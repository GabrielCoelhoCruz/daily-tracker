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
  nome: "Plano Maio/2026 - Team GB",
  descricao: "Gabriel Cruz - Maio 2026",
  metaHidratacao: { aguaMl: 4000, chaMl: 1000 },
  metaCardioMin: 90,
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
          id: "jejum-clembuterol",
          nome: "Clembuterol",
          dosagem: "2ml (50mcg)",
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
      descricao: "Desjejum",
      itens: [
        {
          id: "ref1-ovos",
          nome: "Ovos inteiros",
          dosagem: "3 unidades",
          categoria: "refeicao",
        },
        {
          id: "ref1-whey",
          nome: "Killer Whey",
          dosagem: "30g",
          categoria: "refeicao",
        },
        {
          id: "ref1-aveia",
          nome: "Aveia",
          dosagem: "25g",
          categoria: "refeicao",
        },
        {
          id: "ref1-morango",
          nome: "Morango",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref1-chia",
          nome: "Semente de chia",
          dosagem: "5g",
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
              dosagem: "1 dose",
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
              id: "ref1-dobesilato",
              nome: "Dobesilato de Cálcio",
              dosagem: "500mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-pioglitazona",
              nome: "Pioglitazona",
              dosagem: "15mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-acido-lipoico",
              nome: "Ácido alfa lipóico",
              dosagem: "600mg",
              categoria: "suplemento",
            },
            {
              id: "ref1-cromo",
              nome: "Picolinato de Cromo",
              dosagem: "400mcg",
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
          nome: "Peito de frango ou filé de tilápia",
          dosagem: "225g",
          categoria: "refeicao",
        },
        {
          id: "ref2-batata",
          nome: "Batata inglesa",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref2-azeite",
          nome: "Azeite de oliva extra virgem",
          dosagem: "15g",
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
              id: "ref2-cromo",
              nome: "Picolinato de Cromo",
              dosagem: "400mcg",
              categoria: "suplemento",
            },
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
              id: "ref2-clembuterol",
              nome: "Clembuterol",
              dosagem: "2ml (50mcg)",
              categoria: "suplemento",
            },
            {
              id: "ref2-vitc",
              nome: "Vitamina C",
              dosagem: "1g",
              categoria: "suplemento",
            },
            {
              id: "ref2-acido-lipoico",
              nome: "Ácido alfa lipóico",
              dosagem: "600mg",
              categoria: "suplemento",
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
          dosagem: "60g",
          categoria: "refeicao",
        },
        {
          id: "ref3-nac",
          nome: "NAC",
          dosagem: "600mg",
          categoria: "suplemento",
        },
      ],
    },
    {
      id: "ref4",
      nome: "Refeição 4",
      itens: [
        {
          id: "ref4-proteina",
          nome: "Peito de frango ou filé de tilápia",
          dosagem: "225g",
          categoria: "refeicao",
        },
        {
          id: "ref4-azeite",
          nome: "Azeite de oliva extra virgem",
          dosagem: "15g",
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
          id: "ref5-proteina",
          nome: "Peito de frango ou filé de tilápia",
          dosagem: "200g",
          categoria: "refeicao",
        },
        {
          id: "ref5-ovo",
          nome: "Ovo inteiro",
          dosagem: "1 unidade",
          categoria: "refeicao",
        },
        {
          id: "ref5-fruta",
          nome: "Mamão ou abacaxi",
          dosagem: "100g",
          categoria: "refeicao",
        },
        {
          id: "ref5-oleaginosas",
          nome: "Amêndoas ou castanhas do pará",
          dosagem: "15g",
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
              dosagem: "750mg",
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
              id: "ref5-acido-lipoico",
              nome: "Ácido alfa lipóico",
              dosagem: "600mg",
              categoria: "suplemento",
            },
            {
              id: "ref5-cromo",
              nome: "Picolinato de Cromo",
              dosagem: "400mcg",
              categoria: "suplemento",
            },
            {
              id: "ref5-cetotifeno",
              nome: "Fumarato de cetotifeno",
              dosagem: "2mg (xarope)",
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
          dosagem: "175mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1, 3, 5] },
        },
        {
          id: "hormonal-masteron",
          nome: "Masteron",
          dosagem: "125mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1, 3, 5] },
        },
        {
          id: "hormonal-retatrutida",
          nome: "Retatrutida",
          dosagem: "2.5mg",
          categoria: "hormonal",
          regra: { diasDaSemana: [1] },
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
