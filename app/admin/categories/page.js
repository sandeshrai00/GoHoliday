'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCategories() {
    const router = useRouter()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [newCategory, setNewCategory] = useState({
        name: '', name_en: '', name_th: '', name_zh: '', slug: ''
    })

    useEffect(() => { fetchCategories() }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (res.ok) setCategories(await res.json())
        } catch (err) {
            console.error('Error fetching categories:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setActionLoading(true)
        setError('')

        // Auto generate slug if empty
        let payload = { ...newCategory }
        if (!payload.slug) {
            payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (res.ok) {
                setCategories([data.category, ...categories])
                setNewCategory({ name: '', name_en: '', name_th: '', name_zh: '', slug: '' })
                router.refresh()
            } else {
                setError(data.error || 'Failed to create category')
            }
        } catch (err) {
            setError('An error occurred during creation.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the "${name}" category? This will remove the tag from all associated tours.`)) return

        setActionLoading(true)
        try {
            const res = await fetch('/api/categories/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id))
                router.refresh()
            } else {
                alert('Failed to delete category')
            }
        } catch (err) {
            alert('An error occurred.')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tighter">
                    Category <span className="text-slate-400">Library</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Manage Tour Tags & Classifications</p>
            </div>

            {/* Create Form */}
            <div className="bg-white border border-slate-200">
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Create New Element</h2>
                </div>
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">Internal Name / Base Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black font-bold text-sm outline-none"
                                    placeholder="e.g. Honeymoon"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">URL Slug (Optional)</label>
                                <input
                                    type="text"
                                    value={newCategory.slug}
                                    onChange={e => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black font-bold text-sm outline-none font-mono"
                                    placeholder="e.g. honeymoon-packages"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">English Translation</label>
                                <input
                                    type="text"
                                    value={newCategory.name_en}
                                    onChange={e => setNewCategory({ ...newCategory, name_en: e.target.value })}
                                    className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black font-bold text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">Thai Translation</label>
                                <input
                                    type="text"
                                    value={newCategory.name_th}
                                    onChange={e => setNewCategory({ ...newCategory, name_th: e.target.value })}
                                    className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black font-bold text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3">Chinese Translation</label>
                                <input
                                    type="text"
                                    value={newCategory.name_zh}
                                    onChange={e => setNewCategory({ ...newCategory, name_zh: e.target.value })}
                                    className="w-full px-5 py-4 bg-transparent border border-slate-200 focus:border-black font-bold text-sm outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="bg-black text-white px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50"
                        >
                            {actionLoading ? 'Saving...' : '+ Add Category'}
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200">
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active Categories</h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-bold">Loading...</div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold">No categories exist yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <div key={cat.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-black text-black uppercase tracking-tighter">{cat.name}</h3>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-mono leading-none rounded-sm">
                                            /{cat.slug}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-bold text-slate-400">
                                        {cat.name_en && <span>EN: {cat.name_en}</span>}
                                        {cat.name_th && <span>TH: {cat.name_th}</span>}
                                        {cat.name_zh && <span>ZH: {cat.name_zh}</span>}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        disabled={actionLoading}
                                        className="w-10 h-10 border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center -rotate-45"
                                        title="Delete Category"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
