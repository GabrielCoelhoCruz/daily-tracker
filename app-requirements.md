# Daily Tracker — Dieta & Suplementação

App pessoal para acompanhamento diário de dieta, suplementos, medicamentos manipulados e treino, baseado no plano mensal da Team GB.

---

## Core Features

### 1. Checklist Diário
- Lista de todos os itens do dia (refeições, suplementos, manipulados, cardio, hidratação)
- Agrupamento por refeição/período (jejum, refeição 1, intra treino, pós treino, etc.)
- Suplementos e manipulados como sub-itens da refeição a que pertencem
- Check/uncheck com timestamp de quando foi marcado
- Indicador visual de progresso do dia (ex: 14/20 itens feitos)
- Reset automático às 4h da manhã

### 2. Lógica de Dia de Treino vs Dia Off
- Dias de treino: segunda a sexta
- Dia off: sábado e domingo
- Itens condicionais por dia da semana:
  - Oxandrolona: apenas dias de treino (1h pré treino)
  - Anastrozol: apenas segunda e sexta (em jejum)
  - Protocolo hormonal (enantest + masteron + trembolona): segunda, quarta e sexta
  - Intra treino: apenas dias de treino
- O app detecta o dia da semana e monta a checklist automaticamente
- Toggle manual para marcar um dia de semana como "off" (ex: faltou treino)

### 3. Plano Hardcoded
- Plano definido como objeto TypeScript direto no código
- Estrutura: períodos/refeições → itens (nome, dosagem, categoria) → sub-itens (suplementos atrelados)
- Cada item pode ter regras condicionais (diasDaSemana, apenasEmDiaDeTreino)
- Atualização mensal via código quando o personal envia novo plano
- Sem UI de edição — rebuild via EAS Update (over-the-air, sem reinstalar)

### 4. Hidratação
- Tracker de volume acumulado (não é check/uncheck)
- Meta: 4L água + 500ml chá de cavalinha
- Botões rápidos de incremento (ex: +250ml, +500ml)
- Barra de progresso visual
- Separação entre água mineral e chá de cavalinha

### 5. Cardio
- Meta diária: 80min
- Suporte a múltiplas sessões (sessão principal + sessão extra opcional)
- Campo de duração por sessão (ex: 50min + 30min)
- Soma total do dia visível
- Check automático quando atingir 80min

### 6. Refeição Livre
- 1 refeição livre por semana
- Disponível apenas em dias de treino
- Toggle "usar refeição livre" que substitui uma refeição do cardápio
- Contador semanal visível (0/1 usado)
- Reset do contador semanal toda segunda às 4h

### 7. Consulta Rápida do Treino
- Aba/tela separada com o treino do dia baseado na periodização (A/B/C/D/E)
- Rotação automática seg→sex (A: Peito, B: Costas, C: Pernas, D: Ombros, E: Braços)
- Lista de exercícios com séries (WS, TS, BS, CS) e observações
- Apenas consulta — sem tracking de carga/repetições (não é o foco do app)

### 8. Notificações Locais
- Notificações agrupadas por período/refeição (ex: "Refeição 1 — 8 itens pendentes")
- Configuração de horários base por refeição
- Quick-check direto na notificação (marcar como feito sem abrir o app)
- Notificação de hidratação periódica (ex: a cada 2h se estiver abaixo da meta)

### 9. Histórico & Aderência
- Calendário mostrando dias completos, parciais e perdidos
- Porcentagem de aderência semanal/mensal
- Visualização de quais itens são mais esquecidos
- Streak de dias consecutivos 100%

---

## Nice to Have (v2+)

### 10. Widget iOS
- Widget na home screen com próximo item pendente e horário
- Contagem de itens restantes no dia
- Progresso da hidratação

### 11. Notas & Observações
- Campo de nota por dia (ex: "senti enjoo com o manipulado X")
- Útil para feedback ao personal/nutri

### 12. Fotos de Refeições
- Anexar foto opcional em cada refeição marcada
- Referência rápida para o personal avaliar

### 13. Exportação
- Resumo semanal exportável (PDF ou texto)
- Compartilhar aderência com o personal via WhatsApp

---

## Persistência (AsyncStorage)

O app usa AsyncStorage apenas para:
- **Estado dos checks do dia** — persiste entre abrir/fechar o app, reseta às 4h
- **Histórico de aderência** — salva por dia: `{ data: "2025-02-25", completados: 18, total: 20 }`
- **Contador de refeição livre** — quantas usadas na semana atual
- **Volume de hidratação do dia** — ml acumulados
- **Duração de cardio do dia** — minutos acumulados por sessão
- **Configuração de notificações** — toggles e horários por refeição

Todo o resto (plano, treinos, itens, dosagens) é hardcoded.

---

## Tech Stack

- **Framework:** React Native + Expo (Expo Router)
- **Linguagem:** TypeScript
- **Storage local:** AsyncStorage
- **Notificações:** expo-notifications (locais + notification actions)
- **Estado:** Zustand
- **UI:** Nativewind (Tailwind no React Native)

---

## Observações

- App 100% offline-first — dados ficam no device
- Sem backend — tudo local
- Plano vem hardcoded; atualização mensal via código + EAS Update
- Foco em UX simples: abrir → ver o que falta → marcar → fechar
- Treinos de segunda a sexta, sábado e domingo são dias off
- Abdômen e panturrilha: 3x na semana, separado do treino (não trackado no app por enquanto)
