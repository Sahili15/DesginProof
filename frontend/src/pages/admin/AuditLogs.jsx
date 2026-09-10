import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Shield, User, Clock, Loader2, ArrowLeft, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/audit-logs')
      if (res.data?.status === 'success') {
        setLogs(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="h-8 w-8 text-brand-forest animate-spin" />
        <p className="text-slate-500 text-sm">Loading audit trail...</p>
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-brand-gold" size={24} />
            Platform Audit Logs
          </h1>
          <p className="text-slate-500 text-sm">Immutable system-wide ledger of user activities and database updates.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Terminal className="text-slate-350" size={28} />
            <p>No audit trail logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">User / Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{log.userName}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{log.ip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.action.includes('UPDATE') || log.action.includes('EDIT')
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : log.action.includes('DELETE') || log.action.includes('REMOVE')
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          : 'bg-green-150 text-green-750 dark:bg-green-500/10 dark:text-green-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-medium capitalize text-xs">{log.entity}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-[150px]" title={log.entityId}>
                      {log.entityId || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-500 text-xs flex items-center gap-1.5 mt-2.5">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleString()}
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
