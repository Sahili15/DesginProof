import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Save, Loader2, Info, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Templates() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState({ subject: '', body: '' })

  useEffect(() => {
    fetchTemplate()
  }, [])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/template')
      if (res.data?.status === 'success') {
        setTemplate(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load legal templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await api.post('/api/admin/template', template)
      if (res.data?.status === 'success') {
        toast.success('Notice template saved successfully!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500 text-sm">Loading templates editor...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Notice Template Editor</h1>
          <p className="text-slate-500 text-sm">Customize the formal Cease & Desist copyright infringement notification sent to marketplaces.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject Header</label>
              <input
                type="text"
                value={template.subject}
                onChange={e => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Notice Content</label>
              <textarea
                value={template.body}
                onChange={e => setTemplate(prev => ({ ...prev, body: e.target.value }))}
                className="w-full p-4 h-96 text-sm border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans leading-relaxed resize-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-6 flex items-center justify-center gap-1.5 text-sm font-semibold"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Template
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Info size={16} className="text-brand-forest dark:text-brand-gold" />
              Dynamic Tokens
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use the following variables in your notice drafts. The system will dynamically swap them out upon notice generation:
            </p>
            
            <ul className="space-y-3 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              <li>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold block">[InfringingDomain]</span>
                Host hostname of the copycat shop
              </li>
              <li>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold block">[InfringingURL]</span>
                Direct link to copycat listing
              </li>
              <li>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold block">[OriginalURL]</span>
                Link to your original catalog asset
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
