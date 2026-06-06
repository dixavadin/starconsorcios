/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, Interacao, User, LeadStatus, InteracaoTipo } from '../types';
import { 
  Users, 
  Search, 
  History, 
  X, 
  MessageSquarePlus, 
  Mail, 
  Phone, 
  Coins, 
  AlertCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface LeadsVendedorProps {
  user: User;
}

export default function LeadsVendedor({ user }: LeadsVendedorProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Drag and Drop States
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // Modal active state
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interacao[]>([]);

  // Interaction logs states
  const [newStatus, setNewStatus] = useState<LeadStatus>('Novo');
  const [interTipo, setInterTipo] = useState<InteracaoTipo>('WhatsApp');
  const [interObs, setInterObs] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const list = await api.getLeads(user.id);
      setLeads(list);
    } catch {
      toast.error('Erro ao resgatar seus leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [user.id]);

  // Filters logic
  const filtered = leads.filter(l => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      l.nome.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.telefone.includes(query) ||
      l.produto_interesse.toLowerCase().includes(query);

    return matchesSearch;
  });

  // Open detail panel
  const handleOpenDetail = async (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setInterObs('');
    try {
      setIsOpenDetail(true);
      const interList = await api.getInteracoes(lead.id);
      setInteractions(interList);
    } catch {
      toast.error('Erro ao puxar histórico de interações.');
    }
  };

  // Submit contact notes and/or change status
  const handleUpdateLeadState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      setSubmitting(true);
      
      const didStatusChange = newStatus !== selectedLead.status;

      // 1. Update status on lead
      if (didStatusChange) {
        await api.updateLead(selectedLead.id, { status: newStatus });
        toast.success(`Status do lead alterado para: ${newStatus}`);
      }

      // 2. Record interaction log if there is text in comment box, or if status changed
      if (interObs.trim() || didStatusChange) {
        const textLog = interObs.trim() 
          ? interObs.trim() 
          : `Alteração de status de negociação de "${selectedLead.status}" para "${newStatus}" sem notas adicionais.`;

        await api.createInteracao({
          lead_id: selectedLead.id,
          vendedor_id: user.id,
          tipo: interTipo,
          observacao: textLog
        });
        
        toast.success('Atividade comercial registrada!');
      }

      // Close modal & reload lists
      setIsOpenDetail(false);
      loadLeads();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar alterações.');
    } finally {
      setSubmitting(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (status: LeadStatus) => {
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDropLead = async (status: LeadStatus) => {
    if (!draggedLeadId) return;
    const lead = leads.find(l => l.id === draggedLeadId);
    if (!lead) return;
    if (lead.status === status) return;

    try {
      // 1. Update status on lead
      await api.updateLead(draggedLeadId, { status });
      toast.success(`Status de "${lead.nome}" alterado para: ${status}`);

      // 2. Record interaction log of status change
      const textLog = `Status de negociação alterado de "${lead.status}" para "${status}" via Arrastar e Soltar.`;
      await api.createInteracao({
        lead_id: draggedLeadId,
        vendedor_id: user.id,
        tipo: 'WhatsApp',
        observacao: textLog
      });

      // Reload
      loadLeads();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao redefinir status.');
    } finally {
      setDraggedLeadId(null);
      setDragOverStatus(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Kanban Columns configuration mapping
  const STATUS_COLS: { id: LeadStatus; label: string; text: string; borderHover: string; dot: string; bgBadge: string }[] = [
    { id: 'Novo', label: 'Novo', text: 'text-blue-700', borderHover: 'border-blue-400 bg-blue-50/20 ring-2 ring-blue-500/10', dot: 'bg-blue-500', bgBadge: 'bg-blue-100 text-blue-800' },
    { id: '1 a 3 dias', label: '1 a 3 dias', text: 'text-orange-700', borderHover: 'border-orange-400 bg-orange-50/20 ring-2 ring-orange-500/10', dot: 'bg-orange-500', bgBadge: 'bg-orange-100 text-orange-850' },
    { id: '4 a 7 dias', label: '4 a 7 dias', text: 'text-amber-700', borderHover: 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-500/10', dot: 'bg-amber-500', bgBadge: 'bg-amber-100 text-amber-800' },
    { id: 'Última Tentativa', label: 'Última Tentativa', text: 'text-rose-700', borderHover: 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-500/10', dot: 'bg-rose-550', bgBadge: 'bg-rose-100 text-rose-800' },
    { id: 'Conexão', label: 'Conexão', text: 'text-purple-700', borderHover: 'border-purple-400 bg-purple-50/20 ring-2 ring-purple-500/10', dot: 'bg-purple-500', bgBadge: 'bg-purple-100 text-purple-800' },
    { id: 'Proposta Enviada', label: 'Proposta Enviada', text: 'text-cyan-700', borderHover: 'border-cyan-400 bg-cyan-50/20 ring-2 ring-cyan-500/10', dot: 'bg-cyan-500', bgBadge: 'bg-cyan-100 text-cyan-800' },
    { id: 'Vendido', label: 'Vendido', text: 'text-emerald-700', borderHover: 'border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-500/10', dot: 'bg-emerald-500', bgBadge: 'bg-emerald-100 text-emerald-800' },
    { id: 'Perdido', label: 'Perdido', text: 'text-red-700', borderHover: 'border-red-400 bg-red-50/20 ring-2 ring-red-500/10', dot: 'bg-red-500', bgBadge: 'bg-red-100 text-red-800' },
    { id: 'Ação Futura', label: 'Ação Futura', text: 'text-teal-700', borderHover: 'border-teal-400 bg-teal-50/20 ring-2 ring-teal-500/10', dot: 'bg-teal-500', bgBadge: 'bg-teal-100 text-teal-800' },
  ];

  const displayColumns = selectedStatus === 'All' 
    ? STATUS_COLS 
    : STATUS_COLS.filter(c => c.id === selectedStatus);

  return (
    <div id="vendedor-leads-root" className="space-y-6 animate-fadeIn">
      {/* Top action details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Meus Clientes Ativos</h3>
          <p className="text-xs text-slate-400">Arraste e solte os cartões de clientes nas colunas abaixo para atualizar seus status de forma instantânea.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 bg-blue-50 px-4.5 py-2 rounded-xl text-blue-700 border border-blue-100 font-medium text-xs">
          <TrendingUp className="h-4 w-4 shrink-0 text-[#2563EB]" />
          <span>Foco prioritário em novos leads e ações de follow-up</span>
        </div>
      </div>

      {/* Inputs bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            id="vendedor-search-leads"
            type="text"
            className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition placeholder-slate-450"
            placeholder="Buscar nos seus leads por nome, produto, fone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status columns display filter */}
        <div>
          <select
            id="seller-filter-status"
            className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 font-medium focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Focar em Status: Todos</option>
            <option value="Novo">Focar em: Novo</option>
            <option value="1 a 3 dias">Focar em: 1 a 3 dias</option>
            <option value="4 a 7 dias">Focar em: 4 a 7 dias</option>
            <option value="Última Tentativa">Focar em: Última Tentativa</option>
            <option value="Conexão">Focar em: Conexão</option>
            <option value="Proposta Enviada">Focar em: Proposta Enviada</option>
            <option value="Vendido">Focar em: Vendido</option>
            <option value="Perdido">Focar em: Perdido</option>
            <option value="Ação Futura">Focar em: Ação Futura</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="flex h-96 items-center justify-center bg-white border border-slate-100 rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
            <span className="text-xs text-slate-500 font-semibold">Resgatando seus fluxos comerciais...</span>
          </div>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-2 pb-4 select-none lg:overflow-x-visible lg:grid lg:grid-cols-9 lg:gap-2">
          {displayColumns.map((col) => {
            const columnLeads = filtered.filter(l => l.status === col.id);
            const columnSum = columnLeads.reduce((sum, item) => sum + item.valor_estimado, 0);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(col.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDropLead(col.id)}
                className={`flex-1 min-w-[145px] bg-slate-50/50 rounded-xl border p-2 h-[580px] flex flex-col transition-all duration-200 ${
                  dragOverStatus === col.id 
                    ? `${col.borderHover}` 
                    : 'border-slate-100'
                }`}
              >
                {/* Column Header */}
                <div className="pb-2 border-b border-slate-200/60 shrink-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${col.dot}`} />
                      <h4 className="text-[11px] font-extrabold text-slate-805 truncate" title={col.label}>
                        {col.label}
                      </h4>
                    </div>
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${col.bgBadge}`}>
                      {columnLeads.length}
                    </span>
                  </div>
                  {/* Pipeline financial volume summary */}
                  <div className="text-[9px] text-slate-400 font-bold mt-1 font-mono">
                    {formatCurrency(columnSum)}
                  </div>
                </div>

                {/* Draggable Cards Holder */}
                <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-0.5">
                  {columnLeads.length > 0 ? (
                    columnLeads.map((lead) => {
                      const isDragged = draggedLeadId === lead.id;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenDetail(lead)}
                          className={`bg-white rounded-lg border border-slate-200/80 p-2 shadow-xs hover:shadow-md hover:border-[#2563EB] hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing space-y-2 relative group ${
                            isDragged ? 'opacity-30 border-dashed border-blue-400/80 bg-blue-50/10 scale-[0.98]' : ''
                          }`}
                        >
                          {/* Inner metadata */}
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-slate-800 text-[11px] tracking-tight leading-tight truncate" title={lead.nome}>
                              {lead.nome}
                            </h5>
                            <div className="text-[9px] text-slate-400 font-medium truncate max-w-full" title={lead.produto_interesse}>
                              {lead.produto_interesse}
                            </div>
                            <div className="font-black text-[#2563EB] text-[10px] mt-0.5">
                              {formatCurrency(lead.valor_estimado)}
                            </div>
                          </div>

                          {/* Interactive communications shortcuts */}
                          <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 font-bold border-t border-slate-50 pt-1.5">
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="h-2.5 w-2.5 text-slate-350 shrink-0" />
                              <span className="truncate">{lead.telefone || 'Sem fone'}</span>
                            </span>
                            <span className="flex items-center gap-1 truncate" title={lead.email}>
                              <Mail className="h-2.5 w-2.5 text-slate-350 shrink-0" />
                              <span className="truncate">{lead.email || 'Sem e-mail'}</span>
                            </span>
                          </div>

                          {/* Card action indicator */}
                          <div className="flex items-center justify-between text-[7px] text-slate-400 font-mono mt-0.5 pt-1 border-t border-slate-50/50">
                            <span>{new Date(lead.data_criacao).toLocaleDateString('pt-BR')}</span>
                            <span className="text-[#2563EB] font-bold opacity-0 group-hover:opacity-100 transition duration-150">
                              Ver →
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-2 border border-dashed border-slate-200/70 rounded-lg bg-slate-50/20 text-slate-400">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-350">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK CONTACTS & NEGOTIATION UPDATE SHEET */}
      {isOpenDetail && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="flex h-15 items-center justify-between border-b px-6 bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800">Ficha de Atendimento Comercial</h4>
                <p className="text-xs text-slate-400">Atualizar status e registrar atividades para: <span className="font-bold text-slate-600">{selectedLead.nome}</span></p>
              </div>
              <button
                onClick={() => setIsOpenDetail(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 text-slate-800">
              
              {/* Form Input updating Status & contact notes */}
              <div className="p-6 border-r border-slate-100 shrink-0">
                <h5 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
                  <MessageSquarePlus className="h-4.5 w-4.5 text-[#2563EB]" />
                  <span>Registrar Atendimento</span>
                </h5>

                <form onSubmit={handleUpdateLeadState} className="space-y-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Status Atual da Negociação
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-slate-50 focus:bg-white focus:border-[#2563EB] focus:outline-hidden"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                      >
                        <option value="Novo">Novo (Lead Sem Contato)</option>
                        <option value="1 a 3 dias">1 a 3 dias</option>
                        <option value="4 a 7 dias">4 a 7 dias</option>
                        <option value="Última Tentativa">Última Tentativa</option>
                        <option value="Conexão">Conexão</option>
                        <option value="Proposta Enviada">Proposta Enviada</option>
                        <option value="Vendido">Vendido - Gerar Venda e Comissão!</option>
                        <option value="Perdido">Perdido (Sem Interesse)</option>
                        <option value="Ação Futura">Ação Futura</option>
                      </select>
                    </div>
                  </div>

                  {/* Channel contact */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Canal Utilizado
                    </label>
                    <select
                      className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      value={interTipo}
                      onChange={(e) => setInterTipo(e.target.value as InteracaoTipo)}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Ligação">Ligação Telefônica</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Reunião">Reunião Própria</option>
                      <option value="Visita">Visita Comercial</option>
                    </select>
                  </div>

                  {/* Notes text area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Mensagem / Anotações Comerciais
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      placeholder="Anote o andamento: o que cliente respondeu? Qual o plano de ação?"
                      value={interObs}
                      onChange={(e) => setInterObs(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 cursor-pointer disabled:opacity-50 transition active:translate-y-px"
                  >
                    {submitting ? 'Salvando andamento...' : 'Confirmar e Salvar'}
                  </button>
                </form>
              </div>

              {/* Log Timeline view on the right of modal */}
              <div className="p-6 bg-slate-50/50 flex flex-col h-[380px]">
                <h5 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
                  <Tag className="h-4.5 w-4.5 text-blue-500" />
                  <span>Histórico de Contatos ({interactions.length})</span>
                </h5>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                  {interactions.length > 0 ? (
                    interactions.map(log => (
                      <div key={log.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                            {log.tipo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(log.data_interacao).toLocaleDateString('pt-BR')} às {new Date(log.data_interacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-650 mt-1.5 leading-relaxed font-sans">{log.observacao}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center flex-col text-slate-400">
                      <AlertCircle className="h-7 w-7 text-slate-350" />
                      <span className="text-xs text-slate-400 mt-1">Este lead ainda não tem contatos iniciados</span>
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
