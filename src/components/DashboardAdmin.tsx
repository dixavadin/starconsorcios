/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, Venda, User } from '../types';
import { 
  Users, 
  CheckCircle, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  UsersRound,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { toast } from 'sonner';

export default function DashboardAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      else setRefreshing(true);

      const [loadedLeads, loadedVendas, loadedVendors] = await Promise.all([
        api.getLeads(),
        api.getVendas(),
        api.getVendedores()
      ]);

      setLeads(loadedLeads);
      setVendas(loadedVendas);
      setVendors(loadedVendors);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Erro ao recarregar dados do dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalLeads = leads.length;
  const leadsConvertidos = leads.filter(l => l.status === 'Vendido').length;
  const conversionRate = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 100).toFixed(1) : '0';
  const totalSalesCount = vendas.length;
  const totalFaturamento = vendas.reduce((sum, v) => sum + v.valor_venda, 0);
  const totalComissao = vendas.reduce((sum, v) => sum + v.valor_comissao, 0);

  // Status breakdown for Pie Chart
  const statusCounts = {
    'Novo': 0,
    '1 a 3 dias': 0,
    '4 a 7 dias': 0,
    'Última Tentativa': 0,
    'Conexão': 0,
    'Proposta Enviada': 0,
    'Vendido': 0,
    'Perdido': 0,
    'Ação Futura': 0
  };

  leads.forEach(l => {
    const s = l.status;
    if (s in statusCounts) {
      statusCounts[s as keyof typeof statusCounts]++;
    }
  });

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  })).filter(item => item.value > 0);

  // Colors aligned with status
  const STATUS_COLORS: Record<string, string> = {
    'Novo': '#3B82F6', // Blue
    '1 a 3 dias': '#F97316', // Orange
    '4 a 7 dias': '#F59E0B', // Amber
    'Última Tentativa': '#F43F5E', // Rose
    'Conexão': '#8B5CF6', // Purple
    'Proposta Enviada': '#06B6D4', // Cyan
    'Vendido': '#10B981', // Emerald Green
    'Perdido': '#64748B', // Slate
    'Ação Futura': '#14B8A6'  // Teal
  };

  // Sales per seller for Bar Chart
  const sellerSalesData = vendors.map(vendor => {
    const vendorSales = vendas.filter(v => v.vendedor_id === vendor.id);
    const totalSold = vendorSales.reduce((sum, s) => sum + s.valor_venda, 0);
    return {
      name: vendor.nome.split(' ')[0], // only first name for layout clean look
      'Quantidade Vendas': vendorSales.length,
      'Valor Vendido (R$)': totalSold,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-sm font-semibold text-slate-500">Computando Relatórios e KPIs...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-container" className="space-y-8 animate-fadeIn">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Visão Geral da Organização</h3>
          <p className="text-sm text-slate-400">Consolidado comercial de todos os consultores Star.</p>
        </div>
        <button
          id="btn-refresh-dashboard"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
        </button>
      </div>

      {/* Analytics KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Leads */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Leads</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{totalLeads}</h4>
            <span className="text-[10px] text-slate-500 font-medium">Bases cadastradas</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Lead Conversion */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversão</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{conversionRate}%</h4>
            <span className="text-[10px] text-emerald-600 font-bold">{leadsConvertidos} leads fechados</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Total Sales count */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Vendas</span>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{totalSalesCount}</h4>
            <span className="text-[10px] text-slate-500 font-medium">Contratos assinados</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Faturamento (Revenue) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faturamento</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[140px]" title={formatCurrency(totalFaturamento)}>
              {formatCurrency(totalFaturamento)}
            </h4>
            <span className="text-[10px] text-blue-600 font-bold">Volume em cotas</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Commissions Distributed */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between lg:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comissão Total</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[140px]" title={formatCurrency(totalComissao)}>
              {formatCurrency(totalComissao)}
            </h4>
            <span className="text-[10px] text-slate-500 font-medium">Custo com equipe</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Leads by Status (Pie Chart) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Leads por Status</h4>
            <p className="text-xs text-slate-400 mb-4">Destinação atual de todos os leads captados.</p>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#CBD5E1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} leads`, 'Quantidade']}
                    contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <AlertCircle className="h-8 w-8 text-slate-300" />
                <span className="text-xs font-medium mt-1">Sem dados de status</span>
              </div>
            )}
          </div>

          {/* Status color legend inside side */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-4 border-t border-slate-100 text-xs">
            {Object.keys(statusCounts).map(status => {
              const count = statusCounts[status as keyof typeof statusCounts];
              return (
                <div key={status} className="flex items-center gap-1.5 shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                  <span className="text-slate-600 truncate max-w-[120px]">{status} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sales per Consultant (Bar Chart) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Desempenho Comercial por Consultor</h4>
            <p className="text-xs text-slate-400 mb-4">Volume total faturado (R$) por vendedor ativo.</p>
          </div>

          <div className="h-64 mt-4">
            {vendas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerSalesData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'Valor Vendido (R$)' ? formatCurrency(Number(value)) : `${value} vendas`,
                      name
                    ]}
                    contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Valor Vendido (R$)" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-slate-400">
                <AlertCircle className="h-8 w-8 text-slate-300" />
                <span className="text-xs font-medium mt-1">Nenhuma venda registrada na base de dados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recet Activity or Summary */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800">Principais Indicadores Operacionais</h4>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-150 p-4.5 bg-slate-50/50">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendedor Estrela</h5>
            {vendors.length > 0 && salesCountByVendor(vendas, vendors) ? (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold text-sm">
                  ★
                </div>
                <div>
                  <h6 className="text-sm font-bold text-slate-700">{salesCountByVendor(vendas, vendors)?.name}</h6>
                  <p className="text-[11px] text-indigo-600 font-semibold">
                    {formatCurrency(salesCountByVendor(vendas, vendors)?.total || 0)} faturados
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">Sem vendas para calcular</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-150 p-4.5 bg-slate-50/50">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio de Venda</h5>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-sm font-bold">
                $
              </div>
              <div>
                <h6 className="text-sm font-bold text-slate-700">
                  {totalSalesCount > 0 ? formatCurrency(totalFaturamento / totalSalesCount) : 'R$ 0,00'}
                </h6>
                <p className="text-[11px] text-slate-500 font-medium">Por cota vendida</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-150 p-4.5 bg-slate-50/50">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Índice Geral de Atendimento</h5>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold">
                🖵
              </div>
              <div>
                <h6 className="text-sm font-bold text-slate-700">
                  {leads.filter(l => l.status !== 'Novo' && l.status !== 'Perdido').length} leads ativos
                </h6>
                <p className="text-[11px] text-slate-500 font-medium">Sendo trabalhados pela equipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to calculate best seller
function salesCountByVendor(vendas: Venda[], vendors: User[]) {
  if (vendas.length === 0 || vendors.length === 0) return null;
  const map: Record<string, number> = {};
  vendas.forEach(v => {
    map[v.vendedor_id] = (map[v.vendedor_id] || 0) + v.valor_venda;
  });
  
  let bestVendorId = '';
  let maxSales = -1;
  Object.entries(map).forEach(([vId, val]) => {
    if (val > maxSales) {
      maxSales = val;
      bestVendorId = vId;
    }
  });

  const vendor = vendors.find(u => u.id === bestVendorId);
  if (!vendor) return null;
  return {
    name: vendor.nome,
    total: maxSales
  };
}
