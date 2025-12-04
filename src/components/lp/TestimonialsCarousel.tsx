"use client"
import { useEffect, useState } from 'react'

const items = [
  { n: 'Paula', t: 'Finalmente entendi meu dinheiro. Em 2 dias, vi onde cortar.' },
  { n: 'Rafael', t: 'O preview me convenceu. Em 1 semana parei de perder prazos.' },
  { n: 'Marina', t: 'Importei meu extrato e ganhei clareza instantânea.' },
]

export default function TestimonialsCarousel() {
  const [i, setI] = useState(0)
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % items.length), 5000); return () => clearInterval(id) }, [])
  const curr = items[i]
  return (
    <section className="mx-auto max-w-4xl px-4 py-8 text-center">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 bg-white/75 dark:bg-slate-900/60 backdrop-blur">
        <div className="text-lg text-slate-900 dark:text-white">“{curr.t}”</div>
        <div className="mt-2 text-slate-600 dark:text-slate-300">{curr.n}</div>
        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} className={`h-2 w-2 rounded-full ${idx === i ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`} aria-label={`Ir para depoimento ${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
