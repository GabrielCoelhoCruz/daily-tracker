export type Categoria =
  | "suplemento"
  | "refeicao"
  | "hormonal"
  | "treino"
  | "cardio";

export type RegraCondicional = {
  diasDaSemana?: number[];
  apenasEmDiaDeTreino?: boolean;
};

export type ItemDoPlano = {
  id: string;
  nome: string;
  dosagem?: string;
  categoria: Categoria;
  regra?: RegraCondicional;
  opcional?: boolean;
  subItens?: ItemDoPlano[];
};

export type Periodo = {
  id: string;
  nome: string;
  descricao?: string;
  itens: ItemDoPlano[];
  regra?: RegraCondicional;
};

export type Dica = {
  id: string;
  categoria: "nutricao" | "treino";
  texto: string;
};

export type Plano = {
  nome: string;
  descricao: string;
  periodos: Periodo[];
  metaHidratacao: { aguaMl: number; chaMl: number };
  metaCardioMin: number;
};

export const plano: Plano = {
  nome: "Plano Fev/2026 - Team GB",
  descricao: "Gabriel Cruz - Fevereiro 2026",
  metaHidratacao: { aguaMl: 4000, chaMl: 500 },
  metaCardioMin: 80,
  periodos: [
    {
      id: "jejum",
      nome: "Jejum",
      itens: [
        {
          id: "jejum-cafeina",
          nome: "Cafeína",
          dosagem: "220mg",
          categoria: "suplemento",
        },
        {
          id: "jejum-ioimbina",
          nome: "Ioimbina",
          dosagem: "10mg",
          categoria: "suplemento",
        },
        {
          id: "jejum-teacrine",
          nome: "Teacrine",
          dosagem: "150mg",
          categoria: "suplemento",
        },
        {
          id: "jejum-anastrozol",
          nome: "Anastrozol",
          dosagem: "0.5mg",
          categoria: "suplemento",
          regra: { diasDaSemana: [1, 5] },
        },
      ],
    },
    {
      id: "ref1",
      nome: "Refeição 1",
      descricao: "Desjejum / Pré treino",
      itens: [
        {
          id: "ref1-claras",
          nome: "Claras de ovo",
          dosagem: "6 unidades",
          categoria: "refeicao",
        },
        {
          id: "ref1-ovos",
          nome: "Ovos inteiros",
          dosagem: "2 unidades",
          categoria: "refeicao",
        },
        {
          id: "ref1-aveia",
          nome: "Aveia",
          dosagem: "30g",
          categoria: "refeicao",
        },
        {
          id: "ref1-mamao",
          nome: "Mamão",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref1-chia",
          nome: "Chia",
          dosagem: "10g",
          categoria: "refeicao",
        },
        {
          id: "ref1-pasta-amendoim",
          nome: "Pasta de amendoim",
          dosagem: "20g",
          categoria: "refeicao",
        },
        {
          id: "ref1-canela-adocante",
          nome: "Canela e adoçante",
          categoria: "refeicao",
        },
        {
          id: "ref1-suplementos",
          nome: "Suplementos",
          categoria: "suplemento",
          subItens: [
            {
              id: "ref1-vitc",
              nome: "Vitamina C",
              dosagem: "1g",
              categoria: "suplemento",
            },
            {
              id: "ref1-poli",
              nome: "Polivitamínico TEAM GB",
              categoria: "suplemento",
            },
            {
              id: "ref1-nac",
              nome: "NAC",
              dosagem: "600mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-omega3",
              nome: "Omega 3",
              dosagem: "2000mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-vite",
              nome: "Vitamina E",
              dosagem: "400ui",
              categoria: "suplemento",
            },
            {
              id: "ref1-berberina",
              nome: "Berberina",
              dosagem: "500mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-nattokinase",
              nome: "Nattokinase",
              dosagem: "150mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-dobesilato",
              nome: "Dobesilato de Cálcio",
              dosagem: "500mg",
              categoria: "suplemento",
            },
          ],
        },
      ],
    },
    {
      id: "ref2",
      nome: "Refeição 2",
      descricao: "Pré treino",
      itens: [
        {
          id: "ref2-proteina",
          nome: "Frango ou tilápia",
          dosagem: "180g",
          categoria: "refeicao",
        },
        {
          id: "ref2-carbo",
          nome: "Arroz ou macarrão",
          dosagem: "90g",
          categoria: "refeicao",
        },
        {
          id: "ref2-azeite",
          nome: "Azeite",
          dosagem: "8g",
          categoria: "refeicao",
        },
        {
          id: "ref2-vegetais",
          nome: "Vegetais",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref2-folhas",
          nome: "Folhas",
          categoria: "refeicao",
        },
        {
          id: "ref2-suplementos",
          nome: "Suplementos",
          categoria: "suplemento",
          subItens: [
            {
              id: "ref2-cafeina",
              nome: "Cafeína",
              dosagem: "220mg",
              categoria: "suplemento",
            },
            {
              id: "ref2-ioimbina",
              nome: "Ioimbina",
              dosagem: "10mg",
              categoria: "suplemento",
            },
            {
              id: "ref2-teacrine",
              nome: "Teacrine",
              dosagem: "150mg",
              categoria: "suplemento",
            },
            {
              id: "ref2-vitc",
              nome: "Vitamina C",
              dosagem: "1g",
              categoria: "suplemento",
            },
            {
              id: "ref2-oxandrolona",
              nome: "Oxandrolona",
              dosagem: "40mg",
              categoria: "suplemento",
              regra: { apenasEmDiaDeTreino: true },
            },
          ],
        },
      ],
    },
    {
      id: "intra-treino",
      nome: "Intra Treino",
      regra: { apenasEmDiaDeTreino: true },
      itens: [
        {
          id: "intra-intensity",
          nome: "Intensity Hunter",
          dosagem: "40g",
          categoria: "suplemento",
        },
        {
          id: "intra-glutamina",
          nome: "Glutamina",
          dosagem: "10g",
          categoria: "suplemento",
        },
        {
          id: "intra-creatina",
          nome: "Creatina",
          dosagem: "10g",
          categoria: "suplemento",
        },
        {
          id: "intra-eaas",
          nome: "EAAs",
          dosagem: "10g",
          categoria: "suplemento",
        },
      ],
    },
    {
      id: "ref3",
      nome: "Refeição 3",
      descricao: "Pós treino",
      itens: [
        {
          id: "ref3-whey",
          nome: "Killer Whey",
          dosagem: "40g",
          categoria: "refeicao",
        },
        {
          id: "ref3-morango",
          nome: "Morango",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref3-suplementos",
          nome: "Suplementos",
          categoria: "suplemento",
          subItens: [
            {
              id: "ref3-glifage",
              nome: "Glifage XR",
              dosagem: "500mg",
              categoria: "suplemento",
            },
            {
              id: "ref3-nac",
              nome: "NAC",
              dosagem: "600mg",
              categoria: "suplemento",
            },
            {
              id: "ref3-cromo",
              nome: "Picolinato de Cromo",
              dosagem: "350mcg",
              categoria: "suplemento",
            },
            {
              id: "ref3-cafeina",
              nome: "Cafeína",
              dosagem: "210mg",
              categoria: "suplemento",
            },
          ],
        },
      ],
    },
    {
      id: "ref4",
      nome: "Refeição 4",
      itens: [
        {
          id: "ref4-proteina",
          nome: "Frango ou tilápia",
          dosagem: "180g",
          categoria: "refeicao",
        },
        {
          id: "ref4-batata",
          nome: "Batata",
          dosagem: "90g",
          categoria: "refeicao",
        },
        {
          id: "ref4-fruta",
          nome: "Abacaxi ou kiwi",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref4-azeite",
          nome: "Azeite",
          dosagem: "8g",
          categoria: "refeicao",
        },
        {
          id: "ref4-vegetais",
          nome: "Vegetais",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref4-folhas",
          nome: "Folhas",
          categoria: "refeicao",
        },
      ],
    },
    {
      id: "ref5",
      nome: "Refeição 5",
      descricao: "Ceia",
      itens: [
        {
          id: "ref5-carne",
          nome: "Carne vermelha magra",
          dosagem: "180g",
          categoria: "refeicao",
        },
        {
          id: "ref5-ovos",
          nome: "Ovos",
          dosagem: "2 unidades",
          categoria: "refeicao",
        },
        {
          id: "ref5-batata",
          nome: "Batata",
          dosagem: "90g",
          categoria: "refeicao",
        },
        {
          id: "ref5-mamao",
          nome: "Mamão",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref5-vegetais",
          nome: "Vegetais",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref5-folhas",
          nome: "Folhas",
          categoria: "refeicao",
        },
        {
          id: "ref5-suplementos",
          nome: "Suplementos",
          categoria: "suplemento",
          subItens: [
            {
              id: "ref5-vitc",
              nome: "Vitamina C",
              dosagem: "1g",
              categoria: "suplemento",
            },
            {
              id: "ref5-glifage",
              nome: "Glifage XR",
              dosagem: "500mg",
              categoria: "suplemento",
            },
            {
              id: "ref5-omega3",
              nome: "Omega 3",
              dosagem: "2000mg",
              categoria: "suplemento",
            },
            {
              id: "ref5-vite",
              nome: "Vitamina E",
              dosagem: "400ui",
              categoria: "suplemento",
            },
            {
              id: "ref5-nac",
              nome: "NAC",
              dosagem: "600mg",
              categoria: "suplemento",
            },
            {
              id: "ref5-nattokinase",
              nome: "Nattokinase",
              dosagem: "150mg",
              categoria: "suplemento",
            },
          ],
        },
      ],
    },
    {
      id: "hormonal",
      nome: "Protocolo Hormonal",
      itens: [
        {
          id: "hormonal-enantest",
          nome: "Enantest",
          dosagem: "150mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1, 3, 5] },
        },
        {
          id: "hormonal-masteron",
          nome: "Masteron",
          dosagem: "100mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1, 3, 5] },
        },
        {
          id: "hormonal-trembolona",
          nome: "Trembolona",
          dosagem: "75mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1, 3, 5] },
        },
      ],
    },
    {
      id: "extras",
      nome: "Extras",
      itens: [
        {
          id: "extras-abdomen",
          nome: "Abdômen",
          categoria: "treino",
          opcional: true,
          regra: { apenasEmDiaDeTreino: true },
        },
        {
          id: "extras-panturrilha",
          nome: "Panturrilha",
          categoria: "treino",
          opcional: true,
          regra: { apenasEmDiaDeTreino: true },
        },
      ],
    },
  ],
};
