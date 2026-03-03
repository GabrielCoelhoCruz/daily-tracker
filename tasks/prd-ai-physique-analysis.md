# PRD: AI Physique Analysis

## Introduction

Adicionar uma tab "Progresso" ao Daily Tracker que permite o atleta fazer check-ins semanais de physique com fotos, peso e observações. As fotos são enviadas para a Claude Vision API junto com um system prompt de bodybuilding coach, que retorna uma análise técnica detalhada do condicionamento. Suporta 3 modos: análise completa, comparativa (semana atual vs anterior) e quick check.

## Goals

- Permitir check-ins semanais com fotos (frontal, lateral, costas) + peso + notas
- Enviar fotos para Claude Vision API e receber análise técnica formatada
- Suportar comparativo automático com semana anterior
- Oferecer modo quick check para avaliação rápida com 1 foto
- Manter histórico completo de check-ins com galeria de fotos por semana
- Renderizar análise em markdown formatado

## User Stories

### US-023: Criar tab Progresso na navegação
**Description:** As a user, I want a "Progresso" tab so that I can access physique tracking from the main navigation.

**Acceptance Criteria:**
- [ ] Nova tab "Progresso" adicionada ao tab bar com ícone `analytics-outline` (Ionicons)
- [ ] Grupo de rotas `(progresso)` com `_layout.tsx` (Stack) + `index.tsx`
- [ ] Tela inicial com lista de check-ins (vazia no início) e botão "Novo Check-in"
- [ ] Segue o padrão visual das outras tabs (dark theme, amber accent, `theme.colors`)
- [ ] Typecheck passa (`npx tsc --noEmit`)

### US-024: Criar store de physique check-ins
**Description:** As a developer, I need a Zustand store to manage physique check-in data with persistence.

**Acceptance Criteria:**
- [ ] Store `usePhysiqueStore` criada em `stores/usePhysiqueStore.ts`
- [ ] Interface `PhysiqueCheckIn` com: `id` (string), `week` (number), `date` (string), `weight` (number), `previousWeight?` (number), `notes?` (string), `photoPaths` (string[]), `analysis?` (string), `mode` ('full' | 'comparative' | 'quick')
- [ ] Actions (mutations): `addCheckIn`, `updateAnalysis(id, analysis)`
- [ ] Dados pessoais do atleta hardcoded como constantes no arquivo da store (nome, idade, altura, fase) — app pessoal, não configurável
- [ ] Persist middleware com AsyncStorage (somente metadata, sem base64)
- [ ] Typecheck passa

### US-025: Tela de novo check-in (fotos + formulário)
**Description:** As a user, I want a single screen to capture photos, enter weight and notes, so I can submit a check-in.

**Acceptance Criteria:**
- [ ] Rota `(progresso)/new-checkin.tsx` apresentada como `formSheet` (padrão do app)
- [ ] Solicita permissão de câmera/galeria via `expo-image-picker` antes do primeiro uso
- [ ] Trata negação de permissão com mensagem clara e link para configurações do device
- [ ] 4 slots de foto com labels: Frontal / Lateral / Costas / Extra (opcional)
- [ ] Cada slot permite tirar foto (câmera) ou selecionar da galeria
- [ ] Fotos redimensionadas no momento da captura (`maxWidth: 1024`, `quality: 0.8` via image-picker)
- [ ] Preview de cada foto com botão de remover
- [ ] Campo numérico para peso atual (kg) — obrigatório
- [ ] Campo de semana de prep — obrigatório, default = `última semana + 1` (ou 1 se primeiro check-in)
- [ ] Campo de texto para observações — opcional (placeholder: "me sentindo flat, retenção aumentou...")
- [ ] Peso anterior preenchido automaticamente se houver check-in anterior
- [ ] Seletor de modo: "Análise Completa" (default) ou "Quick Check"
- [ ] Quick Check: requer apenas 1 foto (frontal) + peso
- [ ] Validação: peso > 0, semana > 0, mínimo 1 foto (quick) ou 1+ fotos (completa)
- [ ] Fotos salvas em `FileSystem.documentDirectory/physique/{id}-{index}.jpg`
- [ ] Apenas os paths salvos no store
- [ ] Typecheck passa

### US-026: Integração com Claude Vision API
**Description:** As a user, I want to send my photos for AI analysis so I get detailed physique feedback.

**Acceptance Criteria:**
- [ ] Service `services/physiqueAnalysis.ts` com função `analyzePhysique`
- [ ] Lê fotos do filesystem como base64 apenas no momento do envio
- [ ] System prompt completo do documento de prompt engineering (dados do atleta hardcoded)
- [ ] 3 modos de prompt contextual:
  - **Completa:** sem fotos anteriores, usa template de check-in de progresso
  - **Comparativa:** detecta check-in da semana anterior automaticamente, envia fotos [ATUAL] + [ANTERIOR] com delta de peso
  - **Quick Check:** template curto, 1 foto, resposta direta
- [ ] Usuário pode forçar análise completa mesmo quando há fotos anteriores disponíveis
- [ ] API key hardcoded em `constants/api.ts` (app pessoal, não publicado)
- [ ] Modelo: `claude-sonnet-4-20250514`
- [ ] Headers: `x-api-key`, `anthropic-version`, `content-type`
- [ ] Timeout de 60s na chamada fetch
- [ ] Loading state com mensagem contextual ("Analisando suas fotos...")
- [ ] Tratamento de erros: sem internet, API error (4xx/5xx), timeout — mensagem clara para o usuário, sem crash
- [ ] Análise salva no store via `updateAnalysis(id, text)`
- [ ] Typecheck passa

### US-027: Tela de resultado da análise
**Description:** As a user, I want to see the AI analysis in a well-formatted screen so I can read the feedback.

**Acceptance Criteria:**
- [ ] Rota `(progresso)/result.tsx` com param `id` via query string (padrão do app: `router.push({ pathname: '/(progresso)/result', params: { id } })`)
- [ ] Renderiza análise em markdown formatado usando `@ronradtke/react-native-markdown-display`
- [ ] Estilização dark theme consistente (`theme.colors.bg.primary`, `theme.colors.text.primary`, etc)
- [ ] Header com metadata: semana, data, peso, delta (se comparativa), badge do modo (completa/comparativa/quick)
- [ ] Thumbnails das fotos do check-in no topo (horizontais, scrolláveis)
- [ ] ScrollView para análises longas
- [ ] Typecheck passa

### US-028: Histórico de check-ins
**Description:** As a user, I want to see all my past check-ins so I can track my journey.

**Acceptance Criteria:**
- [ ] Lista de check-ins na tela index da tab Progresso, ordenada por semana (mais recente primeiro)
- [ ] Cada card mostra: semana, data, peso, badge do modo (completa/comparativa/quick), thumbnail da primeira foto
- [ ] Tap no card navega para tela de resultado com análise salva
- [ ] Empty state: ícone + "Nenhum check-in ainda. Comece seu primeiro!" + botão "Novo Check-in"
- [ ] Typecheck passa

### US-029: Galeria de fotos full-screen
**Description:** As a user, I want to browse my progress photos in full screen so I can visually inspect my physique.

**Acceptance Criteria:**
- [ ] Dentro da tela de resultado, tap em uma thumbnail abre foto em full screen
- [ ] Swipe horizontal entre fotos do mesmo check-in
- [ ] Label de cada foto visível (frontal/lateral/costas/extra)
- [ ] Botão de fechar / gesture de dismiss
- [ ] Typecheck passa

## Functional Requirements

- FR-1: Nova tab "Progresso" no tab bar com ícone `analytics-outline` (Ionicons) e grupo de rotas `(progresso)` via Expo Router
- FR-2: Store `usePhysiqueStore` com Zustand + persist middleware (AsyncStorage para metadata, FileSystem para fotos)
- FR-3: Captura de fotos via `expo-image-picker` (câmera + galeria) com resize automático (`maxWidth: 1024`, `quality: 0.8`)
- FR-4: Permissões de câmera/galeria solicitadas antes do primeiro uso, com fallback para negação
- FR-5: Fotos salvas em `FileSystem.documentDirectory/physique/{id}-{index}.jpg`, paths no store
- FR-6: Formulário de check-in com campos: semana (default auto), peso, notas, fotos (min 1, max 4), seletor de modo
- FR-7: Chamada à Claude Vision API (`POST /v1/messages`) com fotos em base64 + system prompt + user prompt contextual, timeout 60s
- FR-8: 3 modos de análise: completa, comparativa (automática se há semana anterior), quick check
- FR-9: Renderização de análise com `@ronradtke/react-native-markdown-display` estilizado para dark theme
- FR-10: Lista de check-ins com cards resumidos e navegação para detalhe
- FR-11: Galeria full-screen com swipe para fotos de cada check-in
- FR-12: Loading state com mensagem contextual e tratamento de erros (sem internet, API error, timeout)

## Non-Goals

- Não terá backend/servidor — chamada direta à API da Anthropic
- Não terá autenticação de usuário (app pessoal)
- Não terá sync na nuvem — dados ficam locais no device
- Não terá edição/recorte de fotos dentro do app
- Não terá gráficos de evolução de peso (pode ser futuro)
- Não terá notificações de lembrete de check-in (pode ser futuro)
- Não terá export/share de análises
- Não terá limpeza automática de fotos órfãs no filesystem (pode ser futuro)
- Dados pessoais do atleta (nome, idade, altura) não serão configuráveis — hardcoded no system prompt

## Design Considerations

- Seguir padrão visual existente: dark theme (`#0c0a09`), amber accent (`#f59e0b`), `theme.colors` e `theme.typography`
- Layout da tela de novo check-in similar a formulários existentes no app
- Cards de histórico seguem padrão visual dos cards de histórico existentes na tab Histórico
- Apresentar `new-checkin` como `formSheet` com grabber (padrão do app — ver `dia-detalhe`)

## Technical Considerations

- **Dependências novas:** `expo-image-picker`, `expo-file-system`, `@ronradtke/react-native-markdown-display`
- **API Key:** Hardcoded em `constants/api.ts` (app pessoal, não publicado, `.gitignore`)
- **Fotos:** Salvas em `FileSystem.documentDirectory/physique/{id}-{index}.jpg`
- **Base64 no envio:** Fotos lidas do filesystem como base64 apenas no momento da chamada API, não persistidas assim
- **Resize:** `expo-image-picker` com `maxWidth: 1024`, `quality: 0.8` — reduz tamanho de ~5-8MB para ~200-400KB
- **AsyncStorage size:** Sem fotos em base64 no store, só paths — sem risco de ultrapassar limites
- **Routing:** Rotas flat dentro do grupo `(progresso)`: `index.tsx`, `new-checkin.tsx`, `result.tsx` (params via query string)
- **Timeout:** 60s no fetch — análises com 4-8 imagens podem levar 15-30s

## Success Metrics

- Check-in completo (fotos + peso + análise) em menos de 2 minutos
- Análise renderizada legível e bem formatada no dark theme
- Histórico navegável com acesso a qualquer check-in anterior em 2 taps
- Zero crashes ao lidar com fotos grandes ou API errors

## Open Questions

- O system prompt deve ser editável pelo usuário na tela de config, ou hardcoded é suficiente para sempre?
- Futuramente: adicionar gráfico de evolução de peso ao longo das semanas?
- Futuramente: permitir comparar fotos de semanas não-adjacentes (ex: semana 1 vs semana 12)?
