# ShapeIQ MVP — Testing Handoff

_Última atualização: 2026-07-02_

## O que é o ShapeIQ MVP

ShapeIQ é um app de **execução de prep**. Ele ajuda o atleta a:

1. Criar ou importar um plano (do coach ou plano-base manual)
2. Executar o dia (refeições, água, cardio, treino)
3. Fechar o dia com evidência (score de execução)
4. Identificar vazamentos de aderência
5. Revisar a semana (Logs)
6. Criar check-ins de físico com fotos e peso
7. Comparar fotos entre check-ins
8. Exportar um resumo semanal (para coach ou para si mesmo)

### O que o ShapeIQ **não** é

- Não substitui coach
- Não prescreve nutrição
- Não calcula calorias/macros
- Não é banco de alimentos
- Não é rede social fitness
- Não julga "prontidão para o palco"
- Não estima percentual de gordura com IA

## Incluído neste MVP

- Onboarding com dois caminhos: **"Tenho coach"** (importar/colar plano) e **"Estou sem coach"** (montar plano-base em poucos minutos)
- Parser determinístico e offline do plano colado (WhatsApp/notas), com revisão antes de ativar
- Plano-base manual: água, nº de refeições (com renomear), cardio, semana de treino (presets ABC/ABCD/ABCDE + edição por dia), refeição livre, horário de fechamento
- Abas: **Hoje** (próxima ação + fechamento) · **Protocolo** (checklist do dia, água, cardio, pular com motivo, refeição livre) · **Treino** (treino do dia, conclusão, registro de sets opcional) · **Logs** (score semanal, principal vazamento, detalhe por dia, exportar resumo) · **Evidências** (check-ins, peso, validade, linha do tempo, comparação)
- Fechamento diário respeita o horário configurado: antes dele, pendências levam de volta à execução; depois, "Fechar mesmo assim" é permitido e vira vazamento
- Dias fechados são snapshots históricos imutáveis (nota editável)
- Resumo semanal em PT-BR copiável/compartilhável ("Resumo para coach" / "Resumo da semana"); dados ausentes aparecem como "não registrado"
- Modo demo (na tela inicial do onboarding e em Configurações) com uma semana realista de dados prefixados `demo-`
- Estado "Parcial" por refeição: long-press na refeição → "Feito parcial" (badge "Parcial", crédito parcial no score e vazamento leve "refeição parcial"; contagem congelada em `refeicoesParciais` no fechamento)
- Os fluxos principais foram implementados como local-first e persistem via Zustand/AsyncStorage. Câmera, armazenamento de fotos, share sheet e persistência em dispositivo ainda precisam de validação no smoke test.

## Intencionalmente fora deste MVP

- Score de físico por IA / julgamento de stage-readiness / estimativa de BF
- Category Finder / motor de elegibilidade IFBB/NPC (telas existem no código, mas fora do fluxo principal)
- Banco de alimentos, cálculo de macros/calorias
- Construtor avançado de treino (o registro set-a-set existente foi mantido como opcional)
- Portal do coach, feed social, gamificação (streaks/confetes/mascotes)
- Peak week, manipulação de água/sódio/diuréticos
- Upload/OCR de PDF no import (apenas colar texto)

## Como resetar o estado para teste

Não há botão único de "reset total". Opções:

1. **Limpar dados demo**: Configurações → Modo demo → "Limpar dados demo" (remove apenas registros `demo-`).
2. **Trocar plano**: Configurações → Plano ativo → "Criar novo plano" (refaz o onboarding).
3. **Reset completo** (recomendado entre testadores): desinstalar e reinstalar o app, ou em dev limpar o storage do app (iOS: apagar app; Android: limpar dados do app; Expo Go: limpar dados do Expo Go). Todo o estado vive em AsyncStorage local — não há backend.

## Flow A — Usuário com coach

1. Instalação limpa → abre no onboarding.
2. Escolher **"Tenho coach"**.
3. Preencher objetivo (ex.: Prep para campeonato + data), perfil básico e preferências de check-in.
4. Preencher dados do coach (opcionais).
5. Em "Como quer cadastrar seu plano?", tocar **"Colar plano"** e colar, por exemplo:
   ```
   Café da manhã:
   - Ovos
   - Aveia
   Almoço:
   - Arroz
   - Frango
   - Legumes
   Jantar:
   - Carne
   - Salada
   Água 3000 ml
   Cardio 40 min
   Treino ABCDE
   Fechamento do dia 21:00
   ```
6. Verificar a prévia (períodos/itens/metas detectados) e confirmar.
7. Concluir onboarding → cair em **Hoje** com próxima ação real.
8. Marcar itens no **Protocolo**, registrar água (+250 ml) e cardio.
9. Concluir treino na aba **Treino** (ou marcar descanso).
10. Após o horário de fechamento (padrão 21:00; ajustável em Configurações), fechar o dia em **Hoje**.
11. Em **Logs**, conferir o dia fechado e tocar **"Resumo para coach"** → compartilhar/copiar o texto.

Esperado: nenhum dado inventado no resumo; itens pulados/pendentes aparecem como vazamento.

## Flow B — Usuário sem coach

1. Instalação limpa → onboarding → **"Estou sem coach"**.
2. Objetivo, perfil, check-in (mesmos passos compartilhados).
3. Metas: água (ml), nº de refeições (3–6), cardio (min/dia), horário de fechamento.
4. Renomear refeições se quiser.
5. Semana de treino: escolher preset (ABC/ABCD/ABCDE) ou "Ainda não quero cadastrar treino"; tocar num dia para alternar treino/cardio/descanso.
6. Refeição livre: escolher "Não usar" ou "1x por semana".
7. Revisar os cards-resumo → **"Ativar plano-base"**.
8. Executar o dia e fechar como no Flow A.
9. Em **Logs**, usar **"Resumo da semana"**.

Esperado: onboarding completo em menos de ~3 minutos, sem cadastrar alimentos.

## Flow C — Persistência, check-ins, restart e comparação

1. Com plano ativo e itens marcados, **fechar o app completamente e reabrir**.
   - Esperado: plano, checks do dia, água, cardio, origem do plano e fechamento persistem.
2. Em **Evidências**, criar um check-in: peso + 1–4 fotos + notas.
3. Criar um segundo check-in (dia seguinte ou de teste) com peso diferente.
4. Tocar **"Comparar"**: escolher os dois check-ins, alternar ângulos (Frontal/Lateral/Costas), conferir delta de peso e datas.
   - Ângulo sem foto deve indicar indisponibilidade, não quebrar.
5. Reiniciar o app de novo: check-ins, fotos e comparação continuam disponíveis.
6. Verificar a validade do check-in ("Há N dias") — aviso após 7 dias sem check-in novo.

## Itens conhecidos adiados

- Meta de cardio semanal (o plano-base usa meta diária; semanal aparece só no resumo agregado)
- Pausar/duplicar plano
- Lembrete configurável de check-in (dia/modo são salvos; notificação dedicada não implementada)
- Edição granular do plano importado pós-ativação (editar exige reimportar ou refazer onboarding)

Nota: não existe ação na UI para trocar para o plano de exemplo embutido. Ele existe apenas como fallback defensivo interno (usado se nenhum plano custom estiver ativo) e para demo/testes — usuários reais sempre saem do onboarding com plano próprio.

## Riscos técnicos conhecidos

- **Parser do plano colado é heurístico**: formatos muito fora do padrão (tabelas, emojis como bullets, tudo em uma linha) podem cair no aviso "nenhum período reconhecido" — o fluxo manual cobre, mas vale testar com planos reais de coaches.
- **Horário de fechamento vs. dia lógico**: o dia lógico vira às 4h. Fechamentos entre 00:00 e 04:00 contam para o dia anterior. Testar fechamento tarde da noite.
- **Fotos de check-in** são URIs locais; em alguns cenários de reinstalação/limpeza do sistema operacional as fotos podem ser removidas pelo SO enquanto o registro permanece.
- **Fuso/data**: datas usam o relógio local; mudança de fuso durante a semana pode deslocar o agrupamento semanal.
- **Notificações** exigem permissão; sem permissão o app funciona, apenas sem lembretes.

## Nota de risco de persistência/migração

Todo o estado é local (AsyncStorage, stores Zustand com `persist`). Os stores têm `version: 1` e uma função `migrate` de identidade (retorna o estado como está) — ou seja, **existe versionamento básico, mas ainda não há migrações reais de schema**. Se a forma dos dados persistidos mudar entre versões do MVP, será preciso escrever uma migração de verdade; até lá, estados antigos podem carregar parcialmente (campos novos assumem defaults) ou, no pior caso, exigir reinstalação. Para o período de teste: avise os testadores que **atualizações de build podem pedir reset de dados**, e não prometa retenção de histórico entre versões do MVP. Dias já fechados são snapshots simples (JSON) e são o dado mais estável; fotos são o mais frágil.

## Mensagem sugerida para testadores (PT-BR)

> "Estou testando um MVP do ShapeIQ, um app para organizar execução de prep/cutting: plano do dia, refeições, água, cardio, treino, fechamento diário, vazamentos de aderência e check-ins de evolução. A ideia não é substituir coach/nutricionista, e sim ajudar a seguir o que você decidiu executar e revisar a semana. Quero que você use por alguns dias e me diga onde ficou confuso, onde ajudou e onde você abandonaria."

## Checklist de smoke test em dispositivo

> Nenhum item abaixo foi validado em dispositivo real nesta passagem — esta lista é o roteiro para essa validação.

- [ ] Instalação limpa abre no onboarding (não nas tabs)
- [ ] Flow A completo: colar plano → revisar → ativar → Hoje com próxima ação
- [ ] Flow B completo em menos de 3 minutos
- [ ] "Entrar em modo demo" na primeira tela popula o app e entra nas tabs
- [ ] Marcar/desmarcar item de refeição; long-press → "Feito parcial"; pular com motivo
- [ ] Água +250 ml / remover; cardio quick add (10/15/20/30)
- [ ] Concluir treino do dia; dia de descanso exibido corretamente
- [ ] Antes do horário de fechamento: com pendência, CTA é "Voltar para executar" (sem "Fechar mesmo assim")
- [ ] Depois do horário: "Fechar o dia" / "Fechar mesmo assim" funcionam; dia fica read-only
- [ ] Logs mostra score semanal, principal vazamento e detalhe por dia
- [ ] Resumo semanal compartilha texto correto (dados ausentes = "não registrado")
- [ ] Check-in com câmera e com galeria; peso salvo
- [ ] Comparação lado a lado com filtro de ângulo; ângulo faltante não quebra
- [ ] Matar o app e reabrir: tudo persiste (plano, checks, água, cardio, check-ins, fechamentos)
- [ ] Rotação de dia (abrir após meia-noite/4h): dia anterior arquivado, novo dia gerado
- [ ] Sem rede (modo avião): todas as ações principais funcionam
- [ ] Notificações: permissão negada não quebra o app
- [ ] Todo o texto visível em PT-BR (exceto nomes oficiais de poses)
