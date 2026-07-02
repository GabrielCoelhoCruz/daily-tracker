# ShapeIQ MVP — Device Smoke Test

> **This file is a script for device validation. It does not mean device validation has already happened.**
>
> Rode em pelo menos um alvo: iOS Simulator, Android Emulator, Expo Go ou dispositivo real. Marque cada item ao executar. Anote build/dispositivo/data no topo antes de enviar para testadores.

- Data: ____
- Dispositivo/alvo: ____
- Build/commit: ____

## A. Setup

- [ ] Instalar/rodar o app (`npx expo start` + Expo Go, ou build de dev no simulador/emulador)
- [ ] Estado limpo: primeira instalação, ou limpar dados do app (iOS: apagar app; Android: limpar dados; Expo Go: limpar dados do Expo Go)
- [ ] App abre no onboarding (não nas tabs)

## B. Flow A — "Tenho coach"

- [ ] Escolher "Tenho coach" e preencher objetivo/perfil/check-in
- [ ] A etapa **"Importar plano"** mostra as três opções: **Importar PDF** (destaque), **Colar texto** e **Cadastrar manualmente**, com o disclaimer no rodapé
- [ ] Colar o plano de exemplo do handoff em **"Colar texto"**:

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

- [ ] Revisar a prévia (períodos/itens/metas detectados) e ativar
- [ ] Cair em **Hoje** com próxima ação real

### B.1 Importar PDF (requer rede + backend com chave do provedor de IA configurada)

O upload de arquivo real não roda no smoke runner web — validar manualmente no dispositivo:

- [ ] Gerar um PDF de texto com o mesmo plano de exemplo acima (ex.: exportar de um editor de texto; precisa ter texto selecionável, não escaneado)
- [ ] Em "Importar plano" → **"Importar PDF"** → tela mostra nota de privacidade → **"Escolher PDF"**
- [ ] Selecionar arquivo não-PDF → erro "Por enquanto, importe apenas arquivos PDF." (fluxo não trava)
- [ ] Selecionar o PDF do plano → estados de processamento aparecem ("Lendo arquivo…" → … → "Preparando revisão…")
- [ ] Revisão mostra: 3 períodos, 7 itens, Água 3000 ml, Cardio 40 min, Treino ABCDE, Fechamento 21:00
- [ ] Treino/fechamento **não** aparecem como itens dentro de "Jantar"
- [ ] Editar um item e uma meta (ex.: água) antes de ativar → valores editados valem
- [ ] **"Ativar plano"** → volta ao onboarding com metas prefill (água/cardio/fechamento do PDF)
- [ ] Cancelar no meio do processamento → volta sem corromper o onboarding
- [ ] Modo avião → tentar importar → mensagem "Importação com IA precisa de conexão…" e fallback para colar texto
- [ ] (Se disponível) PDF escaneado → mensagem de OCR indisponível com fallback claro
- [ ] (Se plano contiver itens sensíveis) seção "Itens sensíveis" aparece e itens não entram no checklist
- [ ] Executar: marcar refeição, registrar água (+250 ml), registrar cardio, concluir treino
- [ ] Antes do horário configurado: fechamento com pendência leva de volta à execução (sem "Fechar mesmo assim")
- [ ] Depois do horário configurado: fechar o dia funciona; dia fica read-only
- [ ] **Logs** mostra o dia fechado
- [ ] "Resumo para coach" gera texto com dados reais (ausentes = "não registrado")
- [ ] Share sheet nativo abre e compartilha o resumo

## C. Flow B — "Estou sem coach"

- [ ] Estado limpo → onboarding → "Estou sem coach"
- [ ] Criar plano-base completo em **menos de 3 minutos** (água, refeições, cardio, semana de treino, fechamento)
- [ ] Marcar refeição como **Feito**
- [ ] Long-press em refeição → **"Feito parcial"** (badge "Parcial" aparece)
- [ ] Marcar item como **Fora do plano** / pular com motivo
- [ ] Registrar água e cardio
- [ ] Status de treino do dia correto (treino/cardio/descanso)
- [ ] Fechar o dia (parcial aparece como vazamento leve "refeição parcial")
- [ ] **Logs** reflete o dia fechado
- [ ] "Resumo da semana" gera texto correto

## D. Flow C — Específico de dispositivo

- [ ] Matar o app após o onboarding e reabrir: plano e perfil persistem (não volta para onboarding)
- [ ] Matar o app após ações do checklist e reabrir: checks, água, cardio e fechamento persistem
- [ ] Check-in com **câmera**: foto salva
- [ ] Check-in com **galeria**: foto salva
- [ ] Reabrir o app: URIs das fotos ainda carregam (persistência de foto)
- [ ] Peso e nota do check-in salvos e exibidos
- [ ] Comparar dois check-ins lado a lado (delta de peso e datas corretos)
- [ ] Ângulo sem foto mostra empty state em PT-BR (não quebra)
- [ ] Share sheet nativo funciona a partir do resumo/análise
- [ ] Ativar modo demo com perfil real já completo: dados reais **não** são sobrescritos (apenas registros `demo-` adicionados); "Limpar dados demo" remove só eles
- [ ] Modo avião: marcar refeição, água, cardio, fechar dia e criar check-in funcionam sem rede

## E. Critérios de aceite

- [ ] Nenhum crash em nenhum fluxo acima
- [ ] Dados persistem entre restarts do app
- [ ] Nenhuma leitura de palco / score de IA falso visível em nenhuma tela alcançável
- [ ] Usuário real não tem acesso a plano de exemplo/padrão via UI
- [ ] Fechamento respeita o horário configurado
- [ ] Todo texto visível em PT-BR (exceto nomes oficiais de poses)
- [ ] Resumo usa dados reais ou "não registrado" — nunca dados inventados

## Resultado

- [ ] PASSOU — pronto para liberar aos testadores
- [ ] FALHOU — registrar itens reprovados e corrigir antes de liberar
