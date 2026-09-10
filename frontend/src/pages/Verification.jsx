import React, { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ShieldAlert, CheckCircle, Copy, FileText, Code, Globe, ArrowLeft, Loader2 } from 'lucide-react'

export default function Verification() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [data, setData] = useState({
    domain: '',
    token: '',
    is_verified: false,
    method: ''
  })
  const [selectedMethod, setSelectedMethod] = useState('meta') // 'meta' or 'file'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchVerificationDetails()
  }, [])

  const fetchVerificationDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/brands/verify/token')
      if (res.data?.status === 'success') {
        setData(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load verification status')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    const textToCopy = selectedMethod === 'meta' 
      ? `<meta name="designproof-verification" content="${data.token}">`
      : data.token

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    try {
      setVerifying(true)
      const res = await api.post('/api/brands/verify', { method: selectedMethod })
      if (res.data?.status === 'success') {
        toast.success(res.data.message || 'Domain successfully verified!')
        setData(prev => ({
          ...prev,
          is_verified: true,
          method: selectedMethod
        }))
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Verification failed. Please check your setup.'
      toast.error(msg)
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500">Loading domain status...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/settings" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="text-brand-forest dark:text-brand-gold" size={24} />
            Domain Verification
          </h1>
          <p className="text-slate-500 text-sm">Verify domain ownership to authorize IP enforcement scans.</p>
        </div>
      </div>

      {data.is_verified ? (
        /* Verified State Screen */
        <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 dark:border-green-500/10 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
            <CheckCircle size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Domain Ownership Verified</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Verification succeeded for <span className="font-semibold text-brand-forest dark:text-brand-gold underline">{data.domain}</span>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">Verification Method</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{data.method === 'meta' ? 'HTML Meta Tag' : 'TXT Verification File'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">Authorized Agent Status</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Active Protection
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            <button onClick={() => setData(prev => ({ ...prev, is_verified: false }))} className="btn-outline">
              Re-verify Domain
            </button>
          </div>
        </div>
      ) : (
        /* Not Verified State Screen */
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main instructions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="font-bold text-lg">Verify Ownership of {data.domain || 'your domain'}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                To prevent unauthorized trademark enforcement and false complaints, you must verify that you own this website domain. Choose a verification method below.
              </p>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSelectedMethod('meta')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                    selectedMethod === 'meta'
                      ? 'border-brand-forest text-brand-forest dark:border-brand-gold dark:text-brand-gold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Code size={16} />
                  HTML Meta Tag
                </button>
                <button
                  onClick={() => setSelectedMethod('file')}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                    selectedMethod === 'file'
                      ? 'border-brand-forest text-brand-forest dark:border-brand-gold dark:text-brand-gold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FileText size={16} />
                  TXT File Upload
                </button>
              </div>

              {/* Active Tab Content */}
              {selectedMethod === 'meta' ? (
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">1. Add this metadata tag to your website header:</span>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Paste this tag into the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600">&lt;head&gt;</code> section of your site's home index file.
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-xs overflow-x-auto text-slate-600 dark:text-slate-300">
                    <pre className="select-all">&lt;meta name="designproof-verification" content="{data.token}"&gt;</pre>
                    <button onClick={handleCopy} className="ml-3 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500" title="Copy code">
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="text-sm space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">2. Confirm placement:</span>
                    <p className="text-slate-500 text-xs">
                      Publish the change and wait a few seconds before clicking the Verify button.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">1. Create a verification text file:</span>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Create a file named <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600">designproof-verification.txt</code> containing only the token string below.
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-xs overflow-x-auto text-slate-600 dark:text-slate-300">
                    <pre className="select-all">{data.token}</pre>
                    <button onClick={handleCopy} className="ml-3 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500" title="Copy token">
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="text-sm space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">2. Upload to website root:</span>
                    <p className="text-slate-500 text-xs">
                      Upload the file to your host root so it is accessible at:
                      <br />
                      <code className="text-red-500 font-mono mt-1 block">https://{data.domain}/designproof-verification.txt</code>
                    </p>
                  </div>
                </div>
              )}

              {/* Verify Trigger */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 max-w-xs leading-tight">
                  {data.domain && (data.domain.includes('localhost') || data.domain.includes('example.com')) ? (
                    <span className="text-brand-gold font-medium">⚠️ Localhost/Example domain detected. Verification simulation mode is active.</span>
                  ) : (
                    "Scans are automated. Verification checks may fail if firewalls block incoming requests."
                  )}
                </span>
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="btn-primary flex items-center gap-2 justify-center min-w-[140px]"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Domain"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-brand-navy rounded-2xl p-6 text-white shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-gold">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-base">Why verify?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verification grants legal standing to send cease & desist notices and escalations under your brand name. Unverified accounts can only use reverse image detection in preview mode.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500 flex items-center gap-1.5 uppercase">
                <ShieldAlert size={14} />
                DNS Verification (Enterprise Only)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For complex subdomains or proxy setup behind Cloudflare, contact enterprise support to use DNS TXT record authorization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
