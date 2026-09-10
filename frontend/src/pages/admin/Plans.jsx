import React from 'react'
import { Layers, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const SYSTEM_PLANS = [
  { id: '00000000-0000-0000-0000-000000000000', name: 'Free Tier', price: '$0/mo', credits: 50, status: 'Active' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Growth Plan', price: '$49/mo', credits: 500, status: 'Active' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Scale Plan', price: '$149/mo', credits: 2500, status: 'Active', recommended: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Enterprise Plan', price: '$499/mo', credits: 10000, status: 'Active' }
]

export default function Plans() {
  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="text-brand-gold" size={24} />
            SaaS Plan Tiers
          </h1>
          <p className="text-slate-500 text-sm">Review Stripe-mapped subscription price codes and monthly resource quotas.</p>
        </div>
      </div>

      <div className="space-y-4">
        {SYSTEM_PLANS.map(plan => (
          <div 
            key={plan.id} 
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden ${
              plan.recommended ? 'border-brand-forest dark:border-brand-gold ring-1 ring-brand-forest/20' : 'border-slate-250 dark:border-slate-800'
            }`}
          >
            {plan.recommended && (
              <span className="absolute top-0 right-0 bg-brand-gold text-white text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5">
                <Sparkles size={8} /> Popular
              </span>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{plan.name}</h3>
                <span className="bg-green-150 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {plan.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Stripe ID: {plan.id}</div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-650 dark:text-slate-450 self-start sm:self-auto">
              <div>
                <span className="text-xs text-slate-400 block">Quota Quota</span>
                <span className="font-bold text-slate-800 dark:text-slate-250">{plan.credits} Scans / mo</span>
              </div>
              <div className="border-l border-slate-100 dark:border-slate-800 pl-6">
                <span className="text-xs text-slate-400 block">Billing Charge</span>
                <span className="font-bold text-slate-800 dark:text-slate-250">{plan.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
