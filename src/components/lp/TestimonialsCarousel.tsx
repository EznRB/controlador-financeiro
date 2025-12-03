"use client"
import { useEffect, useState } from 'react'

const items = [
  { n: 'Paula', t: 'Finalmente entendi meu dinheiro. Em 2 dias, vi onde cortar.' },
  { n: 'Rafael', t: 'O preview me convenceu. Em 1 semana parei de perder prazos.' },
  { n: 'Marina', t: 'Importei meu extrato e ganhei clareza instantânea.' },
]

export default function TestimonialsCarousel() {
  const [i, setI] = useState(0)
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % items.length), 4000); return () => clearInterval(id) }, [])
  const curr = items[i]
  return (
    <section className="mx-auto max-w-4xl px-4 py-8 text-center">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="text-lg text-slate-900 dark:text-white">“{curr.t}”</div>
        <div className="mt-2 text-slate-500">{curr.n}</div>
      </div>
    </section>
  )
}
