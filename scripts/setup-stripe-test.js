const Stripe = require('stripe')
const fs = require('fs')
const path = require('path')

async function main() {
  // load .env.local
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      content.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^([^#=]+)=(.*)$/)
        if (m) process.env[m[1].trim()] = m[2].trim()
      })
    }
  } catch {}

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    console.error('Missing STRIPE_SECRET_KEY in env')
    process.exit(1)
  }
  const stripe = new Stripe(secret)

  const products = await stripe.products.list({ limit: 100 })
  const findByName = (name) => products.data.find((p) => p.name === name)
  const monthlyName = 'Organizador Financeiro - Mensal'
  const lifetimeName = 'Organizador Financeiro - Vitalício'
  const monthlyProduct = findByName(monthlyName) || await stripe.products.create({ name: monthlyName })
  const lifetimeProduct = findByName(lifetimeName) || await stripe.products.create({ name: lifetimeName })

  const prices = await stripe.prices.list({ limit: 100 })
  const monthlyPrice = prices.data.find((pr) => pr.product === monthlyProduct.id && pr.currency === 'brl' && pr.recurring && pr.recurring.interval === 'month' && pr.unit_amount === 990)
    || await stripe.prices.create({ currency: 'brl', unit_amount: 990, recurring: { interval: 'month' }, product: monthlyProduct.id })
  const lifetimePrice = prices.data.find((pr) => pr.product === lifetimeProduct.id && pr.currency === 'brl' && !pr.recurring && pr.unit_amount === 2990)
    || await stripe.prices.create({ currency: 'brl', unit_amount: 2990, product: lifetimeProduct.id })

  const out = {
    monthlyPriceId: monthlyPrice.id,
    lifetimePriceId: lifetimePrice.id,
    webhookSecret: null,
  }
  console.log(JSON.stringify(out))
}

main().catch((err) => { console.error(err); process.exit(1) })
