import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, DollarSign, Calendar, ChevronRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Transaction } from "../types";
import { HISTORIC_WEALTH } from "../mockData";

interface DashboardProps {
  transactions: Transaction[];
  accountsBalances: {
    corrente: number;
    poupanca: number;
    investimentos: number;
    dinheiro: number;
  };
  onTriggerSync: () => void;
  isSyncing: boolean;
  isOffline: boolean;
}

export default function FinanceDashboard({
  transactions,
  accountsBalances,
  onTriggerSync,
  isSyncing,
  isOffline
}: DashboardProps) {
  const [chartType, setChartType] = useState<'line' | 'composed'>('line');

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const leftOver = totalIncome - totalExpense;

  // Wealth committed with fixed costs (isFixed === true)
  const committedFixed = transactions
    .filter(t => t.type === 'expense' && t.isFixed)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netWorth = accountsBalances.corrente + accountsBalances.poupanca + accountsBalances.investimentos + accountsBalances.dinheiro;

  // Format currency
  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="finance-dashboard-section" className="space-y-6">
      {/* Top Welcome Title & Sunc Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-slate-400" />
        </div>
        
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-bold font-display tracking-tight">Painel Patrimonial Conectado</h2>
          <p className="text-sm text-slate-300">
            Monitoramento de saldo unificado, evolução de capital e estimativas automáticas.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start md:self-center">
          {isOffline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Modo Offline Ativo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sincronizado Nuvem
            </span>
          )}

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-1 text-xs font-medium cursor-pointer"
            id="sync-open-finance-btn"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Open Finance Sync
          </button>
        </div>
      </div>

      {/* Patrimônio Líquido Unificado & Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Net worth card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-display">Patrimônio Consolidado</span>
            <h3 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
              {fmt(netWorth)}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +4.8% este mês vs anterior
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider font-mono">Contas Conectadas</span>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-slate-600 font-medium">Conta Corrente (Itaú)</span>
              </div>
              <span className="font-mono font-semibold text-slate-800">{fmt(accountsBalances.corrente)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Poupança (Nubank)</span>
              </div>
              <span className="font-mono font-semibold text-slate-800">{fmt(accountsBalances.poupanca)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 font-medium">Investimentos (XP)</span>
              </div>
              <span className="font-mono font-semibold text-slate-800">{fmt(accountsBalances.investimentos)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Dinheiro Físico</span>
              </div>
              <span className="font-mono font-semibold text-slate-800">{fmt(accountsBalances.dinheiro)}</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Indicators */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Incoming */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Receitas do Mês</span>
              <p className="text-xl font-bold text-slate-900 font-display">{fmt(totalIncome)}</p>
              <span className="text-xs text-slate-400">Total acumulado de entradas</span>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Outgoing */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Despesas do Mês</span>
              <p className="text-xl font-bold text-slate-900 font-display">{fmt(totalExpense)}</p>
              <span className="text-xs text-slate-400">Gastos parcelados e manuais</span>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          {/* Sobra/Leftover */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sobra Disponível</span>
              <p className={`text-xl font-bold font-display ${leftOver >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {fmt(leftOver)}
              </p>
              <span className="text-xs text-slate-400">Saldo não comprometido do período</span>
            </div>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Compromised Fixed Costs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Contas Fixas Comprovadas</span>
              <p className="text-xl font-bold text-slate-900 font-display">{fmt(committedFixed)}</p>
              <span className="text-xs text-slate-500 font-medium">
                {((committedFixed / (totalIncome || 1)) * 100).toFixed(0)}% das suas receitas totais
              </span>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Evolução Patrimonial Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-lg font-bold text-slate-900 font-display tracking-tight">Evolução Patrimonial Consolidada</h4>
            <p className="text-xs text-slate-500">Histórico de rendimento acumulado de todas as carteiras e caixas</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Visualização:</span>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg border font-medium ${chartType === 'line' ? 'bg-blue-600 border-blue-700 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'} cursor-pointer`}
            >
              Curva Suave
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HISTORIC_WEALTH} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v/1000}k`} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => fmt(Number(value))} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="Corrente" name="Conta Corrente" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Poupança" name="Poupança" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Investimentos" name="XP Investimentos" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Dinheiro" name="Físico" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 1 }} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart informational alert */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wide">Privacidade de Dados Localmente Garantida</p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Seus saldos e transações estão armazenados na sandbox local de desenvolvimento. Para segurança extrema, todos os dados de simulações do Open Finance não trafegam em servidores de terceiros e permanecem sob criptografia base de sessão do navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
