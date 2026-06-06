/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// Imports from client business logic API
import { api } from './api';
import { User } from './types';

// Page components imports
import Layout from './components/Layout';
import CadastroPublico from './components/CadastroPublico';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardVendedor from './components/DashboardVendedor';
import LeadsAdmin from './components/LeadsAdmin';
import LeadsVendedor from './components/LeadsVendedor';
import DistribuicaoLeads from './components/DistribuicaoLeads';
import VendedoresAdmin from './components/VendedoresAdmin';
import RelatoriosAdmin from './components/RelatoriosAdmin';
import ConfiguracoesAdmin from './components/ConfiguracoesAdmin';
import ComissoesVendedor from './components/ComissoesVendedor';

function AuthenticatedApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        {/* Admin specific views */}
        {user.role === 'ADMIN' ? (
          <>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/leads" element={<LeadsAdmin />} />
            <Route path="/admin/distribuicao-leads" element={<DistribuicaoLeads />} />
            <Route path="/admin/vendedores" element={<VendedoresAdmin />} />
            <Route path="/admin/relatorios" element={<RelatoriosAdmin />} />
            <Route path="/admin/configuracoes" element={<ConfiguracoesAdmin />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </>
        ) : (
          /* Vendor specific views */
          <>
            <Route path="/vendedor/dashboard" element={<DashboardVendedor user={user} />} />
            <Route path="/vendedor/leads" element={<LeadsVendedor user={user} />} />
            <Route path="/vendedor/comissoes" element={<ComissoesVendedor user={user} />} />
            <Route path="*" element={<Navigate to="/vendedor/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Attempt to recover user state from localStorage
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    toast.info('Sessão encerrada com sucesso.');
  };

  if (initializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-blue-650 border-slate-750" />
          <span className="text-sm font-semibold tracking-wide font-sans">Carregando Star Consórcios...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Dynamic toast engine */}
      <Toaster position="top-right" closeButton richColors theme="light" />
      
      <Routes>
        {/* Public Campaign Leads Registration Form */}
        <Route path="/cadastro" element={<CadastroPublico />} />

        {/* Public Login Route */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={user.role === 'ADMIN' ? "/admin/dashboard" : "/vendedor/dashboard"} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Catch and authorize any other routing requests */}
        <Route 
          path="/*" 
          element={
            user ? (
              <AuthenticatedApp user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
