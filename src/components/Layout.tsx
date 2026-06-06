/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Star, Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Principal';
    if (path.includes('/leads') || path.includes('/leads')) {
      return user.role === 'ADMIN' ? 'Gestão Geral de Leads' : 'Meus Clientes & Leads';
    }
    if (path.includes('/distribuicao')) return 'Mecanismo de Distribuição';
    if (path.includes('/vendedores')) return 'Equipe Comercial (Vendedores)';
    if (path.includes('/relatorios')) return 'Central de Inteligência & Relatórios';
    if (path.includes('/configuracoes')) return 'Configurações do CRM';
    if (path.includes('/comissoes')) return 'Extrato de Comissões';
    return 'Star Consórcios';
  };

  const getBreadcrumb = () => {
    const isAdmin = user.role === 'ADMIN';
    const base = isAdmin ? 'Administração' : 'Consultor';
    const sub = getPageTitle();
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span>Star Consórcios</span>
        <span>/</span>
        <span>{base}</span>
        <span>/</span>
        <span className="text-slate-600 font-medium">{sub}</span>
      </div>
    );
  };

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div id="crm-app-root" className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar for Desktop & Mobile Overlay */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Backdrop for mobile sidebar */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <header id="app-header" className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs">
          
          {/* Header Left: Burger menu (mobile) and titles (Desktop) */}
          <div className="flex items-center gap-4">
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              aria-label="Abrir Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden md:block">
              {getBreadcrumb()}
              <h2 className="text-lg font-bold text-slate-800 leading-tight tracking-tight mt-0.5">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Header Right: Info, Date details, active role badges */}
          <div className="flex items-center gap-4">
            {/* Calendar Widget */}
            <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs text-slate-500 font-medium border border-slate-100">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <span className="capitalize">{formattedDate}</span>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold select-none border border-[#2563EB]/15 bg-blue-50/70 text-[#2563EB]">
              {user.role === 'ADMIN' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Nível Administrador</span>
                </>
              ) : (
                <>
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Consultor Autorizado</span>
                </>
              )}
            </div>

            {/* Quick action wrapper */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main id="app-main-content" className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
