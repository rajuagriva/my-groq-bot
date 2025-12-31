"use client";

import React, { useEffect, useState, useCallback } from 'react';

// Types
interface TotalUsage {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    totalRequests: number;
    totalUsers: number;
}

interface UserSummary {
    userId: string;
    userName: string;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    requestCount: number;
    lastUsed: string;
}

interface DailyUsage {
    date: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
}

interface PersonaUsage {
    persona: string;
    totalTokens: number;
    requestCount: number;
}

interface HourlyUsage {
    hour: number;
    requestCount: number;
    totalTokens: number;
}

interface AdminData {
    total: TotalUsage;
    users: UserSummary[];
    daily: DailyUsage[];
    persona: PersonaUsage[];
    hourly: HourlyUsage[];
}

// Simple Bar Chart Component
function BarChart({
    data,
    labelKey,
    valueKey,
    title,
    color = '#f0a14c',
    height = 200
}: {
    data: Record<string, unknown>[];
    labelKey: string;
    valueKey: string;
    title: string;
    color?: string;
    height?: number;
}) {
    const maxValue = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);

    return (
        <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-[#1b150d] dark:text-white mb-4">{title}</h3>
            <div className="flex items-end gap-1" style={{ height }}>
                {data.map((item, index) => {
                    const value = Number(item[valueKey]) || 0;
                    const barHeight = (value / maxValue) * 100;
                    const label = String(item[labelKey]);

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#1b150d] text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                {value.toLocaleString()} tokens
                            </div>
                            {/* Bar */}
                            <div
                                className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                                style={{
                                    height: `${barHeight}%`,
                                    backgroundColor: color,
                                    minHeight: value > 0 ? '4px' : '0'
                                }}
                            />
                            {/* Label */}
                            <span className="text-[10px] text-[#1b150d]/60 dark:text-white/60 truncate w-full text-center">
                                {label.length > 3 ? label.slice(-2) : label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Line Chart Component for Daily Usage
function LineChart({
    data,
    title
}: {
    data: DailyUsage[];
    title: string;
}) {
    const maxTokens = Math.max(...data.map(d => d.totalTokens), 1);
    const maxRequests = Math.max(...data.map(d => d.requestCount), 1);

    const points = data.map((d, i) => ({
        x: (i / (data.length - 1 || 1)) * 100,
        yTokens: 100 - (d.totalTokens / maxTokens) * 100,
        yRequests: 100 - (d.requestCount / maxRequests) * 100,
        date: d.date,
        tokens: d.totalTokens,
        requests: d.requestCount,
    }));

    const tokenPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yTokens}`).join(' ');
    const requestPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yRequests}`).join(' ');

    return (
        <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-[#1b150d] dark:text-white mb-4">{title}</h3>
            <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-1 rounded bg-[#f0a14c]"></div>
                    <span className="text-[#1b150d]/70 dark:text-white/70">Total Token</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-1 rounded bg-[#6366f1]"></div>
                    <span className="text-[#1b150d]/70 dark:text-white/70">Request</span>
                </div>
            </div>
            <div className="relative h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                    ))}
                    {/* Token line */}
                    <path d={tokenPath} fill="none" stroke="#f0a14c" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    {/* Request line */}
                    <path d={requestPath} fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    {/* Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.yTokens} r="1.5" fill="#f0a14c" />
                            <circle cx={p.x} cy={p.yRequests} r="1.5" fill="#6366f1" />
                        </g>
                    ))}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 text-[10px] text-[#1b150d]/50 dark:text-white/50">
                    <span>{data[0]?.date.slice(5)}</span>
                    <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
                    <span>{data[data.length - 1]?.date.slice(5)}</span>
                </div>
            </div>
        </div>
    );
}

// Donut Chart for Persona Distribution
function DonutChart({
    data,
    title
}: {
    data: PersonaUsage[];
    title: string;
}) {
    const total = data.reduce((sum, d) => sum + d.totalTokens, 0) || 1;
    const colors = ['#f0a14c', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'];

    let currentAngle = 0;
    const segments = data.map((d, i) => {
        const angle = (d.totalTokens / total) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        return {
            ...d,
            startAngle,
            endAngle: currentAngle,
            color: colors[i % colors.length],
            percentage: ((d.totalTokens / total) * 100).toFixed(1),
        };
    });

    const polarToCartesian = (angle: number, radius: number) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        return {
            x: 50 + radius * Math.cos(rad),
            y: 50 + radius * Math.sin(rad),
        };
    };

    const describeArc = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
        const start1 = polarToCartesian(endAngle, outerR);
        const end1 = polarToCartesian(startAngle, outerR);
        const start2 = polarToCartesian(startAngle, innerR);
        const end2 = polarToCartesian(endAngle, innerR);
        const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            'M', start1.x, start1.y,
            'A', outerR, outerR, 0, largeArc, 0, end1.x, end1.y,
            'L', start2.x, start2.y,
            'A', innerR, innerR, 0, largeArc, 1, end2.x, end2.y,
            'Z'
        ].join(' ');
    };

    return (
        <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-[#1b150d] dark:text-white mb-4">{title}</h3>
            <div className="flex items-center gap-6">
                <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {segments.map((seg, i) => (
                            <path
                                key={i}
                                d={describeArc(seg.startAngle, seg.endAngle - 0.5, 25, 45)}
                                fill={seg.color}
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#1b150d] dark:text-white">
                            {total.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {segments.slice(0, 5).map((seg, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                            <span className="text-sm text-[#1b150d]/80 dark:text-white/80 flex-1 truncate">
                                {seg.persona}
                            </span>
                            <span className="text-sm font-medium text-[#1b150d] dark:text-white">
                                {seg.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

    return (
        <div className="bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/20 hover:border-[#f0a14c]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#f0a14c]/10">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#f0a14c]/20 rounded-xl">
                    <span className="material-symbols-outlined text-2xl text-[#f0a14c]">{icon}</span>
                </div>
                {trend && (
                    <span className={`material-symbols-outlined text-lg ${trendColor}`}>
                        {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-medium text-[#1b150d]/60 dark:text-white/60 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-[#1b150d] dark:text-white mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
                <p className="text-xs text-[#1b150d]/50 dark:text-white/50">{subtitle}</p>
            )}
        </div>
    );
}

// User Table Component
function UserTable({ users }: { users: UserSummary[] }) {
    return (
        <div className="bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-[#1b150d] dark:text-white">Penggunaan Per User</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">User</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">Total Token</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">Prompt</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">Completion</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">Request</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-[#1b150d]/60 dark:text-white/60">Terakhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-[#1b150d]/50 dark:text-white/50">
                                    Belum ada data penggunaan
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f0a14c] to-[#e8923a] flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-[#1b150d] dark:text-white">{user.userName}</span>
                                        </div>
                                    </td>
                                    <td className="text-right px-6 py-4 font-semibold text-[#1b150d] dark:text-white">
                                        {user.totalTokens.toLocaleString()}
                                    </td>
                                    <td className="text-right px-6 py-4 text-[#1b150d]/70 dark:text-white/70">
                                        {user.totalPromptTokens.toLocaleString()}
                                    </td>
                                    <td className="text-right px-6 py-4 text-[#1b150d]/70 dark:text-white/70">
                                        {user.totalCompletionTokens.toLocaleString()}
                                    </td>
                                    <td className="text-right px-6 py-4 text-[#1b150d]/70 dark:text-white/70">
                                        {user.requestCount}
                                    </td>
                                    <td className="text-right px-6 py-4 text-[#1b150d]/50 dark:text-white/50 text-sm">
                                        {new Date(user.lastUsed).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/token-usage?type=all&days=30');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#fef4e8] to-[#fde6c8] dark:from-[#1a1410] dark:to-[#2d241c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#f0a14c] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#1b150d]/70 dark:text-white/70">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fef4e8] via-[#fdf0dc] to-[#fde6c8] dark:from-[#1a1410] dark:via-[#221a14] dark:to-[#2d241c]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a1410]/80 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <span className="material-symbols-outlined text-[#1b150d] dark:text-white">arrow_back</span>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-[#1b150d] dark:text-white">Admin Dashboard</h1>
                                <p className="text-sm text-[#1b150d]/60 dark:text-white/60">Monitor penggunaan token AI</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchData}
                                className="flex items-center gap-2 px-4 py-2 bg-[#f0a14c]/10 hover:bg-[#f0a14c]/20 text-[#f0a14c] rounded-xl transition-colors"
                            >
                                <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
                                <span className="font-medium">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex gap-2 bg-white/30 dark:bg-white/5 rounded-2xl p-1.5 w-fit">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'dashboard' },
                        { id: 'users', label: 'Users', icon: 'group' },
                        { id: 'analytics', label: 'Analytics', icon: 'analytics' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-[#f0a14c] text-white shadow-lg shadow-[#f0a14c]/30'
                                    : 'text-[#1b150d]/70 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/10'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 pb-12">
                {error && (
                    <div className="mb-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && data && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard
                                title="Total Token"
                                value={data.total.totalTokens}
                                subtitle="Semua waktu"
                                icon="token"
                                trend="up"
                            />
                            <StatCard
                                title="Prompt Token"
                                value={data.total.totalPromptTokens}
                                subtitle="Input ke AI"
                                icon="input"
                            />
                            <StatCard
                                title="Completion Token"
                                value={data.total.totalCompletionTokens}
                                subtitle="Output dari AI"
                                icon="output"
                            />
                            <StatCard
                                title="Total Request"
                                value={data.total.totalRequests}
                                subtitle="Pesan terkirim"
                                icon="chat"
                            />
                            <StatCard
                                title="Total User"
                                value={data.total.totalUsers}
                                subtitle="Pengguna aktif"
                                icon="group"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <LineChart
                                data={data.daily}
                                title="Penggunaan 30 Hari Terakhir"
                            />
                            <DonutChart
                                data={data.persona}
                                title="Distribusi Persona"
                            />
                        </div>

                        {/* Hourly Distribution */}
                        <BarChart
                            data={data.hourly as unknown as Record<string, unknown>[]}
                            labelKey="hour"
                            valueKey="totalTokens"
                            title="Distribusi Token per Jam (24H)"
                            height={150}
                        />
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && data && (
                    <div className="space-y-6">
                        {/* Top Users Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {data.users.slice(0, 3).map((user, index) => (
                                <div key={user.userId} className="bg-gradient-to-br from-white/30 to-white/10 dark:from-white/10 dark:to-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                    'bg-gradient-to-br from-amber-600 to-amber-800'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#1b150d] dark:text-white">{user.userName}</h3>
                                            <p className="text-sm text-[#1b150d]/60 dark:text-white/60">{user.requestCount} request</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-[#f0a14c]">
                                        {user.totalTokens.toLocaleString()}
                                        <span className="text-sm font-normal text-[#1b150d]/50 dark:text-white/50 ml-2">token</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Users Table */}
                        <UserTable users={data.users} />
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && data && (
                    <div className="space-y-6">
                        {/* Detailed Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <LineChart
                                data={data.daily}
                                title="Trend Penggunaan Token"
                            />
                            <BarChart
                                data={data.daily.slice(-14) as unknown as Record<string, unknown>[]}
                                labelKey="date"
                                valueKey="requestCount"
                                title="Request 14 Hari Terakhir"
                                color="#6366f1"
                                height={180}
                            />
                        </div>

                        {/* Persona and Hourly Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DonutChart
                                data={data.persona}
                                title="Penggunaan per Persona"
                            />
                            <BarChart
                                data={data.hourly as unknown as Record<string, unknown>[]}
                                labelKey="hour"
                                valueKey="requestCount"
                                title="Request per Jam"
                                color="#10b981"
                                height={180}
                            />
                        </div>

                        {/* Token Breakdown */}
                        <div className="bg-white/10 dark:bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-[#1b150d] dark:text-white mb-4">Breakdown Token</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#1b150d]/70 dark:text-white/70">Prompt Token</span>
                                        <span className="font-bold text-[#1b150d] dark:text-white">
                                            {data.total.totalPromptTokens.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#f0a14c] to-[#e8923a] rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(data.total.totalPromptTokens / (data.total.totalTokens || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[#1b150d]/70 dark:text-white/70">Completion Token</span>
                                        <span className="font-bold text-[#1b150d] dark:text-white">
                                            {data.total.totalCompletionTokens.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5] rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(data.total.totalCompletionTokens / (data.total.totalTokens || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
