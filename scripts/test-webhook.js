const Stripe = require('stripe')
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    })
  }
}

async function main() {
  loadEnv()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) { console.error('Missing STRIPE_WEBHOOK_SECRET'); process.exit(1) }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
  const payload = JSON.stringify({
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        mode: 'subscription',
        metadata: { plan: 'monthly' },
        customer: 'cus_test_1',
        customer_details: { email: 'lead@example.com' },
        subscription: 'sub_test_1',
      }
    }
  })
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret })
  const res = await fetch('http://localhost:3000/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': header }, body: payload })
  const txt = await res.text()
  console.log('Webhook response:', res.status, txt)
}

main().catch((e) => { console.error(e); process.exit(1) })
