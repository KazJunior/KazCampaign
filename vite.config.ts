import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Em produção a Vercel executa /api/*.ts como funções serverless.
// No `npm run dev`, este plugin faz o mesmo papel, chamando os handlers GET/POST.
function apiDevPlugin(): Plugin {
  return {
    name: 'kazcampaign-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length).replace(/\/$/, '')
        const file = path.resolve(process.cwd(), 'api', `${name}.ts`)
        if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Rota não encontrada' }))
          return
        }

        try {
          const mod = await server.ssrLoadModule(file)
          const method = req.method ?? 'GET'
          const handler = mod[method] as ((r: Request) => Promise<Response>) | undefined
          if (!handler) {
            res.statusCode = 405
            res.end(JSON.stringify({ error: 'Método não permitido' }))
            return
          }

          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v)
          }
          const request = new Request(url, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })

          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          console.error('[api-dev]', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Erro interno' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Disponibiliza .env.local (KAZCAMPAIGN_DATABASE_URL, AUTH_SECRET) para as rotas /api em dev.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
  }
})
