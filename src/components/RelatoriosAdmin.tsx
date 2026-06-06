/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Lead, Venda, User, LeadStatus } from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Users, 
  ShoppingBag, 
  Percent, 
  Search, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

type ActiveTab = 'leads' | 'vendas' | 'comissoes';

export default function RelatoriosAdmin() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [periodo, setPeriodo] = useState('all'); // '7days', 'thismonth', 'thisyear', 'all'
  const [statusFiltro, setStatusFiltro] = useState('All');
  const [vendedorFiltro, setVendedorFiltro] = useState('All');
  const [comissaoStatusFiltro, setComissaoStatusFiltro] = useState('All'); // 'Pendente', 'Pago', 'All'

  const loadResources = async () => {
    try {
      setLoading(true);
      const [leadsList, vendasList, vendorsList] = await Promise.all([
        api.getLeads(),
        api.getVendas(),
        api.getVendedores()
      ]);
      setLeads(leadsList);
      setVendas(vendasList);
      setVendors(vendorsList);
    } catch {
      toast.error('Erro ao recolher dados da central de relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Filter Data helper
  const filterByDate = (dateStr: string) => {
    if (periodo === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    
    if (periodo === '7days') {
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (periodo === 'thismonth') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (periodo === 'thisyear') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Get filtered elements
  const getFilteredLeads = () => {
    return leads.filter(l => {
      const matchesDate = filterByDate(l.data_criacao);
      const matchesStatus = statusFiltro === 'All' || l.status === statusFiltro;
      let matchesVendor = true;
      if (vendedorFiltro !== 'All') {
        if (vendedorFiltro === 'Unassigned') {
          matchesVendor = l.vendedor_id === null || l.vendedor_id === '';
        } else {
          matchesVendor = l.vendedor_id === vendedorFiltro;
        }
      }
      return matchesDate && matchesStatus && matchesVendor;
    });
  };

  const getFilteredVendas = () => {
    return vendas.filter(v => {
      const matchesDate = filterByDate(v.data_venda);
      const matchesVendor = vendedorFiltro === 'All' || v.vendedor_id === vendedorFiltro;
      return matchesDate && matchesVendor;
    });
  };

  const getFilteredComissoes = () => {
    return vendas.filter(v => {
      const matchesVendor = vendedorFiltro === 'All' || v.vendedor_id === vendedorFiltro;
      const matchesStatus = comissaoStatusFiltro === 'All' || v.status_comissao === comissaoStatusFiltro;
      return matchesStatus && matchesVendor;
    });
  };

  // Core Real CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let fileName = "relatorio";
    
    if (activeTab === 'leads') {
      const data = getFilteredLeads();
      csvContent += "ID,Cliente,Telefone,Email,Produto Interesse,Valor Estimado (R$),Status,ID Vendedor,Criado Em\n";
      data.forEach(item => {
        csvContent += `"${item.id}","${item.nome}","${item.telefone}","${item.email}","${item.produto_interesse}",${item.valor_estimado},"${item.status}","${item.vendedor_id || 'Nenhum'}","${item.data_criacao}"\n`;
      });
      fileName = "StarConsorcios_Relatorio_Leads.csv";
    } else if (activeTab === 'vendas') {
      const data = getFilteredVendas();
      csvContent += "ID Venda,Cliente,ID Vendedor,Produto Vendido,Valor Cota (R$),Comissao (R$),Percentual (%),Status Comissao,Data Venda\n";
      data.forEach(item => {
        csvContent += `"${item.id}","${item.cliente}","${item.vendedor_id}","${item.produto}",${item.valor_venda},${item.valor_comissao},${item.percentual_comissao},"${item.status_comissao}","${item.data_venda}"\n`;
      });
      fileName = "StarConsorcios_Relatorio_Vendas.csv";
    } else if (activeTab === 'comissoes') {
      const data = getFilteredComissoes();
      csvContent += "ID Venda,Vendedor,Cliente,Produto,Valor Cota (R$),Percentual (%),Valor Comissão (R$),Status\n";
      data.forEach(item => {
        const vObj = vendors.find(vend => vend.id === item.vendedor_id);
        csvContent += `"${item.id}","${vObj ? vObj.nome : item.vendedor_id}","${item.cliente}","${item.produto}",${item.valor_venda},${item.percentual_comissao},${item.valor_comissao},"${item.status_comissao}"\n`;
      });
      fileName = "StarConsorcios_Relatorio_Comissoes.csv";
    }

    const encodeUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodeUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Documento CSV (Excel) gerado e baixado.');
  };

  // Browser Print Preview trigger optimized for clean CSS print values
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-xs text-slate-500 font-bold">Compilando estatísticas históricas...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="reports-admin-root" className="space-y-6 animate-fadeIn print:m-0 print:p-0">
      
      {/* Tab Select Bar (Hides on standard print) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs print:hidden">
        
        {/* Tab Buttons */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('leads'); setVendedorFiltro('All'); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'leads' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Relatório de Leads
          </button>
          <button
            onClick={() => { setActiveTab('vendas'); setVendedorFiltro('All'); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'vendas' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Relatório de Vendas
          </button>
          <button
            onClick={() => { setActiveTab('comissoes'); setVendedorFiltro('All'); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'comissoes' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Relatório de Comissões
          </button>
        </div>

        {/* Action Export Button deck */}
        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-3.5 py-2 cursor-pointer transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (CSV)</span>
          </button>

          <button
            id="btn-print-pdf"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2 cursor-pointer transition"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir (PDF)</span>
          </button>
        </div>
      </div>

      {/* FILTERS COLUMN BOX (Hides on standard print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 print:hidden">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#2563EB]" />
          <span>Filtros do Relatório Ativo</span>
        </h4>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          
          {/* Period Selection (Relevant for Leads + Vendas) */}
          {activeTab !== 'comissoes' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Período de Extração
              </label>
              <select
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="all">Sempre (Todo o período)</option>
                <option value="7days">Últimos 7 Dias</option>
                <option value="thismonth">Este mês corrente</option>
                <option value="thisyear">Este ano fiscal</option>
              </select>
            </div>
          )}

          {/* Status Selection (Specific to Leads) */}
          {activeTab === 'leads' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Status de Atendimento
              </label>
              <select
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="All">Todos os Status</option>
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
          )}

          {/* Vendedor Selection (Relevant everywhere) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Consultor Comercial
            </label>
            <select
              className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
              value={vendedorFiltro}
              onChange={(e) => setVendedorFiltro(e.target.value)}
            >
              <option value="All">{activeTab === 'comissoes' ? 'Vendedor (Todos)' : 'Vendedor (Todos)'}</option>
              {activeTab === 'leads' && <option value="Unassigned">Sem vendedor (Pendentes)</option>}
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>

          {/* Status de Comissão (Specific to Commissions) */}
          {activeTab === 'comissoes' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Status de Faturamento da Comissão
              </label>
              <select
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
                value={comissaoStatusFiltro}
                onChange={(e) => setComissaoStatusFiltro(e.target.value)}
              >
                <option value="All">Todos os Status</option>
                <option value="Pendente">Apenas Pendentes</option>
                <option value="Pago">Apenas Pagos</option>
              </select>
            </div>
          )}

        </div>
      </div>

      {/* DISPLAY PREVIEW AREA */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Report official header (Shows clean on print) */}
        <div className="flex items-center justify-between border-b pb-4.5">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {activeTab === 'leads' && 'Relatório Analítico de Captação (Leads)'}
              {activeTab === 'vendas' && 'Relatório de Performance Comercial (Vendas)'}
              {activeTab === 'comissoes' && 'Relatório de Comissões e Produtividade'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Star Consórcios • Documentação Comercial Oficial • Extraído em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs bg-blue-50 text-[#1E3A8A] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded border border-blue-105">
              Filtro Ativo: {periodo === 'all' ? 'Sempre' : periodo === 'thismonth' ? 'Este Mês' : periodo === '7days' ? 'Últimos 7 dias' : 'Este Ano'}
            </span>
          </div>
        </div>

        {/* 1. LEADS TAB PREVIEW */}
        {activeTab === 'leads' && (() => {
          const list = getFilteredLeads();
          const totalEstimado = list.reduce((sum, item) => sum + item.valor_estimado, 0);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Leads Filtrados</span>
                  <div className="text-lg font-bold text-slate-800">{list.length}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Previsão Fechamento</span>
                  <div className="text-lg font-bold text-blue-850">{formatCurrency(totalEstimado)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Atendimento Ativo</span>
                  <div className="text-lg font-bold text-purple-700">{list.filter(item => item.status !== 'Novo' && item.status !== 'Perdido').length}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Convertido (%)</span>
                  <div className="text-lg font-bold text-emerald-600">
                    {list.length > 0 ? ((list.filter(l => l.status === 'Vendido').length / list.length) * 100).toFixed(1) : '0'}%
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Cota/Interesse</th>
                      <th className="p-3">Data Captação</th>
                      <th className="p-3">Responsável</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? list.map(item => {
                      const v = vendors.find(vend => vend.id === item.vendedor_id);
                      return (
                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">{item.nome} <br/><span className="text-[10px] font-medium text-slate-400">{item.telefone || item.email}</span></td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700 block">{item.produto_interesse}</span>
                            <span className="text-[#2563EB] font-bold">{formatCurrency(item.valor_estimado)}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono">{new Date(item.data_criacao).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3 font-medium text-slate-600">{v ? v.nome : 'Sem Atribuição'}</td>
                          <td className="p-3"><span className="font-semibold text-blue-700">{item.status}</span></td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">Nenhum resultado nos filtros estritos de Lead.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* 2. VENDAS TAB PREVIEW */}
        {activeTab === 'vendas' && (() => {
          const list = getFilteredVendas();
          const totalVal = list.reduce((sum, v) => sum + v.valor_venda, 0);
          const totalComPct = list.length > 0 ? (list.reduce((sum, v) => sum + v.percentual_comissao, 0) / list.length).toFixed(1) : '1.5';
          const totalComVal = list.reduce((sum, v) => sum + v.valor_comissao, 0);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Vendas</span>
                  <div className="text-lg font-bold text-slate-800">{list.length}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Valor Faturado</span>
                  <div className="text-lg font-bold text-[#2563EB]">{formatCurrency(totalVal)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Comissões Emitidas</span>
                  <div className="text-lg font-bold text-emerald-605">{formatCurrency(totalComVal)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Média Comissão</span>
                  <div className="text-lg font-bold text-amber-600">{totalComPct}%</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Data</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Consultor Vendedor</th>
                      <th className="p-3">Cota Adquirida</th>
                      <th className="p-3 text-right">Valor Venda</th>
                      <th className="p-3 text-right">Comissão ({totalComPct}%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? list.map(item => {
                      const v = vendors.find(vend => vend.id === item.vendedor_id);
                      return (
                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-500">{new Date(item.data_venda).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3 font-semibold text-slate-705">{item.cliente}</td>
                          <td className="p-3 font-medium text-slate-600">{v ? v.nome : 'Sem Atribuição'}</td>
                          <td className="p-3 font-medium">{item.produto}</td>
                          <td className="p-3 text-right font-semibold text-slate-700">{formatCurrency(item.valor_venda)}</td>
                          <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(item.valor_comissao)}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-450">Nenhuma venda faturada no período selecionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* 3. COMISSÕES TAB PREVIEW */}
        {activeTab === 'comissoes' && (() => {
          const list = getFilteredComissoes();
          const totalComissoes = list.reduce((sum, v) => sum + v.valor_comissao, 0);
          const pagas = list.filter(v => v.status_comissao === 'Pago').reduce((sum, v) => sum + v.valor_comissao, 0);
          const pendentes = list.filter(v => v.status_comissao === 'Pendente').reduce((sum, v) => sum + v.valor_comissao, 0);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 print:grid-cols-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-105 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Faturamento Geral de Comissão</span>
                  <div className="text-xl font-bold text-slate-800">{formatCurrency(totalComissoes)}</div>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Comissões Quitadas (Pagas)</span>
                  <div className="text-xl font-bold text-emerald-700">{formatCurrency(pagas)}</div>
                </div>
                <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block mb-1">Gargalo / Comissões Pendentes</span>
                  <div className="text-xl font-bold text-amber-700">{formatCurrency(pendentes)}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Consultor Vendedor</th>
                      <th className="p-3">Cliente Assinado</th>
                      <th className="p-3">Cota Vendida</th>
                      <th className="p-3 text-right">Valor Venda</th>
                      <th className="p-3 text-center">Percentual (%)</th>
                      <th className="p-3 text-right">Comissão</th>
                      <th className="p-3 text-center">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length > 0 ? list.map(item => {
                      const v = vendors.find(vend => vend.id === item.vendedor_id);
                      return (
                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-700">{v ? v.nome : 'Sem Atribuição'}</td>
                          <td className="p-3 font-medium text-slate-650">{item.cliente}</td>
                          <td className="p-3 text-slate-550">{item.produto}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(item.valor_venda)}</td>
                          <td className="p-3 text-center text-slate-500 font-bold">{item.percentual_comissao}%</td>
                          <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(item.valor_comissao)}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block rounded px-2 py-0.5 text-[9px] uppercase font-bold ${item.status_comissao === 'Pago' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                              {item.status_comissao}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">Nenhum registro de comissão responde aos filtros vigentes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
