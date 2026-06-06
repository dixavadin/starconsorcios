/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, Venda, Interacao, User } from '../types';
import { 
  Users, 
  CheckCircle, 
  ShoppingBag, 
  Award, 
  MessageSquareCode, 
  RefreshCw,
  Send,
  Calendar,
  Phone,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardVendedorProps {
  user: User;
}

export default function DashboardVendedor({ user }: DashboardVendedorProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      else setRefreshing(true);

      const [loadedLeads, loadedVendas, loadedInteracoes] = await Promise.all([
        api.getLeads(user.id),
        api.getVendas(user.id),
        api.getInteracoes() // get all and filter locally, or we can filter
      ]);

      setLeads(loadedLeads);
      setVendas(loadedVendas);
      // Filter interactions related only to this sellers leads
      const myLeadIds = new Set(loadedLeads.map(l => l.id));
      const myInteractions = loadedInteracoes.filter(i => myLeadIds.has(i.lead_id) || i.vendedor_id === user.id);
      setInteracoes(myInteractions);

    } catch (error) {
      console.error('Error fetching seller dashboard data:', error);
      toast.error('Erro ao buscar dados do dashboard do vendedor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  // Compute Stats
  const totalLeads = leads.length;
  const leadsConvertidos = leads.filter(l => l.status === 'Vendido').length;
  const conversionRate = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 100).toFixed(1) : '0';
  const totalSalesVolume = vendas.reduce((sum, v) => sum + v.valor_venda, 0);
  const totalComissao = vendas.reduce((sum, v) => sum + v.valor_comissao, 0);
  const totalComissaoPendente = vendas.filter(v => v.status_comissao === 'Pendente').reduce((sum, v) => sum + v.valor_comissao, 0);

  // Latest 5 leads ordered by date/ID
  const latestLeads = [...leads]
    .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
    .slice(0, 5);

  // Latest 5 interactions
  const latestInteractions = [...interacoes]
    .sort((a, b) => new Date(b.data_interacao).getTime() - new Date(a.data_interacao).getTime())
    .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const getInteractionIcon = (tipo: string) => {
    const styles: Record<string, string> = {
      'Ligação': 'bg-blue-100 text-blue-600',
      'WhatsApp': 'bg-emerald-100 text-emerald-600',
      'E-mail': 'bg-purple-100 text-purple-600',
      'Reunião': 'bg-amber-100 text-amber-600',
      'Visita': 'bg-red-100 text-red-600'
    };
    return (
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[tipo] || 'bg-slate-100 text-slate-600'}`}>
        <span className="text-xs font-bold">{tipo.charAt(0)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-sm font-semibold text-slate-500">Buscando sua carteira e metas...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="vendedor-dashboard-container" className="space-y-8 animate-fadeIn">
      {/* Target action row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Olá, {user.nome}!</h3>
          <p className="text-sm text-slate-400">Aqui está o balanço da sua carteira comercial individual de clientes.</p>
        </div>
        <button
          id="btn-refresh-seller-dashboard"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Meus Leads */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meus Leads</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{totalLeads}</h4>
            <span className="text-[10px] text-[#2563EB] font-semibold">{leads.filter(l => l.status === 'Novo' || l.status === 'Conexão').length} sem contato recente</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Convertidos */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fechamentos</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{leadsConvertidos}</h4>
            <span className="text-[10px] text-emerald-600 font-bold">Conversão de {conversionRate}%</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Minhas Vendas */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Minhas Vendas</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[150px]" title={formatCurrency(totalSalesVolume)}>
              {formatCurrency(totalSalesVolume)}
            </h4>
            <span className="text-[10px] text-purple-600 font-semibold">{vendas.length} contratos ativos</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Minhas Comissões */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganhos em Comissão</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[150px]" title={formatCurrency(totalComissao)}>
              {formatCurrency(totalComissao)}
            </h4>
            <span className="text-[10px] text-amber-600 font-bold">{formatCurrency(totalComissaoPendente)} pendentes</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Table: Últimos Leads */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col h-[400px]">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">Últimos Leads Atribuídos</h4>
            <p className="text-xs text-slate-400">Contatos de clientes adicionados recentemente para atendimento.</p>
          </div>

          <div className="flex-1 overflow-auto">
            {latestLeads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Interesse</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {latestLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-700">{lead.nome}</div>
                        <div className="text-[11px] text-slate-400">{lead.telefone || lead.email}</div>
                      </td>
                      <td className="py-2.5">
                        <div className="text-slate-600 font-medium truncate max-w-[160px]" title={lead.produto_interesse}>
                          {lead.produto_interesse}
                        </div>
                        <div className="text-xs font-bold text-slate-500">{formatCurrency(lead.valor_estimado)}</div>
                      </td>
                      <td className="py-2.5 text-right">
                        {getStatusBadge(lead.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-slate-400">
                <Users className="h-8 w-8 text-slate-200" />
                <span className="text-xs mt-1">Nenhum lead atribuído para o seu perfil</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Table: Últimas Interações */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col h-[400px]">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800">Últimas Interações com Clientes</h4>
            <p className="text-xs text-slate-400">Histórico detalhado dos seus contatos e andamentos comerciais.</p>
          </div>

          <div className="flex-1 overflow-auto space-y-4 pr-1">
            {latestInteractions.length > 0 ? (
              latestInteractions.map((inter) => {
                const associatedLead = leads.find(l => l.id === inter.lead_id);
                return (
                  <div key={inter.id} className="flex gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition">
                    <div className="shrink-0">
                      {getInteractionIcon(inter.tipo)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {associatedLead ? associatedLead.nome : 'Cliente Star'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(inter.data_interacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2" title={inter.observacao}>
                        {inter.observacao}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-slate-400">
                <MessageSquareCode className="h-8 w-8 text-slate-200" />
                <span className="text-xs mt-1">Sem interações registradas nestes leads</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
