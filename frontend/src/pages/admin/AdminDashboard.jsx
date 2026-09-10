import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Users, Shield, Send, CheckCircle, Percent, ShoppingBag, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_users: 0,
    total_brands: 0,
    total_products: 0,
    total_detections: 0,
    total_resolved: 0,
    total_emails_sent: 0,
    success_rate: '0%'
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/stats')
      if (res.data?.status === 'success') {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load platform stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500 text-sm">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of DesignProof SaaS platform-wide activity and metrics.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Total Users</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_users}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <ShoppingBag size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cataloged</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Total Products</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_products}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <Shield size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Scanned</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Copies Detected</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_detections}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 border-b-4 border-brand-forest dark:border-brand-gold">
          <div className="flex justify-between items-center text-brand-forest dark:text-brand-gold">
            <Percent size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Conversion</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Takedown Success Rate</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.success_rate}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Email Logs & Resolution summary */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-lg">Enforcement Metrics</h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Send size={24} />
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold block">Total Legal Notices Issued</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.total_emails_sent}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold block">Hostile Links Removed</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{stats.total_resolved}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl">
            <span className="font-semibold block mb-1">💡 Platform Insights</span>
            Takedown enforcement acts asynchronously. Scanners monitor infringing targets after notice dispatch, verifying domain removals every 6 hours automatically.
          </div>
        </div>

        {/* Admin Quick Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Quick Controls</h3>
          
          <div className="flex flex-col gap-2.5">
            <Link to="/admin/clients" className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all">
              <span>Client Registrations</span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
            
            <Link to="/admin/templates" className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all">
              <span>Notice Templates</span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
            
            <Link to="/admin/audit-logs" className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-all">
              <span>Platform Audit Logs</span>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
