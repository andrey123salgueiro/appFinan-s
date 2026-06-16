import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Sparkles, Download, HelpCircle, AlertCircle, FileSpreadsheet, ArrowDownToLine, Flame, TrendingUp } from "lucide-react";
import { Transaction, Goal, Budget } from "../types";

interface ReportsProps {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
}

export default function FinanceReports({
  transactions,
  goals,
  budgets
}: ReportsProps) {
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Generate AI Insights from corporate backend
  const handleFetchAiInsights = async () => {
    setLoadingInsights(true);
    setAiInsights([]);
    setOverallAnalysis("");
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, goals, budgets })
      });
      const data = await response.json();
      if (data.insights && data.insights.length > 0) {
        setAiInsights(data.insights);
        setOverallAnalysis(data.overallAnalysis);
      } else {
        alert("Ocorreu um erro ao obter insights. Tentando simulação local.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Generate downloadable CSV log file directly
  const handleDownloadCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Descricao,Valor,Tipo,Categoria,Subcategoria,Data,Carteira,Fixo\r\n";

    transactions.forEach(t => {
      const row = `"${t.id}","${t.description.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.category}","${t.subCategory}","${t.date}","${t.account}","${t.isFixed ? 'Sim' : 'Nao'}"`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extrato_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare Pie Chart data: sum of expenses per category
  const getPieData = () => {
    const sumMap: { [cat: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(tr => {
        sumMap[tr.category] = (sumMap[tr.category] || 0) + tr.amount;
      });

    return Object.entries(sumMap).map(([key, val]) => ({
      name: key,
      value: val
    }));
  };

  const pieData = getPieData();

  // Prepare Bar Chart: income vs expense over the months
  // We can group transactions or use static history of 3 months for richness
  const barData = [
    { name: "Março", Receitas: 8500, Despesas: 6420 },
    { name: "Abril", Receitas: 9200, Despesas: 5800 },
    { name: "Maio", Receitas: 8695, Despesas: 6170 },
    {
      name: "Junho (Atual)",
      Receitas: transactions.filter(t => t.type === 'income').reduce((s, c) => s + c.amount, 0),
      Despesas: transactions.filter(t => t.type === 'expense').reduce((s, c) => s + c.amount, 0)
    }
  ];

  // Tailwind Pie Colors (Replaced indigo #4f46e5 with vibrant cobalt blue #2563eb)
  const COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#64748b"];

  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-section-visual">
      
      {/* LEFT SECTION: Graficos Dinamicos (Columns 8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Dynamic Charts visual cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight">Gráficos de Análise e Auditoria</h3>
              <p className="text-xs text-slate-500">Mapeamento visual da destinação das receitas e histórico comparativo mensal.</p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200"
              title="Exportar Planilhas de Lançamentos"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Download Planilha (CSV)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Pie Chart category destination */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Pizza: Onde vai o Seu Dinheiro?</span>
              
              {pieData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                  Sem despesas lançadas para categorizar.
                </div>
              ) : (
                <div className="h-60 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmt(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered text in doughnut */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Gastos</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono">
                      {fmt(transactions.filter(t => t.type === 'expense').reduce((sum, c) => sum + c.amount, 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Pie Legends custom */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-semibold text-slate-600 truncate">{item.name}: {fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart comparative income vs expense */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Barras: Comparação Sazonal</span>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                    <Tooltip formatter={(value) => fmt(Number(value))} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                * Os dados de Junho refletem as movimentações adicionadas na sessão em tempo real.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Inteligência Artificial Insights (Columns 4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Gemini powered recommendations platform */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" />
              Insights Financeiros AI (Gemini)
            </h4>
            <p className="text-xs text-slate-400">Analise seu comportamento de gastos e caixas com inteligência artificial generativa de ponta.</p>
          </div>

          <button
            onClick={handleFetchAiInsights}
            disabled={loadingInsights}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-transform transform active:scale-95 shadow-lg shadow-blue-100/50 cursor-pointer"
          >
            {loadingInsights ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refinando análises com Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Gerar Recomendações de IA
              </>
            )}
          </button>

          {/* Render Insights outcomes */}
          <div className="space-y-3 pt-2">
            {aiInsights.length > 0 ? (
              <>
                {/* Overall brief */}
                {overallAnalysis && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{overallAnalysis}"
                  </p>
                )}

                {/* Grid list details */}
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/15 text-xs space-y-1 relative overflow-hidden">
                    {/* Tiny badge impact */}
                    <div className="absolute right-2 top-2 flex gap-1">
                      <span className={`text-[9px] px-1.5 rounded font-extrabold uppercase ${
                        insight.impact === 'Alto' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        Impacto {insight.impact}
                      </span>
                    </div>

                    <p className="font-extrabold text-slate-800 pr-16 font-display">{insight.title}</p>
                    <p className="text-slate-500 leading-normal text-[11px]">{insight.description}</p>
                    
                    {insight.savingAmountEstimated && insight.savingAmountEstimated !== "N/A" && (
                      <p className="text-[10px] text-blue-700 font-extrabold font-mono pt-1">
                        Poupança estimada: {insight.savingAmountEstimated}
                      </p>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <Sparkles className="w-8 h-8 mx-auto text-blue-200 animate-pulse" />
                <p className="text-xs font-semibold text-slate-700">Ainda sem Recomendações</p>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-[150px] mx-auto">Clique no botão acima para submeter suas transações de Junho e gerar insights inteligentes.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
export { Download };
