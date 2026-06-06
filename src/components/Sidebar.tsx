/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  UserCheck, 
  BarChart3, 
  Settings, 
  DollarSign, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ user, onLogout, mobileOpen = false, setMobileOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user.role === 'ADMIN';

  const menuItems = isAdmin
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Leads', path: '/admin/leads', icon: Users },
        { name: 'Distribuição', path: '/admin/distribuicao-leads', icon: Send },
        { name: 'Vendedores', path: '/admin/vendedores', icon: UserCheck },
        { name: 'Relatórios', path: '/admin/relatorios', icon: BarChart3 },
        { name: 'Configurações', path: '/admin/configuracoes', icon: Settings },
      ]
    : [
        { name: 'Dashboard', path: '/vendedor/dashboard', icon: LayoutDashboard },
        { name: 'Meus Leads', path: '/vendedor/leads', icon: Users },
        { name: 'Minhas Comissões', path: '/vendedor/comissoes', icon: DollarSign },
      ];

  const handleNav = (path: string) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <aside 
      id="app-sidebar"
      className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1e3a8a]/10 bg-[#1E3A8A] text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header with Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#2563EB]/45 bg-[#172554]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/40">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Star Consórcios</h1>
            <span className="text-[10px] text-blue-200 uppercase font-semibold letter-spacing-wider tracking-widest">CRM Gestão</span>
          </div>
        </div>
        
        {/* Mobile close button */}
        {setMobileOpen && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white hover:bg-blue-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <button
              id={`nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`
                flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/40 font-semibold' 
                  : 'text-blue-100 hover:bg-[#1a365d]/50 hover:text-white'
                }
              `}
            >
              <IconComponent className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-blue-300'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout button */}
      <div className="border-t border-[#2563EB]/30 p-4 bg-[#172554]/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold border-2 border-blue-400">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-white leading-tight">{user.nome}</h4>
            <p className="truncate text-xs text-blue-200">{user.role === 'ADMIN' ? 'Administrador' : 'Consultor Star'}</p>
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={handleLogoutClick}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-200 hover:bg-red-950/40 hover:text-red-100 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-red-400" />
          <span>Fazer Logout</span>
        </button>
      </div>
    </aside>
  );
}
