'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Save, TrendingUp, TrendingDown, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import Motion from '@/components/Motion'
import { toast } from 'sonner'
import { TransactionSchema } from '@/lib/validation'

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string; type: 'income' | 'expense' | 'both' }>>([]);
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; date?: string; category?: string }>({})

  useEffect(() => {
    const run = async () => {
      if (status === 'authenticated') {
        await loadCategories();
      }
    }
    run();
  }, [status]);

  useEffect(() => {
    // atualiza lista exibida ao trocar tipo
  }, [type]);

  const loadCategories = async () => {
    // Temporário: categorias fixas (até criarmos API Prisma)
    const data = [
      { id: '1', name: 'Limpeza Pós-Obra', icon: '🧹', type: 'income' },
      { id: '2', name: 'Serviço Extra', icon: '💪', type: 'income' },
      { id: '3', name: 'Alimentação', icon: '🍽️', type: 'expense' },
      { id: '4', name: 'Transporte', icon: '🚗', type: 'expense' },
      { id: '5', name: 'Materiais de Limpeza', icon: '🧼', type: 'expense' },
      { id: '6', name: 'Corte de Cabelo', icon: '✂️', type: 'expense' },
      { id: '7', name: 'Outros Gastos', icon: '📦', type: 'expense' },
    ]
    {
      const mapped = data.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon, type: c.type as 'income' | 'expense' | 'both' }));
      setCategories(mapped);
      if (mapped.length > 0) {
        const first = mapped.find(c => c.type === 'income') || mapped[0];
        setCategory(first.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({})
    const parsed = TransactionSchema.safeParse({
      amount: parseFloat(amount),
      type,
      category,
      description: description || `Transação de ${type === 'income' ? 'entrada' : 'saída'}`,
      transaction_date: date,
      source: 'manual'
    })
    if (!parsed.success) {
      const errs: { amount?: string; date?: string; category?: string } = {}
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0])
        if (path === 'amount') errs.amount = issue.message
        if (path === 'transaction_date') errs.date = issue.message
        if (path === 'category') errs.category = issue.message
      }
      setFieldErrors(errs)
      toast.error(Object.values(errs)[0] || 'Dados inválidos')
      return
    }

    setLoading(true);

    try {
      const res = await fetch('/api/transactions/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      })
      if (!res.ok) throw new Error('Falha ao salvar')

      toast.success('Transação registrada com sucesso!')
      router.push('/transactions');
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast.error('Erro ao salvar transação')
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => (cat.type === type || cat.type === 'both'));

  if (status !== 'authenticated') {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Nova Transação"
          subtitle="Registre uma nova entrada ou saída"
          actions={(
            <Link href="/transactions" className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
        />

        <Motion>
        <ModernCard className="p-6">
          <form onSubmit={handleSubmit}>
          {/* Tipo de Transação */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Saída</span>
              </button>
            </div>
          </div>

          {/* Valor */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={fieldErrors.amount ? 'true' : 'false'}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="0,00"
                required
              />
              {fieldErrors.amount && (
                <p className="mt-2 text-red-700 text-sm" role="alert">{fieldErrors.amount}</p>
              )}
            </div>
          </div>

          {/* Categoria */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            {fieldErrors.category && (
              <p className="mb-2 text-red-700 text-sm" role="alert">{fieldErrors.category}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                    category === cat.name
                      ? type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Tag className={`h-4 w-4 ${
                    category === cat.name
                      ? type === 'income' ? 'text-green-700' : 'text-red-700'
                      : 'text-slate-600'
                  }`} />
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="Descreva a transação..."
            />
          </div>

          {/* Data */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={fieldErrors.date ? 'true' : 'false'}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            />
            {fieldErrors.date && (
              <p className="mt-2 text-red-700 text-sm" role="alert">{fieldErrors.date}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Link href="/transactions" className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors text-center">
              Cancelar
            </Link>
            <GradientButton type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </GradientButton>
          </div>
          </form>
        </ModernCard>
        </Motion>
      </div>
    </div>
  );
}
