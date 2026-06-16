import React, { useState } from "react";
import { PiggyBank, Target, CalendarDays, TrendingUp, HelpCircle, ArrowRightLeft, Sparkles, Scale, Info } from "lucide-react";
import { Goal } from "../types";

interface PlanningProps {
  goals: Goal[];
  onDepositToGoal: (id: string, amount: number) => void;
  onAddGoal: (g: Omit<Goal, 'id'>) => void;
  monthlyLeftOver: number;
}

export default function FinancePlanning({
  goals,
  onDepositToGoal,
  onAddGoal,
  monthlyLeftOver
}: PlanningProps) {
  // Goal state forms
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalMonths, setGoalMonths] = useState("12");
  const [goalCategory, setGoalCategory] = useState("Reserva");

  // Transfer simulation
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferOrigin, setTransferOrigin] = useState("Conta Corrente");

  // Investment Simulator State
  const [investPrincipal, setInvestPrincipal] = useState("5000");
  const [investMonths, setInvestMonths] = useState("12");

  // Future Projection state
  const [projectionSavings, setProjectionSavings] = useState(
    monthlyLeftOver > 0 ? Math.round(monthlyLeftOver) : 500
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    onAddGoal({
      name: goalName,
      target: parseFloat(goalTarget),
      current: 0,
      deadlineMonths: parseInt(goalMonths),
      category: goalCategory
    });

    setGoalName("");
    setGoalTarget("");
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !transferAmount) return;

    const amt = parseFloat(transferAmount);
    onDepositToGoal(selectedGoalId, amt);
    
    // reset
    setTransferAmount("");
    alert(`Transferência de R$ ${amt.toFixed(2)} efetuada com sucesso de ${transferOrigin} para a Caixinha!`);
  };

  // Investment calculations
  const calculateInvestments = () => {
    const principal = parseFloat(investPrincipal) || 0;
    const months = parseInt(investMonths) || 12;
    const rateYears = months / 12;

    // Rates (annually in Brazil nominal)
    const poupancaRate = 0.0617; // 6.17% TR included (approx)
    const cdbRate = 0.1065 * 1.10; // 110% of CDI (assuming CDI 10.65%)
    const tesouroSelicRate = 0.1065 + 0.001; // Selic + 0.1%

    // TR IR Tax tables (sliding scale based on days)
    // 1-180 days: 22.5%
    // 181-360 days: 20%
    // 361-720 days: 17.5%
    // > 720: 15%
    let irTax = 0.175;
    const days = months * 30;
    if (days <= 180) irTax = 0.225;
    else if (days <= 360) irTax = 0.20;
    else if (days <= 720) irTax = 0.175;
    else irTax = 0.15;

    // Formula: S = P * (1 + r)^t
    // For simplicity, do monthly compounding
    const getCompounded = (p: number, rAnnually: boolean, rate: number, m: number, applyIR: boolean) => {
      const monthlyRate = Math.pow(1 + rate, 1/12) - 1;
      let compoundedVal = p;
      for (let i = 0; i < m; i++) {
        compoundedVal *= (1 + monthlyRate);
      }
      const grossProfit = compoundedVal - p;
      const netProfit = applyIR ? grossProfit * (1 - irTax) : grossProfit;
      return {
        gross: compoundedVal,
        net: p + netProfit,
        profit: netProfit,
        irPaid: applyIR ? grossProfit * irTax : 0
      };
    };

    const poupanca = getCompounded(principal, true, poupancaRate, months, false);
    const cdb = getCompounded(principal, true, cdbRate, months, true);
    const tesouro = getCompounded(principal, true, tesouroSelicRate, months, true);

    return {
      poupanca,
      cdb,
      tesouro,
      irTaxPercent: irTax * 100
    };
  };

  const results = calculateInvestments();

  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="planning-overview-section">
      
      {/* LEFT SECTION: Metas & Transferência Caixinha (Columns 7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Goals / Caixinhas List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              Metas de Poupança (Caixinhas)
            </h3>
            <p className="text-xs text-slate-500">Defina objetivos específicos de aportes regulares e monitore sua evolução física.</p>
          </div>

          <div className="space-y-4">
            {goals.map(g => {
              const pct = Math.min((g.current / g.target) * 100, 100);
              const remaining = g.target - g.current;
              // recommended monthly saving to match deadline
              const recMonthly = remaining > 0 ? remaining / g.deadlineMonths : 0;

              return (
                <div key={g.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-500" />
                        {g.name}
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                          {g.category}
                        </span>
                      </p>
                    </div>

                    <div className="text-xs text-right space-y-0.5">
                      <span className="font-mono text-slate-500">
                        {fmt(g.current)} de <strong className="text-slate-900">{fmt(g.target)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-300" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progresso: {pct.toFixed(1)}%</span>
                      {remaining > 0 && (
                        <span>Para atingir em {g.deadlineMonths} meses, guarde <strong>{fmt(recMonthly)}/mês</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transferência caixinha automática simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <ArrowRightLeft className="w-4.5 h-4.5 text-blue-600" />
              Transferência Automática para as Caixinhas
            </h4>
            <p className="text-xs text-slate-400">Simule retirar dinheiro de suas contas correntes para automatizar a poupança protegida.</p>
          </div>

          <form onSubmit={handleExecuteTransfer} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Origem</label>
              <select
                value={transferOrigin}
                onChange={(e) => setTransferOrigin(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="Conta Corrente">Conta Corrente (Itaú)</option>
                <option value="Poupança">Poupança (Nubank)</option>
                <option value="Dinheiro Físico">Dinheiro Físico</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Caixinha Destino</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                required
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="">Selecione uma meta</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Valor (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="1"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={!selectedGoalId || !transferAmount}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Efetuar Aporte
              </button>
            </div>
          </form>
        </div>

        {/* Create new Goal Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Cadastrar Nova Caixinha</span>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <input
              type="text"
              placeholder="Ex: Viagem Europa, Entrada Carro"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
              className="px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg"
            />
            <input
              type="number"
              placeholder="Meta Total (R$)"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              required
              className="px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg font-mono"
            />
            <select
              value={goalMonths}
              onChange={(e) => setGoalMonths(e.target.value)}
              className="px-2 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg"
            >
              <option value="3">3 Meses</option>
              <option value="6">6 Meses</option>
              <option value="12">12 Meses</option>
              <option value="24">24 Meses</option>
              <option value="36">36 Meses</option>
            </select>
            <button type="submit" className="py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer">
              Criar Objetivo
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION: Projeções de Futuro & Simulador CDB (Columns 5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Projeção Financeira de Futuro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              Projeção Estimada de Futuro
            </h4>
            <p className="text-xs text-slate-400">“Se você continuar poupando este valor, em 6 meses você terá...”</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Investimento Fixo Mensal:</span>
                <span className="font-bold text-blue-600 font-mono">{fmt(projectionSavings)}/mês</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={projectionSavings}
                onChange={(e) => setProjectionSavings(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Calculations results block */}
            {(() => {
              const rCdb = 0.117; // approximate CDB 110% compounded annually
              const monthlyRate = Math.pow(1 + rCdb, 1/12) - 1;
              let accumulatedIn6M = 0;
              let accumulatedIn1Y = 0;

              for (let i = 1; i <= 6; i++) {
                accumulatedIn6M = (accumulatedIn6M + projectionSavings) * (1 + monthlyRate);
              }
              for (let i = 1; i <= 12; i++) {
                accumulatedIn1Y = (accumulatedIn1Y + projectionSavings) * (1 + monthlyRate);
              }

              return (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
                  <div className="text-xs space-y-0.5">
                    <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Em 6 meses</span>
                    <p className="text-lg font-bold text-slate-900 font-mono">{fmt(accumulatedIn6M)}</p>
                    <span className="text-[10px] text-slate-400 text-slate-500 font-medium">+ {fmt(accumulatedIn6M - (projectionSavings * 6))} de rendimento</span>
                  </div>

                  <div className="text-xs space-y-0.5">
                    <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Em 12 meses (1 Ano)</span>
                    <p className="text-lg font-bold text-blue-700 font-mono">{fmt(accumulatedIn1Y)}</p>
                    <span className="text-[10px] text-slate-500 font-medium">+ {fmt(accumulatedIn1Y - (projectionSavings * 12))} de rendimento</span>
                  </div>
                </div>
              );
            })()}

            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              *A projeção considera juros compostos calculados mensalmente baseados em um investimento seguro que paga 110% do CDI liquido de impostos federais retidos na fonte.
            </p>
          </div>
        </div>

        {/* Diferencial: Simulador de Investimentos CDB vs Poupança vs Tesouro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Scale className="w-4.5 h-4.5 text-purple-600" />
              Simulador de Renda Fixa (Diferencial)
            </h4>
            <p className="text-xs text-slate-400">Compare onde é melhor alocar o seu fundo de reservas financeiras.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Aporte Único (R$)</label>
              <input
                type="number"
                value={investPrincipal}
                onChange={(e) => setInvestPrincipal(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prazo (Meses)</label>
              <select
                value={investMonths}
                onChange={(e) => setInvestMonths(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="6">6 Meses</option>
                <option value="12">12 Meses (1 Ano)</option>
                <option value="24">24 Meses (2 Anos)</option>
              </select>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-3.5 pt-2 border-t border-slate-50">
            {/* Table */}
            <div className="space-y-2">
              {/* Poupança row */}
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-orange-50/35 border border-orange-100/50">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Poupança</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Isento de IR</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-slate-800">{fmt(results.poupanca.net)}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+{fmt(results.poupanca.profit)}</span>
                </div>
              </div>

              {/* CDB 110% CDI Row */}
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-emerald-50/35 border border-emerald-100/50">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">CDB (110% CDI)</span>
                  <span className="text-[10px] text-slate-400 block font-medium">IR {results.irTaxPercent.toFixed(1)}% retido</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-emerald-700">{fmt(results.cdb.net)}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+{fmt(results.cdb.profit)} neto</span>
                </div>
              </div>

              {/* Tesouro Selic Row */}
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-blue-50/35 border border-blue-100/50">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Tesouro Selic</span>
                  <span className="text-[10px] text-slate-400 block font-medium">IR {results.irTaxPercent.toFixed(1)}% retido</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-slate-800">{fmt(results.tesouro.net)}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+{fmt(results.tesouro.profit)} neto</span>
                </div>
              </div>
            </div>

            {/* Smart insight about this comparison */}
            {results.cdb.net > results.poupanca.net && (
              <div className="flex items-start gap-2.5 p-3 bg-violet-50 rounded-xl border border-violet-100 text-[11px] leading-relaxed text-violet-950">
                <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <span>
                  Ao investir no <strong>CDB 110% do CDI</strong> você ganha <strong>{fmt(results.cdb.net - results.poupanca.net)} a mais</strong> do que na Poupança à taxa atual, mesmo após pagar o Imposto de Renda de {results.irTaxPercent.toFixed(1)}%.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
