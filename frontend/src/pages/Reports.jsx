import React from 'react'
import { FileText, Download, TrendingUp, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

const data = [
    { name: 'Jan', revenue: 4000, takedowns: 24 },
    { name: 'Feb', revenue: 3000, takedowns: 13 },
    { name: 'Mar', revenue: 2000, takedowns: 98 },
    { name: 'Apr', revenue: 2780, takedowns: 39 },
    { name: 'May', revenue: 1890, takedowns: 48 },
    { name: 'Jun', revenue: 2390, takedowns: 38 },
    { name: 'Jul', revenue: 3490, takedowns: 43 },
]

export default function Reports() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <FileText className="text-brand-gold" />
                        Reporting & Insights
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track the impact of your brand protection efforts.</p>
                </div>
                <button className="btn-outline flex items-center gap-2">
                    <Download size={18} /> Export PDF Report
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue Protected"
                    value="$124,500"
                    desc="Estimated based on removed listings"
                    icon={<TrendingUp className="text-green-500" />}
                    trend="+12%"
                />
                <StatCard
                    title="Takedowns Completed"
                    value="486"
                    desc="Listings successfully removed"
                    icon={<CheckCircle className="text-blue-500" />}
                    trend="+54"
                />
                <StatCard
                    title="Success Rate"
                    value="94.2%"
                    desc="Takedowns vs Notices Sent"
                    icon={<AlertCircle className="text-brand-gold" />}
                    trend="+1.2%"
                />
                <StatCard
                    title="Total Copies Detected"
                    value="1,204"
                    desc="Across all monitored channels"
                    icon={<XCircle className="text-red-500" />}
                    trend="-8%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">

                {/* Impact Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Takedown Impact Over Time</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTakedowns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Est. Revenue ($)" />
                                <Area type="monotone" dataKey="takedowns" stroke="#82ca9d" fillOpacity={1} fill="url(#colorTakedowns)" name="Takedowns" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown by Platform */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Infringements by Platform</h3>
                        <select className="text-sm border-none bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                            <option>Last 30 Days</option>
                            <option>All Time</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <PlatformBar name="Shopify Stores" count={124} total={480} color="bg-green-500" />
                        <PlatformBar name="AliExpress" count={89} total={480} color="bg-orange-500" />
                        <PlatformBar name="Etsy" count={65} total={480} color="bg-orange-600" />
                        <PlatformBar name="Amazon" count={42} total={480} color="bg-slate-800" />
                        <PlatformBar name="Social Media" count={150} total={480} color="bg-blue-500" />
                    </div>
                </div>

            </div>

            {/* Generated Reports List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">Recent Reports</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">Monthly Enforcement - Oct 2023</div>
                                    <div className="text-xs text-slate-500">Generated on Nov 1, 2023 • PDF • 2.4 MB</div>
                                </div>
                            </div>
                            <button className="text-brand-navy hover:text-brand-gold p-2">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

function StatCard({ title, value, desc, icon, trend }) {
    const isPositive = trend.includes('+')
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500">{title}</div>
            <div className="text-xs text-slate-600 mt-2">{desc}</div>
        </div>
    )
}

function PlatformBar({ name, count, total, color }) {
    const width = (count / total) * 100
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                <span className="font-bold">{count}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${width}%` }}></div>
            </div>
        </div>
    )
}
