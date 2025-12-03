'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Filter, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { safeFormat } from '@/lib/date';
import Link from 'next/link';
import { toast } from 'sonner'
import ModernCard from '@/components/ModernCard';
import PageHeader from '@/components/PageHeader';
import Motion from '@/components/Motion'

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [period, setPeriod] = useState<'all' | 'month'>('all');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions();
    }
  }, [filterType, period, status]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const typeParam = filterType === 'all' ? '' : `&type=${filterType}`
      const res = await fetch(`/api/transactions/list?limit=200${typeParam}&period=${period}`)
      const json = await res.json()
      const list: Transaction[] = json.transactions || []
      const unique = Array.from(new Map(list.map(t => [t.id || `${t.type}-${t.amount}-${t.transaction_date}`, t])).values())
      setTransactions(unique)
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const res = await fetch('/api/transactions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Falha ao excluir')
      fetchTransactions();
      toast.success('Transação excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação')
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <ModernCard className="p-6">
            <div className="animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              ))}
            </div>
            </div>
        </ModernCard>
      </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Transações"
          subtitle="Gerencie suas entradas e saídas"
          actions={(
            <Link
              href="/transactions/new"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="h-5 w-5" />
              Nova Transação
            </Link>
          )}
        />

        <ModernCard className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterType === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterType === 'income' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                Entradas
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterType === 'expense' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                Saídas
              </button>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  period === 'all' 
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  period === 'month' 
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Mês atual
              </button>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                <DollarSign className="h-8 w-8 text-slate-500 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {filterType === 'all' 
                  ? 'Comece adicionando sua primeira transação'
                  : `Nenhuma transação do tipo ${filterType === 'income' ? 'entrada' : 'saída'} encontrada`
                }
              </p>
              <Link
                href="/transactions/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-3 rounded-2xl transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Adicionar Transação
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction, i) => (
                <Motion key={transaction.id ?? `${transaction.created_at}-${i}`}>
                <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{transaction.description}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {safeFormat(transaction.transaction_date, 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-xl transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                        title="Excluir transação"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                </Motion>
              ))}
            </div>
          )}
        </ModernCard>
      </div>
    </div>
  );
}
