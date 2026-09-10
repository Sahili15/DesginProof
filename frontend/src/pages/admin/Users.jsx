import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { User, Shield, ShieldAlert, Loader2, RefreshCw, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/users')
      if (res.data?.status === 'success') {
        setUsers(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch platform users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userObj) => {
    const nextStatus = !userObj.is_active
    try {
      const res = await api.patch(`/api/admin/users/${userObj.id}`, {
        is_active: nextStatus
      })
      if (res.data?.status === 'success') {
        toast.success(`User successfully ${nextStatus ? 'activated' : 'suspended'}`)
        setUsers(prev => prev.map(u => u.id === userObj.id ? { ...u, is_active: nextStatus } : u))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update user status')
    }
  }

  const handleToggleRole = async (userObj) => {
    const nextRole = userObj.role === 'admin' ? 'client' : 'admin'
    if (!confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return
    
    try {
      const res = await api.patch(`/api/admin/users/${userObj.id}`, {
        role: nextRole
      })
      if (res.data?.status === 'success') {
        toast.success(`User role updated to ${nextRole}`)
        setUsers(prev => prev.map(u => u.id === userObj.id ? { ...u, role: nextRole } : u))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update user role')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500 text-sm">Loading users list...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p className="text-slate-500 text-sm">Review, authorize, and moderate registered brands and system accounts.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No users found on this system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Name / Email</th>
                  <th className="p-4">Brand Registered</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{u.brandName}</td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleRole(u)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' 
                            : 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-xs font-semibold ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title={u.is_active ? 'Suspend account' : 'Reactivate account'}
                        >
                          {u.is_active ? (
                            <ToggleRight className="text-green-600 h-6 w-6" />
                          ) : (
                            <ToggleLeft className="text-slate-300 dark:text-slate-600 h-6 w-6" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
