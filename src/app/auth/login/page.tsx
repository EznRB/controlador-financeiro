'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginSchema, type LoginInput } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Mail, Loader2, Wallet, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { register, handleSubmit, setError: setFieldError, formState: { errors } } = useForm<LoginInput>({ defaultValues: { email: '' } });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [globalError, setGlobalError] = useState('');

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setGlobalError('');
    setMessage('');

    try {
      const parsed = LoginSchema.safeParse(data);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        if (issue) {
          setFieldError('email', { type: 'manual', message: issue.message });
          setGlobalError(issue.message);
        }
        return;
      }
      await signIn(parsed.data.email);
      setMessage('✅ Login realizado. Redirecionando...');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Header com tema toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                FinancePro
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Controle Total</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Login Card Moderno */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Acesse seu controle financeiro inteligente
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  {...register('email')}
                  className="block w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200 shadow-sm focus:shadow-lg"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-2 text-red-700 dark:text-red-400 text-sm font-medium" role="alert">{errors.email.message}</p>
                )}
              </div>
            </div>

            {globalError && (
              <div className="bg-red-50/80 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{globalError}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50/80 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <Sparkles className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
              💡 Enviaremos um link mágico para seu email.
            </p>
          </div>
        </div>

        {/* Footer moderno */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Desenvolvido com 💚 para simplificar suas finanças
          </p>
        </div>
      </div>
    </div>
  );
}
