'use client'
import React, { useState } from 'react'
import { Crown, X, Rocket, ShieldCheck, Download, Zap, Loader2 } from 'lucide-react'
import { sb } from '@/lib/supabase'
import { PREMIUM_PRICE } from '@/lib/constants'

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubscription = async () => {
    setIsRedirecting(true);
    setErrorMsg('');
    try {
      const { data: { session } } = await sb.auth.getSession();

      if (!session) {
        setErrorMsg('Por favor, iniciá sesión para realizar la compra.');
        setIsRedirecting(false);
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      });

      const data = await res.json();

      sessionStorage.setItem('pago_iniciado_uid', session.user.id);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se pudo generar el link de pago');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo conectar con el sistema de pagos. Intentá de nuevo.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Cabecera con degradado */}
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 right-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
            <Crown size={40} className="text-yellow-400 fill-yellow-400" />
          </div>
          
          {/* Círculos decorativos de fondo */}
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2 tracking-tight">
              SQLNova <span className="text-blue-500">Premium</span>
            </h2>
            <p className="text-[var(--sub)] text-sm leading-relaxed">
              Desbloqueá Pocket Database y procesá tus propios archivos Excel y CSV sin límites.
            </p>
          </div>

          {/* Lista de Beneficios */}
          <div className="space-y-4 mb-8">
            <BenefitItem 
              icon={<Rocket size={18} className="text-blue-500" />} 
              title="Soporte Excel (.xlsx)" 
              desc="Subí tus planillas de trabajo sin convertir a CSV." 
            />
            <BenefitItem 
              icon={<ShieldCheck size={18} className="text-green-500" />} 
              title="Privacidad Blindada" 
              desc="Tus datos nunca salen de tu navegador." 
            />
            <BenefitItem 
              icon={<Download size={18} className="text-purple-500" />} 
              title="Exportación Pro" 
              desc="Descargá tus resultados filtrados al instante." 
            />
            <BenefitItem 
              icon={<Zap size={18} className="text-yellow-500" />} 
              title="Sin Límites" 
              desc="Consultas SQL potentes y sin restricciones." 
            />
          </div>

          {/* Botón de Acción Dinámico */}
          <button 
            onClick={handleSubscription}
            disabled={isRedirecting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Conectando...
              </>
            ) : (
              "Suscribirme ahora"
            )}
          </button>
          
          {errorMsg && (
            <p className="mt-3 text-center text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
              {errorMsg}
            </p>
          )}

          <p className="text-center text-[var(--sub)] text-[11px] mt-4 uppercase tracking-widest font-bold">
            Pago único de ${PREMIUM_PRICE.toLocaleString('es-AR')} · Acceso de por vida
          </p>
        </div>
      </div>
    </div>
  )
}

function BenefitItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 w-10 h-10 bg-[var(--bg2)] rounded-xl flex items-center justify-center border border-[var(--border)] group-hover:border-blue-500/50 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-[var(--text)]">{title}</h4>
        <p className="text-xs text-[var(--sub)] leading-tight">{desc}</p>
      </div>
    </div>
  )
}
