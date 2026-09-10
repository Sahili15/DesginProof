import React, { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { CreditCard, CheckCircle, Zap, Shield, Sparkles, Loader2, ArrowRight, X } from 'lucide-react'

const PLANS = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Free Tier',
    price: '$0',
    period: '/mo',
    credits: 50,
    features: ['50 image scans / mo', '1 registered brand domain', 'Email alerts (delayed)', 'Standard search queue']
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Growth Plan',
    price: '$49',
    period: '/mo',
    credits: 500,
    features: ['500 image scans / mo', '2 registered brand domains', 'Immediate email alerts', 'Access to Whitelist/Blacklist lists', 'Priority queue']
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Scale Plan',
    price: '$149',
    period: '/mo',
    credits: 2500,
    features: ['2,500 image scans / mo', '5 registered brand domains', 'Automated takedown escalation', 'Shopify & WooCommerce importers', 'Dedicated support']
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Enterprise Plan',
    price: '$499',
    period: '/mo',
    credits: 10000,
    features: ['10,000 image scans / mo', 'Unlimited domains', 'Custom legal email templates', 'API access for automated scans', '24/7 legal team assistance']
  }
]

export default function Subscription() {
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState(null)
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1 = Form, 2 = Success
  const [processingPayment, setProcessingPayment] = useState(false)

  // Card form states
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [])

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/billing/subscription')
      if (res.data?.status === 'success') {
        setSub(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPlan) return

    try {
      setProcessingPayment(true)
      // Simulate Stripe API Latency
      await new Promise(resolve => setTimeout(resolve, 2000))

      const res = await api.post('/api/billing/checkout', { planId: selectedPlan.id })
      if (res.data?.status === 'success') {
        toast.success('Simulated credit card transaction approved!')
        setCheckoutStep(2)
        fetchSubscriptionDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error('Simulated transaction failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500 text-sm">Loading billing panel...</p>
      </div>
    )
  }

  const percentageCreditsUsed = sub 
    ? Math.min(100, Math.round((sub.scanCreditsUsed / sub.scanCreditsTotal) * 100))
    : 0

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-slate-500 text-sm">Manage subscription tiers, scan credits, and payment preferences.</p>
      </div>

      {sub && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Current plan details */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-brand-forest dark:text-brand-gold uppercase tracking-wider">Your Plan</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{sub.planName}</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Renews at <span className="font-semibold text-slate-700 dark:text-slate-350">{new Date(sub.renewsAt).toLocaleDateString()}</span> ({sub.planPrice})
                </p>
              </div>
              <span className="bg-green-150 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {sub.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Scan Credits Used</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {sub.scanCreditsUsed} / {sub.scanCreditsTotal} ({percentageCreditsUsed}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-forest dark:bg-brand-gold h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percentageCreditsUsed}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Credits reset automatically every monthly billing cycle. Upgrade your plan to expand monthly scanning quotas.
              </p>
            </div>
          </div>

          {/* Quick billing status summary */}
          <div className="bg-gradient-to-br from-slate-900 to-brand-navy rounded-2xl p-6 text-white flex flex-col justify-between shadow-md space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-lg">Secure Simulated Checkout</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                DesignProof runs an integrated sandbox checkout powered by mock Stripe APIs. Experience full upgrade flows without enterng actual merchant tokens.
              </p>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-white/10 pt-4 flex items-center gap-1">
              <Shield size={12} className="text-brand-gold" />
              100% compliant local sandbox environment.
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Choose a Plan</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map(plan => {
            const isCurrent = sub && sub.planName.toLowerCase().includes(plan.name.toLowerCase())
            
            return (
              <div 
                key={plan.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-300 relative overflow-hidden hover:shadow-xl ${
                  isCurrent 
                    ? 'border-brand-forest dark:border-brand-gold ring-2 ring-brand-forest/20 dark:ring-brand-gold/20' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Popular badge */}
                {plan.name === 'Scale Plan' && (
                  <span className="absolute top-0 right-0 bg-brand-gold text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Sparkles size={10} />
                    Popular
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-slate-100 text-lg">{plan.name}</h4>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                      <span className="text-xs text-slate-400 ml-1">{plan.period}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1 uppercase tracking-wider">{plan.credits} scan credits / mo</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button 
                      disabled 
                      className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedPlan(plan); setCheckoutStep(1); }}
                      className={`w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        plan.name === 'Scale Plan'
                          ? 'bg-brand-forest hover:bg-brand-forest/90 text-white shadow-md dark:bg-brand-gold dark:hover:bg-brand-gold/90'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200'
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulated Stripe Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedPlan(null)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl relative p-8 border border-slate-200 dark:border-slate-850">
            <button onClick={() => setSelectedPlan(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors">
              <X size={20} />
            </button>

            {checkoutStep === 1 ? (
              /* Step 1: Simulated Stripe Card Form */
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Checkout Portal</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Stripe Checkout Sandbox</h3>
                  <p className="text-slate-500 text-sm">
                    Enter credit card details below to complete your checkout simulation for the <span className="font-bold text-slate-850 dark:text-slate-200">{selectedPlan.name}</span>.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white font-mono shadow-md relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
                  <div className="flex justify-between items-start mb-8">
                    <Zap className="text-brand-gold fill-brand-gold" size={24} />
                    <span className="text-xs uppercase opacity-80 tracking-widest">DesignProof Pay</span>
                  </div>
                  
                  <div className="text-lg tracking-[0.2em] mb-4">
                    {cardNumber ? cardNumber.replace(/\d{4}(?=.)/g, '$& ') : '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] uppercase opacity-50 block tracking-wider">Card Holder</span>
                      <span className="text-xs tracking-wider">SANDBOX TESTER</span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[8px] uppercase opacity-50 block tracking-wider">Expires</span>
                        <span className="text-xs tracking-wider">{cardExpiry || 'MM/YY'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase opacity-50 block tracking-wider">CVV</span>
                        <span className="text-xs tracking-wider">{cardCvv || '•••'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength="16"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expiration Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        placeholder="123"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="btn-outline flex-1 py-3 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${selectedPlan.price}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Step 2: Checkout Success Screen */
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-green-500/20 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <CheckCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-850 dark:text-slate-200">Subscription Updated</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Your sandbox transaction has been approved. Your brand is now successfully upgraded to the <span className="font-bold text-slate-700 dark:text-slate-350">{selectedPlan.name}</span>.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="btn-primary px-10 py-2.5 text-sm mx-auto flex items-center gap-2"
                >
                  Return to Panel
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
