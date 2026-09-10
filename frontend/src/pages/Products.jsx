import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle2, Mail, X, ShieldCheck, Upload, ExternalLink, Send, FileText, Image as ImageIcon, Edit, Trash2, Plus, Grid, Layers } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Products() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Added this state

  // Tab State
  const [activeTab, setActiveTab] = useState('scanner') // 'scanner' or 'catalog'
  const [catalogProducts, setCatalogProducts] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  
  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false)
  const [importType, setImportType] = useState('shopify') // 'shopify' or 'woocommerce'
  const [storeUrl, setStoreUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [importing, setImporting] = useState(false)

  // Manual Add Product state
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualSku, setManualSku] = useState('')
  const [manualImage, setManualImage] = useState('')
  const [manualPriority, setManualPriority] = useState('medium')
  const [addingManual, setAddingManual] = useState(false)

  useEffect(() => {
    fetchCatalogProducts()
  }, [])

  const fetchCatalogProducts = async () => {
    try {
      setLoadingCatalog(true)
      const res = await api.get('/api/products')
      if (res.data?.status === 'success') {
        setCatalogProducts(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load products')
    } finally {
      setLoadingCatalog(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to remove this product from protection?')) return
    try {
      const res = await api.delete(`/api/products/${id}`)
      if (res.data?.status === 'success') {
        toast.success(res.data.message || 'Product removed from protection')
        setCatalogProducts(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete product')
    }
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()
    if (!storeUrl) return
    try {
      setImporting(true)
      const endpoint = importType === 'shopify' ? '/api/imports/shopify' : '/api/imports/woocommerce'
      const payload = importType === 'shopify' 
        ? { storeUrl, apiKey } 
        : { storeUrl, consumerKey: apiKey, consumerSecret: apiSecret }
      
      const res = await api.post(endpoint, payload)
      if (res.data?.status === 'success') {
        toast.success(res.data.message)
        setShowImportModal(false)
        setStoreUrl('')
        setApiKey('')
        setApiSecret('')
        fetchCatalogProducts()
        setActiveTab('catalog')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualName || !manualImage) return toast.error('Please enter name and image URL')
    try {
      setAddingManual(true)
      const res = await api.post('/api/products', {
        name: manualName,
        sku: manualSku,
        primary_image_url: manualImage,
        priority: manualPriority
      })
      if (res.data?.status === 'success') {
        toast.success('Product added successfully!')
        setShowManualModal(false)
        setManualName('')
        setManualSku('')
        setManualImage('')
        setManualPriority('medium')
        fetchCatalogProducts()
        setActiveTab('catalog')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setAddingManual(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
      
      // Auto-trigger search
      await triggerSearch(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    disabled: isLoading
  });

  const triggerSearch = async (fileToUpload) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', fileToUpload);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;
      if (data.error) throw new Error(data.error);
      
      setResults({
        exact: data.exactMatches || [],
        similar: data.similarMatches || [],
        matching_websites: data.matching_websites || []
      });
      setScanTime(data.scan_duration || 'N/A');
    } catch (err) {
      setError(err.message || 'Error uploading image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowNotice = (email, matchObj) => {
    const domain = new URL(matchObj.url).hostname;
    setSelectedNotice(matchObj);
    setEditableEmail(email || '');
    setEditableContent(
`Dear Sir/Madam,

I hope this message finds you well.

I am writing to inform you that an image owned by me has been identified on your website without my permission. The image is my original work, and its usage on your platform appears to be unauthorized.

**Details of the issue:**

* Website URL: ${matchObj.url}
* Original Image Owner: [Your Name / Company Name]
* Proof of Ownership: [Evidence Case ID: ${matchObj.id}]

I kindly request you to remove the image from your website at the earliest or provide proper authorization/credit if applicable.

Please treat this as an urgent matter related to intellectual property rights. I would appreciate your cooperation in resolving this issue promptly.

If the image is not removed within a reasonable timeframe, I may be required to take further action.

Thank you for your understanding and cooperation.

Sincerely,
[Your Full Name]
[Your Contact Information]
[Your Email Address]`
    );
    setIsEditing(false); // Reset editing state
    setIsModalOpen(true);
  };

  const handleSendNotice = async () => {
    if (!selectedNotice) return;
    setIsSending(true);

    try {
      const payload = {
        email: editableEmail,
        website_url: selectedNotice.url,
        original_image_url: selectedImage,
        copied_image_url: selectedNotice.copied_image_url || selectedNotice.thumbnail,
        content: editableContent
      };

      const res = await api.post('/api/notices', payload);
      if (res.data.error) throw new Error(res.data.error);

      // Update UI status locally
      setResults(prev => ({
          ...prev,
          exact: prev.exact.map(m => m.url === selectedNotice.url ? { ...m, status: 'Sent' } : m)
      }));

      setIsModalOpen(false);
      alert('Copyright Notice issued successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex font-['Inter',sans-serif] text-slate-800 selection:bg-indigo-100 w-full pb-20">
      {/* Main Experience Content - Centered and full width */}
      <div className="flex-1 p-6 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Design & Product Registry</h1>
              <p className="text-slate-500 font-medium mt-1">Scan design files for copy detection or manage your active product catalog.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[20px] self-start md:self-auto">
              <button
                onClick={() => setActiveTab('scanner')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search size={14} />
                Visual Scanner
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid size={14} />
                Protected Catalog ({catalogProducts.length})
              </button>
            </div>
          </div>

          {activeTab === 'scanner' ? (
            /* TAB 1: VISUAL SCANNER */
            <>
              {!results && !isLoading ? (
                <div 
                  {...getRootProps()} 
                  className={`
                    mt-4 group cursor-pointer transition-all duration-500
                    bg-white border-4 border-dashed rounded-[64px] p-24 text-center
                    shadow-[0_40px_80px_-40px_rgba(79,70,229,0.1)]
                    ${isDragActive ? 'border-indigo-600 bg-indigo-50/50 scale-[1.02]' : 'border-slate-100 hover:border-indigo-400'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="w-32 h-32 bg-indigo-50 rounded-[48px] flex items-center justify-center mx-auto mb-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-xl shadow-indigo-100">
                    <Upload className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Your Design. Protected.</h2>
                  <p className="text-slate-400 text-xl font-medium mb-16 leading-relaxed max-w-lg mx-auto">
                    {isDragActive ? 'Drop your design here to begin' : 'Drag and drop your design here, or click to browse'}
                  </p>
                  <div className="bg-indigo-600 text-white px-16 py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-300 cursor-pointer hover:bg-slate-900 transition-all hover:-translate-y-2 inline-block">
                    Choose Creative Asset
                  </div>
                </div>
              ) : isLoading ? (
                <div className="bg-white rounded-[64px] p-24 text-center border border-slate-100 shadow-2xl mb-16 animate-pulse mt-4">
                  <div className="w-24 h-24 border-8 border-slate-50 border-t-indigo-600 rounded-full animate-spin mx-auto mb-10 shadow-lg"></div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Neural Web Scan Active</h3>
                  <p className="text-slate-400 text-lg font-medium">Cross-referencing your design against 500M+ e-commerce images...</p>
                </div>
              ) : results ? (
                <div className="animate-in fade-in slide-in-from-bottom-10 shadow-2xl shadow-indigo-50/20 duration-1000 mt-4">
                  {/* Reset/Upload New Header */}
                  <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-md">
                        <img src={selectedImage} alt="Scanned" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-xl tracking-tight">Active Scan Analysis</h3>
                        <p className="text-slate-400 font-medium">Verified original design asset</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setResults(null); setSelectedImage(null); }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Scan New Design
                    </button>
                  </div>

                  {/* Industry Stats Cluster */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-slate-50 p-3.5 rounded-2xl text-slate-400"><Search className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Scan Performance Metrics</span>
                      </div>
                      <div className="text-5xl font-black text-slate-900 tracking-tighter">
                        {scanTime}
                        <span className="text-sm font-bold ml-2 text-slate-200 uppercase tracking-widest">Processing Time</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-10 rounded-[48px] border-b-4 border-rose-500 shadow-xl shadow-rose-50/30">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-600"><ShieldCheck className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">High Risk Flags</span>
                      </div>
                      <div className="text-5xl font-black text-rose-600 tracking-tighter">
                        {results.exact.length}
                        <span className="text-sm font-bold ml-2 text-rose-200">EXACT</span>
                        <span className="text-2xl font-black mx-2 text-slate-100">/</span>
                        <span className="text-3xl text-indigo-400">{results.similar.length}</span>
                        <span className="text-xs font-bold ml-2 text-indigo-100 uppercase tracking-widest">Similar</span>
                      </div>
                    </div>
                  </div>

                  {/* Exact Matches (100%) */}
                  <div className="mb-20">
                    <div className="flex items-center gap-6 mb-12">
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-4 border-l-4 border-rose-600 pl-6 uppercase tracking-[0.15em]">
                        Exact Matches (100%) ({results.exact.length})
                      </h2>
                      <div className="h-0.5 flex-1 bg-slate-50 rounded-full"></div>
                    </div>

                    {results.exact.length === 0 ? (
                      <div className="bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-slate-100 shadow-inner">
                        <CheckCircle2 className="w-16 h-16 text-emerald-100 mx-auto mb-6" />
                        <h4 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-tight">Zero Exact Duplicates Detected</h4>
                        <p className="text-slate-600 font-medium italic">Your original asset hash is unique across identified retail endpoints.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {results.exact.map((match, i) => (
                          <MatchCard key={`exact-${i}`} match={match} index={i} isExact={true} selectedImage={selectedImage} onNotice={handleShowNotice} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Similar Matches (70%+) */}
                  <div className="mb-20">
                    <div className="flex items-center gap-6 mb-12">
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-4 border-l-4 border-indigo-600 pl-6 uppercase tracking-[0.15em]">
                        Similar Designs ({results.similar.length})
                      </h2>
                      <div className="h-0.5 flex-1 bg-slate-50 rounded-full"></div>
                    </div>

                    {results.similar.length === 0 ? (
                      <div className="bg-white rounded-[48px] p-20 text-center border border-slate-100">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No similar variations found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {results.similar.map((match, i) => (
                          <MatchCard key={`similar-${i}`} match={match} index={i} isExact={false} selectedImage={selectedImage} onNotice={handleShowNotice} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] mt-12 flex items-center gap-6 animate-in zoom-in duration-300">
                  <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-200"><AlertCircle className="text-white w-6 h-6" /></div>
                  <div>
                    <span className="block text-rose-900 font-black text-lg">Detection Process Interrupted</span>
                    <span className="block text-rose-400 font-medium">{error}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: PROTECTED CATALOG */
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg">Protected Assets Directory</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Designs registered in this catalog are scanned automatically by our background crawlers.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowManualModal(true)}
                    className="flex-1 sm:flex-initial flex items-center gap-1.5 justify-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Plus size={14} />
                    Add Manual
                  </button>
                  <button
                    onClick={() => { setImportType('shopify'); setShowImportModal(true); }}
                    className="flex-1 sm:flex-initial flex items-center gap-1.5 justify-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-xl bg-brand-forest/10 hover:bg-brand-forest/20 text-brand-forest dark:text-brand-gold dark:bg-brand-gold/10 dark:hover:bg-brand-gold/20 transition-colors"
                  >
                    <Layers size={14} />
                    Shopify Import
                  </button>
                  <button
                    onClick={() => { setImportType('woocommerce'); setShowImportModal(true); }}
                    className="flex-1 sm:flex-initial flex items-center gap-1.5 justify-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    <Layers size={14} />
                    WooCommerce
                  </button>
                </div>
              </div>

              {/* Grid List */}
              {loadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="animate-spin text-brand-forest h-8 w-8" />
                  <p className="text-slate-500 text-sm">Loading protected catalog...</p>
                </div>
              ) : catalogProducts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-20 text-center shadow-sm space-y-6">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                    <ImageIcon size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">No Designs Cataloged Yet</h4>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Build your protected collection by adding designs manually, uploading files, or connecting store importers.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button onClick={() => setShowManualModal(true)} className="btn-primary">Add Your First Product</button>
                    <button onClick={() => { setImportType('shopify'); setShowImportModal(true); }} className="btn-outline">Connect Shopify</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catalogProducts.map(product => (
                    <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                      {/* Product Image */}
                      <div className="aspect-[4/5] bg-slate-50 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                        <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold shadow border border-slate-100/50 dark:border-slate-800 uppercase tracking-wider">
                          {product.sku || 'No SKU'}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base line-clamp-1">{product.name}</h4>
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                            product.priority === 'high' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' 
                              : product.priority === 'medium'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                              : 'bg-slate-100 text-slate-750 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {product.priority} priority
                          </span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Monitoring
                          </span>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 rounded-lg text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Remove design"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Shopify / WooCommerce Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowImportModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl relative p-8 border border-slate-200 dark:border-slate-850">
            <button onClick={() => setShowImportModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Layers className="text-brand-forest dark:text-brand-gold" size={24} />
              Import from {importType === 'shopify' ? 'Shopify' : 'WooCommerce'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Connect your online storefront. We'll automatically fetch product details and reference images to add them to your protected catalog.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Store URL</label>
                <input
                  type="url"
                  placeholder={importType === 'shopify' ? 'https://mystore.myshopify.com' : 'https://mystore.com'}
                  value={storeUrl}
                  onChange={e => setStoreUrl(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  {importType === 'shopify' ? 'Shopify API Access Token' : 'WooCommerce Consumer Key'}
                </label>
                <input
                  type="password"
                  placeholder={importType === 'shopify' ? 'shpat_xxxxxxxxxxxxxxxx' : 'ck_xxxxxxxxxxxxxxxx'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {importType === 'woocommerce' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">WooCommerce Consumer Secret</label>
                  <input
                    type="password"
                    placeholder="cs_xxxxxxxxxxxxxxxx"
                    value={apiSecret}
                    onChange={e => setApiSecret(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert size={14} />
                  Simulation Mode Active
                </p>
                <p className="opacity-90">To test locally without active merchant keys, type any store URL and click Import to run a simulated load.</p>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn-outline flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Connect & Import"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Product Add Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowManualModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl relative p-8 border border-slate-200 dark:border-slate-850">
            <button onClick={() => setShowManualModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Plus className="text-brand-forest dark:text-brand-gold" size={24} />
              Add Design Manually
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Register a proprietary design to active copyright scanning by supplying its name and reference image URL.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Design Name</label>
                <input
                  type="text"
                  placeholder="Floral Embroidered Saree"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="SAR-009"
                    value={manualSku}
                    onChange={e => setManualSku(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                  <select
                    value={manualPriority}
                    onChange={e => setManualPriority(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or any web link"
                  value={manualImage}
                  onChange={e => setManualImage(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="btn-outline flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingManual}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {addingManual ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Register Design"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {isModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[64px] w-full max-w-6xl shadow-[0_80px_100px_-20px_rgba(0,0,0,0.2)] relative flex flex-col md:flex-row overflow-hidden max-h-[95vh] border-8 border-white/20">
            {/* Visual Evidence */}
            <div className="md:w-2/5 bg-slate-50 p-12 flex flex-col border-r border-slate-100">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Evidence Package</h3>
              
              <div className="space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest pl-2">Original</span>
                    <span className="text-[10px] font-bold text-slate-500">AUTHENTIC DESIGN</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl ring-4 ring-white border-2 border-slate-100">
                    <img src={selectedImage} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-[11px] font-black text-rose-600 uppercase tracking-widest pl-2">Detected</span>
                    <span className="text-[10px] font-bold text-slate-500">{selectedNotice.similarity_score}% SIMILARITY</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl ring-4 ring-white border-2 border-slate-100">
                    <img src={selectedNotice.copied_image_url || selectedNotice.thumbnail} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="md:w-3/5 p-16 flex flex-col bg-white overflow-hidden">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-3 text-slate-300 hover:text-slate-900 transition-all active:scale-95">
                 <X className="w-8 h-8" />
               </button>

               <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em]">Direct Infringement Case</span>
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4">
                    Takedown Action: {new URL(selectedNotice.url).hostname.replace('www.', '')}
                  </h3>
               </div>

               <div className="flex-1 overflow-y-auto pr-8 custom-scrollbar">
                  <div className="bg-slate-50 p-12 rounded-[56px] border border-slate-100 mb-8 shadow-inner shadow-slate-100/50">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                         <Mail className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Target Contact Email</label>
                        <input 
                          type="email" 
                          value={editableEmail}
                          onChange={(e) => setEditableEmail(e.target.value)}
                          readOnly={!isEditing}
                          className={`w-full bg-transparent border-none p-0 focus:ring-0 outline-none font-black text-2xl text-slate-900 placeholder:text-slate-200 ${isEditing ? '' : 'cursor-not-allowed'}`}
                          placeholder="legal@marketplace.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Formal Notice Draft</label>
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-600 hover:text-indigo-600'}`}
                        >
                          {isEditing ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                          {isEditing ? 'Lock Draft' : 'Edit Notice'}
                        </button>
                      </div>
                      <textarea 
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        readOnly={!isEditing}
                        className={`w-full bg-white border p-8 rounded-[40px] h-72 outline-none transition-all font-medium text-slate-600 shadow-inner resize-none text-sm leading-relaxed ${isEditing ? 'border-indigo-200 focus:ring-8 focus:ring-indigo-50' : 'border-slate-50 cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-10 flex items-center gap-8">
                  <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-slate-500 font-black uppercase text-[11px] tracking-[0.2em] hover:text-slate-900 transition-colors">Discard Case</button>
                  <button 
                    onClick={handleSendNotice}
                    disabled={isSending}
                    className="flex-1 bg-indigo-600 text-white px-16 py-7 rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSending ? 'Transmitting Notice...' : 'Approve & Send Notice'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Lite Match Card Component
function MatchCard({ match, index, onNotice, isExact, selectedImage }) {
  const domain = match.brand_name || new URL(match.url).hostname.replace('www.', '');
  
  return (
    <div className="flex flex-col bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group relative">
      <div className="p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm tracking-tighter ${isExact ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600 shadow-inner'}`}>
              #{index + 1}
            </div>
            <div>
              <span className="block font-black text-slate-900 text-lg tracking-tighter leading-tight uppercase truncate max-w-[120px]">{domain}</span>
              <span className={`block text-[9px] font-black uppercase tracking-[0.3em] ${isExact ? 'text-rose-400' : 'text-slate-300'}`}>{isExact ? "Unauthorized" : "Inspired"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className={`text-[11px] font-black tracking-widest uppercase ${isExact ? 'text-rose-600' : 'text-indigo-400'}`}>
                {isExact ? '100% EXACT MATCH' : `${Math.round(match.similarity_score)}% SIMILAR DESIGN`}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-5 mb-10">
           <div className="flex-1 aspect-[4/5] rounded-[36px] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-[1.04] transition-all duration-700 relative">
             <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-700"></div>
             <div className="absolute top-3 left-3 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/40">Reference</div>
           </div>
           
           <div className="flex-1 aspect-[4/5] rounded-[36px] overflow-hidden bg-white border border-slate-100 shadow-inner group-hover:scale-[1.04] transition-all duration-700 relative">
             {match.copied_image_url || match.thumbnail ? (
               <img src={match.copied_image_url || match.thumbnail} alt="Copy" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-200">
                  <ShieldCheck className="w-10 h-10 opacity-20 mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Scan Only</span>
               </div>
             )}
             <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg ${isExact ? 'bg-rose-600' : 'bg-slate-900'}`}>Evidence</div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50/60 p-5 rounded-[28px] border border-slate-100/50 shadow-inner overflow-hidden">
            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 pl-2">Platform URL</span>
            <div className="flex items-center gap-3">
              <a href={match.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 text-[12px] font-bold truncate flex-1 transition-all">
                {match.url}
              </a>
              <ExternalLink className="w-4 h-4 text-slate-200" />
            </div>
          </div>

          <button 
            onClick={() => onNotice(match.emails?.[0]?.email || '', match)}
            className={`w-full py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] ${
              isExact 
                ? 'bg-slate-900 hover:bg-rose-600 text-white shadow-2xl shadow-slate-200' 
                : 'bg-white border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-500'
            }`}
          >
            <FileText className="w-5 h-5" /> 
            {match.emails && match.emails.length > 0 ? "Edit & Dispatch Notice" : "Edit & Verify Case"}
          </button>
        </div>
      </div>
    </div>
  );
}
