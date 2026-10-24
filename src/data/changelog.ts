export interface ChangeDetail {
  highlight: string;
  description: string;
  type?: 'buff' | 'nerf' | 'new' | 'fix';
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  tag: string;
  changes: ChangeDetail[];
}

export const GAME_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v1.6',
    date: '24 de Outubro de 2026',
    title: 'Recargas Táticas, Formatos de AoE de Chefes & Melhorias de QoL',
    isLatest: true,
    tag: 'Balanceamento & QoL',
    changes: [
      {
        highlight: 'Cooldown Mínimo de Stun, Cura e Taunt (4 Turnos)',
        description: 'Todas as habilidades de atordoamento (stun), cura/sustentação/roubo de vida e provocação (taunt) agora possuem tempo de recarga mínimo de 4 turnos para todas as classes, monstros e chefes.',
        type: 'nerf',
      },
      {
        highlight: 'Padrões Únicos de AoE para Chefes',
        description: 'Habilidades em área dos chefes foram redesenhadas com alcances e formatos táticos distintos: Cones direcionais, Cruzes ampliadas, Linhas de 5 casas e Clivagens (Cleave), aprofundando o posicionamento no tabuleiro.',
        type: 'new',
      },
      {
        highlight: 'Seleção Direta em Unidades Estunadas',
        description: 'Corrigida a trava de controle ao clicar em uma unidade atordoada, permitindo agora selecionar normalmente outros heróis ou casas livres do tabuleiro sem precisar apertar Esc.',
        type: 'fix',
      },
      {
        highlight: 'Checar Inventário na Escolha de Equipamento',
        description: 'Adicionado botão dedicado e atalho rápido (tecla I) na tela de escolha de recompensas de combate, permitindo abrir o inventário com sobreposição clara para comparar itens antes de escolher.',
        type: 'new',
      },
    ],
  },
  {
    version: 'v1.5',
    date: '23 de Outubro de 2026',
    title: 'Santuário dos Pets: Ovos, Incubação & Companheiros de Batalha',
    tag: 'Grande Atualização',
    changes: [
      {
        highlight: 'Sistema de Pets & Ovos de Companheiro',
        description: 'Os jogadores agora podem obter ovos derrotando monstros (1% de chance em monstros comuns, 25% em Mini-Chefes e 100% garantido ao derrotar Chefes). Limite de até 20 ovos no ninho.',
        type: 'new',
      },
      {
        highlight: 'Raridades de Ovos & Chances',
        description: 'Ovos com raridades visuais distintas: Branco (Comum - 40%), Verde (Incomum - 30%), Azul (Raro - 20%), Roxo (Épico - 9%) e Dourado (Lendário - 1%).',
        type: 'new',
      },
      {
        highlight: 'Incubadora por Raridade & Chocar com Ouro',
        description: 'Tempo de incubação balanceado por raridade: Comum (1h), Incomum (2h), Raro (3h), Épico (5h) e Lendário (8h), ou chocado imediatamente por 10.000 de Ouro. Pets repetidos são convertidos em ouro.',
        type: 'new',
      },
      {
        highlight: 'Efeitos Bônus & Habilidades Ativas com Maior Status do Grupo',
        description: 'Equipe um pet antes das expedições! Suas habilidades ativas agora escalam diretamente com o maior status da equipe (maior Ataque, maior Magia ou maior Defesa entre os heróis vivos). Ativáveis a partir do Turno 3 (1 uso por batalha).',
        type: 'buff',
      },
      {
        highlight: 'Almanaque de Pets (41 Exemplares)',
        description: 'Catálogo completo no Santuário contendo 15 Comuns, 10 Incomuns, 8 Raros, 5 Épicos e 3 Lendários com detalhes, filtros de coleção e lore.',
        type: 'new',
      },
    ],
  },
  {
    version: 'v1.4',
    date: '23 de Outubro de 2026',
    title: 'Alcance de Provocação & Dano Mínimo em Chefes',
    tag: 'Balanceamento',
    changes: [
      {
        highlight: 'Provocação com Alcance (3 Casas)',
        description: 'O Grito de Provocação do Guerreiro agora possui alcance de 3 casas (aoeRadius: 3), afetando ameaças próximas com feedback visual imediato (Provocado!).',
        type: 'new',
      },
      {
        highlight: 'Duração da Provocação (1 Turno)',
        description: 'Efeitos de provocação foram reduzidos para 1 turno de duração e agora persistem estrategicamente durante toda a fase de ataque dos inimigos.',
        type: 'buff',
      },
      {
        highlight: 'Dano Mínimo contra Chefes no Ataque Básico',
        description: 'Ataques normais (sem habilidade) causam no mínimo 2% da vida do boss nos 2 primeiros chefes (até a Fase 10: Devorador e Astaroth) e 1% para todos os chefes subsequentes.',
        type: 'buff',
      },
    ],
  },
  {
    version: 'v1.3',
    date: '22 de Outubro de 2026',
    title: 'Modelos 3D dos Monstros & Correção de Escudos',
    tag: 'Visual & Balanceamento',
    changes: [
      {
        highlight: 'Modelos 3D Detalhados (Fases 11 a 50)',
        description: 'Novas miniaturas e modelos 3D exclusivos para todos os monstros normais dos Atos II a V.',
        type: 'new',
      },
      {
        highlight: 'Correção de Absorção de Escudo',
        description: 'Corrigido bug em que escudos impediam dano residual de atingir a vida da unidade após o rompimento da barreira.',
        type: 'fix',
      },
      {
        highlight: 'Ajuste de Habilidades do Mago e Druida',
        description: 'Tempos de recarga de cura e barreiras ajustados; remoção de escudos acumulativos em habilidades puras de agro.',
        type: 'buff',
      },
      {
        highlight: 'Nova Suprema do Paladino',
        description: 'Imposição da Justiça reformulada para golpe físico devastador de 180% com ativação imediata de provocação.',
        type: 'new',
      },
    ],
  },
  {
    version: 'v1.2',
    date: '20 de Outubro de 2026',
    title: 'Áreas de Efeito em Cone & Novos Bosses 3D',
    tag: 'Conteúdo & Bosses',
    changes: [
      {
        highlight: 'Expansão de Áreas de Efeito (Cone)',
        description: 'Habilidades em formato de cone agora cobrem 3 fileiras progressivas (1, 3 e 5 casas) com +1 casa de alcance.',
        type: 'buff',
      },
      {
        highlight: 'Miniaturas Exclusivas de Chefes',
        description: 'Designs visuais 3D únicos para todos os 10 chefes e mini-bosses da campanha com bases reforçadas.',
        type: 'new',
      },
      {
        highlight: 'Sincronização em Nuvem de Itens & Base',
        description: 'Upgrades da base, itens catalogados e inventário agora salvam e sincronizam com a conta em nuvem.',
        type: 'fix',
      },
    ],
  },
  {
    version: 'v1.1',
    date: '18 de Outubro de 2026',
    title: 'Otimização Mobile & Reformulação do Arqueiro',
    tag: 'Jogabilidade & Mobile',
    changes: [
      {
        highlight: 'Navegação Touch no Tabuleiro 3D',
        description: 'Suporte a gestos de arrastar o dedo para mover a câmera livremente no celular sem conflitos de mira.',
        type: 'new',
      },
      {
        highlight: 'Reformulação do Arqueiro',
        description: 'Arsenal reconstruído com foco em alcance superior (até 5 casas), perfuração de armadura e dano de longo alcance.',
        type: 'buff',
      },
      {
        highlight: 'Progressão por Nível dos Heróis',
        description: 'Escolha de novas habilidades ou evolução de feitiços a cada marco de nível e ganho de atributos distribuíveis.',
        type: 'new',
      },
    ],
  },
  {
    version: 'v1.0',
    date: '15 de Outubro de 2026',
    title: 'Lançamento Oficial — Campanha dos 50 Níveis',
    tag: 'Lançamento',
    changes: [
      {
        highlight: 'Modo Aventura Contínua (50 Fases)',
        description: 'Campanha completa em 5 Atos com 14 classes desbloqueáveis, sistema de morte permanente de run e ouro acumulativo.',
        type: 'new',
      },
      {
        highlight: 'Catálogo de Itens & Forja da Base',
        description: 'Mais de 60 itens de raridades Comum, Rara, Épica e Lendária com melhorias permanentes na Base.',
        type: 'new',
      },
      {
        highlight: 'Ranking Global & Modo Offline',
        description: 'Suporte a ranking mundial online de pontuação e modo convidado 100% offline no navegador.',
        type: 'new',
      },
    ],
  },
];
