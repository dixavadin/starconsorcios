/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Configuracoes } from '../types';
import { Settings, Shield, Sparkles, Sliders, Volume2, Save, Eye, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesAdmin() {
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states matching Configuracoes
  const [empresa, setEmpresa] = useState('');
  const [logo, setLogo] = useState('');
  const [percentualPadrao, setPercentualPadrao] = useState('1.5');
  const [distribuicaoAutomatica, setDistribuicaoAutomatica] = useState(false);
  const [corPrincipal, setCorPrincipal] = useState('#1E3A8A'); // visualization setting

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await api.getConfiguracoes();
        setConfig(data);
        setEmpresa(data.empresa);
        setLogo(data.logo || '');
        setPercentualPadrao((data.percentual_padrao || 1.5).toString());
        setDistribuicaoAutomatica(data.distribuicao_automatica);
      } catch {
        toast.error('Erro ao ler configurações do servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<Configuracoes> = {
        empresa,
        logo,
        percentual_padrao: Number(percentualPadrao) || 1.5,
        distribuicao_automatica: distribuicaoAutomatica
      };
      
      const updated = await api.updateConfiguracoes(payload);
      setConfig(updated);
      toast.success('Configurações salvas e aplicadas em toda a filial!');
    } catch {
      toast.error('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-xs text-slate-500 font-bold font-sans">Carregando painel de parametrização...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="settings-admin-root" className="space-y-6 animate-fadeIn">
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left column explanation & stats */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h4 className="text-sm font-extrabold text-[#1E3A8A] flex items-center gap-2 pb-2.5 border-b mb-3">
              <Shield className="h-4.5 w-4.5 text-[#2563EB]" />
              <span>Políticas & Parâmetros</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              As alterações efetuadas neste painel impactam diretamente o cálculo de faturas, a emissão automática de ordens de vendas e o direcionamento automatizado de novas captações de clientes.
            </p>
            
            <div className="mt-5 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 border p-3">
                <span className="font-bold text-slate-700 block mb-1">Cálculo de Comissionamento</span>
                <span className="text-slate-500 leading-normal">
                  Sellers cadastrados sem um percentual explícito herdarão automaticamente a alíquota padrão configurada.
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 border p-3">
                <span className="font-bold text-slate-700 block mb-1">Direcionamento de Leads</span>
                <span className="text-slate-500 leading-normal">
                  A distribuição automática utiliza algoritmo balanceado de Round Robin para encaminhar novos leads ao consultor com menor pendência.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column main parameters form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 mb-6">
            <Sliders className="h-4.5 w-4.5 text-[#2563EB]" />
            <span>Configurações Operacionais</span>
          </h4>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Empresa & Logo Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nome da Empresa / Administradora
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome Fantasia"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-hidden text-slate-800 font-bold"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Logomarca do Sistema (URL Imagem)
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://dominio.com/logo.png"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-650 focus:outline-hidden"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                />
              </div>
            </div>

            {/* Standard commission alicote */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Alíquota Padrão de Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="block w-36 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-hidden font-bold text-slate-800"
                value={percentualPadrao}
                onChange={(e) => setPercentualPadrao(e.target.value)}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Configuração padrão herdada por novos consultores.</span>
            </div>

            {/* Color selection system mockup */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Paleta de Cores de Apoio
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorPrincipal('#1E3A8A')}
                  className={`h-8 w-8 rounded-full border-3 bg-[#1E3A8A] transition ${corPrincipal === '#1E3A8A' ? 'border-amber-300 scale-110' : 'border-slate-200'}`}
                  title="Azul Star Corporativo"
                />
                <button
                  type="button"
                  onClick={() => setCorPrincipal('#0F172A')}
                  className={`h-8 w-8 rounded-full border-3 bg-[#0F172A] transition ${corPrincipal === '#0F172A' ? 'border-amber-300 scale-110' : 'border-slate-200'}`}
                  title="Slate Minimal"
                />
                <button
                  type="button"
                  onClick={() => setCorPrincipal('#0D9488')}
                  className={`h-8 w-8 rounded-full border-3 bg-[#0D9488] transition ${corPrincipal === '#0D9488' ? 'border-amber-300 scale-110' : 'border-slate-200'}`}
                  title="Verde Esmeralda Teat"
                />
                <span className="text-xs text-slate-500 font-medium font-mono uppercase">{corPrincipal}</span>
              </div>
            </div>

            {/* Lead Auto distribution toggle switch */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" />
                  Distribuição Automática de Leads
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Ativando, qualquer lead novo incluído sem consultor será atribuído de imediato utilizando Round-Robin inteligente para a equipe de vendas.
                </p>
              </div>

              {/* Native checkbox toggle styling */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-auto-dist"
                  type="checkbox"
                  className="sr-only peer"
                  checked={distribuicaoAutomatica}
                  onChange={(e) => setDistribuicaoAutomatica(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Submit save buttons */}
            <div className="flex items-center justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-sm px-6 py-2.5 cursor-pointer disabled:opacity-50 transition active:translate-y-px shadow-lg shadow-blue-500/15"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{saving ? 'Gravando Alterações...' : 'Configurar Filial'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
