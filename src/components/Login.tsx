/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { toast } from 'sonner';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect accordingly
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vendedor/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await api.login(email, senha);
      toast.success(`Bem-vindo de volta, ${loggedUser.nome}!`);
      onLoginSuccess(loggedUser);
      
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vendedor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
      toast.error('Erro de login. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div id="login-screen-root" className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-950/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-xl shadow-[#2563EB]/50">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white font-sans">
            Star Consórcios
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium tracking-wide">
            Sistema de Gestão Comercial e CRM de Alto Impacto
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700/60 p-8 rounded-2xl shadow-2xl space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-950/40 border border-red-500/20 p-3.5 text-sm text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Usuário ou E-mail
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl bg-slate-950 border border-slate-700/65 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/30 focus:outline-hidden transition"
                    placeholder="Nome de usuário ou e-mail"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Senha segura
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full rounded-xl bg-slate-950 border border-slate-700/65 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/30 focus:outline-hidden transition"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              id="submit-login"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20 active:translate-y-px"
            >
              {loading ? 'Validando Acesso...' : 'Explorar Star Consórcios'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
