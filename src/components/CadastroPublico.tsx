/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../api';
import { Toaster, toast } from 'sonner';
import { 
  Building, 
  Car, 
  Bike, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';

type ProductInterest = 'Imóvel' | 'Veículo' | 'Moto';

export default function CadastroPublico() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [interesse, setInteresse] = useState<ProductInterest>('Imóvel');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic telephone format/mask: (XX) XXXXX-XXXX
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setTelefone(value);
  };

  // Safe Email Validation regular expression
  const isValidEmail = (emailStr: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!nome.trim()) {
      toast.error('Por favor, informe seu nome completo.');
      return;
    }

    // Checking formatted telefone: requires exactly 15 characters (e.g., (11) 99999-9999)
    const rawTelefone = telefone.replace(/\D/g, '');
    if (rawTelefone.length < 10 || rawTelefone.length > 11) {
      toast.error('Por favor, informe um telefone válido no formato (00) 00000-0000.');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);

    // Estimate parameters based on product interest selection
    let valorEstimado = 80000;

    if (interesse === 'Imóvel') {
      valorEstimado = 300000;
    } else if (interesse === 'Moto') {
      valorEstimado = 25000;
    }

    try {
      // Create new lead with status "Novo" and force_unassigned: true bypassing auto round-robin
      await api.createLead({
        nome: nome.trim(),
        telefone: telefone,
        email: email.trim().toLowerCase(),
        produto_interesse: interesse,
        valor_estimado: valorEstimado,
        status: 'Novo',
        vendedor_id: null, // No assignment
        notas: 'Lead captado diretamente via Formulário de Campanha.',
        force_unassigned: true
      });

      toast.success('Inscrição realizada com sucesso!');
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Infelizmente ocorreu um erro ao registrar seu interesse. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNome('');
    setTelefone('');
    setEmail('');
    setInteresse('Imóvel');
    setIsSuccess(false);
  };

  // Interest options visual definition
  const INTEREST_OPTIONS = [
    { 
      id: 'Imóvel' as ProductInterest, 
      label: 'Imóvel', 
      desc: 'Simule parcelas para casa própria ou salas comerciais.', 
      icon: Building, 
      color: 'border-blue-200 text-blue-600 bg-blue-50/25 active:bg-blue-50' 
    },
    { 
      id: 'Veículo' as ProductInterest, 
      label: 'Veículo', 
      desc: 'Planeje a conquista do seu carro novo ou seminovo.', 
      icon: Car, 
      color: 'border-orange-200 text-orange-600 bg-orange-50/25 active:bg-orange-50' 
    },
    { 
      id: 'Moto' as ProductInterest, 
      label: 'Moto', 
      desc: 'Consórcio facilitado para andar de duas rodas.', 
      icon: Bike, 
      color: 'border-teal-200 text-teal-600 bg-teal-50/25 active:bg-teal-50' 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white">
      <Toaster position="top-right" closeButton richColors theme="light" />
      
      {/* Top Header Branding decoration */}
      <div className="absolute top-0 inset-x-0 h-85 bg-gradient-to-b from-blue-950/40 via-transparent to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full z-10">
        
        {/* Dynamic transition success frame or registration form */}
        {!isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-slate-850 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex gap-1.5 items-center justify-center px-3.5 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simulação Online</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Star Consórcios</h2>
              <p className="text-sm text-slate-400 mt-2 font-medium">
                Inscreva-se abaixo para simular as melhores taxas e as menores parcelas do mercado nacional.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome Completo Field */}
              <div className="space-y-1.5">
                <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-10.5 pr-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-755 rounded-xl text-white font-medium text-sm placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 outline-none"
                  />
                </div>
              </div>

              {/* Telefone Field */}
              <div className="space-y-1.5">
                <label htmlFor="telefone" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="telefone"
                    type="tel"
                    required
                    value={telefone}
                    onChange={handleTelefoneChange}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-10.5 pr-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-755 rounded-xl text-white font-medium text-sm placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-450 font-medium block">Adicione operadora + número (Ex: 11 99999-9999)</span>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full pl-10.5 pr-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-755 rounded-xl text-white font-medium text-sm placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 outline-none"
                  />
                </div>
              </div>

              {/* select visual design card interest list container */}
              <div className="space-y-2.5 pt-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Escolha seu interesse de consórcio <span className="text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {INTEREST_OPTIONS.map((opt) => {
                    const IconComponent = opt.icon;
                    const isSelected = interesse === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInteresse(opt.id)}
                        className={`text-left flex items-start gap-3.5 p-3 sm:p-4 rounded-xl border transition-all duration-200 outline-none ${
                          isSelected 
                            ? 'bg-blue-600/10 border-blue-500/80 ring-1 ring-blue-500/50' 
                            : 'bg-slate-800/60 border-slate-755 hover:border-slate-600 hover:bg-slate-805'
                        }`}
                      >
                        <div className={`p-2.2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/55 text-slate-400'}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-black uppercase tracking-wide ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                            {opt.label}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA action trigger */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Registrando Interesse...</span>
                    </>
                  ) : (
                    <>
                      <span>Simular e Garantir Taxas</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Landing success frame once processed */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-slate-850 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden p-8 text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">Perfeito, {nome.split(' ')[0]}!</h3>
            <p className="text-sm text-slate-400 mt-3 font-medium leading-relaxed">
              Recebemos sua manifestação de interesse para o <span className="text-blue-400 font-bold">{interesse}</span>.
            </p>

            <div className="bg-slate-800/50 border border-slate-750 rounded-2xl p-4.5 text-left my-6 space-y-3">
              <div className="flex gap-3">
                <HeartHandshake className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Criamos seu perfil como lead <span className="font-bold text-slate-100">"Novo"</span> na nossa plataforma. Nossa inteligência fará a análise do seu perfil e o vendedor mais qualificado entrará em contato!
                </p>
              </div>
              <div className="border-t border-slate-750/70 pt-3 flex flex-col gap-1.5 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Opção de Consórcio:</span>
                  <span className="font-black text-slate-200">{interesse}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contato Registrado:</span>
                  <span className="font-mono text-slate-200">{telefone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>E-mail:</span>
                  <span className="text-slate-300 font-medium truncate max-w-[190px]">{email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 font-bold text-sm py-3 px-5 rounded-xl border border-slate-700 transition"
              >
                Simular outro plano
              </button>
            </div>
          </motion.div>
        )}

        {/* Small footer branding signature */}
        <p className="text-center text-xs text-slate-500 font-semibold mt-8 tracking-wide">
          © {new Date().getFullYear()} Star Consórcios S.A. Todos os direitos reservados.
        </p>

      </div>
    </div>
  );
}
