/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  telefone?: string;
  cpf?: string;
  percentual_comissao?: number;
  senha?: string; // used securely in simulated auth
}

export type LeadStatus = 'Novo' | '1 a 3 dias' | '4 a 7 dias' | 'Última Tentativa' | 'Conexão' | 'Proposta Enviada' | 'Vendido' | 'Perdido' | 'Ação Futura';

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  produto_interesse: string;
  valor_estimado: number;
  status: LeadStatus;
  vendedor_id: string | null; // null represents unassigned
  notas: string;
  data_criacao: string;
}

export type InteracaoTipo = 'Ligação' | 'WhatsApp' | 'E-mail' | 'Reunião' | 'Visita';

export interface Interacao {
  id: string;
  lead_id: string;
  vendedor_id: string;
  tipo: InteracaoTipo;
  observacao: string;
  data_interacao: string;
}

export interface Venda {
  id: string;
  lead_id: string;
  vendedor_id: string;
  cliente: string;
  produto: string;
  valor_venda: number;
  percentual_comissao: number;
  valor_comissao: number;
  data_venda: string;
  status_comissao: 'Pendente' | 'Pago';
}

export interface Configuracoes {
  empresa: string;
  logo: string;
  percentual_padrao: number;
  distribuicao_automatica: boolean;
}

export interface DatabaseState {
  users: User[];
  leads: Lead[];
  interacoes: Interacao[];
  vendas: Venda[];
  configuracoes: Configuracoes;
}
