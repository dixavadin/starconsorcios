/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, User } from '../types';
import { Send, Users, Sparkles, SlidersHorizontal, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DistribuicaoLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendedores, setVendedores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedVendedorId, setSelectedVendedorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const [leadsList, vendorsList] = await Promise.all([
        api.getLeads(),
        api.getVendedores()
      ]);
      setLeads(leadsList);
      setVendedores(vendorsList);
    } catch {
      toast.error('Erro ao recolher dados de distribuição.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Compute unassigned leads
  const unassignedLeads = leads.filter(l => l.vendedor_id === null || l.vendedor_id === '');

  // Handle manual express assignment form submission
  const handleAssignExpress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      toast.error('Selecione primeiro qual lead deseja encaminhar.');
      return;
    }
    if (!selectedVendedorId) {
      toast.error('Selecione um consultor comercial da Star.');
      return;
    }

    try {
      setSubmitting(true);
      await api.distribuirLead(selectedLeadId, selectedVendedorId);
      toast.success('Lead encaminhado com sucesso e atividade registrada!');
      
      // Clear form express selection
      setSelectedLeadId('');
      setSelectedVendedorId('');
      
      // Refresh
      loadResources();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao efetuar alocação.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick inline row reassignment selector
  const handleInlineAssign = async (leadId: string, vendorId: string) => {
    if (!vendorId) return;
    try {
      await api.distribuirLead(leadId, vendorId);
      toast.success('Consultor alterado com sucesso!');
      loadResources();
    } catch {
      toast.error('Erro ao redistribuir lead.');
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'Novo': 'bg-blue-50 text-blue-700',
      '1 a 3 dias': 'bg-orange-50 text-orange-700',
      '4 a 7 dias': 'bg-amber-50 text-amber-700',
      'Última Tentativa': 'bg-rose-50 text-rose-700',
      'Conexão': 'bg-purple-50 text-purple-700',
      'Proposta Enviada': 'bg-cyan-50 text-cyan-700',
      'Vendido': 'bg-emerald-50 text-emerald-700',
      'Perdido': 'bg-slate-100 text-slate-700',
      'Ação Futura': 'bg-teal-50 text-teal-700'
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${styles[status] || 'bg-slate-50 text-slate-700'}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-xs text-slate-550 font-bold">Verificando fluxos de distribuição...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="distribution-admin-root" className="space-y-6 animate-fadeIn">
      
      {/* Top Banner details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#1E3A8A] p-6 rounded-2xl text-white shadow-md shadow-[#1E3A8A]/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-300 fill-amber-300 animate-pulse" />
            <h3 className="text-lg font-extrabold tracking-tight">Painel de Alocação e Distribuição</h3>
          </div>
          <p className="text-xs text-blue-105 font-medium max-w-xl">
            Selecione de forma manual a carteira ideal para cada consultor ou proceda à redistribuição estratégica de leads inativos ou pendentes.
          </p>
        </div>
        
        {/* KPI indicators count */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-right border border-white/10 shrink-0">
          <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Leads Sem Atendimento</span>
          <span className="text-2xl font-black text-white">{unassignedLeads.length} de {leads.length}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Express distribution form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs h-fit">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />
            <span>Distribuidor Expresso</span>
          </h4>

          <form onSubmit={handleAssignExpress} className="space-y-4">
            <div>
              <label htmlFor="dist-select-lead" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                1. Selecionar Lead Comercial
              </label>
              <select
                id="dist-select-lead"
                required
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm focus:bg-white focus:border-[#2563EB] focus:outline-hidden text-slate-800 font-semibold"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
              >
                <option value="">Selecione o lead pendente</option>
                {/* Prioritize unassigned, but list all */}
                <optgroup label="Aguardando Vendedor (Pendentes)">
                  {unassignedLeads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.nome} ({l.produto_interesse})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Já Atribuídos anteriormente">
                  {leads.filter(l => l.vendedor_id !== null && l.vendedor_id !== '').map(l => {
                    const currentV = vendedores.find(v => v.id === l.vendedor_id);
                    return (
                      <option key={l.id} value={l.id}>
                        {l.nome} (Atual: {currentV ? currentV.nome : 'Nenhum'})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            <div>
              <label htmlFor="dist-select-vendor" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                2. Encaminhar para Consultor Star
              </label>
              <select
                id="dist-select-vendor"
                required
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm focus:bg-white focus:border-[#2563EB] focus:outline-hidden text-slate-800"
                value={selectedVendedorId}
                onChange={(e) => setSelectedVendedorId(e.target.value)}
              >
                <option value="">Selecione quem fará o atendimento</option>
                {vendedores.map(v => {
                  const leadCount = leads.filter(l => l.vendedor_id === v.id).length;
                  return (
                    <option key={v.id} value={v.id}>
                      {v.nome} ({leadCount} leads na carteira)
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              id="submit-express-dist"
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-sm px-4 py-3 cursor-pointer disabled:opacity-50 transition active:translate-y-px shadow-lg shadow-blue-500/10 mt-2"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Atribuindo Carteira...' : 'Atribuir Lead'}</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Main list of unassigned and active leads */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Corte Detalhado de Distribuição</h4>
              <p className="text-xs text-slate-405">Todos os leads cadastrados e seus respectivos status.</p>
            </div>
            <div className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 rounded-full px-3 py-1">
              Filtro: Leads Atribuição Direta
            </div>
          </div>

          {leads.length > 0 ? (
            <div className="overflow-x-auto max-h-[450px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase tracking-widest">
                    <th className="px-6 py-4">Cliente / Interesse</th>
                    <th className="px-6 py-4">Status de Venda</th>
                    <th className="px-6 py-4 text-right">Mudar Atendedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-sans">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/20 transition">
                      {/* Name card */}
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800">{lead.nome}</div>
                        <div className="text-[11px] text-slate-450 mt-0.5 truncate max-w-[200px]" title={lead.produto_interesse}>
                          {lead.produto_interesse}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <div className="inline-block">
                          {getStatusStyle(lead.status)}
                        </div>
                      </td>

                      {/* Select row changer */}
                      <td className="px-6 py-3.5 text-right">
                        <select
                          id={`inline-alloc-${lead.id}`}
                          className="rounded-lg bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 focus:bg-white focus:border-[#2563EB] focus:outline-hidden text-slate-700 font-semibold"
                          value={lead.vendedor_id || ''}
                          onChange={(e) => handleInlineAssign(lead.id, e.target.value)}
                        >
                          <option value="">Aguardando Distribuição</option>
                          {vendedores.map(v => (
                            <option key={v.id} value={v.id}>{v.nome}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CheckCircle className="h-10 w-10 text-emerald-300 mb-2" />
              <h5 className="font-bold text-slate-700 text-sm">Sem Leads Cadastrados</h5>
              <p className="text-xs text-slate-400 mt-1">Crie leads no módulo anterior para distribuir.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
