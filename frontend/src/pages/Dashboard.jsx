import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Upload, Search, ShieldAlert, Mail, CheckCircle, 
  ExternalLink, Eye, AlertTriangle, Download, 
  Filter, ArrowRight, RefreshCw, Copy, Trash2, 
  Clock, Link as LinkIcon, AlertCircle, X, Send,
  FileText, TrendingUp, BarChart3, Bell
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast, { Toaster } from 'react-hot-toast'

// --- SKELETON LOADER ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}></div>
)

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [scanResults, setScanResults] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailStatus, setEmailStatus] = useState('idle') // idle, sending, success
  const [filters, setFilters] = useState({ type: 'all', sort: 'relevance' })
  const [emailsSent, setEmailsSent] = useState(0)
  const [resolvedCount, setResolvedCount] = useState(0)

  // Fetch initial data (History & Stats)
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/api/detections')
      
      const allDetections = res.data.data || []
      const sentCount = allDetections.filter(d => d.firstNoticeSentAt !== null && d.firstNoticeSentAt !== undefined).length
      const remCount = allDetections.filter(d => d.isRemoved === true).length
      setEmailsSent(sentCount)
      setResolvedCount(remCount)

      // Group by original image to create a history
      const grouped = allDetections.reduce((acc, curr) => {
        // Group by product name + date to keep scans separate and organized
        const key = curr.id || curr.productName 
        if (!acc[key]) {
          acc[key] = { 
            id: curr.id,
            name: curr.productName,
            image: curr.image || 'https://via.placeholder.com/100?text=Design',
            date: curr.dateFound,
            fullDate: curr.createdAt || new Date().toISOString(),
            matches: 0,
            results: []
          }
        }
        acc[key].matches++
        acc[key].results.push(curr)
        return acc
      }, {})
      setHistory(Object.values(grouped))
      setIsLoading(false)
    } catch (err) {
      console.error("Dashboard data fetch failed", err)
      setIsLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(10)
    
    const formData = new FormData()
    formData.append('image', file)
    formData.append('name', file.name)
    formData.append('brand', 'My Brand')

    try {
      setUploadProgress(30)
      const res = await api.post('/upload', formData)
      setUploadProgress(100)
      setScanResults(res.data)
      toast.success(`Scan complete! Found ${res.data.counts.exact} exact matches.`)
      fetchData() // Refresh history
    } catch (err) {
      toast.error('Scan failed. Please try again.')
      console.error(err)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-8 pb-20">
      <Toaster position="top-right" />
      
      {/* 1. TOP NAVBAR (Simplified embedded) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-brand-forest text-white rounded-lg">
              <BarChart3 size={24} />
            </span>
            Intellectual Property Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor, detect, and enforce your copyright globally.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative">
             <Bell size={20} />
             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
           </button>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
           <button className="flex-1 md:flex-none btn-outline flex items-center justify-center gap-2">
             <Download size={18} /> Download Report
           </button>
        </div>
      </div>

      {/* 2. COMPACT UPLOAD SECTION */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <UploadCard onUpload={handleUpload} isUploading={isUploading} progress={uploadProgress} />
        </div>
        <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
              <StatMiniCard title="Processing Time" value={scanResults ? scanResults.scan_duration || "3.2s" : "--"} icon={<Clock className="text-blue-500" />} />
              <StatMiniCard title="Links Found" value={scanResults ? scanResults.matching_websites?.length : "0"} icon={<LinkIcon className="text-brand-forest" />} />
              <StatMiniCard title="High Risk" value={scanResults ? scanResults.exactMatches?.length : "0"} icon={<AlertTriangle className="text-red-500" />} />
              <StatMiniCard title="Emails Sent" value={emailsSent} icon={<Mail className="text-purple-500" />} />
            </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8">
        {/* MAIN SCAN RESULTS AREA */}
        <div className="xl:col-span-8 space-y-6">
          {/* Filters & Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Search size={18} className="text-brand-forest" />
              Scan Results
              {scanResults && <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-full">{scanResults.matching_websites?.length} matches</span>}
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-48">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                 <input 
                   placeholder="Search domains..."
                   className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-brand-forest w-full"
                 />
               </div>
               <div className="relative flex-1 sm:flex-none">
                 <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                 <select 
                   value={filters.type}
                   onChange={(e) => setFilters({...filters, type: e.target.value})}
                   className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-brand-forest w-full"
                 >
                   <option value="all">Match Type: All</option>
                   <option value="exact">Exact Matches</option>
                   <option value="similar">Similar Only</option>
                 </select>
               </div>
               <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-forest transition-colors">
                 <RefreshCw size={16} />
               </button>
            </div>
          </div>

          {/* Results Grid/List */}
          <div className="space-y-12">
            {!scanResults ? (
              <EmptyState title="No active scan" desc="Upload a design or select an image from history to see detection results." />
            ) : scanResults.matching_websites?.length === 0 ? (
              <EmptyState title="No infringements found" desc="Our AI didn't find any direct matches for this design. Great news!" />
            ) : (
              <>
                {/* Exact Matches Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">Exact Matches (100%)</h4>
                  </div>
                  <div className="space-y-4">
                    {scanResults.exactMatches?.length > 0 ? (
                      scanResults.exactMatches.map((item, idx) => (
                        <ResultCard 
                          key={`exact-${idx}`} 
                          data={item} 
                          onViewDetails={() => setSelectedResult(item)} 
                          onSendEmail={() => { setSelectedResult(item); setIsEmailModalOpen(true); }}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic pl-4">No exact duplicates found.</p>
                    )}
                  </div>
                </div>

                {/* Similar Matches Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">Similar Designs</h4>
                  </div>
                  <div className="space-y-4">
                    {scanResults.similarMatches?.length > 0 ? (
                      scanResults.similarMatches.map((item, idx) => (
                        <ResultCard 
                          key={`similar-${idx}`} 
                          data={item} 
                          onViewDetails={() => setSelectedResult(item)} 
                          onSendEmail={() => { setSelectedResult(item); setIsEmailModalOpen(true); }}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic pl-4">No similar variations found.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SIDEBAR: HISTORY & SUMMARY */}
        <div className="xl:col-span-4 space-y-6">
          {/* History Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <Clock size={16} className="text-slate-400" />
                Scan History
              </h3>
              <button onClick={fetchData} className="text-xs text-brand-forest hover:underline">View All</button>
            </div>
            <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full mb-2" />)
              ) : history.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No history found.</div>
              ) : (
                history.map((item, idx) => (
                  <HistoryItem key={idx} item={item} onSelect={() => {
                    const sortedResults = {
                      matching_websites: item.results || [],
                      exactMatches: (item.results || []).filter(r => (r.similarity_score || r.similarity) >= 99),
                      similarMatches: (item.results || []).filter(r => (r.similarity_score || r.similarity) < 99)
                    };
                    setScanResults(sortedResults);
                  }} />
                ))
              )}
            </div>
          </div>

          {/* Report Summary Section */}
          <div className="bg-brand-forest rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <h3 className="font-bold text-lg mb-4 relative z-10 flex items-center gap-2">
              <FileText size={20} />
              Enforcement Summary
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">Total Infringements</span>
                <span className="font-bold text-xl">{history.reduce((a, b) => a + b.matches, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-80">Resolved / Removed</span>
                <span className="font-bold text-xl text-green-300">{resolvedCount}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-white h-full" 
                  style={{ width: `${history.reduce((a, b) => a + b.matches, 0) > 0 ? (resolvedCount / history.reduce((a, b) => a + b.matches, 0)) * 100 : 0}%` }} 
                />
              </div>
              <p className="text-xs opacity-60 italic mt-2">Legal suggestion: Send DMCA notices to high-risk domains first to recover 40% of lost revenue.</p>
              <button className="w-full py-2.5 bg-white text-brand-forest rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                Generate Full PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {selectedResult && !isEmailModalOpen && (
          <DetailsModal 
            data={selectedResult} 
            onClose={() => setSelectedResult(null)} 
            onAction={() => setIsEmailModalOpen(true)}
          />
        )}
        {isEmailModalOpen && (
          <EmailModal 
            data={selectedResult} 
            onClose={() => setIsEmailModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function UploadCard({ onUpload, isUploading, progress }) {
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
      onUpload(e)
    }
  }

  return (
    <label className={`block relative bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed transition-all cursor-pointer group h-full min-h-[160px] overflow-hidden ${isUploading ? 'border-brand-forest ring-4 ring-brand-forest/5' : 'border-slate-200 dark:border-slate-800 hover:border-brand-forest hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <input type="file" className="hidden" onChange={handleChange} disabled={isUploading} />
      
      {preview && !isUploading && (
        <div className="absolute inset-0 z-0">
          <img src={preview} alt="preview" className="w-full h-full object-cover opacity-20" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
        {isUploading ? (
          <div className="w-full px-6 space-y-4">
             <RefreshCw className="mx-auto text-brand-forest animate-spin" size={32} />
             <div className="space-y-2">
               <div className="text-sm font-bold text-brand-forest uppercase tracking-widest">Scanning Web...</div>
               <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-brand-forest h-full" />
               </div>
             </div>
          </div>
        ) : (
          <>
            <div className="p-3 bg-brand-forest/10 text-brand-forest rounded-xl mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Upload Design</h4>
            <p className="text-xs text-slate-600">Drag & drop or <span className="text-brand-forest font-bold underline">browse</span></p>
            <p className="text-[10px] text-slate-500 mt-2 uppercase">JPG, PNG up to 10MB</p>
          </>
        )}
      </div>
    </label>
  )
}

function StatMiniCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">{title}</div>
        <div className="text-xl font-bold text-slate-800 dark:text-white leading-none">{value}</div>
      </div>
    </div>
  )
}

function HistoryItem({ item, onSelect }) {
  return (
    <button onClick={onSelect} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left transition-colors group">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
        <img src={item.image} alt="hist" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</h5>
        <p className="text-[10px] text-slate-400 font-medium">
          {item.date} {item.fullDate && new Date(item.fullDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {item.matches} matches
        </p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 p-1.5 bg-brand-forest text-white rounded-md transition-all">
        <RefreshCw size={12} />
      </div>
    </button>
  )
}

function ResultCard({ data, onViewDetails, onSendEmail }) {
  const isExact = data.match_type === "Exact Match"
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md hover:border-brand-forest/30 transition-all group">
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Thumbnail */}
        <div className="w-full md:w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 relative">
          <img src={data.copied_image_url || data.thumbnail || 'https://via.placeholder.com/100?text=No+Preview'} alt="match" className="w-full h-full object-cover" />
          <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${data.similarity_score >= 99 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white shadow-lg'}`}>
            {data.similarity_score >= 99 ? '100% Exact Match' : `${Math.round(data.similarity_score)}% Similarity`}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-white truncate mb-0.5">{data.title || "Infringing Design Discovery"}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300">{data.brand_name || new URL(data.url || data.link).hostname.replace('www.', '')}</span>
                <span>•</span>
                <span className="truncate">{data.url || data.link}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${data.match_type === 'Exact Match' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {data.match_type === 'Exact Match' ? 'Exact Match' : 'Similar Design'}
                    </span>
              <div className="text-[8px] font-bold text-slate-400 uppercase -mt-1">Confidence</div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <button onClick={onSendEmail} className="px-3 py-1.5 bg-brand-forest text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-brand-forest/90 transition-colors shadow-sm">
              <Mail size={14} /> Send Email
            </button>
            <button onClick={onViewDetails} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Eye size={14} /> View Details
            </button>
            <button 
              onClick={() => { navigator.clipboard.writeText(data.url || data.link); toast.success('Link copied!') }}
              className="p-1.5 text-slate-400 hover:text-brand-forest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-all"
            >
              <Copy size={14} />
            </button>
            <a href={data.url || data.link} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ml-auto">
              <ExternalLink size={14} /> Open Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, desc }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
        <ShieldAlert size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-xs mx-auto">{desc}</p>
    </div>
  )
}

function DetailsModal({ data, onClose, onAction }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-brand-dark-footer rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold dark:text-white">Infringement Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 md:grid md:grid-cols-2 gap-6 space-y-6 md:space-y-0">
          <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
             <img src={data.copied_image_url || data.thumbnail || 'https://via.placeholder.com/300'} alt="preview" className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md text-xs font-bold">
                 <AlertCircle size={14} /> Not Contacted
              </div>
            </div>
            
            <div className="space-y-3">
              <DetailRow label="Confidence" value={`${Math.round(data.similarity_score)}% (${data.match_type})`} />
              <DetailRow label="Domain" value={new URL(data.url || data.link).hostname} />
              <DetailRow label="Detected Email" value={data.emails?.[0]?.email || "Looking for contact..."} />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
               <div className="text-[10px] font-bold text-slate-400 uppercase">Website URL</div>
               <div className="text-xs truncate dark:text-white font-medium">{data.url || data.link}</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col sm:flex-row gap-3">
           <button onClick={onAction} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
             <Mail size={18} /> Compose Removal Email
           </button>
           <button className="flex-1 btn-outline py-3 flex items-center justify-center gap-2">
             <Copy size={18} /> Copy Link
           </button>
        </div>
      </motion.div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">{value}</div>
    </div>
  )
}

function EmailModal({ data, onClose }) {
  const domain = new URL(data.url || data.link).hostname
  const [status, setStatus] = useState('idle') // idle, sending, success
  const [subject, setSubject] = useState(`URGENT: Copyright Infringement Notice - ${domain}`)
  const [message, setMessage] = useState(
`Dear Sir/Madam,

I hope this message finds you well.

I am writing to inform you that an image owned by me has been identified on your website without my permission. The image is my original work, and its usage on your platform appears to be unauthorized.

**Details of the issue:**

* Website URL: ${data.url || data.link}
* Original Image Owner: [Your Name / Company Name]
* Proof of Ownership: [Evidence Case ID: ${data.id}]

I kindly request you to remove the image from your website at the earliest or provide proper authorization/credit if applicable.

Please treat this as an urgent matter related to intellectual property rights. I would appreciate your cooperation in resolving this issue promptly.

If the image is not removed within a reasonable timeframe, I may be required to take further action.

Thank you for your understanding and cooperation.

Sincerely,
[Your Full Name]
[Your Contact Information]
[Your Email Address]`
  )
  
  const handleSend = async () => {
    setStatus('sending')
    try {
      await api.post('/api/notices', {
        email: data.emails?.[0]?.email || 'support@' + domain,
        website_url: data.url || data.link,
        subject: subject,
        content: message,
        original_image_url: data.originalImage || data.image,
        copied_image_url: data.copied_image_url || data.thumbnail
      })
      setStatus('success')
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      toast.error('Failed to send notice.')
      setStatus('idle')
    }
  }

  return (
    <div className="fixed inset-0 z-[1010] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div 
        layoutId="email-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-brand-dark-footer rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold dark:text-white">Compose Legal Notice</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-[10px] text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-medium">
            RECIPIENT: <strong>{data.emails?.[0]?.email || "support@" + domain}</strong>
          </div>
        </div>

        <div className="p-6 space-y-4">
           <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notice Subject</label>
             <input 
               value={subject} 
               onChange={(e) => setSubject(e.target.value)}
               className="w-full text-sm font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-forest focus:outline-none dark:text-white" 
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notice Content (Click to Edit)</label>
             <textarea 
               rows={10}
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className="w-full text-xs p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl resize-none text-slate-600 dark:text-slate-200 leading-relaxed focus:ring-2 focus:ring-brand-forest focus:outline-none"
             />
           </div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={handleSend}
            disabled={status !== 'idle'}
            className="w-full py-4 bg-brand-forest text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-forest/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {status === 'idle' && <><Send size={20} /> Deploy Takedown Notice</>}
            {status === 'sending' && <><RefreshCw size={20} className="animate-spin" /> Finalizing & Dispatching...</>}
            {status === 'success' && <><CheckCircle size={20} /> Notice Successfully Dispatched</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
