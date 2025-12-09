'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ModernCard from '@/components/ModernCard'
import PageHeader from '@/components/PageHeader'
import GradientButton from '@/components/GradientButton'
import { processCSVContent, CSVTransaction } from '@/lib/csv-import'
export default function ImportCSVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVTransaction[]>([])
  const [previewErrors, setPreviewErrors] = useState<string[]>([])
  const [previewTotalRows, setPreviewTotalRows] = useState(0)
  const [previewImportedRows, setPreviewImportedRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setSuccess(null)

    try {
      const text = await selectedFile.text()
      const result = processCSVContent(text)

      setPreviewTotalRows(result.totalRows)
      setPreviewImportedRows(result.importedRows)
      setPreviewErrors(result.errors)
      if (result.transactions.length > 0) {
        setPreview(result.transactions.slice(0, 10))
      } else {
        setError(result.errors.join('\n') || 'Nenhuma transação válida encontrada')
        setPreview([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
      setPreview([])
      setPreviewErrors([])
      setPreviewTotalRows(0)
      setPreviewImportedRows(0)
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const text = await file.text()
      
      // Envia para a API route para processamento seguro
      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvContent: text })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar transações')
      }

      setImportedCount(data.importedCount)
      setSuccess(`Sucesso! ${data.importedCount} transações importadas.`)
      router.push('/dashboard?type=expense&period=month&categories=Comida,Investimentos,Lazer')
      if (Array.isArray(data.errors)) {
        setPreviewErrors(data.errors)
      }
      
      // Limpa o formulário após 2 segundos
      setTimeout(() => {
        setFile(null)
        setPreview([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setPreviewErrors([])
        setPreviewTotalRows(0)
        setPreviewImportedRows(0)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar transações')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="Importar Extrato Bancário"
          subtitle="Faça upload do CSV do seu banco"
          actions={<GradientButton onClick={() => router.push('/transactions')} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">Voltar</GradientButton>}
        />

        <ModernCard className="p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione o arquivo CSV</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {file ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">{file.name}</p>
                  <p className="text-xs text-gray-500 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Clique para selecionar um arquivo CSV</p>
                  <p className="text-xs text-gray-500">ou arraste e solte aqui</p>
                </div>
              )}
              
              <GradientButton onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 text-sm">
                {file ? 'Trocar arquivo' : 'Escolher arquivo'}
              </GradientButton>
            </div>
          </div>

          {error && (
            <ModernCard className="bg-red-50/60 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 mb-4">
              <pre className="text-sm whitespace-pre-wrap">{error}</pre>
              {previewErrors.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside text-red-700">
                  {previewErrors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {previewErrors.length > 10 && (
                    <li>+ {previewErrors.length - 10} outros erros</li>
                  )}
                </ul>
              )}
            </ModernCard>
          )}

          {success && (
            <ModernCard className="bg-green-50/60 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 mb-4">
              {success}
            </ModernCard>
          )}

          {preview.length > 0 && (
            <ModernCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prévia das transações</h3>
              <p className="text-sm text-slate-600 mb-4">{previewImportedRows} válidas de {previewTotalRows} linhas</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={transaction.description}>
                            {transaction.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModernCard>
          )}

          {file && preview.length > 0 && (
            <div className="flex gap-4">
              <GradientButton onClick={handleImport} disabled={loading} className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Importando...' : `Importar ${importedCount || 'todas as'} transações`}
              </GradientButton>
              <button
                onClick={() => {
                  setFile(null)
                  setPreview([])
                  setError(null)
                  setSuccess(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </ModernCard>

        <ModernCard className="p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4">Formatos suportados</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">Bancos suportados:</h4>
              <ul className="space-y-1">
                <li>• Itaú</li>
                <li>• Bradesco</li>
                <li>• Santander</li>
                <li>• Nubank</li>
                <li>• Inter</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Formato esperado:</h4>
              <p className="mb-2">O arquivo CSV deve conter as colunas:</p>
              <ul className="space-y-1">
                <li>• Data</li>
                <li>• Descrição/Histórico</li>
                <li>• Valor (positivo para entrada, negativo para saída)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-xs text-slate-600">
              <strong>Exemplo de linha:</strong><br/>
              15/11/2024,COMPRA MERCADO LIVRE,-125.50<br/>
              16/11/2024,SALÁRIO MENSAL,1500.00
            </p>
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
