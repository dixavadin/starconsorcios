/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Lead, Interacao, Venda, Configuracoes, LeadStatus, InteracaoTipo, DatabaseState } from './types';

// Standard Default Database Seeds (same as server.ts)
const DEFAULT_SEED: DatabaseState = {
  users: [
    { id: 'u-1', nome: 'Admin Geral', email: 'admin@star.com', role: 'ADMIN', senha: 'admin123', telefone: '(11) 99999-9999', cpf: '000.000.000-00', percentual_comissao: 1.5 },
    { id: 'u-2', nome: 'Carlos Sales', email: 'carlos@star.com', role: 'VENDEDOR', senha: 'vend123', telefone: '(11) 98888-7777', cpf: '123.456.789-10', percentual_comissao: 1.5 },
    { id: 'u-3', nome: 'Mariana Costa', email: 'mariana@star.com', role: 'VENDEDOR', senha: 'vend123', telefone: '(11) 97777-6666', cpf: '987.654.321-20', percentual_comissao: 2.0 },
    { id: 'u-4', nome: 'Juliana Santos', email: 'juliana@star.com', role: 'VENDEDOR', senha: 'vend123', telefone: '(11) 96666-5555', cpf: '456.789.123-30', percentual_comissao: 1.8 }
  ],
  leads: [
    {
      id: 'l-1',
      nome: 'Marcos Oliveira',
      telefone: '(11) 91111-2222',
      email: 'marcos@email.com',
      produto_interesse: 'Consórcio Imobiliário - R$ 500k',
      valor_estimado: 500000,
      status: 'Vendido',
      vendedor_id: 'u-2',
      notas: 'Lead muito interessado na aquisição de imóvel comercial. Compra efetuada.',
      data_criacao: '2026-05-10T14:30:00Z'
    },
    {
      id: 'l-2',
      nome: 'Renata Abreu',
      telefone: '(11) 92222-3333',
      email: 'renata@email.com',
      produto_interesse: 'Consórcio Veicular - R$ 120k',
      valor_estimado: 120000,
      status: 'Conexão',
      vendedor_id: 'u-3',
      notas: 'Enviada simulação da parcela de R$ 900. Aguardando retorno sobre lance embutido.',
      data_criacao: '2026-05-20T10:15:00Z'
    },
    {
      id: 'l-3',
      nome: 'Davi Lima',
      telefone: '(11) 93333-4444',
      email: 'davi@email.com',
      produto_interesse: 'Consórcio Imobiliário - R$ 350k',
      valor_estimado: 350000,
      status: 'Proposta Enviada',
      vendedor_id: 'u-4',
      notas: 'Proposta de cota enviada pelo WhatsApp. Cliente analisando forma de pagamento.',
      data_criacao: '2026-06-01T16:45:00Z'
    },
    {
      id: 'l-4',
      nome: 'Lucas Souza',
      telefone: '(11) 94444-5555',
      email: 'lucas@email.com',
      produto_interesse: 'Consórcio Caminhões - R$ 250k',
      valor_estimado: 250000,
      status: 'Conexão',
      vendedor_id: 'u-2',
      notas: 'Primeiro contato telefônico efetuado. Interesse para renovação de frota de frete.',
      data_criacao: '2026-06-03T09:00:00Z'
    },
    {
      id: 'l-5',
      nome: 'Clara Mendes',
      telefone: '(11) 95555-6666',
      email: 'clara@email.com',
      produto_interesse: 'Consórcio Veicular - R$ 80k',
      valor_estimado: 80000,
      status: 'Novo',
      vendedor_id: null,
      notas: 'Lead captado via campanha do Instagram de Consórcio de Automóveis.',
      data_criacao: '2026-06-05T18:20:00Z'
    },
    {
      id: 'l-6',
      nome: 'Patricia Rocha',
      telefone: '(11) 96666-7777',
      email: 'patricia@email.com',
      produto_interesse: 'Consórcio Imobiliário - R$ 600k',
      valor_estimado: 600000,
      status: 'Perdido',
      vendedor_id: 'u-3',
      notas: 'Cliente desistiu do investimento pois decidiu financiar diretamente com FGTS.',
      data_criacao: '2026-05-15T11:00:00Z'
    },
    {
      id: 'l-7',
      nome: 'Guilherme Santos',
      telefone: '(11) 97777-8888',
      email: 'guilherme@email.com',
      produto_interesse: 'Consórcio de Motos - R$ 30k',
      valor_estimado: 30000,
      status: 'Novo',
      vendedor_id: null,
      notas: 'Interessado em adquirir cota de R$ 30.000 para compra de moto esportiva.',
      data_criacao: '2026-06-06T11:45:00Z'
    }
  ],
  interacoes: [
    {
      id: 'i-1',
      lead_id: 'l-1',
      vendedor_id: 'u-2',
      tipo: 'Ligação',
      observacao: 'Ligação inicial efetuada. Cliente explicou que deseja carta de R$ 500k com parcela máxima de R$ 2.500.',
      data_interacao: '2026-05-11T10:00:00Z'
    },
    {
      id: 'i-2',
      lead_id: 'l-1',
      vendedor_id: 'u-2',
      tipo: 'WhatsApp',
      observacao: 'Envio de simulações com Administradoras Porto Seguro e Embracon.',
      data_interacao: '2026-05-12T14:30:00Z'
    },
    {
      id: 'i-3',
      lead_id: 'l-1',
      vendedor_id: 'u-2',
      tipo: 'Reunião',
      observacao: 'Reunião presencial no escritório. Cliente assinou o contrato de adesão da cota contemplada.',
      data_interacao: '2026-05-14T16:00:00Z'
    },
    {
      id: 'i-4',
      lead_id: 'l-2',
      vendedor_id: 'u-3',
      tipo: 'WhatsApp',
      observacao: 'Apresentação das tabelas e taxa de administração. Cliente achou a parcela barata comparada ao juro do financiamento.',
      data_interacao: '2026-05-21T11:20:00Z'
    },
    {
      id: 'i-5',
      lead_id: 'l-3',
      vendedor_id: 'u-4',
      tipo: 'E-mail',
      observacao: 'Envio da tabela de lances médios dos últimos 6 meses para comprovar viabilidade de contemplação rápida.',
      data_interacao: '2026-06-02T15:00:00Z'
    }
  ],
  vendas: [
    {
      id: 'v-1',
      lead_id: 'l-1',
      vendedor_id: 'u-2',
      cliente: 'Marcos Oliveira',
      produto: 'Consórcio Imobiliário - R$ 500k',
      valor_venda: 500000,
      percentual_comissao: 1.5,
      valor_comissao: 7500,
      data_venda: '2026-05-14T17:00:00Z',
      status_comissao: 'Pago'
    }
  ],
  configuracoes: {
    empresa: 'Star Consórcios',
    logo: '',
    percentual_padrao: 1.5,
    distribuicao_automatica: false
  }
};

const STORAGE_KEY = 'star_db_store';

// Helper to initialize and get Local DB
function getLocalDB(): DatabaseState {
  const store = localStorage.getItem(STORAGE_KEY);
  if (!store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
    return DEFAULT_SEED;
  }
  try {
    return JSON.parse(store) as DatabaseState;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED));
    return DEFAULT_SEED;
  }
}

function saveLocalDB(db: DatabaseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Indicator flag to bypass API on subsequent calls if backend is down
let localFallbackActive = false;

// Standard API fetcher with automatic switch to local fallback on network error or serverless environment (Vercel static)
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (localFallbackActive) {
    throw new Error('FallbackLocalAtivo');
  }

  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // If Vercel defaults route is hitting HTML on 404 (common on Vercel SPA) or real 404/500
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      if (res.status === 404 || contentType.includes('text/html')) {
        console.warn(`Backend não encontrado em ${path}. Ativando modo local persistente.`);
        localFallbackActive = true;
        throw new Error('FallbackLocalAtivo');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Erro de rede: ${res.status}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    // If the server is offline or fails to fetch (e.g. TypeError: Failed to fetch)
    if (error instanceof Error && error.message !== 'FallbackLocalAtivo') {
      console.warn(`Erro de conexão com o servidor. Alternando para o banco de dados local do navegador.`);
      localFallbackActive = true;
    }
    throw new Error('FallbackLocalAtivo');
  }
}

export const api = {
  // Auth
  async login(email: string, senha: string): Promise<User> {
    try {
      const data = await fetchAPI<{ user: User }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      localStorage.setItem('star_user', JSON.stringify(data.user));
      return data.user;
    } catch {
      // Offline fallback
      const db = getLocalDB();
      const user = db.users.find(u => u.email === email && u.senha === senha);
      if (!user) {
        throw new Error('Credenciais inválidas. Verifique o email e senha no banco local.');
      }
      const { senha: _, ...userSecure } = user;
      localStorage.setItem('star_user', JSON.stringify(userSecure));
      return userSecure;
    }
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
    try {
      return await fetchAPI<User[]>('/api/users');
    } catch {
      const db = getLocalDB();
      return db.users.filter(u => u.role === 'VENDEDOR');
    }
  },

  async createVendedor(data: Partial<User>): Promise<User> {
    try {
      return await fetchAPI<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      if (db.users.find(u => u.email === data.email)) {
        throw new Error('Este e-mail já está sendo utilizado.');
      }
      const newVendor: User = {
        id: `u-${Date.now()}`,
        nome: data.nome || '',
        email: data.email || '',
        role: 'VENDEDOR',
        telefone: data.telefone || '',
        cpf: data.cpf || '',
        percentual_comissao: data.percentual_comissao ? Number(data.percentual_comissao) : db.configuracoes.percentual_padrao,
        senha: data.senha || 'vend123'
      };
      db.users.push(newVendor);
      saveLocalDB(db);
      const { senha: _, ...vendorSecure } = newVendor;
      return vendorSecure;
    }
  },

  async updateVendedor(id: string, data: Partial<User>): Promise<User> {
    try {
      return await fetchAPI<User>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const index = db.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Vendedor não encontrado.');
      
      const updated = { ...db.users[index], ...data };
      if (data.percentual_comissao !== undefined) {
        updated.percentual_comissao = Number(data.percentual_comissao);
      }
      db.users[index] = updated;
      saveLocalDB(db);
      
      const { senha: _, ...vendorSecure } = updated;
      return vendorSecure;
    }
  },

  async deleteVendedor(id: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchAPI<{ success: boolean; message: string }>(`/api/users/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const db = getLocalDB();
      const index = db.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Vendedor não encontrado.');

      db.leads = db.leads.map(lead => {
        if (lead.vendedor_id === id) {
          return { ...lead, vendedor_id: null };
        }
        return lead;
      });

      db.users.splice(index, 1);
      saveLocalDB(db);
      return { success: true, message: 'Vendedor removido com sucesso de forma local.' };
    }
  },

  // Leads
  async getLeads(vendedorId?: string): Promise<Lead[]> {
    try {
      const url = vendedorId ? `/api/leads?vendedor_id=${vendedorId}` : '/api/leads';
      return await fetchAPI<Lead[]>(url);
    } catch {
      const db = getLocalDB();
      if (vendedorId) {
        return db.leads.filter(l => l.vendedor_id === vendedorId);
      }
      return db.leads;
    }
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    try {
      return await fetchAPI<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const newLead: Lead = {
        id: `l-${Date.now()}`,
        nome: data.nome || '',
        telefone: data.telefone || '',
        email: data.email || '',
        produto_interesse: data.produto_interesse || 'Consórcio Geral',
        valor_estimado: data.valor_estimado ? Number(data.valor_estimado) : 0,
        status: data.status || 'Novo',
        vendedor_id: data.vendedor_id || null,
        notas: data.notas || '',
        data_criacao: new Date().toISOString()
      };

      // Automatic round robin if configured
      if (db.configuracoes.distribuicao_automatica && !newLead.vendedor_id) {
        const activeVendors = db.users.filter(u => u.role === 'VENDEDOR');
        if (activeVendors.length > 0) {
          const activeStates: LeadStatus[] = ['Novo', '1 a 3 dias', '4 a 7 dias', 'Última Tentativa', 'Conexão', 'Proposta Enviada', 'Ação Futura'];
          const counts = activeVendors.map(v => {
            const numLeads = db.leads.filter(l => l.vendedor_id === v.id && activeStates.includes(l.status)).length;
            return { id: v.id, nome: v.nome, count: numLeads };
          });
          counts.sort((a, b) => a.count - b.count);
          const assignedId = counts[0].id;
          newLead.vendedor_id = assignedId;

          // Register interaction log
          const interacaoLog: Interacao = {
            id: `i-${Date.now()}-auto`,
            lead_id: newLead.id,
            vendedor_id: assignedId,
            tipo: 'WhatsApp',
            observacao: `Distribuição automática de lead realizada para o vendedor ${counts[0].nome}`,
            data_interacao: new Date().toISOString()
          };
          db.interacoes.push(interacaoLog);
        }
      }

      db.leads.push(newLead);
      saveLocalDB(db);
      return newLead;
    }
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    try {
      return await fetchAPI<Lead>(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const index = db.leads.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lead não encontrado.');

      const previous = db.leads[index];
      const updated: Lead = {
        ...previous,
        nome: data.nome !== undefined ? (data.nome || '') : previous.nome,
        telefone: data.telefone !== undefined ? (data.telefone || '') : previous.telefone,
        email: data.email !== undefined ? (data.email || '') : previous.email,
        produto_interesse: data.produto_interesse !== undefined ? (data.produto_interesse || '') : previous.produto_interesse,
        valor_estimado: data.valor_estimado !== undefined ? Number(data.valor_estimado) : previous.valor_estimado,
        status: data.status !== undefined ? (data.status as LeadStatus) : previous.status,
        vendedor_id: data.vendedor_id !== undefined ? data.vendedor_id : previous.vendedor_id,
        notas: data.notas !== undefined ? (data.notas || '') : previous.notas,
      };

      // Vendor assignment event log
      if (updated.vendedor_id !== previous.vendedor_id && updated.vendedor_id) {
        const ven = db.users.find(u => u.id === updated.vendedor_id);
        const interacaoLog: Interacao = {
          id: `i-${Date.now()}-assign`,
          lead_id: updated.id,
          vendedor_id: updated.vendedor_id,
          tipo: 'E-mail',
          observacao: `Lead atribuído ao vendedor ${ven ? ven.nome : updated.vendedor_id}`,
          data_interacao: new Date().toISOString()
        };
        db.interacoes.push(interacaoLog);
      }

      // If marked as Vendido, generate sale and pending commission
      if (updated.status === 'Vendido' && previous.status !== 'Vendido') {
        const vId = updated.vendedor_id || 'u-2';
        const vendor = db.users.find(u => u.id === vId);
        const commPct = vendor?.percentual_comissao || db.configuracoes.percentual_padrao;
        const valVenda = updated.valor_estimado;
        const valComm = (valVenda * commPct) / 100;

        const alreadyHasSale = db.vendas.find(v => v.lead_id === updated.id);
        if (!alreadyHasSale) {
          const newSale: Venda = {
            id: `v-${Date.now()}`,
            lead_id: updated.id,
            vendedor_id: vId,
            cliente: updated.nome,
            produto: updated.produto_interesse,
            valor_venda: valVenda,
            percentual_comissao: commPct,
            valor_comissao: valComm,
            data_venda: new Date().toISOString(),
            status_comissao: 'Pendente'
          };
          db.vendas.push(newSale);

          const commLog: Interacao = {
            id: `i-${Date.now()}-sale`,
            lead_id: updated.id,
            vendedor_id: vId,
            tipo: 'Reunião',
            observacao: `Venda registrada! Gerada comissão pendente de R$ ${valComm.toFixed(2)} (${commPct}%).`,
            data_interacao: new Date().toISOString()
          };
          db.interacoes.push(commLog);
        }
      }

      db.leads[index] = updated;
      saveLocalDB(db);
      return updated;
    }
  },

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchAPI<{ success: boolean; message: string }>(`/api/leads/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const db = getLocalDB();
      const index = db.leads.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lead não encontrado.');

      // Remove associated assets
      db.interacoes = db.interacoes.filter(i => i.lead_id !== id);
      db.vendas = db.vendas.filter(v => v.lead_id !== id);

      db.leads.splice(index, 1);
      saveLocalDB(db);
      return { success: true, message: 'Lead e seus registros históricos foram removidos de forma local.' };
    }
  },

  async distribuirLead(lead_id: string, vendedor_id: string | null): Promise<{ success: boolean; lead: Lead }> {
    try {
      return await fetchAPI<{ success: boolean; lead: Lead }>('/api/leads/distribuir', {
        method: 'POST',
        body: JSON.stringify({ lead_id, vendedor_id }),
      });
    } catch {
      const db = getLocalDB();
      const index = db.leads.findIndex(l => l.id === lead_id);
      if (index === -1) throw new Error('Lead não encontrado.');

      const prev = db.leads[index];
      const updated: Lead = {
        ...prev,
        vendedor_id
      };

      if (vendedor_id) {
        const ven = db.users.find(u => u.id === vendedor_id);
        const interacaoLog: Interacao = {
          id: `i-${Date.now()}-dist`,
          lead_id: updated.id,
          vendedor_id: vendedor_id,
          tipo: 'E-mail',
          observacao: `Lead redistribuído para o vendedor ${ven ? ven.nome : vendedor_id}`,
          data_interacao: new Date().toISOString()
        };
        db.interacoes.push(interacaoLog);
      }

      db.leads[index] = updated;
      saveLocalDB(db);
      return { success: true, lead: updated };
    }
  },

  // Interações
  async getInteracoes(leadId?: string): Promise<Interacao[]> {
    try {
      const url = leadId ? `/api/interacoes?lead_id=${leadId}` : '/api/interacoes';
      return await fetchAPI<Interacao[]>(url);
    } catch {
      const db = getLocalDB();
      let inters = db.interacoes;
      if (leadId) {
        inters = inters.filter(i => i.lead_id === leadId);
      }
      return [...inters].sort((a, b) => new Date(b.data_interacao).getTime() - new Date(a.data_interacao).getTime());
    }
  },

  async createInteracao(data: { lead_id: string; vendedor_id: string; tipo: InteracaoTipo; observacao: string }): Promise<Interacao> {
    try {
      return await fetchAPI<Interacao>('/api/interacoes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const newInteraction: Interacao = {
        id: `i-${Date.now()}`,
        lead_id: data.lead_id,
        vendedor_id: data.vendedor_id,
        tipo: data.tipo,
        observacao: data.observacao,
        data_interacao: new Date().toISOString()
      };
      db.interacoes.push(newInteraction);

      // Auto update lead from Novo -> Conexão
      const leadIdx = db.leads.findIndex(l => l.id === data.lead_id);
      if (leadIdx !== -1 && db.leads[leadIdx].status === 'Novo') {
        db.leads[leadIdx].status = 'Conexão';
      }

      saveLocalDB(db);
      return newInteraction;
    }
  },

  async deleteInteracao(id: string): Promise<{ success: boolean }> {
    try {
      return await fetchAPI<{ success: boolean }>(`/api/interacoes/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const db = getLocalDB();
      const idx = db.interacoes.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Interação não encontrada.');
      db.interacoes.splice(idx, 1);
      saveLocalDB(db);
      return { success: true };
    }
  },

  // Vendas & Comissões
  async getVendas(vendedorId?: string): Promise<Venda[]> {
    try {
      const url = vendedorId ? `/api/vendas?vendedor_id=${vendedorId}` : '/api/vendas';
      return await fetchAPI<Venda[]>(url);
    } catch {
      const db = getLocalDB();
      if (vendedorId) {
        return db.vendas.filter(v => v.vendedor_id === vendedorId);
      }
      return db.vendas;
    }
  },

  async createVenda(data: Partial<Venda>): Promise<Venda> {
    try {
      return await fetchAPI<Venda>('/api/vendas', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const vId = data.vendedor_id || 'u-2';
      const vendor = db.users.find(u => u.id === vId);
      const commPct = data.percentual_comissao !== undefined ? Number(data.percentual_comissao) : (vendor?.percentual_comissao || db.configuracoes.percentual_padrao);
      const valVenda = Number(data.valor_venda || 0);
      const valComm = (valVenda * commPct) / 100;

      const newSale: Venda = {
        id: `v-${Date.now()}`,
        lead_id: data.lead_id || `l-manual-${Date.now()}`,
        vendedor_id: vId,
        cliente: data.cliente || '',
        produto: data.produto || '',
        valor_venda: valVenda,
        percentual_comissao: commPct,
        valor_comissao: valComm,
        data_venda: new Date().toISOString(),
        status_comissao: data.status_comissao || 'Pendente'
      };

      db.vendas.push(newSale);

      if (data.lead_id) {
        const leadIdx = db.leads.findIndex(l => l.id === data.lead_id);
        if (leadIdx !== -1) {
          db.leads[leadIdx].status = 'Vendido';
        }
      }

      saveLocalDB(db);
      return newSale;
    }
  },

  async updateVendaComissao(vendaId: string, data: { status_comissao?: 'Pendente' | 'Pago'; valor_venda?: number; percentual_comissao?: number }): Promise<Venda> {
    try {
      return await fetchAPI<Venda>(`/api/vendas/${vendaId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const idx = db.vendas.findIndex(v => v.id === vendaId);
      if (idx === -1) throw new Error('Venda não encontrada.');

      const previous = db.vendas[idx];
      const valVenda = data.valor_venda !== undefined ? Number(data.valor_venda) : previous.valor_venda;
      const commPct = data.percentual_comissao !== undefined ? Number(data.percentual_comissao) : previous.percentual_comissao;
      const valComm = (valVenda * commPct) / 100;

      const updated: Venda = {
        ...previous,
        valor_venda: valVenda,
        percentual_comissao: commPct,
        valor_comissao: valComm,
        status_comissao: data.status_comissao !== undefined ? data.status_comissao : previous.status_comissao
      };

      db.vendas[idx] = updated;
      saveLocalDB(db);
      return updated;
    }
  },

  // Configurações
  async getConfiguracoes(): Promise<Configuracoes> {
    try {
      return await fetchAPI<Configuracoes>('/api/configuracoes');
    } catch {
      const db = getLocalDB();
      return db.configuracoes;
    }
  },

  async updateConfiguracoes(data: Partial<Configuracoes>): Promise<Configuracoes> {
    try {
      return await fetchAPI<Configuracoes>('/api/configuracoes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const db = getLocalDB();
      const updated = {
        ...db.configuracoes,
        ...data
      };
      db.configuracoes = updated;
      saveLocalDB(db);
      return updated;
    }
  }
};
