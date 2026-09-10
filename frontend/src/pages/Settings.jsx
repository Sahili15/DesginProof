import React, { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Globe, CheckCircle, ShieldAlert, Plus, Trash2, Loader2, ShieldCheck } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Account form
  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [company, setCompany] = useState('Brand A')

  // Verification state
  const [verificationData, setVerificationData] = useState({
    domain: '',
    token: '',
    is_verified: false,
    method: ''
  })
  
  // Whitelist/Blacklist state
  const [whitelistEntries, setWhitelistEntries] = useState([])
  const [newDomain, setNewDomain] = useState('')
  const [newDomainType, setNewDomainType] = useState('whitelist') // 'whitelist' or 'blacklist'
  const [addingDomain, setAddingDomain] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
      fetchVerification()
      fetchWhitelist()
    }
  }, [user])

  const fetchVerification = async () => {
    try {
      const res = await api.get('/api/brands/verify/token')
      if (res.data?.status === 'success') {
        setVerificationData(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch verification info:', err)
    }
  }

  const fetchWhitelist = async () => {
    try {
      const res = await api.get('/api/whitelists')
      if (res.data?.status === 'success') {
        setWhitelistEntries(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch whitelist entries:', err)
    }
  }

  const handleAddDomainEntry = async (e) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    try {
      setAddingDomain(true)
      const res = await api.post('/api/whitelists', {
        domain: newDomain,
        type: newDomainType
      })
      if (res.data?.status === 'success') {
        toast.success(res.data.message)
        setNewDomain('')
        fetchWhitelist()
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to add domain')
    } finally {
      setAddingDomain(false)
    }
  }

  const handleDeleteDomainEntry = async (id) => {
    try {
      const res = await api.delete(`/api/whitelists/${id}`)
      if (res.data?.status === 'success') {
        toast.success(res.data.message)
        setWhitelistEntries(prev => prev.filter(item => item.id !== id))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete domain entry')
    }
  }

  // Security
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSaveAccount = async () => {
    try {
      setLoading(true)
      // Example: PATCH /api/users/me
      await api.patch('/api/users/me', { fullName, email, company })
      toast.success('Account details saved')
    } catch (err) {
      toast.error('Failed to save account')
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return toast.error('Please fill all fields')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    try {
      setLoading(true)
      await api.post('/api/users/change-password', { current_password: currentPassword, new_password: newPassword })
      toast.success('Password changed')
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error('Failed to change password')
      console.error(err)
    } finally { setLoading(false) }
  }

  const toggle2FA = async () => {
    try {
      setLoading(true)
      if (!is2faEnabled) {
        await api.post('/api/users/2fa')
        setIs2faEnabled(true)
        toast.success('Two-factor enabled (check your email for setup)')
      } else {
        await api.delete('/api/users/2fa')
        setIs2faEnabled(false)
        toast.success('Two-factor disabled')
      }
    } catch (err) {
      toast.error('Failed to update two-factor auth')
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return
    try {
      setLoading(true)
      await api.delete('/api/users/me')
      toast.success('Account deleted')
      localStorage.removeItem('access_token')
      navigate('/')
    } catch (err) {
      toast.error('Failed to delete account')
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-500">Update account, notifications, and preferences.</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={handleSaveAccount} className="btn-primary" disabled={loading}>Save</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Domain Verification Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Globe className="text-slate-400" size={20} />
              Domain Verification
            </h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Registered Brand Domain</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{verificationData.domain || 'Not Configured'}</p>
                
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {verificationData.is_verified ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                      <CheckCircle size={14} />
                      Verified (via {verificationData.method === 'meta' ? 'Meta Tag' : 'File Scan'})
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                      <ShieldAlert size={14} />
                      Verification Pending
                    </span>
                  )}
                </div>
              </div>
              <Link 
                to="/settings/verify" 
                className={`py-2 px-4 rounded-lg font-medium text-sm transition-all text-center w-full sm:w-auto ${
                  verificationData.is_verified 
                    ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300' 
                    : 'bg-brand-forest hover:bg-brand-forest/90 text-white shadow-md'
                }`}
              >
                {verificationData.is_verified ? 'Manage Verification' : 'Verify Domain'}
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Account Details</h2>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row gap-4">
                <label className="w-full">
                  <div className="text-xs font-medium text-slate-500">Full Name</div>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                </label>
                <label className="w-full">
                  <div className="text-xs font-medium text-slate-500">Email</div>
                  <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                </label>
              </div>
              <label>
                <div className="text-xs font-medium text-slate-500">Company</div>
                <input value={company} onChange={e => setCompany(e.target.value)} className="mt-1 w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
              </label>
            </div>
            <div className="mt-4 md:hidden flex gap-2">
              <button onClick={handleSaveAccount} className="btn-primary" disabled={loading}>Save</button>
            </div>
          </div>

          {/* Whitelist / Blacklist Manager Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <ShieldCheck className="text-slate-400" size={20} />
              Domain Access Lists
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Whitelist authorized resellers (to prevent scanning them) or blacklist specific hostile domains.
            </p>

            {/* Add Entry Form */}
            <form onSubmit={handleAddDomainEntry} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="reseller-site.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                className="flex-1 p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
              <select
                value={newDomainType}
                onChange={e => setNewDomainType(e.target.value)}
                className="p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350"
              >
                <option value="whitelist">Whitelist</option>
                <option value="blacklist">Blacklist</option>
              </select>
              <button
                type="submit"
                disabled={addingDomain}
                className="btn-primary flex items-center gap-1.5 justify-center py-2 px-4 text-sm"
              >
                {addingDomain ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Domain
              </button>
            </form>

            {/* List Table */}
            {whitelistEntries.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">No custom domain rules configured yet.</p>
            ) : (
              <div className="max-h-[220px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                {whitelistEntries.map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-3 text-sm">
                    <div>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{entry.domain}</span>
                      <span className={`ml-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        entry.type === 'whitelist' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {entry.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDomainEntry(entry.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="font-semibold mb-3">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked />
                <span>Receive enforcement emails</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                <span>Weekly summary</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Security</h3>
            <div className="space-y-4 text-sm text-slate-500">
              <div>
                <button onClick={() => setShowChangePassword(s => !s)} className="text-sm text-brand-forest hover:underline">Change password</button>
                {showChangePassword && (
                  <form onSubmit={handleChangePassword} className="mt-3 space-y-2">
                    <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                    <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                    <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800" />
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary" disabled={loading}>Save Password</button>
                      <button type="button" onClick={() => setShowChangePassword(false)} className="btn-outline">Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={is2faEnabled} onChange={toggle2FA} />
                  <span>Two-factor authentication</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-3">Delete your account and all associated data. This action is irreversible.</p>
            <button onClick={handleDeleteAccount} className="w-full py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete account</button>
          </div>
        </div>
      </div>
    </div>
  )
}
