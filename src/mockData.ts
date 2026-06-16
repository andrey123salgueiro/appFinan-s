import { Transaction, Goal, Budget, CreditCard, Bill, CategorizationRule, Notification, GroupExpense } from "./types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    description: "Salário Mensal Tecnologia",
    amount: 8500.00,
    type: "income",
    category: "Receita",
    subCategory: "Salário",
    date: "2026-06-01",
    account: "Conta Corrente",
    isFixed: true
  },
  {
    id: "t2",
    description: "Rendimento CDB XP",
    amount: 195.50,
    type: "income",
    category: "Receita",
    subCategory: "Investimentos",
    date: "2026-06-02",
    account: "Investimentos",
    isFixed: false
  },
  {
    id: "t3",
    description: "Aluguel Apartamento",
    amount: 1800.00,
    type: "expense",
    category: "Moradia",
    subCategory: "Aluguel",
    date: "2026-06-01",
    account: "Conta Corrente",
    isFixed: true
  },
  {
    id: "t4",
    description: "Supermercado Pão de Açúcar",
    amount: 450.00,
    type: "expense",
    category: "Alimentação",
    subCategory: "Supermercado",
    date: "2026-06-02",
    account: "Conta Corrente",
    isFixed: false
  },
  {
    id: "t5",
    description: "Jantar - Pizzaria Saborosa",
    amount: 180.00,
    type: "expense",
    category: "Alimentação",
    subCategory: "Restaurantes",
    date: "2026-06-02",
    account: "Conta Corrente",
    isFixed: false
  },
  {
    id: "t6",
    description: "Posto Shell Gasolina",
    amount: 120.00,
    type: "expense",
    category: "Transporte",
    subCategory: "Combustível",
    date: "2026-06-02",
    account: "Conta Corrente",
    isFixed: false
  },
  {
    id: "t7",
    description: "Assinatura Netflix Premium",
    amount: 55.90,
    type: "expense",
    category: "Lazer",
    subCategory: "Assinatura",
    date: "2026-06-01",
    account: "Conta Corrente",
    isFixed: true
  },
  {
    id: "t8",
    description: "Compra Monitor Ultrawide (Parcela 2/5)",
    amount: 300.00,
    type: "expense",
    category: "Compras",
    subCategory: "Eletrônicos",
    date: "2026-06-01",
    account: "Conta Corrente",
    isFixed: false,
    installmentCurrent: 2,
    installmentTotal: 5
  },
  {
    id: "t9",
    description: "Consulta Pediátrica",
    amount: 250.00,
    type: "expense",
    category: "Saúde",
    subCategory: "Médicos",
    date: "2026-05-28",
    account: "Conta Corrente",
    isFixed: false
  },
  {
    id: "t10",
    description: "Academia SmartFit",
    amount: 119.90,
    type: "expense",
    category: "Saúde",
    subCategory: "Mensalidade",
    date: "2026-05-25",
    account: "Conta Corrente",
    isFixed: true
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    name: "Reserva de Emergência",
    target: 15000.00,
    current: 12000.00,
    deadlineMonths: 6,
    category: "Reserva"
  },
  {
    id: "g2",
    name: "Viagem de Ano Novo",
    target: 8000.00,
    current: 3200.00,
    deadlineMonths: 7,
    category: "Lazer"
  },
  {
    id: "g3",
    name: "Entrada Imóvel / Carro",
    target: 50000.00,
    current: 10000.00,
    deadlineMonths: 24,
    category: "Grande Objetivo"
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: "Alimentação", limit: 1200.00, current: 630.00 }, // R$ 450 + R$ 180 = 630 (52.5%)
  { category: "Transporte", limit: 400.00, current: 120.00 }, // 120
  { category: "Moradia", limit: 2500.00, current: 1800.00 }, // Rent R$ 1800 (72%)
  { category: "Lazer", limit: 500.00, current: 55.90 }, // Netflix R$ 55.90 (11%)
  { category: "Saúde", limit: 600.00, current: 369.90 }, // R$ 250 + R$ 119.90 = 369.90 (61.6%)
  { category: "Compras", limit: 1000.00, current: 300.00 } // Monitor parcel R$ 300 (30%)
];

export const INITIAL_CREDIT_CARDS: CreditCard[] = [
  {
    id: "c1",
    name: "Nubank UltraVioleta",
    limitTotal: 12000.00,
    limitUsed: 2340.50,
    closingDay: 6,
    dueDay: 13,
    currentInvoiceAmount: 940.50
  },
  {
    id: "c2",
    name: "XP Visa Infinite",
    limitTotal: 15000.00,
    limitUsed: 1200.00,
    closingDay: 1,
    dueDay: 8,
    currentInvoiceAmount: 450.00
  }
];

export const INITIAL_BILLS: Bill[] = [
  { id: "b1", name: "Netflix Premium", amount: 55.90, dueDate: "2026-06-10", frequency: "mensal", paused: false, category: "Lazer" },
  { id: "b2", name: "Spotify Família", amount: 34.90, dueDate: "2026-06-12", frequency: "mensal", paused: false, category: "Lazer" },
  { id: "b3", name: "Gympass / Academia", amount: 119.90, dueDate: "2026-06-22", frequency: "mensal", paused: false, category: "Saúde" },
  { id: "b4", name: "Seguro Auto", amount: 240.00, dueDate: "2026-06-25", frequency: "mensal", paused: false, category: "Transporte" }
];

export const INITIAL_RULES: CategorizationRule[] = [
  { id: "r1", pattern: "Mercado Livre", category: "Compras", subCategory: "Geral" },
  { id: "r2", pattern: "Uber", category: "Transporte", subCategory: "Uber/Aplicativos" },
  { id: "r3", pattern: "iFood", category: "Alimentação", subCategory: "Delivery" }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Alerta de Orçamento Próximo ao Limite",
    message: "Sua categoria 'Alimentação' atingiu 52.5% do orçamento com apenas 3 dias de mês decorridos.",
    type: "alert",
    date: "2026-06-03",
    read: false
  },
  {
    id: "2",
    title: "Vencimento de Fatura Próxima",
    message: "A fatura do cartão Nubank fecha em 3 dias (06 de Junho). Valor atual: R$ 940,50.",
    type: "info",
    date: "2026-06-03",
    read: false
  },
  {
    id: "3",
    title: "Meta Reserva de Emergência",
    message: "Parabéns! Você está a 80% do caminho de consolidar sua Reserva de Emergência.",
    type: "success",
    date: "2026-06-02",
    read: true
  }
];

export const INITIAL_GROUP_EXPENSES: GroupExpense[] = [
  {
    id: "gex1",
    description: "Hospedagem Sítio",
    amount: 1200.00,
    paidBy: "Me (Andrey)",
    splits: { "Me (Andrey)": 25, "Gabriel": 25, "Letícia": 25, "Lucas": 25 },
    date: "2026-05-20"
  },
  {
    id: "gex2",
    description: "Churrasco no Sítio",
    amount: 450.00,
    paidBy: "Gabriel",
    splits: { "Me (Andrey)": 25, "Gabriel": 25, "Letícia": 25, "Lucas": 25 },
    date: "2026-05-21"
  },
  {
    id: "gex3",
    description: "Pedágio & Combustível",
    amount: 160.00,
    paidBy: "Letícia",
    splits: { "Me (Andrey)": 50, "Gabriel": 0, "Letícia": 50, "Lucas": 0 },
    date: "2026-05-21"
  }
];

export const HISTORIC_WEALTH = [
  { month: "Jan/26", Corrente: 2500, Poupança: 10000, Investimentos: 20000, Dinheiro: 300 },
  { month: "Feb/26", Corrente: 3100, Poupança: 10500, Investimentos: 21500, Dinheiro: 350 },
  { month: "Mar/26", Corrente: 2800, Poupança: 11000, Investimentos: 23000, Dinheiro: 400 },
  { month: "Apr/26", Corrente: 4200, Poupança: 11500, Investimentos: 24200, Dinheiro: 280 },
  { month: "May/26", Corrente: 3120, Poupança: 12000, Investimentos: 25400, Dinheiro: 320 },
  { month: "Jun/26", Corrente: 8871, Poupança: 12000, Investimentos: 25595, Dinheiro: 320 } // reflects current balances
];
