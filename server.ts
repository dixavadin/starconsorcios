/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DatabaseState, User, Lead, Interacao, Venda, Configuracoes } from './src/types';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'src', 'data', 'db.json');

// Ensure database folder exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// System Seeds
const defaultSeed: DatabaseState = {
  users: [
    {
      id: 'u-1',
      nome: 'Administrador Geral',
      email: 'admin',
      role: 'ADMIN',
      senha: 'admin@123',
      telefone: '(11) 99999-9999',
      cpf: '000.000.000-00',
      percentual_comissao: 1.5
    }
  ],
  leads: [],
  interacoes: [],
  vendas: [],
  configuracoes: {
    "empresa": "Star Consórcios",
    "logo": "",
    "percentual_padrao": 1.5,
    "distribuicao_automatica": false
  }
};

// Database helper
function readDB(): DatabaseState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultSeed, null, 2), 'utf-8');
      return defaultSeed;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseState;
  } catch (error) {
    console.error('Error reading database file, returning in-memory fallback:', error);
    return defaultSeed;
  }
}

function writeDB(state: DatabaseState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database:', error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API ROUTES

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Login
  app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.senha === senha);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o email e senha.' });
    }
    // Don't send passwords back
    const { senha: _, ...userSecure } = user;
    res.json({ user: userSecure });
  });

  // Sellers (Vendedores) - Only Admin should manage, but we expose simple endpoint
  app.get('/api/users', (req, res) => {
    const db = readDB();
    // Filter vendors (role === VENDEDOR)
    const vendors = db.users.filter(u => u.role === 'VENDEDOR');
    res.json(vendors);
  });

  app.post('/api/users', (req, res) => {
    const { nome, email, telefone, cpf, percentual_comissao, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, Email e Senha são obrigatórios.' });
    }
    const db = readDB();
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Este e-mail já está sendo utilizado.' });
    }
    const newVendor: User = {
      id: `u-${Date.now()}`,
      nome,
      email,
      role: 'VENDEDOR',
      telefone,
      cpf,
      percentual_comissao: percentual_comissao ? Number(percentual_comissao) : db.configuracoes.percentual_padrao,
      senha
    };
    db.users.push(newVendor);
    writeDB(db);
    const { senha: _, ...vendorSecure } = newVendor;
    res.status(210).json(vendorSecure); // Using 210/200 for created
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cpf, percentual_comissao, senha } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Vendedor não encontrado.' });
    }
    const updated = { ...db.users[userIndex] };
    if (nome) updated.nome = nome;
    if (email) updated.email = email;
    if (telefone !== undefined) updated.telefone = telefone;
    if (cpf !== undefined) updated.cpf = cpf;
    if (percentual_comissao !== undefined) updated.percentual_comissao = Number(percentual_comissao);
    if (senha) updated.senha = senha;

    db.users[userIndex] = updated;
    writeDB(db);
    const { senha: _, ...vendorSecure } = updated;
    res.json(vendorSecure);
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Vendedor não encontrado.' });
    }
    // Reassign leads to null if they belong to deleted vendor
    db.leads = db.leads.map(lead => {
      if (lead.vendedor_id === id) {
        return { ...lead, vendedor_id: null };
      }
      return lead;
    });
    db.users.splice(userIndex, 1);
    writeDB(db);
    res.json({ success: true, message: 'Vendedor removido com sucesso e seus leads foram desalocados.' });
  });

  // Leads
  app.get('/api/leads', (req, res) => {
    const db = readDB();
    const { vendedor_id } = req.query;
    let leads = db.leads;
    if (vendedor_id) {
      leads = leads.filter(l => l.vendedor_id === vendedor_id);
    }
    res.json(leads);
  });

  // Lead auto distribution round robin helper
  function distributeLeadAutomatically(lead: Lead, db: DatabaseState): string | null {
    const activeVendors = db.users.filter(u => u.role === 'VENDEDOR');
    if (activeVendors.length === 0) return null;
    
    // Sort vendors by the number of active leads (New, 1 a 3 dias, 4 a 7 dias, Última Tentativa, Conexão, Proposta Enviada, Ação Futura)
    const activeStates = ['Novo', '1 a 3 dias', '4 a 7 dias', 'Última Tentativa', 'Conexão', 'Proposta Enviada', 'Ação Futura'];
    const getLeadCount = (vendorId: string) => 
      db.leads.filter(l => l.vendedor_id === vendorId && activeStates.includes(l.status)).length;

    activeVendors.sort((a, b) => getLeadCount(a.id) - getLeadCount(b.id));
    return activeVendors[0].id;
  }

  app.post('/api/leads', (req, res) => {
    const { nome, telefone, email, produto_interesse, valor_estimado, status, vendedor_id, notas, force_unassigned } = req.body;
    if (!nome) {
      return res.status(400).json({ error: 'Nome do cliente é obrigatório.' });
    }
    const db = readDB();
    const newLead: Lead = {
      id: `l-${Date.now()}`,
      nome,
      telefone: telefone || '',
      email: email || '',
      produto_interesse: produto_interesse || 'Consórcio Geral',
      valor_estimado: valor_estimado ? Number(valor_estimado) : 0,
      status: status || 'Novo',
      vendedor_id: vendedor_id || null,
      notas: notas || '',
      data_criacao: new Date().toISOString()
    };

    // If auto distribution is enabled and no vendor is explicitly selected, distribute it
    if (db.configuracoes.distribuicao_automatica && !newLead.vendedor_id && !force_unassigned) {
      const assignedId = distributeLeadAutomatically(newLead, db);
      if (assignedId) {
        newLead.vendedor_id = assignedId;
        // Create an interaction logging the auto-assignment
        const assignedVendor = db.users.find(u => u.id === assignedId);
        const nameText = assignedVendor ? assignedVendor.nome : 'Vendedor';
        const interacaoLog: Interacao = {
          id: `i-${Date.now()}`,
          lead_id: newLead.id,
          vendedor_id: assignedId,
          tipo: 'WhatsApp', // arbitrary channel for log
          observacao: `Distribuição automática de lead realizada para o vendedor ${nameText}`,
          data_interacao: new Date().toISOString()
        };
        db.interacoes.push(interacaoLog);
      }
    }

    db.leads.push(newLead);
    writeDB(db);
    res.json(newLead);
  });

  app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { nome, telefone, email, produto_interesse, valor_estimado, status, vendedor_id, notas } = req.body;
    const db = readDB();
    const leadIndex = db.leads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    const previousLead = db.leads[leadIndex];
    const updatedLead = {
      ...previousLead,
      nome: nome !== undefined ? nome : previousLead.nome,
      telefone: telefone !== undefined ? telefone : previousLead.telefone,
      email: email !== undefined ? email : previousLead.email,
      produto_interesse: produto_interesse !== undefined ? produto_interesse : previousLead.produto_interesse,
      valor_estimado: valor_estimado !== undefined ? Number(valor_estimado) : previousLead.valor_estimado,
      status: status !== undefined ? status : previousLead.status,
      vendedor_id: vendedor_id !== undefined ? (vendedor_id || null) : previousLead.vendedor_id,
      notas: notas !== undefined ? notas : previousLead.notas,
    };

    // If assigned to a new vendor, log interaction
    if (updatedLead.vendedor_id !== previousLead.vendedor_id && updatedLead.vendedor_id) {
      const vendorObj = db.users.find(u => u.id === updatedLead.vendedor_id);
      const interacaoLog: Interacao = {
        id: `i-${Date.now()}-assign`,
        lead_id: updatedLead.id,
        vendedor_id: updatedLead.vendedor_id,
        tipo: 'E-mail',
        observacao: `Lead atribuído ao vendedor ${vendorObj ? vendorObj.nome : updatedLead.vendedor_id}`,
        data_interacao: new Date().toISOString()
      };
      db.interacoes.push(interacaoLog);
    }

    // Checking if lead is newly marked as 'Vendido' - if so, auto-generate a sale!
    if (updatedLead.status === 'Vendido' && previousLead.status !== 'Vendido') {
      const vendorId = updatedLead.vendedor_id || 'u-2'; // Default Carlos if unassigned
      const vendorObj = db.users.find(u => u.id === vendorId);
      const commPct = vendorObj?.percentual_comissao || db.configuracoes.percentual_padrao;
      const valVenda = updatedLead.valor_estimado;
      const valComm = (valVenda * commPct) / 100;

      // Check if sale already exists
      const alreadyHasSale = db.vendas.find(v => v.lead_id === updatedLead.id);
      if (!alreadyHasSale) {
        const newSale: Venda = {
          id: `v-${Date.now()}`,
          lead_id: updatedLead.id,
          vendedor_id: vendorId,
          cliente: updatedLead.nome,
          produto: updatedLead.produto_interesse,
          valor_venda: valVenda,
          percentual_comissao: commPct,
          valor_comissao: valComm,
          data_venda: new Date().toISOString(),
          status_comissao: 'Pendente'
        };
        db.vendas.push(newSale);

        // Also add an interaction logger
        const commLog: Interacao = {
          id: `i-${Date.now()}-sale`,
          lead_id: updatedLead.id,
          vendedor_id: vendorId,
          tipo: 'Reunião',
          observacao: `Venda registrada! Gerada comissão pendente de R$ ${valComm.toFixed(2)} (${commPct}%).`,
          data_interacao: new Date().toISOString()
        };
        db.interacoes.push(commLog);
      }
    }

    db.leads[leadIndex] = updatedLead;
    writeDB(db);
    res.json(updatedLead);
  });

  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const leadIndex = db.leads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }
    // Delete associated interactions
    db.interacoes = db.interacoes.filter(i => i.lead_id !== id);
    // Delete associated sales
    db.vendas = db.vendas.filter(v => v.lead_id !== id);
    
    db.leads.splice(leadIndex, 1);
    writeDB(db);
    res.json({ success: true, message: 'Lead e seus registros históricos foram removidos.' });
  });

  // Interactions
  app.get('/api/interacoes', (req, res) => {
    const db = readDB();
    const { lead_id } = req.query;
    let inters = db.interacoes;
    if (lead_id) {
      inters = inters.filter(i => i.lead_id === lead_id);
    }
    // Sort descending by date
    inters.sort((a, b) => new Date(b.data_interacao).getTime() - new Date(a.data_interacao).getTime());
    res.json(inters);
  });

  app.post('/api/interacoes', (req, res) => {
    const { lead_id, vendedor_id, tipo, observacao } = req.body;
    if (!lead_id || !vendedor_id || !tipo || !observacao) {
      return res.status(400).json({ error: 'lead_id, vendedor_id, tipo e observacao são obrigatórios.' });
    }
    const db = readDB();
    const newInteraction: Interacao = {
      id: `i-${Date.now()}`,
      lead_id,
      vendedor_id,
      tipo,
      observacao,
      data_interacao: new Date().toISOString()
    };
    db.interacoes.push(newInteraction);
    
    // Auto update status based on interaction if applicable (just metadata update)
    const leadIndex = db.leads.findIndex(l => l.id === lead_id);
    if (leadIndex !== -1 && db.leads[leadIndex].status === 'Novo') {
      db.leads[leadIndex].status = 'Conexão';
    }

    writeDB(db);
    res.json(newInteraction);
  });

  app.delete('/api/interacoes/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const interIndex = db.interacoes.findIndex(i => i.id === id);
    if (interIndex === -1) {
      return res.status(404).json({ error: 'Interação não encontrada.' });
    }
    db.interacoes.splice(interIndex, 1);
    writeDB(db);
    res.json({ success: true });
  });

  // Sales (Vendas / Comissões mixed logic)
  app.get('/api/vendas', (req, res) => {
    const db = readDB();
    const { vendedor_id } = req.query;
    let sales = db.vendas;
    if (vendedor_id) {
      sales = sales.filter(s => s.vendedor_id === vendedor_id);
    }
    res.json(sales);
  });

  app.post('/api/vendas', (req, res) => {
    const { lead_id, vendedor_id, cliente, produto, valor_venda, percentual_comissao, status_comissao } = req.body;
    if (!cliente || !produto || !valor_venda) {
      return res.status(400).json({ error: 'Campos cliente, produto e valor_venda são obrigatórios.' });
    }
    const db = readDB();
    const vId = vendedor_id || 'u-2'; // Default Carlos
    const vendorObj = db.users.find(u => u.id === vId);
    const commPct = percentual_comissao !== undefined ? Number(percentual_comissao) : (vendorObj?.percentual_comissao || db.configuracoes.percentual_padrao);
    const valVenda = Number(valor_venda);
    const valComm = (valVenda * commPct) / 100;

    const newSale: Venda = {
      id: `v-${Date.now()}`,
      lead_id: lead_id || `l-manual-${Date.now()}`,
      vendedor_id: vId,
      cliente,
      produto,
      valor_venda: valVenda,
      percentual_comissao: commPct,
      valor_comissao: valComm,
      data_venda: new Date().toISOString(),
      status_comissao: status_comissao || 'Pendente'
    };

    db.vendas.push(newSale);
    
    // If there's an associated lead, keep it Sold!
    if (lead_id) {
      const idx = db.leads.findIndex(l => l.id === lead_id);
      if (idx !== -1) {
        db.leads[idx].status = 'Vendido';
      }
    }

    writeDB(db);
    res.json(newSale);
  });

  app.put('/api/vendas/:id', (req, res) => {
    const { id } = req.params;
    const { status_comissao, valor_venda, percentual_comissao } = req.body;
    const db = readDB();
    const saleIndex = db.vendas.findIndex(v => v.id === id);
    if (saleIndex === -1) {
      return res.status(404).json({ error: 'Venda/Comissão não encontrada.' });
    }

    const previous = db.vendas[saleIndex];
    const valVenda = valor_venda !== undefined ? Number(valor_venda) : previous.valor_venda;
    const commPct = percentual_comissao !== undefined ? Number(percentual_comissao) : previous.percentual_comissao;
    const valComm = (valVenda * commPct) / 100;

    db.vendas[saleIndex] = {
      ...previous,
      valor_venda: valVenda,
      percentual_comissao: commPct,
      valor_comissao: valComm,
      status_comissao: status_comissao !== undefined ? status_comissao : previous.status_comissao
    };

    writeDB(db);
    res.json(db.vendas[saleIndex]);
  });

  // Settings
  app.get('/api/configuracoes', (req, res) => {
    const db = readDB();
    res.json(db.configuracoes);
  });

  app.post('/api/configuracoes', (req, res) => {
    const { empresa, logo, percentual_padrao, distribuicao_automatica } = req.body;
    const db = readDB();
    if (empresa !== undefined) db.configuracoes.empresa = empresa;
    if (logo !== undefined) db.configuracoes.logo = logo;
    if (percentual_padrao !== undefined) db.configuracoes.percentual_padrao = Number(percentual_padrao);
    if (distribuicao_automatica !== undefined) db.configuracoes.distribuicao_automatica = !!distribuicao_automatica;
    
    writeDB(db);
    res.json(db.configuracoes);
  });

  // Lead Distribution manual allocation POST
  app.post('/api/leads/distribuir', (req, res) => {
    const { lead_id, vendedor_id } = req.body;
    if (!lead_id) {
      return res.status(400).json({ error: 'lead_id é obrigatório.' });
    }
    const db = readDB();
    const leadIndex = db.leads.findIndex(l => l.id === lead_id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    const previousVendorId = db.leads[leadIndex].vendedor_id;
    const targetVendor = db.users.find(u => u.id === vendedor_id);

    db.leads[leadIndex].vendedor_id = vendedor_id || null;
    
    // Log interaction
    const vendorName = targetVendor ? targetVendor.nome : 'Nenhum (Desalocado)';
    const interacaoLog: Interacao = {
      id: `i-${Date.now()}-alloc`,
      lead_id,
      vendedor_id: vendedor_id || 'system',
      tipo: 'E-mail',
      observacao: `Lead distribuído manualmente. Atribuído a: ${vendorName}.`,
      data_interacao: new Date().toISOString()
    };
    db.interacoes.push(interacaoLog);

    writeDB(db);
    res.json({ success: true, lead: db.leads[leadIndex] });
  });


  // React and Vite client setup code
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Star Consórcios application server:', error);
});
