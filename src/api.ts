/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Lead, Interacao, Venda, Configuracoes, LeadStatus, InteracaoTipo } from './types';

// Helper for standard API calls
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Erro de rede: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(email: string, senha: string): Promise<User> {
    const data = await fetchAPI<{ user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    localStorage.setItem('star_user', JSON.stringify(data.user));
    return data.user;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('star_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('star_user');
  },

  // Sellers (Vendedores)
  async getVendedores(): Promise<User[]> {
    return fetchAPI<User[]>('/api/users');
  },

  async createVendedor(data: Partial<User>): Promise<User> {
    return fetchAPI<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVendedor(id: string, data: Partial<User>): Promise<User> {
    return fetchAPI<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteVendedor(id: string): Promise<{ success: boolean; message: string }> {
    return fetchAPI<{ success: boolean; message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Leads
  async getLeads(vendedorId?: string): Promise<Lead[]> {
    const url = vendedorId ? `/api/leads?vendedor_id=${vendedorId}` : '/api/leads';
    return fetchAPI<Lead[]>(url);
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    return fetchAPI<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    return fetchAPI<Lead>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    return fetchAPI<{ success: boolean; message: string }>(`/api/leads/${id}`, {
      method: 'DELETE',
    });
  },

  async distribuirLead(lead_id: string, vendedor_id: string | null): Promise<{ success: boolean; lead: Lead }> {
    return fetchAPI<{ success: boolean; lead: Lead }>('/api/leads/distribuir', {
      method: 'POST',
      body: JSON.stringify({ lead_id, vendedor_id }),
    });
  },

  // Interações
  async getInteracoes(leadId?: string): Promise<Interacao[]> {
    const url = leadId ? `/api/interacoes?lead_id=${leadId}` : '/api/interacoes';
    return fetchAPI<Interacao[]>(url);
  },

  async createInteracao(data: { lead_id: string; vendedor_id: string; tipo: InteracaoTipo; observacao: string }): Promise<Interacao> {
    return fetchAPI<Interacao>('/api/interacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteInteracao(id: string): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>(`/api/interacoes/${id}`, {
      method: 'DELETE',
    });
  },

  // Vendas & Comissões
  async getVendas(vendedorId?: string): Promise<Venda[]> {
    const url = vendedorId ? `/api/vendas?vendedor_id=${vendedorId}` : '/api/vendas';
    return fetchAPI<Venda[]>(url);
  },

  async createVenda(data: Partial<Venda>): Promise<Venda> {
    return fetchAPI<Venda>('/api/vendas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateVendaComissao(vendaId: string, data: { status_comissao?: 'Pendente' | 'Pago'; valor_venda?: number; percentual_comissao?: number }): Promise<Venda> {
    return fetchAPI<Venda>(`/api/vendas/${vendaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Configurações
  async getConfiguracoes(): Promise<Configuracoes> {
    return fetchAPI<Configuracoes>('/api/configuracoes');
  },

  async updateConfiguracoes(data: Partial<Configuracoes>): Promise<Configuracoes> {
    return fetchAPI<Configuracoes>('/api/configuracoes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
