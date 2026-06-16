import React, { useState } from "react";
import { PlusCircle, Filter, ScanLine, Tag, Calendar, ShoppingCart, Video, Trash2, PauseCircle, PlayCircle, Eye, AlertCircle, Sparkles, Building2, Layers } from "lucide-react";
import { Transaction, Bill, Budget } from "../types";

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  bills: Bill[];
  onToggleBillPause: (id: string) => void;
  onAddBill: (b: Omit<Bill, 'id'>) => void;
  budgets: Budget[];
  onUpdateBudgetLimit: (category: string, newLimit: number) => void;
}

export default function FinanceTransactions({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  bills,
  onToggleBillPause,
  onAddBill,
  budgets,
  onUpdateBudgetLimit
}: TransactionsProps) {
  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Manual Transaction Form
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState("Alimentação");
  const [subCategory, setSubCategory] = useState("Geral");
  const [account, setAccount] = useState("Conta Corrente");
  const [isFixed, setIsFixed] = useState(false);

  // Bill subscription Form
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDate, setBillDueDate] = useState("10");  // Day of the month
  const [billCategory, setBillCategory] = useState("Lazer");

  // OCR Simulator
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrTextQuery, setOcrTextQuery] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  // Edit Budget State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempBudgetLimit, setTempBudgetLimit] = useState("");

  // Get distinct categories
  const categories = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Compras", "Educação", "Outros"];
  
  const subCategoriesMap: { [key: string]: string[] } = {
    Alimentação: ["Supermercado", "Restaurantes", "Delivery", "Padaria"],
    Transporte: ["Combustível", "Uber/Aplicativos", "Ônibus/Metrô", "Manutenção"],
    Moradia: ["Aluguel", "Energia/Luz", "Internet", "Condomínio", "Coisas de Casa"],
    Lazer: ["Streaming/Mídia", "Viagem", "Cinema", "Eventos"],
    Saúde: ["Farmácia", "Médicos", "Plano de Saúde", "Academia"],
    Compras: ["Vestuário", "Eletrônicos", "Presentes"],
    Educação: ["Cursos", "Faculdade/Escola", "Livros"],
    Outros: ["Imprevistos", "Geral"]
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    onAddTransaction({
      description: desc,
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'Receita' : category,
      subCategory: type === 'income' ? 'Geral' : subCategory,
      date: new Date().toISOString().split('T')[0],
      account,
      isFixed
    });

    // Reset
    setDesc("");
    setAmount("");
    setIsFixed(false);
  };

  const handleAddBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billAmount) return;

    onAddBill({
      name: billName,
      amount: parseFloat(billAmount),
      dueDate: `2026-06-${billDueDate.padStart(2, '0')}`,
      frequency: "mensal",
      paused: false,
      category: billCategory
    });

    setBillName("");
    setBillAmount("");
  };

  // Quick select items for OCR Mock simulation
  const mockReceipts = [
    {
      title: "🍔 Jantar iFood",
      text: "PEDIDO IFOOD #9084 - ESTABELECIMENTO BURGER KING SAO PAULO - CNPJ: 12.345.678/0001-90 - DATA: 03/06/2026 \n 1x Combo Whopper Duplo R$ 42,90 \n 1x Batata Frita Individual R$ 12,00 \n 1x Refrigerante Lata R$ 8,00 \n Taxas de Entrega R$ 9,00 \n TOTAL PAGO: R$ 71,90 \n Obrigado!"
    },
    {
      title: "🛒 Extra Supermercados",
      text: "COMPANHIA REGIONAL DE ALIMENTOS - EXTRA SUPERMERCADOS - CUPOM FISCAL \n 03/06/2026 \n Arroz Prato Fino 5kg R$ 29,90 \n Leite Integral Leitissimo 1L R$ 8,50 \n File de Frango Swift 1kg R$ 24,90 \n Sabao em Po Omo R$ 16,50 \n Amaciante Downy R$ 18,90 \n TOTAL BRUTO: R$ 98,70 \n PAGAMENTO VIA DEBITO BANCO ITAU"
    },
    {
      title: "⛽ Combustível Posto Ipiranga",
      text: "AUTO POSTO IPIRANGA CENTRAL DE BELO HORIZONTE \n DATA: 02/06/2026 - NOTA DE DEBITO \n PROD: GASOLINA ADITIVADA - QUANT: 32 LITROS \n VALOR UNITARIO: R$ 5,62 \n TOTAL DO CUPOM FISCAL: R$ 180,00 \n ATENDIDO POR GUSTAVO"
    }
  ];

  const handleTriggerOcr = async (receiptText: string) => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const response = await fetch("/api/gemini/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageText: receiptText })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setOcrResult(resData.data);
      } else {
        alert("Não foi possível processar o OCR. Usando simulação padrão.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleConfirmOcrAdd = () => {
    if (!ocrResult) return;
    onAddTransaction({
      description: ocrResult.establishment,
      amount: Number(ocrResult.amount),
      type: 'expense',
      category: ocrResult.category,
      subCategory: ocrResult.subCategory,
      date: ocrResult.date || new Date().toISOString().split('T')[0],
      account: "Conta Corrente",
      isFixed: false
    });
    setIsOcrModalOpen(false);
    setOcrResult(null);
    setOcrTextQuery("");
  };

  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="transactions-overview">
      
      {/* LEFT SECTION: Lançamentos & Histórico (Columns 8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Adicionar Rápido Header & OCR Box Trigger */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Lançamento e Organização
            </h3>
            <p className="text-xs text-slate-500">Adicione gastos manuais ou escanear comprovantes fiscais via Inteligência Artificial.</p>
          </div>

          <button
            onClick={() => setIsOcrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-transform transform active:scale-95 shadow-md shadow-blue-100 cursor-pointer animate-none"
            id="ocr-scan-modal-btn"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            Scanner de Cupom OCR (IA)
          </button>
        </div>

        {/* Transactions List with interactive filtering */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Filtering Header Panel */}
          <div className="p-5 border-b border-slate-50 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-800">Histórico de Movimentações</span>
              
              {/* Type Switches */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-3 py-1 rounded-md transition-colors ${filterType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-3 py-1 rounded-md transition-colors ${filterType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Despesas
                </button>
              </div>
            </div>

            {/* Inputs & select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Pesquise por descrição ou categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List items representation */}
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Filter className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-sm font-medium">Nenhuma transação encontrada para os filtros selecionados.</p>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const isExpense = t.type === 'expense';
                return (
                  <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl ${
                        isExpense 
                          ? (t.isFixed ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600') 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isExpense ? (t.isFixed ? <Calendar className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />) : <PlusCircle className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate" title={t.description}>
                          {t.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-slate-400">
                          <span className="font-medium text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {t.category} ❯ {t.subCategory}
                          </span>
                          <span>•</span>
                          <span>{t.date}</span>
                          <span>•</span>
                          <span>{t.account}</span>
                          {t.installmentCurrent && (
                            <>
                              <span>•</span>
                              <span className="bg-blue-50 text-blue-600 font-semibold px-1 rounded font-mono">
                                Parcela {t.installmentCurrent}/{t.installmentTotal}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-extrabold font-mono ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isExpense ? '-' : '+'} {fmt(t.amount)}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Deletar Transação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Orcamentos & Assinaturas Recorrentes (Columns 4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Manual Addition Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 font-display">Lançamento Manual Rápido</h4>
          <form onSubmit={handleAddManual} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tipo de Caixa</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${type === 'expense' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Despesa (Sai)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 rounded-lg border text-xs font-semibold ${type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Receita (Entra)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Padaria, Uber, Gasolina"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Carteira / Conta</label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Conta Corrente">C. Corrente</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Investimentos">XP Corretora</option>
                  <option value="Dinheiro">Físico</option>
                </select>
              </div>
            </div>

            {type === 'expense' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory(subCategoriesMap[e.target.value]?.[0] || 'Geral');
                    }}
                    className="w-full px-1.5 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Subcategoria</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-1.5 py-1.5 text-xs text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {(subCategoriesMap[category] || ["Geral"]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {type === 'expense' && (
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="is-fixed-checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="is-fixed-checkbox" className="text-xs text-slate-500 select-none">despesa recorrente mensal fixa</label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors shadow-sm block cursor-pointer"
            >
              Registrar Transação
            </button>
          </form>
        </div>

        {/* Orçamentos por categoria limites com alertas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 font-display">Orçamentos por Categoria</h4>
            <p className="text-[10px] text-slate-400">Notificará ao atingir 80% ou 100% de ocupação.</p>
          </div>

          <div className="space-y-4">
            {budgets.map(b => {
              const currentT = transactions
                .filter(tr => tr.type === 'expense' && tr.category === b.category)
                .reduce((su, c) => su + c.amount, 0);

              const percent = Math.min((currentT / (b.limit || 1)) * 100, 100);
              const isDanger = percent >= 100;
              const isWarning = percent >= 80 && percent < 100;

              return (
                <div key={b.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{b.category}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {editingCategory === b.category ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempBudgetLimit}
                            onChange={(e) => setTempBudgetLimit(e.target.value)}
                            className="w-16 px-1 border border-slate-300 rounded text-[10px]"
                          />
                          <button
                            onClick={() => {
                              onUpdateBudgetLimit(b.category, parseFloat(tempBudgetLimit));
                              setEditingCategory(null);
                            }}
                            className="px-1 bg-emerald-500 text-white rounded text-[9px]"
                          >
                            Ok
                          </button>
                        </div>
                      ) : (
                        <span onClick={() => {
                          setEditingCategory(b.category);
                          setTempBudgetLimit(b.limit.toString());
                        }} className="text-slate-400 underline cursor-pointer hover:text-blue-600 focus:outline-none">
                          lim: {fmt(b.limit)}
                        </span>
                      )}
                      <span className="text-slate-500">| gastou {fmt(currentT)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all ${
                        isDanger 
                          ? 'bg-rose-500' 
                          : (isWarning ? 'bg-amber-500 animate-pulse' : 'bg-blue-600')
                      }`}
                    />
                  </div>

                  {/* Alert notification message inside category */}
                  {isDanger && (
                    <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1 leading-none">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Limite estourado! Evite novas compras nesta categoria.
                    </p>
                  )}
                  {isWarning && (
                    <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 leading-none animate-pulse">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Atenção: Já consumiu {percent.toFixed(0)}% do orçamento.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assinaturas recorrentes Netflix streaming, academia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 font-display">Assinaturas & Despesas Mensais</h4>
            <p className="text-[10px] text-slate-400 font-medium">Contas e débito em conta com opção de suspensão.</p>
          </div>

          <div className="space-y-3">
            {bills.map(bl => {
              return (
                <div key={bl.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      {bl.name}
                      {bl.paused && <span className="bg-slate-200 text-slate-600 text-[8px] font-semibold px-1 rounded uppercase tracking-wider">Pausada</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Vence: dia {bl.dueDate.split('-')[2]}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 font-mono">{fmt(bl.amount)}</span>
                    <button
                      onClick={() => onToggleBillPause(bl.id)}
                      className={`p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${bl.paused ? "text-emerald-600" : "text-amber-500"}`}
                      title={bl.paused ? "Ativar Assinatura" : "Pausar Assinatura para Próximo Mês"}
                    >
                      {bl.paused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Subscription Form */}
          <form onSubmit={handleAddBillSubmit} className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cadastrar Assinatura</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ex Nome: Canva, Wifi"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-800"
                required
              />
              <input
                type="number"
                placeholder="Valor (R$)"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-800 font-mono"
                required
              />
            </div>
            <button type="submit" className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-[10px] transition-colors cursor-pointer">
              Adicionar Assinatura Recorrente
            </button>
          </form>
        </div>
      </div>

      {/* AI INVOICE SCANNER MODAL SECTION */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-blue-400" />
                <h3 className="text-md font-bold font-display">Leitor de Cupom Fiscal Inteligent (OCR)</h3>
              </div>
              <button
                onClick={() => {
                  setIsOcrModalOpen(false);
                  setOcrResult(null);
                  setOcrTextQuery("");
                }}
                className="text-slate-400 hover:text-white text-xs cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg"
              >
                Voltar
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Nesta ferramenta você pode simular a captura por câmera ou colar os dados brutos de texto de uma nota fiscal. A inteligência artificial da <strong>Google Gemini</strong> analisará o estabelecimento, extrairá valores individuais de produtos e preencherá a transação categorizada para você.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left - templates selector / text paste */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Modelos de Notas Rápidas</span>
                  <div className="grid grid-cols-1 gap-2">
                    {mockReceipts.map((mockRec, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setOcrTextQuery(mockRec.text);
                        }}
                        className="p-2.5 text-left border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-xs transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold text-slate-700">{mockRec.title}</span>
                        <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colar Cupom Fiscal Livre (Texto)</label>
                    <textarea
                      rows={5}
                      placeholder="Cole ou digite itens da nota fiscal (ex: iFood R$ 54,00 em 03/06/2026)"
                      value={ocrTextQuery}
                      onChange={(e) => setOcrTextQuery(e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-800 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleTriggerOcr(ocrTextQuery)}
                    disabled={ocrLoading || !ocrTextQuery}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-50"
                  >
                    {ocrLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Gemini lendo nota...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Executar Análise de OCR
                      </>
                    )}
                  </button>
                </div>

                {/* Right - outcome response */}
                <div className="border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-4 flex flex-col justify-between min-h-[300px]">
                  {ocrResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                        <Building2 className="w-4 h-4" />
                        Nota Identificada Corretamente!
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Estabelecimento</span>
                          <p className="font-extrabold text-slate-800">{ocrResult.establishment}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Data Encontrada</span>
                            <p className="font-semibold text-slate-700">{ocrResult.date}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Total</span>
                            <p className="font-bold text-blue-600 font-mono">{fmt(ocrResult.amount)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Categoria Sugerida</span>
                            <p className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">{ocrResult.category}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Subcategoria</span>
                            <p className="font-semibold text-slate-700">{ocrResult.subCategory}</p>
                          </div>
                        </div>

                        {/* Items listed */}
                        {ocrResult.items && ocrResult.items.length > 0 && (
                          <div className="space-y-1.5 border-t border-slate-200 pt-2.5">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide block">Itens da Compra</span>
                            <div className="space-y-1 max-h-[110px] overflow-y-auto">
                              {ocrResult.items.map((it: any, i: number) => (
                                <div key={i} className="flex justify-between text-[11px] text-slate-600 bg-white p-1 rounded border border-slate-100">
                                  <span>{it.qty}x {it.name}</span>
                                  <span className="font-mono font-medium">{fmt(it.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleConfirmOcrAdd}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Importar para Meus Lançamentos
                      </button>
                    </div>
                  ) : (
                    <div className="my-auto text-center text-slate-400 space-y-3">
                      <ScanLine className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700">Aguardando Cupom Fiscal</p>
                        <p className="text-[10px] text-slate-500 leading-normal max-w-[200px] mx-auto">Coloque ou use um dos nossos cupons prontos ao lado e clique em Executar OCR.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
