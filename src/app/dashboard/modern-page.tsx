'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Wallet, PiggyBank, CreditCard } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { safeFormat } from '@/lib/date';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
}

interface DashboardStats {
  current_balance: number;
  total_income: number;
  total_expense: number;
  last_transactions: Transaction[];
}

// Componente de Card moderno
function ModernCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

// Componente de estatística
function StatCard({ title, value, icon: Icon, trend, color }: {
  title: string;
  value: string;
  icon: any;
  trend?: 'up' | 'down';
  color: 'green' | 'red' | 'blue';
}) {
  const colors = {
    green: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500' },
  };

  return (
    <ModernCard className="p-6 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className={`text-2xl font-bold ${colors[color].text}`}>{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${colors[trend === 'up' ? 'green' : 'red'].text}`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>12% este mês</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color].bg}`}>
          <Icon className={`h-6 w-6 ${colors[color].icon}`} />
        </div>
      </div>
    </ModernCard>
  );
}

// Botão de ação rápida
function QuickActionButton({ onClick, icon: Icon, title, subtitle, color }: {
  onClick: () => void;
  icon: any;
  title: string;
  subtitle: string;
  color: 'green' | 'blue' | 'purple';
}) {
  const colors = {
    green: { from: 'from-green-500', to: 'to-emerald-600', hover: 'hover:from-green-600 hover:to-emerald-700' },
    blue: { from: 'from-blue-500', to: 'to-cyan-600', hover: 'hover:from-blue-600 hover:to-cyan-700' },
    purple: { from: 'from-purple-500', to: 'to-violet-600', hover: 'hover:from-purple-600 hover:to-violet-700' },
  };

  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${colors[color].from} ${colors[color].to} ${colors[color].hover} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-4 group`}
    >
      <div className={`p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-left flex-1">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-sm opacity-90">{subtitle}</div>
      </div>
      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
        <Plus className="h-5 w-5" />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar transações do mês atual
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString())
        .order('transaction_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Calcular estatísticas
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const currentBalance = totalIncome - totalExpense;

      setStats({
        current_balance: currentBalance,
        total_income: totalIncome,
        total_expense: totalExpense,
        last_transactions: transactions || []
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickAddIncome = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          amount: 150.00,
          type: 'income',
          category: 'Limpeza Pós-Obra',
          description: 'Renda do dia - Serviço de limpeza',
          transaction_date: today,
          source: 'manual'
        });

      if (error) throw error;
      
      // Recarregar dados
      fetchDashboardData();
      
      // Notificação de sucesso
      alert('💰 Renda registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar renda:', error);
      alert('❌ Erro ao registrar renda');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Dashboard Financeiro
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {format(new Date(), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Meta do mês</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">R$ 2.000,00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionButton
            onClick={quickAddIncome}
            icon={DollarSign}
            title="Registrar Renda do Dia"
            subtitle="R$ 150,00 - Limpeza pós-obra"
            color="green"
          />
          <QuickActionButton
            onClick={() => window.location.href = '/transactions/new'}
            icon={CreditCard}
            title="Nova Transação"
            subtitle="Adicionar despesa ou renda"
            color="blue"
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Saldo Atual"
            value={`R$ ${(stats?.current_balance ?? 0).toFixed(2)}`}
            icon={Wallet}
            trend={(stats?.current_balance ?? 0) >= 0 ? 'up' : 'down'}
            color={(stats?.current_balance ?? 0) >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Ganhos do Mês"
            value={`R$ ${(stats?.total_income ?? 0).toFixed(2)}`}
            icon={TrendingUp}
            trend="up"
            color="green"
          />
          <StatCard
            title="Despesas do Mês"
            value={`R$ ${(stats?.total_expense ?? 0).toFixed(2)}`}
            icon={TrendingDown}
            trend="down"
            color="red"
          />
        </div>

        {/* Últimas Transações */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Últimas Transações</h2>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Este mês</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats?.last_transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/30 hover:bg-slate-100/50 dark:hover:bg-slate-600/40 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-base">{transaction.description}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {safeFormat(transaction.transaction_date, 'dd MMM', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
            
            {stats?.last_transactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">Nenhuma transação ainda</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  Comece registrando sua primeira renda ou despesa
                </p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
