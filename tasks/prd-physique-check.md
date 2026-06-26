# PRD: PhysiqueCheck v3 — Category Finder, Suporte Feminino & API Proxy

## Introduction

Evolução do módulo de análise de físico para torná-lo um produto completo e escalável. Três eixos principais:

1. **Category Finder** — nova feature standalone onde o atleta informa sexo, altura e peso e recebe todas as categorias IFBB/NPC elegíveis com critérios, poses e recomendações. Cálculo 100% local (TypeScript puro), funciona como onboarding e ferramenta educacional.
2. **Perfil dinâmico + suporte feminino** — substituir constantes hardcoded por perfil editável com suporte a atletas femininas (7 categorias adicionais: Bikini, Wellness, Figure, Women's Physique, Bodybuilding, Bodyfitness, Fit Model).
3. **System prompt v3 + API proxy** — novo prompt com 13 categorias completas (dados do product prompt), migração para Expo API Route, e melhorias na análise.

O que **já existe** e não muda: check-in form, photo slots, result screen com scores, evolution chart, posing mode, Zustand store persistido.

## Goals

- Atleta descobre categorias elegíveis em <30s sem precisar de foto ou API call
- Suporte completo a atletas femininas (7 categorias com critérios específicos)
- API key protegida via Expo API Route (não mais exposta no client)
- System prompt escalável com dados de todas as 13 categorias
- Perfil editável (nome, sexo, altura, peso, fase) sem hardcode

## User Stories

### US-001: Perfil dinâmico do atleta
**Description:** As an athlete, I want to set up my profile with my info so the app personalizes everything for me.

**Acceptance Criteria:**
- [ ] Criar `stores/useAthleteStore.ts` com Zustand persist: `name: string`, `gender: 'male' | 'female'`, `heightCm: number`, `currentWeightKg: number`, `phase?: string`, `coachName?: string`, `competitiveExperience?: string`
- [ ] Tela de setup do perfil em `app/(tabs)/(progresso)/profile.tsx` com form para todos os campos
- [ ] Validação: nome obrigatório, altura 140-220cm, peso 40-180kg, sexo obrigatório
- [ ] Remover constantes hardcoded (`ATHLETE_NAME`, `ATHLETE_AGE`, `ATHLETE_HEIGHT`, `ATHLETE_PHASE`) do `usePhysiqueStore.ts`
- [ ] `services/physiqueAnalysis.ts` lê dados do `useAthleteStore` em vez de constantes
- [ ] Se perfil não preenchido, redirecionar para profile setup antes de permitir check-in
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-002: Category Finder — lógica de cálculo
**Description:** As a developer, I need the category calculation logic so we can determine eligible categories locally.

**Acceptance Criteria:**
- [ ] Criar `services/categoryFinder.ts` com função `findCategories(input): CategoryResult[]`
- [ ] Input type: `{ gender: 'male' | 'female', heightCm: number, currentWeightKg: number }`
- [ ] Output type: `CategoryResult { name, className, eligible, maxWeightKg, deltaKg, status: '✅' | '⚠️' | '❌', statusText }`
- [ ] Masculino (6 categorias): Men's Physique (classes A-F por altura), Muscular Men's Physique (Open), Classic Physique (fórmula `(altura-100)+bonus`), Classic Bodybuilding (fórmula com bonus menor), Bodybuilding IFBB (por altura), Bodybuilding NPC (por peso)
- [ ] Feminino (7 categorias): Bikini (classes A-H), Wellness (A-D), Figure (A-D), Women's Physique (A-B), Bodybuilding (por peso), Bodyfitness (A-D), Fit Model (A-F)
- [ ] Status: ✅ elegível (dentro do peso), ⚠️ ajuste necessário (≤5kg acima), ❌ fora do range (>5kg acima)
- [ ] Dados de cada categoria como constantes tipadas: poses, attire, critérios de julgamento, nível de musculatura/condicionamento, resumo
- [ ] Testes unitários cobrindo: homem 172cm/85kg, mulher 165cm/60kg, edge cases de peso máximo
- [ ] Typecheck passes

### US-003: Category Finder — tela de resultados
**Description:** As an athlete, I want to see all my eligible categories in a clear view so I understand where I fit.

**Acceptance Criteria:**
- [ ] Nova tela `app/(tabs)/(progresso)/categories.tsx` acessível via botão na tab Progresso
- [ ] Chama `findCategories()` com dados do `useAthleteStore`
- [ ] Lista categorias ordenadas: elegíveis primeiro, depois com ajuste de peso, depois fora do range
- [ ] Card por categoria com: nome, classe, status badge (✅/⚠️/❌), delta de peso
- [ ] Card expandível mostrando: attire, poses obrigatórias, top 5 critérios, nível de musculatura/condicionamento, resumo em 1 frase
- [ ] Seção de recomendação no final: "mais acessível" + "se quiser evoluir"
- [ ] Atualiza automaticamente ao mudar peso no perfil
- [ ] Typecheck passes
- [ ] Verify in device/simulator

### US-004: Expandir TargetCategory para incluir categorias femininas
**Description:** As a developer, I need to support female categories in the type system and UI.

**Acceptance Criteria:**
- [ ] `TargetCategory` expandido: adicionar `'bikini' | 'wellness' | 'figure' | 'womens_physique' | 'womens_bodybuilding'`
- [ ] `CATEGORY_LABELS` atualizado com labels para todas as novas categorias
- [ ] Category selector no `new-checkin.tsx` mostra apenas categorias do sexo correto (ler de `useAthleteStore`)
- [ ] Masculino: pills de Physique, Classic, Bodybuilding, A definir (como hoje)
- [ ] Feminino: pills de Bikini, Wellness, Figure, Physique, A definir
- [ ] Posing mode labels atualizados para categorias femininas (quarter turns para Bikini/Wellness, mandatórias para Figure/Physique/BB)
- [ ] Typecheck passes

### US-005: System prompt v3 com todas as categorias
**Description:** As a developer, I need the updated system prompt with complete data for all 13 categories so Claude can analyze any athlete.

**Acceptance Criteria:**
- [ ] Novo `SYSTEM_PROMPT` em `services/physiqueAnalysis.ts` baseado no `docs/physique-check-product-prompt.md`
- [ ] Inclui: papel (copiloto educacional), limitações (iluminação, ângulo, foto≠palco), o que NÃO é (não é coach, não dá scores numéricos)
- [ ] Dados completos das 13 categorias: classes, peso máximo, poses, attire, critérios de julgamento, nível de musculatura/condicionamento
- [ ] Protocolo de análise com 6 blocos: resumo, avaliação por grupo com fit de categoria, comparativo, recomendação de categoria, posing, ações da semana
- [ ] Formato de resposta usa 3 indicadores simples: ✅ No nível, 📈 Acima, 📉 Abaixo (remover ⚖️ NO LIMITE)
- [ ] Classificação geral: 🟢 Destaque, 🟡 Adequado, 🔴 Atenção
- [ ] Regras: responder no idioma do atleta, honesto sobre limitações, máximo 3 categorias por atleta
- [ ] Contexto do atleta interpolado dinamicamente (nome, sexo, altura, peso, fase — do `useAthleteStore`)
- [ ] JSON scores mantido ao final (overallConditioning, stageReadiness, vTaper)
- [ ] Prompt tokenizado e verificado que não excede limite razoável (~4K tokens)
- [ ] Typecheck passes

### US-006: Expo API Route como proxy
**Description:** As a developer, I need to move the Claude API call to a server-side route so the API key is not exposed in the client.

**Acceptance Criteria:**
- [ ] Criar `app/api/analyze+api.ts` que recebe POST com `{ photos: { base64: string, label: string }[], context: AnalysisContext, athleteProfile: AthleteProfile }`
- [ ] Valida payload: pelo menos 1 foto, campos obrigatórios presentes
- [ ] Monta request para Claude API com system prompt + user prompt + imagens
- [ ] `ANTHROPIC_API_KEY` lido de `process.env` no server (não mais importado de `constants/api`)
- [ ] Modelo configurável via env var (default `claude-sonnet-4-20250514`)
- [ ] max_tokens: 8192
- [ ] Retorna `{ analysis: string, scores?: PhysiqueScores }` ou `{ error: string }` com status code adequado
- [ ] `services/physiqueAnalysis.ts` atualizado para chamar a API route local em vez de `api.anthropic.com` direto
- [ ] Remover import de `ANTHROPIC_API_KEY` do client code
- [ ] Timeout de 90s no fetch + tratamento de erro
- [ ] Typecheck passes

### US-007: Guia de fotos in-app
**Description:** As an athlete, I want a photo guide so I take consistent photos every week.

**Acceptance Criteria:**
- [ ] Tela `app/(tabs)/(progresso)/photo-guide.tsx` acessível via link na tela de novo check-in
- [ ] Instruções: quando (manhã, jejum), onde (mesmo local, fundo neutro, câmera na cintura), iluminação (lateral 45°)
- [ ] Fotos obrigatórias: frontal relaxado, lateral relaxado, costas relaxado
- [ ] Opcionais: poses da categoria (a cada 2-3 semanas)
- [ ] Regras: sem segurar celular, timer ou alguém tire, mesma roupa
- [ ] Ícones/ilustrações simples para cada instrução
- [ ] Typecheck passes
- [ ] Verify in device/simulator

### US-008: Comparativo side-by-side
**Description:** As an athlete, I want to compare photos from different weeks side by side so I see my visual progress.

**Acceptance Criteria:**
- [ ] Nova tela `app/(tabs)/(progresso)/compare.tsx` acessível via botão no histórico
- [ ] Seletor de 2 semanas (picker ou dropdown com lista de check-ins)
- [ ] Exibe fotos lado a lado: mesma posição (frontal vs frontal, lateral vs lateral)
- [ ] Delta de peso entre as semanas exibido no header
- [ ] Swipe horizontal para alternar entre ângulos (frontal → lateral → costas)
- [ ] Se uma semana tem menos fotos que outra, mostrar placeholder no slot vazio
- [ ] Typecheck passes
- [ ] Verify in device/simulator

### US-009: Compartilhar relatório com coach
**Description:** As an athlete, I want to share my analysis report so my coach can review it.

**Acceptance Criteria:**
- [ ] Botão "Compartilhar" na tela de resultado (`result.tsx`)
- [ ] Gera texto formatado com: resumo, avaliação por grupo, recomendação, ações
- [ ] Inclui metadados: semana, peso, categoria alvo, data
- [ ] Usa `expo-sharing` / share sheet nativo do OS
- [ ] Opção de incluir ou não as fotos (toggle antes de compartilhar)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Perfil do atleta armazenado em Zustand store separado (`useAthleteStore`) com persist
- FR-2: Category Finder calcula categorias 100% localmente — sem API call
- FR-3: Fórmula de peso máximo Classic Physique: `(altura_cm - 100) + bonus_classe` (bonus varia por classe)
- FR-4: Classic Bodybuilding usa fórmula similar mas com bonus 2kg menor que Classic Physique
- FR-5: 6 categorias masculinas + 7 femininas com dados completos (poses, attire, critérios, classes)
- FR-6: Claude API chamada exclusivamente via Expo API Route — API key nunca no client
- FR-7: System prompt inclui protocolo de 6 blocos e dados de todas as 13 categorias
- FR-8: Análise usa máximo 3 categorias por atleta (baseado no perfil)
- FR-9: Check-in form mostra apenas categorias do sexo correto do atleta
- FR-10: Indicadores de fit: ✅ No nível, 📈 Acima, 📉 Abaixo (3 níveis, sem gradações extras)
- FR-11: A análise nunca prescreve dieta, treino, suplementação — é copiloto educacional

## Non-Goals

- Não implementar backend externo ou cloud storage — tudo local
- Não implementar pagamento/planos
- Não implementar perfil multi-atleta (coach dashboard)
- Não implementar notificações de lembrete
- Não criar autenticação ou contas de usuário
- Não dar scores numéricos absolutos de BF% ou stage readiness percentual
- Não substituir avaliação presencial de coach

## Technical Considerations

- **Expo API Routes**: `app/api/analyze+api.ts` — requer EAS hosting ou local dev server para funcionar
- **Token budget**: System prompt v3 é longo (~4K tokens). Enviar apenas categorias relevantes ao sexo do atleta para economizar.
- **Image compression**: Manter compressão atual (JPEG 0.8, resize) — verificar se suficiente para quality/cost tradeoff
- **Migration**: Dados existentes no `usePhysiqueStore` devem continuar funcionando — `useAthleteStore` é store novo, não breaking
- **Constantes hardcoded**: Remover `ATHLETE_NAME`, `ATHLETE_AGE`, `ATHLETE_HEIGHT`, `ATHLETE_PHASE` gradualmente — US-001 e US-005 cobrem isso

## Success Metrics

- Category Finder retorna resultados em <100ms (cálculo local)
- Análise visual retorna em <60s após envio
- Atleta feminina consegue completar fluxo completo (perfil → categories → check-in → análise)
- API key não aparece em nenhum arquivo client-side após US-006
- Comparativo side-by-side funcional em <3 taps

## Open Questions

- Expo API Routes funcionam com EAS Update ou precisam de EAS Hosting? Verificar deployment story.
- Qual limite de check-ins locais antes de impactar performance? Considerar cleanup de fotos antigas.
- Category Finder deve ter entrada própria na tab bar ou ficar dentro de Progresso?
