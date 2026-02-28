'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function AdminHeader({ title, onMenuClick }) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Quick Search - Premium Profile */}
                <div className="hidden md:flex relative group">
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-10 pr-4 py-2 bg-slate-100/70 border border-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium outline-none w-56 focus:w-72 text-slate-800 placeholder-slate-400"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Profile / Quick Actions */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200 h-9">
                    <div className="text-right hidden sm:block pr-2">
                        <div className="text-sm font-bold text-slate-900 leading-tight">Admin User</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">System Manager</div>
                    </div>
                </div>
            </div>
        </header>
    )
}
