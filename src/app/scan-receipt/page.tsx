'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import Motion from '@/components/Motion'
import { toast } from 'sonner'

export default function ScanReceiptPage() {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleScan = async () => {
    if (!image) return

    try {
      setLoading(true)
      // Por enquanto, apenas simula o processamento
      setTimeout(() => {
        toast.info('Escaneamento de notas está em desenvolvimento!')
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao escanear nota:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Escanear Nota Fiscal"
          subtitle="Funcionalidade em desenvolvimento"
          actions={<GradientButton onClick={() => router.push('/transactions')} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">Voltar</GradientButton>}
        />

        <Motion>
        <ModernCard className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Funcionalidade em Desenvolvimento</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            O escaneamento de notas fiscais estará disponível em breve. Você poderá tirar fotos de suas notas e os dados serão extraídos automaticamente.
          </p>
          
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="inline-block cursor-pointer">
              <GradientButton className="px-6 py-3">Selecionar Imagem da Nota</GradientButton>
            </label>
            {image && (
              <p className="mt-2 text-sm text-gray-600">
                Imagem selecionada: {image.name}
              </p>
            )}
          </div>

          <GradientButton onClick={handleScan} disabled={!image || loading} className="disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processando...' : 'Escanear Nota'}
          </GradientButton>
        </ModernCard>
        </Motion>
      </div>
    </div>
  )
}
