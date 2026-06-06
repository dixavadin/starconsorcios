/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, User, LeadStatus, Interacao, InteracaoTipo } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  History, 
  X, 
  AlertCircle, 
  ChevronDown, 
  User as UserIcon,
  Phone,
  Mail,
  Coins,
  MessageSquarePlus,
  Trash
} from 'lucide-react';
import { toast } from 'sonner';

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isHistOpen, setIsHistOpen] = useState(false);
  const [currentLeadForHist, setCurrentLeadForHist] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interacao[]>([]);

  // Form input states
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formProduto, setFormProduto] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('Novo');
  const [formVendedorId, setFormVendedorId] = useState('');
  const [formNotas, setFormNotas] = useState('');

  // Interaction Form input states inside history modal
  const [interTipo, setInterTipo] = useState<InteracaoTipo>('WhatsApp');
  const [interObs, setInterObs] = useState('');
  const [submittingInter, setSubmittingInter] = useState(false);

  // Load resources
  const loadData = async () => {
    try {
      setLoading(true);
      const [allLeads, allVendors] = await Promise.all([
        api.getLeads(),
        api.getVendedores()
      ]);
      setLeads(allLeads);
      setVendors(allVendors);
    } catch (err: any) {
      toast.error('Erro ao listar leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telefone.includes(searchQuery) ||
      lead.produto_interesse.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;
    
    let matchesVendor = true;
    if (selectedVendor !== 'All') {
      if (selectedVendor === 'Unassigned') {
        matchesVendor = lead.vendedor_id === null;
      } else {
        matchesVendor = lead.vendedor_id === selectedVendor;
      }
    }

    return matchesSearch && matchesStatus && matchesVendor;
  });

  // Open modal for Creating
  const handleOpenCreate = () => {
    setEditingLead(null);
    setFormNome('');
    setFormTelefone('');
    setFormEmail('');
    setFormProduto('Consórcio Imobiliário - R$ 200k');
    setFormValor('200000');
    setFormStatus('Novo');
    setFormVendedorId('');
    setFormNotas('');
    setIsFormOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormNome(lead.nome);
    setFormTelefone(lead.telefone);
    setFormEmail(lead.email);
    setFormProduto(lead.produto_interesse);
    setFormValor(lead.valor_estimado.toString());
    setFormStatus(lead.status);
    setFormVendedorId(lead.vendedor_id || '');
    setFormNotas(lead.notas);
    setIsFormOpen(true);
  };

  // Save changes
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      toast.error('Nome do cliente é obrigatório.');
      return;
    }

    try {
      const payload: Partial<Lead> = {
        nome: formNome,
        telefone: formTelefone,
        email: formEmail,
        produto_interesse: formProduto,
        valor_estimado: Number(formValor) || 0,
        status: formStatus,
        vendedor_id: formVendedorId || null,
        notas: formNotas
      };

      if (editingLead) {
        await api.updateLead(editingLead.id, payload);
        toast.success('Lead atualizado com sucesso!');
      } else {
        await api.createLead(payload);
        toast.success('Novo lead cadastrado com sucesso!');
      }

      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar informações.');
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Deseja realmente remover este lead da base de dados? Todas as interações vinculadas serão perdidas.')) return;
    try {
      await api.deleteLead(leadId);
      toast.success('Lead excluído permanentemente.');
      loadData();
    } catch (err: any) {
      toast.error('Não foi possível excluir o lead.');
    }
  };

  // Open interactions modal
  const handleOpenHistory = async (lead: Lead) => {
    setCurrentLeadForHist(lead);
    setInterObs('');
    try {
      setIsHistOpen(true);
      const list = await api.getInteracoes(lead.id);
      setInteractions(list);
    } catch (err) {
      toast.error('Erro ao resgatar histórico de interações.');
    }
  };

  // Create new interaction log
  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLeadForHist) return;
    if (!interObs.trim()) {
      toast.error('Mensagem ou observação é obrigatória.');
      return;
    }

    try {
      setSubmittingInter(true);
      await api.createInteracao({
        lead_id: currentLeadForHist.id,
        vendedor_id: currentLeadForHist.vendedor_id || 'system',
        tipo: interTipo,
        observacao: interObs
      });
      toast.success('Interação registrada!');
      setInterObs('');
      
      // Reload interactions
      const list = await api.getInteracoes(currentLeadForHist.id);
      setInteractions(list);
      loadData(); // also update main list state (e.g. status updates)
    } catch (err) {
      toast.error('Erro ao adicionar interação.');
    } finally {
      setSubmittingInter(false);
    }
  };

  // Delete logged interaction
  const handleDeleteInter = async (id: string) => {
    if (!window.confirm('Excluir esta anotação do histórico?')) return;
    try {
      await api.deleteInteracao(id);
      toast.success('Registro de contato apagado.');
      if (currentLeadForHist) {
        const list = await api.getInteracoes(currentLeadForHist.id);
        setInteractions(list);
      }
    } catch {
      toast.error('Impossível remover interação.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Novo': 'bg-blue-50 text-blue-700 border-blue-200/50',
      '1 a 3 dias': 'bg-orange-50 text-orange-700 border-orange-200/50',
      '4 a 7 dias': 'bg-amber-50 text-amber-700 border-amber-200/50',
      'Última Tentativa': 'bg-rose-50 text-rose-700 border-rose-200/50',
      'Conexão': 'bg-purple-50 text-purple-700 border-purple-200/50',
      'Proposta Enviada': 'bg-cyan-50 text-cyan-700 border-cyan-200/50',
      'Vendido': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
      'Perdido': 'bg-slate-100 text-slate-700 border-slate-200/50',
      'Ação Futura': 'bg-teal-50 text-teal-700 border-teal-200/50'
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="leads-admin-root" className="space-y-6 animate-fadeIn">
      {/* Top action row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        {/* Title details */}
        <div>
          <h3 className="text-lg font-bold text-slate-800">Clientes & Leads</h3>
          <p className="text-xs text-slate-400">Database de contatos e atribuições comerciais da Star Consórcios.</p>
        </div>
        
        {/* Create lead button */}
        <button
          id="btn-add-lead-admin"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm px-4.5 py-2.5 cursor-pointer shadow-md shadow-blue-500/20 transition active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Lead</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            id="admin-search-leads"
            type="text"
            className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-755 placeholder-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 focus:outline-hidden transition"
            placeholder="Buscar por cliente, produto, telefone ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            id="filter-status-select"
            className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 font-medium focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Filtrar por Status (Todos)</option>
            <option value="Novo">Novo</option>
            <option value="1 a 3 dias">1 a 3 dias</option>
            <option value="4 a 7 dias">4 a 7 dias</option>
            <option value="Última Tentativa">Última Tentativa</option>
            <option value="Conexão">Conexão</option>
            <option value="Proposta Enviada">Proposta Enviada</option>
            <option value="Vendido">Vendido</option>
            <option value="Perdido">Perdido</option>
            <option value="Ação Futura">Ação Futura</option>
          </select>
        </div>

        {/* Vendor/Vendedor Filter */}
        <div>
          <select
            id="filter-vendor-select"
            className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 font-medium focus:bg-white focus:border-[#2563EB] focus:outline-hidden transition"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="All">Filtrar por Vendedor (Todos)</option>
            <option value="Unassigned">Sem atribuição (Pendente)</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
              <span className="text-xs text-slate-550 font-semibold">Consultando base de leads...</span>
            </div>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-450 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Cliente</th>
                  <th className="px-6 py-4.5">Cota / Interesse</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Consultor Atribuído</th>
                  <th className="px-6 py-4.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-sans text-slate-700">
                {filteredLeads.map((lead) => {
                  const assignedVendor = vendors.find(v => v.id === lead.vendedor_id);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                      {/* Cliente */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-base">{lead.nome}</div>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {lead.telefone || 'Sem Telefone'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {lead.email || 'Sem E-mail'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Cota Interesse */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 max-w-[220px] truncate" title={lead.produto_interesse}>
                          {lead.produto_interesse}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-bold text-[#2563EB] text-sm">
                          <Coins className="h-3.5 w-3.5 text-blue-400" />
                          <span>{formatCurrency(lead.valor_estimado)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                          Cadastrado em: {new Date(lead.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Vendedor */}
                      <td className="px-6 py-4">
                        {assignedVendor ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-slate-100 text-slate-700 border font-bold text-xs">
                              {assignedVendor.nome.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{assignedVendor.nome}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-500 font-medium">
                            <AlertCircle className="h-3 w-3 text-slate-400" />
                            Aguardando Distribuição
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Histórico button */}
                          <button
                            id={`btn-history-lead-${lead.id}`}
                            onClick={() => handleOpenHistory(lead)}
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                            title="Histórico de Atendimento"
                          >
                            <History className="h-4 w-4" />
                          </button>

                          {/* Editar button */}
                          <button
                            id={`btn-edit-lead-${lead.id}`}
                            onClick={() => handleOpenEdit(lead)}
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Editar Lead"
                          >
                            <Edit className="h-4 w-4 text-amber-500" />
                          </button>

                          {/* Excluir button */}
                          <button
                            id={`btn-delete-lead-${lead.id}`}
                            onClick={() => handleDeleteLead(lead.id)}
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-red-100 bg-red-50/55 hover:bg-red-50 text-red-600 transition cursor-pointer"
                            title="Deletar permanentemente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users className="h-12 w-12 text-slate-200 mb-3" />
            <h5 className="font-bold text-slate-700 text-sm">Nenhum Lead Encontrado</h5>
            <p className="text-xs text-slate-400 max-w-xs text-center mt-1">Nenhum resultado corresponde à sua pesquisa ou filtros ativos.</p>
          </div>
        )}
      </div>

      {/* LEAD CREATION / EDITING MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex h-14 items-center justify-between border-b px-6 bg-slate-50">
              <h4 className="font-bold text-slate-800">
                {editingLead ? `Ficha Técnica: ${formNome}` : 'Adicionar Novo Lead Comercial'}
              </h4>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLead} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do proponente"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/10 focus:outline-hidden transition"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                />
              </div>

              {/* Contatos Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/10 focus:outline-hidden"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    placeholder="email@dominio.com"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/10 focus:outline-hidden"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Produto e Valor */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Cota / Tipo Interesse
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Consórcio Toyota Corolla R$ 130k"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden"
                    value={formProduto}
                    onChange={(e) => setFormProduto(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 130000"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden"
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                  />
                </div>
              </div>

              {/* Status & Vendedor */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Status de Negociação
                  </label>
                  <select
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                  >
                    <option value="Novo">Novo</option>
                    <option value="1 a 3 dias">1 a 3 dias</option>
                    <option value="4 a 7 dias">4 a 7 dias</option>
                    <option value="Última Tentativa">Última Tentativa</option>
                    <option value="Conexão">Conexão</option>
                    <option value="Proposta Enviada">Proposta Enviada</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Perdido">Perdido</option>
                    <option value="Ação Futura">Ação Futura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Consultor Responsável
                  </label>
                  <select
                    className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden"
                    value={formVendedorId}
                    onChange={(e) => setFormVendedorId(e.target.value)}
                  >
                    <option value="">Não atribuído (Disponível)</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Notas de Histórico / Observações
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#2563EB] focus:outline-hidden"
                  placeholder="Instruções para o consultor, perfil financeiro do cliente..."
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {editingLead ? 'Salvar Alterações' : 'Criar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERACTION LOGS SHEET (MODAL / HISTORY OVERFLOW) */}
      {isHistOpen && currentLeadForHist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp">
            
            {/* Header */}
            <div className="flex h-15 items-center justify-between border-b px-6 bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-800">Linha do Tempo de Atendimento</h4>
                <p className="text-xs text-slate-400">Atividades associadas ao lead: <span className="text-slate-600 font-bold">{currentLeadForHist.nome}</span></p>
              </div>
              <button 
                onClick={() => setIsHistOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 text-slate-800">
              
              {/* Form panel to log interaction */}
              <div className="p-6 border-r border-slate-100">
                <h5 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
                  <MessageSquarePlus className="h-4.5 w-4.5 text-[#2563EB]" />
                  <span>Novo Registro de Contato</span>
                </h5>
                
                <form onSubmit={handleAddInteraction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Canal de Contato
                    </label>
                    <select
                      className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
                      value={interTipo}
                      onChange={(e) => setInterTipo(e.target.value as InteracaoTipo)}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Ligação">Ligação Telefônica</option>
                      <option value="E-mail">E-mail Comercial</option>
                      <option value="Reunião">Reunião Própria</option>
                      <option value="Visita">Visita Comercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Anotações / Notas de Reunião
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Fale brevemente sobre o andamento e o que ficou acordado com o proponente..."
                      className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#2563EB] focus:outline-hidden"
                      value={interObs}
                      onChange={(e) => setInterObs(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInter}
                    className="flex w-full items-center justify-center rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 cursor-pointer disabled:opacity-50 transition"
                  >
                    {submittingInter ? 'Registrando...' : 'Adicionar no Histórico'}
                  </button>
                </form>
              </div>

              {/* Timeline feed panel */}
              <div className="p-6 bg-slate-50/50 flex flex-col h-[380px]">
                <h5 className="text-sm font-bold text-slate-700 mb-4">
                  Anotações Anteriores ({interactions.length})
                </h5>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {interactions.length > 0 ? (
                    interactions.map((inter) => (
                      <div key={inter.id} className="relative rounded-xl border border-slate-100 bg-white p-3.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleDeleteInter(inter.id)}
                          className="absolute top-2 right-2 p-1 text-slate-350 hover:text-red-500 rounded-lg hover:bg-slate-50 transition"
                          title="Remover histórico"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-blue-50 text-blue-600 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5">
                            {inter.tipo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(inter.data_interacao).toLocaleDateString('pt-BR')} às {new Date(inter.data_interacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {inter.observacao}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center flex-col text-slate-400">
                      <AlertCircle className="h-7 w-7 text-slate-300" />
                      <span className="text-xs mt-1">Este lead ainda não possui contatos registrados</span>
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
