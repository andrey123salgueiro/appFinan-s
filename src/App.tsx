import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Layers, 
  PiggyBank, 
  CreditCard as CardIcon, 
  RefreshCcw, 
  Settings, 
  Lock, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  Fingerprint, 
  ShieldCheck, 
  Sparkles,
  DollarSign
} from "lucide-react";

import { Transaction, Goal, Budget, CreditCard, Bill, CategorizationRule, Notification, GroupExpense } from "./types";
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_GOALS, 
  INITIAL_BUDGETS, 
  INITIAL_CREDIT_CARDS, 
  INITIAL_BILLS, 
  INITIAL_RULES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_GROUP_EXPENSES 
} from "./mockData";

// Import custom sub-modules
import FinanceDashboard from "./components/FinanceDashboard";
import FinanceTransactions from "./components/FinanceTransactions";
import FinancePlanning from "./components/FinancePlanning";
import FinanceCreditCards from "./components/FinanceCreditCards";
import FinanceAutomation from "./components/FinanceAutomation";
import FinanceReports from "./components/FinanceReports";
import FinanceSecurity from "./components/FinanceSecurity";

type ActiveTab = 'dashboard' | 'transactions' | 'planning' | 'debts' | 'automation' | 'reports' | 'security';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hard State variables loaded from localStorage or initial mock data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("fin_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("fin_goals");
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("fin_budgets");
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem("fin_credit_cards");
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_CARDS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem("fin_bills");
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [rules, setRules] = useState<CategorizationRule[]>(() => {
    const saved = localStorage.getItem("fin_rules");
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("fin_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>(() => {
    const saved = localStorage.getItem("fin_group_expenses");
    return saved ? JSON.parse(saved) : INITIAL_GROUP_EXPENSES;
  });

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    const saved = localStorage.getItem("fin_is_offline");
    return saved ? JSON.parse(saved) === "true" : false;
  });

  // Security variables
  const [isLockedByPin, setIsLockedByPin] = useState(true); // startup app is locked!
  const [pinUnlockCode, setPinUnlockCode] = useState("");
  const [biometricUnlocking, setBiometricUnlocking] = useState(false);

  // Accounts balances derived or tracked in hard state
  const [accountsBalances, setAccountsBalances] = useState({
    corrente: 5410.50,
    poupanca: 12000.00,
    investimentos: 25400.00,
    dinheiro: 320.00
  });

  // Dynamic Open Finance Sync triggering
  const [isSyncingOpenFinance, setIsSyncingOpenFinance] = useState(false);

  // Watchers to synchronize memory with localStorage
  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("fin_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("fin_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("fin_credit_cards", JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem("fin_bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("fin_rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem("fin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("fin_group_expenses", JSON.stringify(groupExpenses));
  }, [groupExpenses]);

  useEffect(() => {
    localStorage.setItem("fin_is_offline", String(isOffline));
  }, [isOffline]);

  // Recalculate accounts balances in reaction to transaction history dynamically
  useEffect(() => {
    let corriente = 4200.00; // Base starting CC
    let poupança_val = 12000.00; // emergency fund
    let invest_val = 25400.00; 
    let cash_val = 320.00;

    transactions.forEach(t => {
      const isExpense = t.type === 'expense';
      const factor = isExpense ? -1 : 1;

      if (t.account === 'Conta Corrente') {
        corriente += (t.amount * factor);
      } else if (t.account === 'Poupança') {
        poupança_val += (t.amount * factor);
      } else if (t.account === 'Investimentos') {
        invest_val += (t.amount * factor);
      } else if (t.account === 'Dinheiro') {
        cash_val += (t.amount * factor);
      }
    });

    setAccountsBalances({
      corrente: corriente,
      poupanca: poupança_val,
      investimentos: invest_val,
      dinheiro: cash_val
    });

  }, [transactions]);

  // Handle Actions Triggers
  const handleAddTransaction = (newTr: Omit<Transaction, 'id'>) => {
    const freshTr: Transaction = {
      ...newTr,
      id: `t-${Date.now()}`
    };

    setTransactions(prev => [freshTr, ...prev]);

    // Track if this matches any budget to increment that budget's current spend on-the-fly
    if (newTr.type === 'expense') {
      setBudgets(prevBudgets => {
        return prevBudgets.map(b => {
          if (b.category === newTr.category) {
            const upCurrent = b.current + newTr.amount;
            
            // Trigger quick notification alert if over limit budget
            if (upCurrent >= b.limit * 0.8 && b.current < b.limit * 0.8) {
              triggerSystemNotification(
                "Aviso de Orçamento",
                `Seus gastos com ${b.category} atingiram 80% do teto mensal estabelecido.`,
                "alert"
              );
            } else if (upCurrent >= b.limit && b.current < b.limit) {
              triggerSystemNotification(
                "Orçamento Estourado!",
                `Você ultrapassou 100% de ocupação da categoria ${b.category}. Evite novas compras nela!`,
                "alert"
              );
            }

            return { ...b, current: upCurrent };
          }
          return b;
        });
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Deduct from budget as well
    if (target.type === 'expense') {
      setBudgets(prevB => {
        return prevB.map(b => {
          if (b.category === target.category) {
            return { ...b, current: Math.max(0, b.current - target.amount) };
          }
          return b;
        });
      });
    }
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, current: g.current + amount };
      }
      return g;
    }));

    // Deduct that deposit sum from Account balance by adding a simulated expense transaction
    const targetG = goals.find(g => g.id === goalId);
    handleAddTransaction({
      description: `Aporte: Caixinha ${targetG ? targetG.name : 'Objetivo'}`,
      amount,
      type: 'expense',
      category: 'Outros',
      subCategory: 'Aporte Caixinha',
      date: new Date().toISOString().split('T')[0],
      account: 'Conta Corrente',
      isFixed: false
    });
  };

  const handleAddGoal = (newG: Omit<Goal, 'id'>) => {
    setGoals(prev => [
      ...prev,
      { ...newG, id: `goal-${Date.now()}` }
    ]);
  };

  const handleAddBill = (newB: Omit<Bill, 'id'>) => {
    setBills(prev => [
      ...prev,
      { ...newB, id: `bill-${Date.now()}` }
    ]);
  };

  const handleToggleBillPause = (id: string) => {
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, paused: !b.paused };
      }
      return b;
    }));
  };

  const handleUpdateBudgetLimit = (category: string, newLimit: number) => {
    setBudgets(prev => prev.map(b => {
      if (b.category === category) {
        return { ...b, limit: newLimit };
      }
      return b;
    }));
  };

  const handleAddRule = (newRl: Omit<CategorizationRule, 'id'>) => {
    setRules(prev => [
      ...prev,
      { ...newRl, id: `rule-${Date.now()}` }
    ]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) return { ...n, read: true };
      return n;
    }));
  };

  const handleAddGroupExpense = (newGex: Omit<GroupExpense, 'id'>) => {
    setGroupExpenses(prev => [
      ...prev,
      { ...newGex, id: `gex-${Date.now()}` }
    ]);
  };

  const handleClearGroupExpenses = () => {
    setGroupExpenses([]);
  };

  const handleOpenFinanceSyncCompleted = (fetchedItems: Omit<Transaction, 'id'>[]) => {
    // Add all compiled transactions
    fetchedItems.forEach(itt => {
      handleAddTransaction(itt);
    });

    triggerSystemNotification(
      "Sincronização de Banco",
      "Saldos e faturas atualizados via API de consentimento Banco Central do Brasil.",
      "success"
    );
  };

  const triggerSystemNotification = (title: string, message: string, type: 'alert' | 'info' | 'success') => {
    const fNf: Notification = {
      id: `nf-${Date.now()}`,
      title,
      message,
      type,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications(prev => [fNf, ...prev]);
  };

  const handleClearAllData = () => {
    localStorage.clear();
  };

  // Simulated biometric unlocking
  const handleSimulateBiometricUnlock = () => {
    setBiometricUnlocking(true);
    setTimeout(() => {
      setBiometricUnlocking(false);
      setIsLockedByPin(false);
      alert("Reconhecimento Facial/Digital efetuado! Bem vindo de volta.");
    }, 1200);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinUnlockCode === "1234") {
      setIsLockedByPin(false);
      setPinUnlockCode("");
    } else {
      alert("Senha PIN mestre inválida! Tente com a padrão '1234'.");
      setPinUnlockCode("");
    }
  };

  // Trigger simulated Open Finance background worker
  const handleOpenFinanceManualTrigger = () => {
    setIsSyncingOpenFinance(true);
    setTimeout(() => {
      setIsSyncingOpenFinance(false);
      // add a small simulation record
      handleAddTransaction({
        description: "Rendimento CDB XP Líquido",
        amount: 85.00,
        type: "income",
        category: "Receita",
        subCategory: "Investimentos",
        date: new Date().toISOString().split('T')[0],
        account: "Investimentos",
        isFixed: false
      });
      alert("Sincronização rápida realizada! R$ 85,00 depositados em XP Investimentos.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans tracking-tight antialiased">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-white w-64 p-6 border-r border-slate-800 flex flex-col justify-between transition-transform transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        <div className="space-y-6">
          
          {/* Main Title / Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-bold font-display tracking-wide">Gestor de Finanças</h1>
              <span className="text-[10px] text-slate-400 font-bold block leading-none font-mono tracking-wider">PREMIUM v4.2</span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1.5 pt-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">Principal</span>
            
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Wallet className="w-4 h-4" />
              Visão Geral
            </button>

            <button
              onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Layers className="w-4 h-4" />
              Transações e Lançamentos
            </button>

            <button
              onClick={() => { setActiveTab('planning'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'planning' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <PiggyBank className="w-4 h-4" />
              Metas e Caixinhas
            </button>

            <button
              onClick={() => { setActiveTab('debts'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'debts' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <CardIcon className="w-4 h-4" />
              Cartões e Dívidas
            </button>

            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block pt-4 mb-2 font-mono">Conectividade / IA</span>

            <button
              onClick={() => { setActiveTab('automation'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'automation' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <RefreshCcw className="w-4 h-4" />
              Open Finance e Grupo
            </button>

            <button
              onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Sparkles className="w-4 h-4" />
              Relatórios e Insights
            </button>

            <button
              onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-700/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Lock className="w-4 h-4" />
              Proteção & Privacidade
            </button>
          </nav>

        </div>

        {/* Footer info lock indicator */}
        <div className="pt-6 border-t border-slate-800/60 flex items-center gap-3 text-xs text-slate-400">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase text-[10px]">AN</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900" />
          </div>
          <div>
            <p className="font-bold text-slate-200">Andrey Salgueiro</p>
            <span className="text-[10px] text-slate-500">andreysalgueiro95</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* Top bar for mobile nav and sync details */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Seção Ativa ❯</span>
              <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                {activeTab === 'dashboard' && "Painel Geral"}
                {activeTab === 'transactions' && "Histórico & OCR"}
                {activeTab === 'planning' && "Objetivos e CDB"}
                {activeTab === 'debts' && "Mapeamento Dívidas"}
                {activeTab === 'automation' && "Fluxo Integrado"}
                {activeTab === 'reports' && "Inteligência Artificial"}
                {activeTab === 'security' && "Ajuste PIN"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Balance Indicators in Header */}
            <div className="hidden md:flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-medium">Saldo Itaú:</span>
              <strong className="text-slate-800 font-mono">R$ {accountsBalances.corrente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>

            {/* Locked Quick Toggle button */}
            <button
              onClick={() => setIsLockedByPin(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white transition-colors cursor-pointer"
              title="Lock screen master"
              id="lock-screen-quick-btn"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Bloquear App
            </button>
          </div>
        </header>

        {/* Tab display zone */}
        <div id="finance-tab-viewport" className="p-6 max-w-7xl w-full mx-auto flex-1 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <FinanceDashboard 
              transactions={transactions}
              accountsBalances={accountsBalances}
              onTriggerSync={handleOpenFinanceManualTrigger}
              isSyncing={isSyncingOpenFinance}
              isOffline={isOffline}
            />
          )}

          {activeTab === 'transactions' && (
            <FinanceTransactions
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              bills={bills}
              onToggleBillPause={handleToggleBillPause}
              onAddBill={handleAddBill}
              budgets={budgets}
              onUpdateBudgetLimit={handleUpdateBudgetLimit}
            />
          )}

          {activeTab === 'planning' && (
            <FinancePlanning
              goals={goals}
              onDepositToGoal={handleDepositToGoal}
              onAddGoal={handleAddGoal}
              monthlyLeftOver={accountsBalances.corrente}
            />
          )}

          {activeTab === 'debts' && (
            <FinanceCreditCards
              cards={creditCards}
              onUpdateLimitUsed={(id, amt) => {
                setCreditCards(prev => prev.map(c => {
                  if (c.id === id) return { ...c, limitUsed: amt };
                  return c;
                }));
              }}
            />
          )}

          {activeTab === 'automation' && (
            <FinanceAutomation
              rules={rules}
              onAddRule={handleAddRule}
              onDeleteRule={handleDeleteRule}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              groupExpenses={groupExpenses}
              onAddGroupExpense={handleAddGroupExpense}
              onClearGroupExpenses={handleClearGroupExpenses}
              onAddTransaction={handleAddTransaction}
              onOpenFinanceSyncDone={handleOpenFinanceSyncCompleted}
              isOffline={isOffline}
              onToggleOffline={() => setIsOffline(!isOffline)}
            />
          )}

          {activeTab === 'reports' && (
            <FinanceReports
              transactions={transactions}
              goals={goals}
              budgets={budgets}
            />
          )}

          {activeTab === 'security' && (
            <FinanceSecurity
              isPinLocked={isLockedByPin}
              onSetPinLocked={setIsLockedByPin}
              onClearAllData={handleClearAllData}
            />
          )}
        </div>
      </main>

      {/* 3. MOBILE MENU BAR MOBILE MENU BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-slate-950/45 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 4. PIN/BIOMETRICS GLASS-MORPHIC SECURITY LOCK SCREEN OVERLAY */}
      {isLockedByPin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/10 text-white w-full max-w-sm rounded-[24px] border border-white/10 shadow-2xl overflow-hidden p-6 text-center space-y-6 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />

            <div className="space-y-2">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                <Lock className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display tracking-wide">Acesso Protegido</h3>
                <p className="text-xs text-slate-400 font-medium">Digite o seu PIN de 4 dígitos ou use FaceID para desbloquear.</p>
              </div>
            </div>

            {/* Unlock Form */}
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div className="flex justify-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="PIN Mestre (padrão: 1234)"
                  value={pinUnlockCode}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, "");
                    setPinUnlockCode(cleanValue);
                    if (cleanValue === "1234") {
                      setIsLockedByPin(false);
                      setPinUnlockCode("");
                    }
                  }}
                  className="w-full text-center tracking-[1.5em] text-white placeholder-slate-500 text-lg py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!pinUnlockCode}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Confirmar PIN Numérico
                </button>

                <button
                  type="button"
                  onClick={handleSimulateBiometricUnlock}
                  disabled={biometricUnlocking}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  {biometricUnlocking ? "Analisando Face ID..." : "Simular Scanner Face ID"}
                </button>
              </div>
            </form>

            <p className="text-[10px] text-slate-500">
              *Seu cofre está isolado localmente. Caso desinstale o app, suas chaves de segurança expirarão.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
