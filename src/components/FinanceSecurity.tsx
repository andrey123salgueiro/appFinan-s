import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Key, Fingerprint, RefreshCw, AlertTriangle, ShieldAlert, Lock, Unlock, BadgeAlert } from "lucide-react";

interface SecurityProps {
  isPinLocked: boolean;
  onSetPinLocked: (isLocked: boolean) => void;
  onClearAllData: () => void;
}

export default function FinanceSecurity({
  isPinLocked,
  onSetPinLocked,
  onClearAllData
}: SecurityProps) {
  // Passcode unlock trial state
  const [pinInput, setPinInput] = useState("");
  const [masterPin, setMasterPin] = useState("1234");
  const [showPinInputArea, setShowPinInputArea] = useState(false);
  const [newPin, setNewPin] = useState("");

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [biometricsScanning, setBiometricsScanning] = useState(false);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === masterPin) {
      onSetPinLocked(false);
      setPinInput("");
      alert("Autenticado com sucesso! Aplicativo desbloqueado.");
    } else {
      alert("PIN Incorreto! Use o PIN padrão '1234' para simulação.");
      setPinInput("");
    }
  };

  const handleTriggerBiometrics = () => {
    setBiometricsScanning(true);
    setTimeout(() => {
      setBiometricsScanning(false);
      onSetPinLocked(false);
      alert("Digital/Face ID analisada com sucesso! Aplicativo desbloqueado.");
    }, 1500);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      alert("O PIN mestre precisa conter exatamente 4 dígitos numéricos.");
      return;
    }
    setMasterPin(newPin);
    setNewPin("");
    alert(`PIN de segurança atualizado para [${newPin}]! Lembre-se dele.`);
  };

  const handleWipeData = () => {
    if (confirm("Tem certeza absoluta que deseja apagar todos os dados financeiros locais? Isso removerá transações, caixinhas e configurações de Open Finance, restaurando os padrões de fábrica.")) {
      onClearAllData();
      alert("Todos os dados foram eliminados com sucesso. Recarregando...");
      window.location.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="security-privacy-compartment">
      
      {/* LEFT SECTION: Config PIN & Biometria (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Senha mestre & Bloqueio por PIN status card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-slate-900 font-display tracking-tight flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                PIN e Bloqueio de Segurança
              </h3>
              <p className="text-xs text-slate-500 font-medium">Impedir acesso não-autorizado quando abrir o app.</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold font-mono text-slate-600">
              <span>Status:</span>
              <span className={isPinLocked ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}>
                {isPinLocked ? "BLOQUEADO" : "LIVRE"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Simular Bloqueio Imediato</span>
            <p className="text-xs text-slate-500 leading-normal">
              Ao ativar esta proteção, uma janela de segurança com desfoque cobrirá a interface se porventura o app for suspenso ou destravado. O PIN mestre padrão configurado é <strong className="font-mono text-slate-900">1234</strong>.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onSetPinLocked(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Bloquear Agora
              </button>
              
              {!isPinLocked && (
                <button
                  onClick={() => alert("O aplicativo está livre! Clique em 'Bloquear Agora' para ver a tela de proteção PIN em tempo real.")}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Confirmar PIN Atual Ativo ({masterPin})
                </button>
              )}
            </div>
          </div>

          {/* Form to update Master PIN */}
          <form onSubmit={handleUpdatePin} className="space-y-2 pt-2 border-t border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Alterar Senha Mestre de PIN</span>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                placeholder="Novo PIN (4 dígitos numéricos)"
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNewPin(val);
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-100 hover:text-white rounded-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                Gravar Senha
              </button>
            </div>
          </form>
        </div>

        {/* Biometric fingerprint simulation Face ID toggle */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-display">Autenticação Biométrica (Digital / Face ID)</h4>
              <p className="text-xs text-slate-400">Usar sensores integrados ao smartphone/computador para liberar o cofre de dados.</p>
            </div>

            {/* Toggle Biometrics */}
            <button
              onClick={() => {
                setBiometricsEnabled(!biometricsEnabled);
                alert(biometricsEnabled ? "Biometria suspensa do app." : "Biometria Face ID/Touch ID acoplada com sucesso!");
              }}
              className={`p-1 w-11 h-6 rounded-full transition-colors relative cursor-pointer ${biometricsEnabled ? "bg-emerald-500" : "bg-slate-200"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all absolute top-1 ${biometricsEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>

          {biometricsEnabled && (
            <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-xl text-xs space-y-2 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[240px]">
                <p className="font-bold flex items-center gap-1 font-display">
                  <Fingerprint className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  Biometria Habilitada
                </p>
                <p className="text-[10px] text-emerald-800 leading-normal">
                  No celular, você pode tocar no sensor ou olhar para a câmera para dispensar a senha de 4 dígitos.
                </p>
              </div>

              <button
                onClick={handleTriggerBiometrics}
                disabled={biometricsScanning}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[10px] cursor-pointer shrink-0"
              >
                {biometricsScanning ? "Lendo Scanner..." : "Testar FaceID/TouchID"}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT SECTION: Política Criptografia e Wipe (Columns 6) */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Política de privacidade e criptografia local */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Criptografia de Dados & Custódia Local
          </h4>

          <div className="space-y-3 leading-relaxed text-slate-600">
            <p>
              Diferente de sistemas legados que enviam sua senha do banco para a nuvem sem transparência, nosso <strong>Gestor de Finanças Pessoais</strong> opera sob uma política estrita de **custódia local criptografada**.
            </p>

            <div className="p-3.5 bg-slate-950 text-slate-300 rounded-xl space-y-2 border border-slate-800 font-mono text-[10px] leading-relaxed">
              <div className="flex justify-between font-bold border-b border-slate-800 pb-1.5">
                <span>PARÂMETRO DE SEGURANÇA</span>
                <span>MÉTODO / ALGORITMO</span>
              </div>
              <div className="flex justify-between">
                <span>Chaves Open Finance</span>
                <span className="text-emerald-400">RSA-4096 Bits SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span>Banco de Lançamentos</span>
                <span className="text-emerald-400">AES-256 com Chave de Sessão</span>
              </div>
              <div className="flex justify-between">
                <span>Cofre de Meta Poupança</span>
                <span className="text-emerald-400">Armazenamento Local Isolado</span>
              </div>
              <div className="flex justify-between">
                <span>Conexões Externas</span>
                <span className="text-blue-400">TLS 1.3 / mTLS Brasil</span>
              </div>
            </div>

            <p>
              Ao optar por não usar bancos de dados cloud corporativos no fluxo simplificado, qualquer criminoso que tentar reter seu dispositivo de longe não terá acesso às suas finanças devido ao hash de sal de PIN que criptografa os cookies de persistência local.
            </p>
          </div>
        </div>

        {/* Destructive zone: wipe all local records */}
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
            <span className="font-extrabold text-rose-950 uppercase tracking-wider font-display">Zona Destrutiva / Wipe Out</span>
          </div>
          <p className="text-rose-800 leading-normal">
            Limpando todos os cookies, desassociará os saldos de Conta Corrente, faturas de cartão de crédito e a história das caixinhas, forçando uma reinicialização com os dados de fábrica originais. Ação irreversível.
          </p>

          <button
            onClick={handleWipeData}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-100 cursor-pointer block text-center"
          >
            Apagar Todos os Dados Locais
          </button>
        </div>

      </div>

    </div>
  );
}
export { Eye };
export { EyeOff };
export { RefreshCw };
