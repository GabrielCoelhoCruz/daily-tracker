export type Serie = {
  tipo: "WS" | "TS" | "BS" | "CS";
  series: number;
  reps?: number | string;
  observacao?: string;
};

export type Exercicio = {
  id: string;
  nome: string;
  series: Serie[];
  observacao?: string;
};

export type Treino = {
  id: string;
  letra: string;
  grupoMuscular: string;
  exercicios: Exercicio[];
};

export const treinos: Treino[] = [
  {
    id: "treino-a",
    letra: "A",
    grupoMuscular: "Peito",
    exercicios: [
      {
        id: "a1",
        nome: "Supino inclinado máquina/hammer",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "a2",
        nome: "Supino inclinado smith",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "a3",
        nome: "Crucifixo inclinado halteres",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "BS", series: 1, reps: 15 },
        ],
      },
      {
        id: "a4",
        nome: "Supino reto máquina",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "CS", series: 1, reps: "4+4+4" },
        ],
      },
      {
        id: "a5",
        nome: "Crucifixo/peck deck",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "a6",
        nome: "Supino declinado halteres",
        series: [
          { tipo: "WS", series: 1 },
          { tipo: "TS", series: 1 },
          { tipo: "BS", series: 1, reps: 15 },
        ],
      },
      {
        id: "a7",
        nome: "Cross over",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
    ],
  },
  {
    id: "treino-b",
    letra: "B",
    grupoMuscular: "Costas",
    exercicios: [
      {
        id: "b1",
        nome: "Remada curvada pronada",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "b2",
        nome: "Remada cavalinho supinada",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "BS", series: 1, reps: 15 },
        ],
      },
      {
        id: "b3",
        nome: "Remada baixa neutra/triângulo",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "b4",
        nome: "Puxada frente aberta pronada",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "b5",
        nome: "Puxada frente fechada/supinada",
        series: [{ tipo: "WS", series: 3 }],
      },
      {
        id: "b6",
        nome: "Pulldown corda",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "b7",
        nome: "Hiperextensão lombar com carga",
        series: [{ tipo: "WS", series: 3 }],
      },
    ],
  },
  {
    id: "treino-c",
    letra: "C",
    grupoMuscular: "Pernas",
    exercicios: [
      {
        id: "c1",
        nome: "Agachamento smith",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "c2",
        nome: "Leg press 45°",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "c3",
        nome: "Stiff barra livre",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "c4",
        nome: "Mesa flexora",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "CS", series: 1, reps: "5+5+5", observacao: "10seg pausa" },
        ],
      },
      {
        id: "c5",
        nome: "Cadeira extensora",
        observacao: "1seg pico de contração",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "c6",
        nome: "Cadeira abdutora",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "c7",
        nome: "Elevação pélvica",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "c8",
        nome: "Cadeira adutora",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
    ],
  },
  {
    id: "treino-d",
    letra: "D",
    grupoMuscular: "Ombros",
    exercicios: [
      {
        id: "d1",
        nome: "Desenvolvimento máquina",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
        ],
      },
      {
        id: "d2",
        nome: "Elevação frontal halteres banco 45°",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "d3",
        nome: "Elevação lateral halteres",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 2 },
          { tipo: "BS", series: 1, reps: 15 },
        ],
      },
      {
        id: "d4",
        nome: "Elevação lateral máquina",
        observacao: "1seg pico de contração",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
          { tipo: "CS", series: 1, reps: "5+5+5" },
        ],
      },
      {
        id: "d5",
        nome: "Elevação lateral unilateral sentado",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "d6",
        nome: "Crucifixo inverso halteres",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "d7",
        nome: "Encolhimento smith",
        series: [{ tipo: "WS", series: 3 }],
      },
    ],
  },
  {
    id: "treino-e",
    letra: "E",
    grupoMuscular: "Braços",
    exercicios: [
      {
        id: "e1",
        nome: "Rosca martelo halteres",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e2",
        nome: "Tríceps francês halter",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e3",
        nome: "Rosca direta polia barra W",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e4",
        nome: "Tríceps polia barra W",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e5",
        nome: "Rosca Scott máquina",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e6",
        nome: "Tríceps testa polia/corda",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e7",
        nome: "Rosca banco 45° halteres",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e8",
        nome: "Tríceps polia corda",
        series: [
          { tipo: "WS", series: 2 },
          { tipo: "TS", series: 1 },
        ],
      },
      {
        id: "e9",
        nome: "Rosca inversa",
        series: [{ tipo: "WS", series: 3 }],
      },
    ],
  },
];
