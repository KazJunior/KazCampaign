const TOKEN_KEY = 'kazcampaign_auth_token';

export interface AuthUser {
  id: number;
  username: string;
}

export interface LeaderboardEntry {
  username: string;
  highestLevel: number;
  party: string[];
  achievedAt: string;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage indisponível */
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erro ${res.status}`);
  return data as T;
}

export interface RegisterResult {
  user: AuthUser;
  recoveryKey?: string;
}

export interface RecoverResult {
  user: AuthUser;
  newRecoveryKey: string;
}

export async function register(username: string, password: string): Promise<RegisterResult> {
  const data = await request<{ token: string; user: AuthUser; recoveryKey?: string }>('/api/register', {
    method: 'POST',
    body: { username, password },
  });
  setToken(data.token);
  return { user: data.user, recoveryKey: data.recoveryKey };
}

export async function recoverPassword(
  username: string,
  recoveryKey: string,
  newPassword: string
): Promise<RecoverResult> {
  const data = await request<{ token: string; user: AuthUser; newRecoveryKey: string }>('/api/recover', {
    method: 'POST',
    body: { username, recoveryKey, newPassword },
  });
  setToken(data.token);
  return { user: data.user, newRecoveryKey: data.newRecoveryKey };
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const data = await request<{ token: string; user: AuthUser }>('/api/login', { method: 'POST', body: { username, password } });
  setToken(data.token);
  return data.user;
}

export function logout(): void {
  setToken(null);
}

/** Valida o token salvo. Retorna null se não houver sessão válida. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const data = await request<{ user: AuthUser }>('/api/me', { auth: true });
    return data.user;
  } catch {
    setToken(null);
    return null;
  }
}

/** Carrega progresso salvo no Neon Database para o usuário autenticado */
export async function fetchCloudProgress(): Promise<any | null> {
  if (!getToken()) return null;
  try {
    const data = await request<{ progress: any | null }>('/api/progress', { auth: true });
    return data.progress;
  } catch {
    return null;
  }
}

/** Sincroniza progresso com o Neon Database */
export async function saveCloudProgress(progress: any): Promise<void> {
  if (!getToken()) return;
  try {
    await request('/api/progress', { method: 'POST', body: progress, auth: true });
  } catch (err) {
    console.warn('Sincronização em nuvem indisponível:', err);
  }
}

const LOCAL_LEADERBOARD_KEY = 'kazcampaign_local_leaderboard';

function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function saveLocalScore(username: string, level: number, party: string[]): void {
  try {
    let entries = getLocalLeaderboard();
    const existingIndex = entries.findIndex((e) => e.username.toLowerCase() === username.toLowerCase());
    const nowStr = new Date().toISOString();

    if (existingIndex !== -1) {
      const existing = entries[existingIndex];
      // Mantém apenas a melhor aventura; em caso de empate, mantém a mais recente
      if (level >= existing.highestLevel) {
        entries[existingIndex] = {
          username: existing.username,
          highestLevel: level,
          party,
          achievedAt: nowStr,
        };
      }
    } else {
      entries.push({
        username,
        highestLevel: level,
        party,
        achievedAt: nowStr,
      });
    }

    // Ordena por fase decrescente, desempate pela mais recente decrescente
    entries.sort((a, b) => {
      if (b.highestLevel !== a.highestLevel) return b.highestLevel - a.highestLevel;
      return new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime();
    });

    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    /* localStorage indisponível */
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const data = await request<{ entries: LeaderboardEntry[] }>('/api/leaderboard');
    if (data && Array.isArray(data.entries)) return data.entries;
  } catch {
    // Fallback para o ranking local
  }
  return getLocalLeaderboard();
}

export async function submitScore(level: number, party: string[], username = 'Jogador'): Promise<void> {
  // Salva localmente de forma garantida
  saveLocalScore(username, level, party);

  // Tenta submeter ao backend se houver sessão
  if (getToken()) {
    try {
      await request('/api/leaderboard', { method: 'POST', body: { level, party }, auth: true });
    } catch (err) {
      console.warn('Não foi possível sincronizar o ranking online:', err);
    }
  }
}
