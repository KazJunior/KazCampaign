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
    version: 'v1.8',
    date: '27 de Outubro de 2026',
    title: 'Novo Modo Treino & Bonecos de Prática 3D',
    isLatest: true,
    tag: 'Novo Modo de Jogo',
    changes: [
      {
        highlight: 'Novo Campo de Treinamento (Modo Treino)',
        description: 'Um modo livre dedicado onde os jogadores podem selecionar e testar qualquer uma das 17 classes da campanha livremente em equipes de 1 a 4 heróis, mantendo a classe secreta/oculta preservada.',
        type: 'new',
      },
      {
        highlight: 'Bonecos de Treino com Miniaturas 3D Dedicadas',
        description: 'Implementados bonecos de palha e madeira em 3D: Boneco de Treino Padrão (neutro), Boneco Blindado (70 de Defesa Física) e Boneco Rúnico (70 de Resistência Mágica). Os bonecos são estáticos e não atacam.',
        type: 'new',
      },
      {
        highlight: 'Ferramentas de Prática & Medidor de Dano (DPS)',
        description: 'Painel em combate com botões para Zerar Recargas instantaneamente, Curar Equipe, Reiniciar Bonecos e medidor em tempo real de Dano Total, Maior Golpe e Número de Ataques.',
        type: 'new',
      },
      {
        highlight: 'Configuração de Presets de Nível',
        description: 'Possibilidade de escolher o nível da equipe de treino (Nível 1, 5, 10 com 5 habilidades ou 20 supremo) e cenários de bonecos (Alvo Único, Trio Tático ou Batalhão AoE).',
        type: 'new',
      },
    ],
  },
  {
    version: 'v1.7',
    date: '26 de Outubro de 2026',
    title: 'Teto de Movimentação (Máx 4 Casas) & Mira em Área',
    isLatest: false,
    tag: 'Balanceamento & QoL',
    changes: [
      {
        highlight: 'Reformulação Completa das Habilidades de Vulcanus (Boss da Fase 20)',
        description: 'Vulcanus, Titã das Forjas, recebeu um conjunto de habilidades reformulado: 1° Golpe Esmaga-Escudo (230% de dano físico e rouba o escudo do alvo); 2° Baforada Vulcânica em cone (200% de dano físico, queima e -2 Movimento); 3° Bigorna Incandescente (+300 de escudo e reduz o dano de todos os heróis em 30% por 2 ataques/turnos); 4° Fissura Tectônica em cruz (200% de dano físico e arremessa os heróis para as bordas do mapa); 5° Investida Sísmica (salto até o inimigo mais distante, 210% de dano e atordoamento); e mantida a habilidade suprema Terremoto Primordial ativada com metade da vida.',
        type: 'buff',
      },
      {
        highlight: 'IA dos Monstros & Navegação de Obstáculos (Pathfinding Inteligente)',
        description: 'Corrigida a inteligência artificial dos monstros que ficavam presos atrás de pedras e pilares sem se mover ou atacar. A IA agora calcula rotas reais contornando obstáculos via busca em largura (BFS), permitindo que contornem rochas para alcançar os heróis.',
        type: 'fix',
      },
      {
        highlight: 'Espaçamento Tático dos Monstros nas Fases',
        description: 'Monstros redistribuídos nas fases para eliminar agrupamentos colados que facilitavam dano em área excessivo. Cada monstro agora mantém ao menos 2 casas de distância dos demais, posicionando tanques na linha de frente e suportes/arqueiros na retaguarda.',
        type: 'buff',
      },
      {
        highlight: 'Ajustes no Mini Boss da Fase 25 (Arquimago das Runas)',
        description: 'A vida do Arquimago das Runas foi aumentada para 55.000 HP, seu Vórtice do Vazio agora possui 250% de escalonamento, o Selo de Bloqueio Concussivo atordoa em formato de cruz (+) e o Raio Rúnico Perfurante ignora escudos. Além disso, dois Tecelões de Glifos foram posicionados nas pontas para acompanhá-lo no combate.',
        type: 'buff',
      },
      {
        highlight: 'Alcance de Movimentação dos Monstros (+1 MOV na Fase 10+)',
        description: 'A partir da Fase 10, todos os monstros e chefes tiveram seu alcance de movimentação aumentado em +1 casa (respeitando o teto global de 4 casas).',
        type: 'buff',
      },
      {
        highlight: 'Restauração de Bônus de Movimento com Teto Máximo (4 Casas)',
        description: 'Os bônus de movimento em itens e pets (incluindo o Voo Celestial da Águia de Cristal) foram restabelecidos, agora com uma trava global de equilíbrio: a movimentação de qualquer personagem não pode ultrapassar 4 casas no tabuleiro.',
        type: 'buff',
      },
      {
        highlight: 'Mira de Magias em Área em Slots com Aliados',
        description: 'Corrigido o bloqueio que impedia selecionar o slot onde um herói aliado está posicionado ao conjurar habilidades em área. Agora é possível mirar em qualquer casa válida dentro do alcance para atingir inimigos ou aliados ao redor do ponto escolhido.',
        type: 'fix',
      },
      {
        highlight: 'Buff no Assassino (Vida Base e Ataque Base)',
        description: 'A classe Assassino recebeu um aumento substancial em seus atributos base para melhorar sua durabilidade e letalidade: Vida base aumentada de 70 para 100 (+30 HP) e Ataque base aumentado de 29 para 32 (+3 ATK).',
        type: 'buff',
      },
      {
        highlight: 'Precisão na Seleção de Casas e Desvinculação da Barra de Vida',
        description: 'As barras de vida flutuantes e auras visuais foram tornadas 100% transparentes ao clique (não interceptam raycasts), desvinculando-as da seleção de unidades e permitindo selecionar, movimentar ou mirar livremente na casa imediatamente acima de qualquer personagem sem interferência.',
        type: 'fix',
      },
      {
        highlight: 'Buff no Curandeiro (+10% Poder Base de Cura Arredondado para Cima e +10% Vida Perdida)',
        description: 'Todas as habilidades de cura do Curandeiro tiveram seus valores base de cura aumentados e arredondados para cima (Cura Sagrada: 105% MAG, Círculo de Renovação: 95% MAG, Purificação: 85% MAG, Luz Restauradora: 140% MAG, Onda Vital: 120% MAG e Milagre Supremo: 155% MAG), além de curarem um adicional fixo de +10% da vida perdida do alvo.',
        type: 'buff',
      },
      {
        highlight: 'Atualização Dinâmica do Texto de Habilidades Evoluídas',
        description: 'Corrigido o problema em que o texto descritivo das habilidades permanecia com os valores iniciais (Nv. 1) após a evolução. Agora as porcentagens de dano, poder de cura, valores de escudo e penetração de armadura se atualizam dinamicamente em tempo real em todas as telas (modal de evolução, painel de habilidades e HUD de combate).',
        type: 'fix',
      },
    ],
  },
  {
    version: 'v1.6',
    date: '24 de Outubro de 2026',
    title: 'Recargas Táticas, Formatos de AoE de Chefes & Melhorias de QoL',
    isLatest: false,
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
      {
        highlight: 'Dano de Habilidades de Inimigos Normais (+20% na Fase 10+)',
        description: 'Inimigos comuns a partir da Fase 10 agora têm o multiplicador de dano de suas habilidades aumentado em 20% (ex: 100% vai para 120%, 150% para 180%), com atualização dinâmica da descrição.',
        type: 'buff',
      },
      {
        highlight: 'Áreas de Efeito Táticas para Inimigos Normais',
        description: 'Inimigos normais com habilidades em área agora possuem formatos únicos de alcance tático como Cones, Cruzes de 5 casas, Linhas Perfurantes e Varreduras Frontais (Cleave).',
        type: 'new',
      },
      {
        highlight: 'Correção de Cura e Escudo Excessivos',
        description: 'Corrigido o debuff de cura excessiva e escudo excessivo que eram removidos prematuramente no fim do turno. Agora persistem devidamente para o turno consecutivo, reduzindo a cura e o escudo em 50% caso o mesmo aliado seja curado/protegido repetidamente.',
        type: 'fix',
      },
      {
        highlight: 'Ajuste de Preço dos Magos Elementais',
        description: 'Corrigido o valor de recrutamento do Mago Elétrico e do Mago de Vento para 100.000 de Ouro, padronizando o custo com o Mago de Gelo e as demais classes avançadas compráveis.',
        type: 'fix',
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
