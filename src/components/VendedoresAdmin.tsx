/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Lead } from '../types';
import { Plus, Edit, Trash2, X, UserCheck, Phone, Mail, ShieldAlert, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function VendedoresAdmin() {
  const [vendors, setVendors] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal active states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<User | null>(null);

  // Form input states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [percentualComissao, setPercentualComissao] = useState('1.5');
  const [senha, setSenha] = useState('vend123'); // default password makes creation straightforward
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const [vendorsList, leadsList] = await Promise.all([
        api.getVendedores(),
        api.getLeads()
      ]);
      setVendors(vendorsList);
      setLeads(leadsList);
    } catch {
      toast.error('Erro ao listar equipe comercial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Open modal for Creating
  const handleOpenCreate = () => {
    setEditingVendor(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setPercentualComissao('1.5');
    setSenha('vend123');
    setIsFormOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (v: User) => {
    setEditingVendor(v);
    setNome(v.nome);
    setEmail(v.email);
    setTelefone(v.telefone || '');
    setCpf(v.cpf || '');
    setPercentualComissao((v.percentual_comissao || 1.5).toString());
    setSenha(''); // Keep blank to not alter unless inputted
    setIsFormOpen(true);
  };

  // Delete vendor
  const handleDeleteVendor = async (vendorId: string) => {
    if (!window.confirm('Tem certeza absoluta que deseja desvincular este vendedor? Suas comissões acumuladas ainda constarão em relatórios, mas seus leads ativos retornarão para "Sem atribuição".')) return;
    try {
      await api.deleteVendedor(vendorId);
      toast.success('Consultor desvinculado e removido do sistema.');
      loadResources();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover consultor.');
    }
  };

  // Submit vendor form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error('Nome e E-mail comercial são obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<User> = {
        nome,
        email,
        telefone,
        cpf,
        percentual_comissao: Number(percentualComissao) || 1.5,
      };

      if (senha.trim()) {
        payload.senha = senha.trim();
      }

      if (editingVendor) {
        await api.updateVendedor(editingVendor.id, payload);
        toast.success(`Dados do vendedor ${nome} salvos!`);
      } else {
        if (!senha.trim()) {
          toast.error('Informe uma senha padrão de entrada.');
          setIsSubmitting(false);
          return;
        }
        await api.createVendedor(payload);
        toast.success(`Novo vendedor cadastrado no sistema comercial!`);
      }

      setIsFormOpen(false);
      loadResources();
    } catch (err: any) {
      toast.error(err.message || 'Houve um imprevisto ao salvar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600 border-r-transparent border-slate-200" />
          <span className="text-xs text-slate-500 font-semibold">Buscando cadastro da equipe comercial...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="vendors-admin-root" className="space-y-6 animate-fadeIn">
      {/* Top Card action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Equipe de Vendedores</h3>
          <p className="text-xs text-slate-400">Gerencie perfis, cotas de liderança e comissionamentos individuais.</p>
        </div>
        <button
          id="btn-add-vendor-admin"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm px-4.5 py-2.5 cursor-pointer shadow-md shadow-blue-500/20 transition active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Vendedor</span>
        </button>
      </div>

      {/* Directory table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {vendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Nome / Identificação</th>
                  <th className="px-6 py-4.5">Contatos</th>
                  <th className="px-6 py-4.5">CPF</th>
                  <th className="px-6 py-4.5">Leads sob Gestão</th>
                  <th className="px-6 py-4.5">Comissão Individual</th>
                  <th className="px-6 py-4.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {vendors.map((v) => {
                  const activeLeadsCount = leads.filter(l => l.vendedor_id === v.id).length;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/30 transition">
                      {/* Name with initials bubble */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-white border-2 border-[#2563EB]/40 font-black text-sm">
                          {v.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">{v.nome}</div>
                          <span className="inline-flex items-center gap-1 rounded bg-blue-50 text-[#2563EB] text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 mt-1 border border-blue-200/30">
                            Consultor Atendimento
                          </span>
                        </div>
                      </td>

                      {/* E-mail & Phone */}
                      <td className="px-6 py-4 text-slate-550 font-medium">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{v.email}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{v.telefone || 'Aguardando Cadastro'}</span>
                        </div>
                      </td>

                      {/* CPF */}
                      <td className="px-6 py-4 text-slate-500 font-semibold font-mono text-xs">
                        {v.cpf || 'Não Informado'}
                      </td>

                      {/* Leads Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800">{activeLeadsCount}</span>
                          <span className="text-xs text-slate-400">leads vinculados</span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(activeLeadsCount * 12, 100)}%` }} 
                          />
                        </div>
                      </td>

                      {/* Comm rate */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2.5 py-1 text-xs font-bold leading-tight">
                          <Award className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{v.percentual_comissao || 1.5}%</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* edit */}
                          <button
                            id={`btn-edit-vendor-${v.id}`}
                            onClick={() => handleOpenEdit(v)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Editar Perfil"
                          >
                            <Edit className="h-4 w-4 text-amber-500" />
                          </button>
                          
                          {/* delete */}
                          <button
                            id={`btn-delete-vendor-${v.id}`}
                            onClick={() => handleDeleteVendor(v.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50/55 hover:bg-red-50 text-red-600 transition cursor-pointer"
                            title="Deletar Vendedor"
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
            <UserCheck className="h-12 w-12 text-slate-200 mb-3" />
            <h5 className="font-bold text-slate-700 text-sm">Sem Vendedores Ativos</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">Nenhum consultor foi incluído na comissão de vendas até o momento.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT VENDOR FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-101 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex h-14 items-center justify-between border-b px-6 bg-slate-50">
              <h4 className="font-bold text-slate-800">
                {editingVendor ? `Configurar Consultor: ${nome}` : 'Adicionar Novo Perfil Comercial'}
              </h4>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome comercial do vendedor"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail Funcional
                </label>
                <input
                  type="email"
                  required
                  placeholder="vendas@starconsorcios.com"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-[#1E3A8A] focus:outline-hidden"
                  value={email}
                  disabled={!!editingVendor} // Email cannot easily change on edit to avoid auth issues unless allowed
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Telefone e CPF Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 90000-0000"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-hidden focus:border-blue-600"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-hidden focus:border-blue-600"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>
              </div>

              {/* Commission Percentage */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Percentual de Comissão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ex: 1.5"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-hidden focus:border-blue-600 font-semibold"
                  value={percentualComissao}
                  onChange={(e) => setPercentualComissao(e.target.value)}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">A comissão padrão recomendada de filiais é de 1.5%.</span>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {editingVendor ? 'Cadastrar Nova Senha (Opcional)' : 'Senha de Acesso Comercial'}
                </label>
                <input
                  type="password"
                  placeholder={editingVendor ? 'Mantenha em branco para não alterar' : 'Mínimo de 6 caracteres'}
                  required={!editingVendor}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:outline-hidden focus:border-blue-600"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              {/* Actions submit */}
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
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  {isSubmitting ? 'Salvando dados...' : (editingVendor ? 'Salvar Configurações' : 'Incluir na Equipe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
