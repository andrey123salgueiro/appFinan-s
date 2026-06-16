import React, { useState } from "react";
import { Sparkles, Library, Layers, Milestone, HelpCircle, Bell, RefreshCcw, WifiOff, Users, PlusCircle, ArrowRightLeft, CreditCard, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { CategorizationRule, Notification, GroupExpense, Transaction } from "../types";

interface AutomationProps {
  rules: CategorizationRule[];
  onAddRule: (rule: Omit<CategorizationRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  groupExpenses: GroupExpense[];
  onAddGroupExpense: (exp: Omit<GroupExpense, 'id'>) => void;
  onClearGroupExpenses: () => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onOpenFinanceSyncDone: (newTransactions: Omit<Transaction, 'id'>[]) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

export default function FinanceAutomation({
  rules,
  onAddRule,
  onDeleteRule,
  notifications,
  onMarkNotificationRead,
  groupExpenses,
  onAddGroupExpense,
  onClearGroupExpenses,
  onAddTransaction,
  onOpenFinanceSyncDone,
  isOffline,
  onToggleOffline
}: AutomationProps) {
  // Open Finance Connection state
  const [showOpenFinanceModal, setShowOpenFinanceModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncingState, setSyncingState] = useState<'idle' | 'running' | 'success'>('idle');

  // Rule additions state
  const [rulePattern, setRulePattern] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Alimentação");
  const [ruleSubCategory, setRuleSubCategory] = useState("Supermercado");

  // Couple/Group Split state
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("Me (Andrey)");
  
  // Custom group members
  const members = ["Me (Andrey)", "Gabriel", "Letícia", "Lucas"];

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulePattern) return;

    onAddRule({
      pattern: rulePattern,
      category: ruleCategory,
      subCategory: ruleSubCategory
    });

    setRulePattern("");
  };

  const handleCreateGroupExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) return;

    const amt = parseFloat(expenseAmount);
    
    // Split equally among the 4 members
    const splitMap: { [name: string]: number } = {};
    members.forEach(m => {
      splitMap[m] = 25; // 25% each
    });

    onAddGroupExpense({
      description: expenseDesc,
      amount: amt,
      paidBy: expensePaidBy,
      splits: splitMap,
      date: new Date().toISOString().split('T')[0]
    });

    setExpenseDesc("");
    setExpenseAmount("");

    alert(`Despesa coletiva de R$ ${amt.toFixed(2)} adicionada! Divisão igualitária automática de 25% para cada membro configurada.`);
  };

  // Perform Open Finance connection simulation logs step-by-step
  const handleOpenFinanceSubmit = (bankName: string) => {
    setSelectedBank(bankName);
    setSyncingState('running');
    setSyncLogs([]);

    const logSteps = [
      `Iniciando canal de transmissão seguro com criptografia TLS 1.3 para ${bankName}...`,
      `Validando consentimento eletrônico do Usuário (ID: user_985) na plataforma Banco Central do Brasil...`,
      `Efetuando handshake e resgatando token JWT autenticado...`,
      `Fazendo download do extrato da Conta Corrente oficial via Open API...`,
      `Baixando lançamentos de cartões e faturas vigentes...`,
      `Aplicando regras locais de categorização automática às transações importadas...`,
      `Handshake concluído. Nuvem de dados sincronizada com sucesso.`
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSyncLogs(prev => [...prev, step]);
        if (idx === logSteps.length - 1) {
          setSyncingState('success');

          // Generate simulated fresh transactions from selected bank
          const fetchedItems: Omit<Transaction, 'id'>[] = [
            {
              description: `Aporte Open Finance ${bankName}`,
              amount: bankName === 'Nubank' ? 1200.00 : 2500.00,
              type: 'income',
              category: 'Receita',
              subCategory: 'Rendimentos',
              date: new Date().toISOString().split('T')[0],
              account: 'Conta Corrente',
              isFixed: false
            },
            {
              description: `Supermercado ${bankName === 'Itaú' ? 'Carrefour' : 'Extra'}`,
              amount: 189.50,
              type: 'expense',
              category: 'Alimentação',
              subCategory: 'Supermercado',
              date: new Date().toISOString().split('T')[0],
              account: 'Conta Corrente',
              isFixed: false
            },
            {
              description: `${bankName} Tarifa Serviços`,
              amount: 29.90,
              type: 'expense',
              category: 'Outros',
              subCategory: 'Tarifas',
              date: new Date().toISOString().split('T')[0],
              account: 'Conta Corrente',
              isFixed: false
            }
          ];

          setTimeout(() => {
            onOpenFinanceSyncDone(fetchedItems);
            setShowOpenFinanceModal(false);
            setSyncingState('idle');
          }, 1500);
        }
      }, (idx + 1) * 700);
    });
  };

  // Compute Net balances among group shared expenses
  // Each member paid some total, and spent some total. We calculate net balance = Paid - Spent.
  const calculateDebtSettlements = () => {
    const paidByMember: { [name: string]: number } = {};
    const spentByMember: { [name: string]: number } = {};

    members.forEach(m => {
      paidByMember[m] = 0;
      spentByMember[m] = 0;
    });

    groupExpenses.forEach(exp => {
      // Who paid gets credit
      paidByMember[exp.paidBy] = (paidByMember[exp.paidBy] || 0) + exp.amount;

      // Splits
      Object.entries(exp.splits).forEach(([membName, pct]) => {
        const costShare = exp.amount * (pct / 100);
        spentByMember[membName] = (spentByMember[membName] || 0) + costShare;
      });
    });

    // Net value for each member = Paid - Spent
    const balances = members.map(m => {
      const net = (paidByMember[m] || 0) - (spentByMember[m] || 0);
      return {
        name: m,
        net
      };
    });

    // Strategy to settle:
    // Sort balances descending. High positive is creditor, high negative is debtor.
    // Greedily match debtor to creditor to clear them.
    const creditors = balances.filter(b => b.net > 0.01).sort((a, b) => b.net - a.net);
    const debtors = balances.filter(b => b.net < -0.01).sort((a, b) => a.net - b.net);

    const steps: { debtor: string; creditor: string; amount: number }[] = [];

    // Copy to mutate
    const cTemp = creditors.map(c => ({ ...c }));
    const dTemp = debtors.map(d => ({ ...d }));

    let cIdx = 0;
    let dIdx = 0;

    while (cIdx < cTemp.length && dIdx < dTemp.length) {
      const cred = cTemp[cIdx];
      const debt = dTemp[dIdx];

      const toPay = Math.min(cred.net, Math.abs(debt.net));
      steps.push({
        debtor: debt.name,
        creditor: cred.name,
        amount: toPay
      });

      cred.net -= toPay;
      debt.net += toPay;

      if (cred.net < 0.01) cIdx++;
      if (Math.abs(debt.net) < 0.01) dIdx++;
    }

    return {
      balances,
      settlements: steps
    };
  };

  const groupReport = calculateDebtSettlements();

  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="automation-sync-center">
      
      {/* LEFT SECTION: Open Finance & Notificações (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Open Finance Bancos integrados */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-blue-600" />
              Sincronização Open Finance
            </h3>
            <p className="text-xs text-slate-500">Conecte com segurança as contas bancárias de maior renome do Brasil para buscar saldos atuais automáticos.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowOpenFinanceModal(true);
                setSelectedBank("Nubank");
              }}
              className="p-3 border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 text-left rounded-xl transition-all cursor-pointer space-y-1 relative group"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-extrabold text-sm font-sans">Nu</div>
              <p className="text-xs font-bold text-slate-800">Nubank</p>
              <span className="text-[9px] text-slate-400 font-medium">BRL • Cartão & Corrente</span>
            </button>

            <button
              onClick={() => {
                setShowOpenFinanceModal(true);
                setSelectedBank("Itaú");
              }}
              className="p-3 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-extrabold text-sm font-sans">It</div>
              <p className="text-xs font-bold text-slate-800">Banco Itaú</p>
              <span className="text-[9px] text-slate-400 font-medium">BRL • Investimentos & Pix</span>
            </button>

            <button
              onClick={() => {
                setShowOpenFinanceModal(true);
                setSelectedBank("XP Investimentos");
              }}
              className="p-3 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-sm font-sans">XP</div>
              <p className="text-xs font-bold text-slate-800">XP Corretora</p>
              <span className="text-[9px] text-slate-400 font-medium">Ações, Renda Fixa, Previdência</span>
            </button>

            <button
              onClick={() => {
                setShowOpenFinanceModal(true);
                setSelectedBank("Bradesco");
              }}
              className="p-3 border border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-left rounded-xl transition-all cursor-pointer space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-extrabold text-sm font-sans">Br</div>
              <p className="text-xs font-bold text-slate-800">Bradesco</p>
              <span className="text-[9px] text-slate-400 font-medium">BRL • Conta Poupança</span>
            </button>
          </div>
        </div>

        {/* Notificações Inteligentes Center */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Bell className="w-4.5 h-4.5 text-blue-600" />
              Notificações e Avisos do Sistema
            </h4>
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
              {notifications.filter(n => !n.read).length} pendentes
            </span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {notifications.map(nf => {
              return (
                <div key={nf.id} className={`p-3 rounded-xl border transition-colors flex items-start gap-2.5 ${nf.read ? "bg-slate-50/50 border-slate-200 opacity-60" : "bg-blue-50/30 border-blue-100"}`}>
                  <div className={`p-1.5 rounded-lg shrink-0 ${nf.type === 'alert' ? 'bg-rose-50 text-rose-600' : nf.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{nf.title}</p>
                      <span className="text-[9px] font-mono text-slate-400">{nf.date}</span>
                    </div>
                    <p className="text-slate-600 leading-normal">{nf.message}</p>
                    {!nf.read && (
                      <button
                        onClick={() => onMarkNotificationRead(nf.id)}
                        className="text-[9px] text-blue-600 font-bold hover:underline mt-1 cursor-pointer block"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customizable Transaction Categorization rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 font-display">Regras Automáticas de Categorização</h4>
            <p className="text-xs text-slate-500 font-medium">Cadastre palavras chaves para agrupar automaticamente seus gastos vindos do Open Finance.</p>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {rules.map(rl => (
              <div key={rl.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-100 font-sans">
                <div>
                  <span className="font-bold text-slate-700">Se contiver: "{rl.pattern}"</span>
                  <span className="text-slate-400 font-medium font-mono text-[10px] block">Mapear para ❯ {rl.category} / {rl.subCategory}</span>
                </div>
                <button
                  onClick={() => onDeleteRule(rl.id)}
                  className="text-xs text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* New Rule form */}
          <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <input
              type="text"
              placeholder='Texto (Ex: Carrefour)'
              value={rulePattern}
              onChange={(e) => setRulePattern(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              required
            />
            <select
              value={ruleCategory}
              onChange={(e) => setRuleCategory(e.target.value)}
              className="px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Lazer">Lazer</option>
              <option value="Moradia">Moradia</option>
              <option value="Compras">Compras</option>
              <option value="Outros">Outros</option>
            </select>
            <button
              type="submit"
              className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
            >
              Criar Automação
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT SECTION: Multiplataforma & Divisão de Despesas em Grupo (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Offline Mode Sync & Aviation mode Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                <WifiOff className="w-4.5 h-4.5 text-blue-600" />
                Experiência Offline (Sincronização)
              </h4>
              <p className="text-xs text-slate-400">Escreva lançamentos sem rede móvel. Ficam salvos em sandbox buffer local.</p>
            </div>

            {/* Offline toggle */}
            <button
              onClick={onToggleOffline}
              className={`p-1 w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isOffline ? "bg-amber-400" : "bg-slate-200"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all absolute top-1 ${isOffline ? "right-1" : "left-1"}`} />
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 font-display">Buffer de Atividades Offline</span>
              <span className="bg-blue-50 text-blue-600 font-bold px-1.5 rounded text-[10px] font-mono">
                {isOffline ? "01 Pendente" : "0 Pendente (Sincronizado)"}
              </span>
            </div>
            
            {isOffline ? (
              <p className="leading-relaxed text-amber-800 text-[11px]">
                ⚠️ Você está no modo simulação de avião/offline. Lançamentos adicionados agora serão agregados em cache temporária e sincronizados com nosso servidor Cloud Run assim que reconectar.
              </p>
            ) : (
              <p className="leading-relaxed text-slate-500 text-[11px]">
                ✅ Todos os logs e transferências foram registrados com o servidor remoto em tempo real.
              </p>
            )}
          </div>
        </div>

        {/* Divisão de despesas em Grupo (Diferencial) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-emerald-600" />
              Divisão de Despesas Compartilhadas
            </h4>
            <p className="text-xs text-slate-400">Acompanhamento e ajuste de contas para viagens ou casa em comum.</p>
          </div>

          {/* Expenses history */}
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {groupExpenses.map(gex => (
              <div key={gex.id} className="p-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{gex.description}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Pago por: <strong>{gex.paidBy}</strong> • em {gex.date}</p>
                </div>
                <span className="font-mono font-bold text-slate-700">{fmt(gex.amount)}</span>
              </div>
            ))}
          </div>

          {/* Calculator outcomes net balances and settlements */}
          {groupExpenses.length > 0 && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs space-y-2">
              <span className="font-bold text-emerald-950 block uppercase tracking-wider text-[9px]">Acerto de Contas Sugerido para Zerar Saldos</span>
              
              {groupReport.settlements.length === 0 ? (
                <p className="text-emerald-800">Tudo perfeitamente acertado! Nenhuma transferência pendente necessária.</p>
              ) : (
                <div className="space-y-1.5">
                  {groupReport.settlements.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-800 font-medium font-sans">
                      <span className="text-red-700 font-bold">{step.debtor}</span>
                      <span>deve transferir</span>
                      <strong className="text-blue-600 font-mono">{fmt(step.amount)}</strong>
                      <span>para</span>
                      <span className="text-emerald-800 font-bold">{step.creditor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add shared expenditure */}
          <form onSubmit={handleCreateGroupExpense} className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Registrar Despesa em Grupo</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                placeholder="Ex Descrição: Caixa de Cerveja"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
              />
              <input
                type="number"
                placeholder="Valor (R$)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
              />
              <select
                value={expensePaidBy}
                onChange={(e) => setExpensePaidBy(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
              >
                {members.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
              >
                Lançar Despesa & Dividir por 4
              </button>
              <button
                type="button"
                onClick={onClearGroupExpenses}
                className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs cursor-pointer"
              >
                Zerar Contas
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* OPEN FINANCE ACTIVE CONNECT LOADING OVERLAY */}
      {showOpenFinanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 text-center border border-slate-200">
            
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <RefreshCcw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-md font-extrabold text-slate-900 font-display">Handshake Remoto Open Finance</h3>
              <p className="text-xs text-slate-500">Conectando aos endpoints oficiais do **{selectedBank}**</p>
            </div>

            {/* Sync Steps Logs box */}
            <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl text-left h-48 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed border border-slate-800">
              {syncLogs.map((log, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <span className="text-slate-600">&gt;</span>
                  <p>{log}</p>
                </div>
              ))}
              <div className="animate-pulse flex items-center gap-1 text-slate-500">
                <span>_</span>
              </div>
            </div>

            {syncingState === 'idle' && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleOpenFinanceSubmit(selectedBank)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Concordar & Autorizar Sincronização
                </button>
                <button
                  onClick={() => setShowOpenFinanceModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            {syncingState === 'running' && (
              <p className="text-xs font-semibold text-slate-500 animate-pulse">Estabelecendo transmissão criptografada...</p>
            )}

            {syncingState === 'success' && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 animate-scale" />
                <span>Integração Executada! Sincronizando saldos no app...</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
export { Check };
