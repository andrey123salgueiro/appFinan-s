import React, { useState } from "react";
import { CreditCard as CardIcon, HelpCircle, Flame, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, Info, Trash2 } from "lucide-react";
import { CreditCard } from "../types";

interface CreditCardsProps {
  cards: CreditCard[];
  onUpdateLimitUsed: (id: string, amount: number) => void;
}

interface CustomDebt {
  id: string;
  name: string;
  balance: number;
  rate: number; // monthly interest rate in %
  minPayment: number;
}

export default function FinanceCreditCards({
  cards,
  onUpdateLimitUsed
}: CreditCardsProps) {
  // Custom debts list for strategic optimization simulation
  const [debts, setDebts] = useState<CustomDebt[]>([
    { id: "d1", name: "Cartão Nubank Atrasado", balance: 1840.00, rate: 14.5, minPayment: 200 },
    { id: "d2", name: "Empréstimo Pessoal Caixa", balance: 8500.00, rate: 4.8, minPayment: 350 },
    { id: "d3", name: "Cheque Especial Itaú", balance: 1200.00, rate: 8.0, minPayment: 150 }
  ]);

  // Debt addition state
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtBalance, setNewDebtBalance] = useState("");
  const [newDebtRate, setNewDebtRate] = useState("");
  const [newDebtMin, setNewDebtMin] = useState("");

  // Payoff strategist picker
  const [payoffStrategy, setPayoffStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // Interest cost simulator state
  const [invoiceAmount, setInvoiceAmount] = useState("1500");
  const [interestRate, setInterestRate] = useState("14.5"); // default Nubank rotative
  const [monthsDelayed, setMonthsDelayed] = useState("3");

  const [simulatedOutcome, setSimulatedOutcome] = useState<any | null>(null);

  // Add custom debt
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtName || !newDebtBalance || !newDebtRate) return;

    setDebts([
      ...debts,
      {
        id: `debt-${Date.now()}`,
        name: newDebtName,
        balance: parseFloat(newDebtBalance),
        rate: parseFloat(newDebtRate),
        minPayment: parseFloat(newDebtMin) || 100
      }
    ]);

    setNewDebtName("");
    setNewDebtBalance("");
    setNewDebtRate("");
    setNewDebtMin("");
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  // Perform interest rate cost computation
  const handleSimulateInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(invoiceAmount) || 0;
    const rateMonthly = (parseFloat(interestRate) || 0) / 100;
    const months = parseInt(monthsDelayed) || 1;

    // Minimum payment (usually 15% in Brazil)
    const minPay = principal * 0.15;
    const unpaidBalance = principal - minPay;

    // Compounded interest: S = P * (1 + r)^n
    const finalDebtAfterPeriod = unpaidBalance * Math.pow(1 + rateMonthly, months);
    const interestAccrued = finalDebtAfterPeriod - unpaidBalance;
    const totalCostPayed = minPay + finalDebtAfterPeriod;

    setSimulatedOutcome({
      minPay,
      unpaidBalance,
      finalDebtAfterPeriod,
      interestAccrued,
      totalCostPayed,
      lostPercentage: (interestAccrued / principal) * 100
    });
  };

  // Sorting debts according to selected method
  const getSortedDebts = () => {
    if (payoffStrategy === 'avalanche') {
      // Sort by highest interest rate first
      return [...debts].sort((a, b) => b.rate - a.rate);
    } else {
      // Snowball: sort by smallest outstanding balance first
      return [...debts].sort((a, b) => a.balance - b.balance);
    }
  };

  const sortedDebtsOutcome = getSortedDebts();

  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="credit-cards-and-debts">
      
      {/* LEFT COLUMN: Cartões de Créditos e Simulador de Juros (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Credit Cards list with closes cerrar indicators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <CardIcon className="w-5 h-5 text-blue-600" />
              Meus Cartões de Crédito
            </h3>
            <p className="text-xs text-slate-500">Visualização de limite disponível, faturas atuais e compras parceladas.</p>
          </div>

          <div className="space-y-4">
            {cards.map(card => {
              const limitAvailable = card.limitTotal - card.limitUsed;
              const percentUsed = (card.limitUsed / card.limitTotal) * 100;

              return (
                <div key={card.id} className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-inner">
                  {/* Glowing background gradient for realism */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">{card.name}</span>
                      <p className="text-sm font-medium font-mono text-slate-300">•••• •••• •••• {card.id === 'c1' ? '4590' : '9012'}</p>
                    </div>
                    {/* Simulated Visa or mastercard chip decoration */}
                    <div className="w-8 h-6 bg-amber-400/20 border border-amber-400/30 rounded-md" />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Fatura Atual</span>
                      <p className="text-xl font-extrabold text-white font-mono">{fmt(card.currentInvoiceAmount)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Limite Livre</span>
                      <p className="text-sm font-semibold text-slate-200 font-mono">{fmt(limitAvailable)} de {fmt(card.limitTotal)}</p>
                    </div>
                  </div>

                  {/* Limit bar ratio */}
                  <div className="space-y-1 mt-4">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${percentUsed}%` }} className="h-full bg-blue-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{percentUsed.toFixed(0)}% do limite usado</span>
                      <span>Fecha dia {card.closingDay} • Vence dia {card.dueDay}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulador de Atrasos / Juros Rotativos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
              Simulador de Custo de Juros Rotativos
            </h4>
            <p className="text-xs text-slate-400">Calcule o custo real de financiar uma compra pelo mínimo ou atrasar o cartão de crédito.</p>
          </div>

          <form onSubmit={handleSimulateInterest} className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Valor Fatura (R$)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Juros ao Mês (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tempo (Meses)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={monthsDelayed}
                  onChange={(e) => setMonthsDelayed(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Simular Custo Real
            </button>
          </form>

          {/* Simulated result outcome view */}
          {simulatedOutcome && (
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-2">
              <span className="font-bold text-slate-900 block font-sans">Simulação do Impacto Financeiro</span>
              <p className="text-[11px] text-slate-600">
                Se você pagar apenas o mínimo compulsório de 15% (<strong>{fmt(simulatedOutcome.minPay)}</strong>), restará um saldo devedor de {fmt(simulatedOutcome.unpaidBalance)} no rotativo.
              </p>
              
              <div className="grid grid-cols-2 gap-2 border-t border-rose-200/50 pt-2 font-mono">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Dívida Final ({monthsDelayed}m)</span>
                  <p className="text-sm font-extrabold text-rose-700">{fmt(simulatedOutcome.finalDebtAfterPeriod)}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Juros Jogado Fora</span>
                  <p className="text-sm font-extrabold text-rose-700">{fmt(simulatedOutcome.interestAccrued)}</p>
                </div>
              </div>

              <div className="bg-rose-100 text-rose-950 p-2 text-[10px] font-semibold rounded-lg flex items-center gap-1.5 mt-2 animate-bounce">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Isso custa adicionais {simulatedOutcome.lostPercentage.toFixed(0)}% do valor original da sua compra em puro juros!</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: Estratégias de Quitação de Dívidas (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Payoff strategies roadmap generator (Diferencial) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Flame className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Otimizador de Quitação de Dívidas
            </h4>
            <p className="text-xs text-slate-400">Ordene e estruture o plano de pagamento correto para se livrar do passivo com menos juros.</p>
          </div>

          {/* Strategy Selection Controls */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPayoffStrategy('avalanche')}
              className={`py-1.5 rounded-lg transition-all ${payoffStrategy === 'avalanche' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              id="strategy-avalanche-btn"
            >
              Método Avalanche (Maior Juros)
            </button>
            <button
              onClick={() => setPayoffStrategy('snowball')}
              className={`py-1.5 rounded-lg transition-all ${payoffStrategy === 'snowball' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              id="strategy-snowball-btn"
            >
              Método Bola de Neve (Menor Saldo)
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Dívidas Ativas Cadastradas</span>
              <span className="text-[10px] text-blue-600 font-semibold font-display">Total: {fmt(debts.reduce((sum, d) => sum + d.balance, 0))}</span>
            </div>

            {/* List */}
            <div className="space-y-2">
              {sortedDebtsOutcome.map((db, ix) => (
                <div key={db.id} className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full font-mono">
                        {ix + 1}
                      </span>
                      {db.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Juros de {db.rate}% ao mês • Pag. mínimo: {fmt(db.minPayment)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 font-mono">{fmt(db.balance)}</span>
                    <button
                      onClick={() => handleDeleteDebt(db.id)}
                      className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategy Roadmap Explanation Cards */}
            <div className="p-4 bg-amber-500/10 text-slate-900 rounded-xl border border-amber-500/20 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold uppercase tracking-wide text-[10px]">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Ordem de Ataque Recomendada ({payoffStrategy === 'avalanche' ? 'Avalanche' : 'Bola de Neve'})</span>
              </div>
              
              {payoffStrategy === 'avalanche' ? (
                <p>
                  O método <strong>Avalanche</strong> ordena suas dívidas pelas **taxas de juros mais elevadas**. Ao focalizar todo seu orçamento disponível para liquidar a dívida 1 (<strong>{sortedDebtsOutcome[0]?.name}</strong> com {sortedDebtsOutcome[0]?.rate}% a.m), você minimiza matematicamente o montante total de juros pagos ao longo do tempo.
                </p>
              ) : (
                <p>
                  O método <strong>Bola de Neve</strong> ordena as contas pelo **menor saldo total devedor**. Ideia comportamental inteligente: quitar a conta 1 (<strong>{sortedDebtsOutcome[0]?.name}</strong> de {fmt(sortedDebtsOutcome[0]?.balance)}) rapidamente lhe dá pequenas conquistas psicológicas e libera seu fluxo de caixa mensal imediato para turbinar os pagamentos das dívidas maiores.
                </p>
              )}

              <div className="bg-white p-2.5 rounded-lg border border-amber-500/10 space-y-1 text-[11px] leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900 block">Como Executar:</span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Pague estritamente os valores mínimos exigidos de todas as outras dívidas.</li>
                  <li>Jogue qualquer excedente financeiro exclusivamente na dívida #1 (<strong>{sortedDebtsOutcome[0]?.name}</strong>).</li>
                  <li>Assim que quitada, direcione a parcela correspondente para turbinar a quitar a dívida #2.</li>
                </ol>
              </div>
            </div>

            {/* Quick addition of custom debt */}
            <form onSubmit={handleAddDebt} className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cadastrar Outra Dívida / Parcelamento</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nome (Ex: Empréstimo Sogrão)"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
                <input
                  type="number"
                  placeholder="Saldo Total Devedor (R$)"
                  value={newDebtBalance}
                  onChange={(e) => setNewDebtBalance(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Taxa de Juros Mensal (%)"
                  value={newDebtRate}
                  onChange={(e) => setNewDebtRate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
                <input
                  type="number"
                  placeholder="Pagamento Mínimo (R$)"
                  value={newDebtMin}
                  onChange={(e) => setNewDebtMin(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer"
              >
                Cadastrar na Lista de Ataque
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
export { Trash2 };
