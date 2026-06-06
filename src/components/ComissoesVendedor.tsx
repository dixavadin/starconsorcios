/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Venda, User } from '../types';
import { Award, Wallet, DollarSign, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ComissoesVendedorProps {
  user: User;
}

export default function ComissoesVendedor({ user }: ComissoesVendedorProps) {
  const [sales, setSales] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const list = await api.getVendas(user.id);
        setSales(list);
      } catch {
        toast.error('Erro ao ler seu faturamento em comissões.');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [user.id]);

  // Calculations
  const totalGanhos = sales.reduce((sum, s) => sum + s.valor_comissao, 0);
  const totalPagos = sales.filter(s => s.status_comissao === 'Pago').reduce((sum, s) => sum + s.valor_comissao, 0);
  const totalPendentes = sales.filter(s => s.status_comissao === 'Pendente').reduce((sum, s) => sum + s.valor_comissao, 0);
  const totalVendasVolume = sales.reduce((sum, s) => sum + s.valor_venda, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-xs text-slate-500 font-bold">Consolidando comissões de faturados...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="seller-commissions-root" className="space-y-6 animate-fadeIn">
      
      {/* Top Title Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Extrato de Comissões</h3>
          <p className="text-xs text-slate-400">Extrato detalhado sobre vendas e lançamentos de comissão creditados em sua conta.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-[#2563EB]/15 bg-blue-50/70 text-[#2563EB] text-xs font-bold px-3 py-1.5 h-fit">
          <Award className="h-4 w-4" />
          <span>Sua Alíquota Base: {user.percentual_comissao || 1.5}%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Faturado Volume */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume Faturado</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[155px]" title={formatCurrency(totalVendasVolume)}>
              {formatCurrency(totalVendasVolume)}
            </h4>
            <span className="text-[10px] text-slate-500 font-medium">{sales.length} consórcios assinados</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-650 border border-purple-100">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Total de comissões */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comissão Total</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[155px]" title={formatCurrency(totalGanhos)}>
              {formatCurrency(totalGanhos)}
            </h4>
            <span className="text-[10px] text-[#2563EB] font-bold">Ganhos globais acumulados</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-105">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Liberados pagos */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganhos Recebidos</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[155px]" title={formatCurrency(totalPagos)}>
              {formatCurrency(totalPagos)}
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold">Já quitados pela filial</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-605 border border-emerald-100">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Pendentes de faturamento */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganhos a Receber</span>
            <h4 className="text-xl font-bold text-slate-800 mt-1.5 truncate max-w-[155px]" title={formatCurrency(totalPendentes)}>
              {formatCurrency(totalPendentes)}
            </h4>
            <span className="text-[10px] text-amber-600 font-bold">Contas a liquidar</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-609 border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-800">Livro-Razão de Contratos e Vendas</h4>
          <p className="text-xs text-slate-404">Acompanhamento de alíquota e liberação de cada contratação individual.</p>
        </div>

        {sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Data Venda</th>
                  <th className="px-6 py-4">Proponente (Cliente)</th>
                  <th className="px-6 py-4">Produto / Cota</th>
                  <th className="px-6 py-4 text-right">Valor Venda</th>
                  <th className="px-6 py-4 text-center">Taxa (%)</th>
                  <th className="px-6 py-4 text-right">Comissão Líquida</th>
                  <th className="px-6 py-4 text-center">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/40 transition">
                    {/* Date */}
                    <td className="px-6 py-3.5 text-slate-450 font-mono text-xs">
                      {new Date(sale.data_venda).toLocaleDateString('pt-BR')}
                    </td>
                    
                    {/* Customer */}
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {sale.cliente}
                    </td>

                    {/* Product */}
                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {sale.produto}
                    </td>

                    {/* Value */}
                    <td className="px-6 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(sale.valor_venda)}
                    </td>

                    {/* Percentage */}
                    <td className="px-6 py-3.5 text-center font-bold text-slate-500">
                      {sale.percentual_comissao}%
                    </td>

                    {/* Commission */}
                    <td className="px-6 py-3.5 text-right font-extrabold text-emerald-600">
                      {formatCurrency(sale.valor_comissao)}
                    </td>

                    {/* Payment Status badge */}
                    <td className="px-6 py-3.5 text-center">
                      <span className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider
                        ${sale.status_comissao === 'Pago' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                          : 'bg-amber-50 text-amber-700 border-amber-250'
                        }
                      `}>
                        {sale.status_comissao === 'Pago' ? 'Creditado (Pago)' : 'Aguardando (Pendente)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-205 mb-2.5" />
            <h5 className="font-bold text-slate-700 text-sm">Histórico de faturamento vazio</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">As comissões serão geradas automaticamente assim que consolidar contratos marcados como "Vendido".</p>
          </div>
        )}
      </div>

    </div>
  );
}
