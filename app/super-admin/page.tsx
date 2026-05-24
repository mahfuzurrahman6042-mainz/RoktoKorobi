'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Users, Heart, Phone, Menu, X, Globe, User, LogOut, Plus, Star, Droplet, Shield, Award, ChevronRight, CheckCircle, Map, Check, ArrowRight, Clock, Calendar, MessageSquare, Home, HeartPulse, Eye, Send, Crown, Flag, AlertTriangle, Trash, Cog, Edit, ClipboardCheck, History, Inbox, Sun, Moon, BarChart3, ChevronDown, ListTodo, AlertCircle, Tag } from 'lucide-react';

export default function SuperAdmin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [contentTab, setContentTab] = useState('flagged');

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    showNotification(newTheme === 'light' ? 'লাইট মোড / Light mode' : 'ডার্ক মোড / Dark mode');
  };

  const openSheet = (sheetId: string) => {
    setActiveSheet(sheetId);
  };

  const closeSheet = () => {
    setActiveSheet('');
  };

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const theme = {
    dark: {
      bgPrimary: '#1a1816',
      bgSecondary: '#24201d',
      bgTertiary: '#1a1816',
      border: '#3d3630',
      textPrimary: '#C4B5A0',
      textSecondary: '#8a7a6e',
      textMuted: '#6B5B4F',
      hairline: '#3d3630',
      cardBg: '#24201d',
      inputBorder: '#3d3630',
      overlayBg: 'rgba(26, 24, 22, 0.85)',
    },
    light: {
      bgPrimary: '#faf9f6',
      bgSecondary: '#f5f0e8',
      bgTertiary: '#ffffff',
      border: '#e7e0d4',
      textPrimary: '#1c1917',
      textSecondary: '#8c7b6b',
      textMuted: '#a89f91',
      hairline: '#e7e0d4',
      cardBg: '#ffffff',
      inputBorder: '#d6cbb8',
      overlayBg: 'rgba(250, 249, 246, 0.85)',
    }
  };

  const colors = theme[currentTheme];

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-24 transition-all duration-500" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      {/* Toast */}
      <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 -translate-y-4 px-7 py-3.5 rounded-lg text-sm z-50 transition-all duration-400 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`} style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary }}>
        {toastMessage}
      </div>

      {/* Overlay */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${activeSheet ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ backgroundColor: colors.overlayBg, backdropFilter: 'blur(12px)' }} onClick={closeSheet}></div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-500" style={{ backgroundColor: `${colors.bgPrimary}E6`, borderColor: colors.border }}>
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border transition-all duration-500" style={{ borderColor: '#8B263540' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8B2635' }}></div>
                </div>
              </div>
              <div>
                <h1 className="text-base tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Rokto<span style={{ color: '#8B2635' }}>Korobi</span>
                </h1>
                <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: colors.textMuted }}>Super Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95" style={{ backgroundColor: colors.bgSecondary, border: `1px solid ${colors.border}` }} onClick={toggleTheme}>
                {currentTheme === 'dark' ? <Sun className="w-4 h-4" style={{ color: colors.textPrimary }} /> : <Moon className="w-4 h-4" style={{ color: colors.textPrimary }} />}
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500" style={{ backgroundColor: colors.bgSecondary }} onClick={() => openSheet('menuSheet')}>
                <BarChart3 className="w-4 h-4" style={{ color: colors.textMuted }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Dashboard */}
      <div id="adminView">
        {/* Homepage Quick Access */}
        <section className="max-w-lg mx-auto px-6 pt-6">
          <div className="rounded-xl p-5 cursor-pointer transition-all duration-300 active:scale-98" style={{ background: 'linear-gradient(135deg, #8B2635 0%, #6b1c28 100%)', position: 'relative', overflow: 'hidden' }} onClick={() => showNotification('হোমপেজে যাওয়া হচ্ছে...')}>
            <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(196, 181, 160, 0.3) 0%, transparent 70%)' }}></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: '#C4B5A0', opacity: 0.7 }}>Browse as User</p>
                <h3 className="text-lg font-medium mb-1" style={{ fontFamily: 'Noto Sans Bengali, Playfair Display, serif', color: '#C4B5A0' }}>হোমপেজে যান</h3>
                <p className="text-[11px] mt-1" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif', color: '#C4B5A0', opacity: 0.6 }}>রক্তদানের জন্য ব্রাউজ করুন</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C4B5A020' }}>
                <ArrowRight className="w-4 h-4" style={{ color: '#C4B5A0' }} />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-lg mx-auto px-6 mt-6">
          <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${colors.hairline}, transparent)` }}></div>
        </div>

        {/* Command Modules */}
        <section className="max-w-lg mx-auto px-6 pt-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px" style={{ backgroundColor: colors.hairline }}></div>
            <span className="text-[0.6rem] tracking-[0.25em] uppercase font-medium" style={{ color: colors.textMuted, fontFamily: 'Inter, sans-serif' }}>Command</span>
          </div>

          <div className="space-y-3">
            {/* User Control */}
            <div className="rounded-xl p-5 cursor-pointer transition-all duration-400 active:scale-98" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }} onClick={() => openSheet('usersSheet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B263520' }}>
                    <Shield className="w-4 h-4" style={{ color: '#8B2635' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-0.5" style={{ fontFamily: 'Noto Sans Bengali, Playfair Display, serif', color: colors.textPrimary }}>ব্যবহারকারী নিয়ন্ত্রণ</h3>
                    <p className="text-[11px]" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif', color: '#6B5B4F' }}>User Control</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" style={{ color: colors.textMuted }} />
              </div>
            </div>

            {/* Role Assignment */}
            <div className="rounded-xl p-5 cursor-pointer transition-all duration-400 active:scale-98" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }} onClick={() => openSheet('rolesSheet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2E5A4C20' }}>
                    <Tag className="w-4 h-4" style={{ color: '#2E5A4C' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-0.5" style={{ fontFamily: 'Noto Sans Bengali, Playfair Display, serif', color: colors.textPrimary }}>রোল অ্যাসাইন</h3>
                    <p className="text-[11px]" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif', color: '#6B5B4F' }}>Role Assignment</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" style={{ color: colors.textMuted }} />
              </div>
            </div>

            {/* Content Patrol */}
            <div className="rounded-xl p-5 cursor-pointer transition-all duration-400 active:scale-98" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }} onClick={() => openSheet('contentSheet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6B5B4F20' }}>
                    <Eye className="w-4 h-4" style={{ color: '#8a7a6e' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-0.5" style={{ fontFamily: 'Noto Sans Bengali, Playfair Display, serif', color: colors.textPrimary }}>কন্টেন্ট প্যাট্রোল</h3>
                    <p className="text-[11px]" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif', color: '#6B5B4F' }}>Content Patrol</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" style={{ color: colors.textMuted }} />
              </div>
            </div>

            {/* Task Dispatch */}
            <div className="rounded-xl p-5 cursor-pointer transition-all duration-400 active:scale-98" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }} onClick={() => openSheet('tasksSheet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C4B5A010' }}>
                    <Send className="w-4 h-4" style={{ color: '#a89884' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-0.5" style={{ fontFamily: 'Noto Sans Bengali, Playfair Display, serif', color: colors.textPrimary }}>টাস্ক ডিসপ্যাচ</h3>
                    <p className="text-[11px]" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif', color: '#6B5B4F' }}>Task Dispatch</p>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3" style={{ color: colors.textMuted }} />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-lg mx-auto px-6 mt-6">
          <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${colors.hairline}, transparent)` }}></div>
        </div>

        {/* Flagged Content Preview */}
        <section className="max-w-lg mx-auto px-6 pt-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px" style={{ backgroundColor: colors.hairline }}></div>
              <span className="text-[0.6rem] tracking-[0.25em] uppercase font-medium" style={{ color: colors.textMuted, fontFamily: 'Inter, sans-serif' }}>Flagged</span>
            </div>
            <button className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#8B2635' }} onClick={() => openSheet('contentSheet')}>সব দেখুন</button>
          </div>

          <div className="rounded-xl overflow-hidden transition-all duration-400" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="px-5 py-4 text-center" style={{ color: colors.textMuted }}>
              <Inbox className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p className="text-sm" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>কোনো ফ্ল্যাগড কন্টেন্ট নেই</p>
              <p className="text-[11px] mt-1">No flagged content</p>
            </div>
          </div>
        </section>

        {/* Activity Log */}
        <section className="max-w-lg mx-auto px-6 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px" style={{ backgroundColor: colors.hairline }}></div>
            <span className="text-[0.6rem] tracking-[0.25em] uppercase font-medium" style={{ color: colors.textMuted, fontFamily: 'Inter, sans-serif' }}>Activity</span>
          </div>

          <div className="rounded-xl p-6 transition-all duration-400" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div className="text-center" style={{ color: colors.textMuted }}>
              <History className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p className="text-sm" style={{ fontFamily: 'Noto Sans Bengali, Inter, sans-serif' }}>কোনো অ্যাক্টিভিটি নেই</p>
              <p className="text-[11px] mt-1">No recent activity</p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t transition-all duration-500" style={{ backgroundColor: `${colors.bgPrimary}F2`, borderColor: colors.border }}>
        <div className="max-w-lg mx-auto px-6 py-3">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1" onClick={() => showNotification('হোম')}>
              <Home className="w-4 h-4" style={{ color: '#8B2635' }} />
              <span className="text-[8px] tracking-[0.15em] uppercase" style={{ color: colors.textMuted }}>হোম</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => showNotification('দাতা')}>
              <Users className="w-4 h-4" style={{ color: colors.textMuted }} />
              <span className="text-[8px] tracking-[0.15em] uppercase" style={{ color: colors.textMuted }}>দাতা</span>
            </button>

            <div className="relative -top-5">
              <button className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95" style={{ backgroundColor: '#8B2635', color: '#C4B5A0', boxShadow: '0 4px 12px rgba(139, 38, 53, 0.4)' }} onClick={() => openSheet('commandMenuSheet')}>
                <Crown className="w-4 h-4" />
              </button>
            </div>

            <button className="flex flex-col items-center gap-1" onClick={() => showNotification('রিকোয়েস্ট')}>
              <HeartPulse className="w-4 h-4" style={{ color: colors.textMuted }} />
              <span className="text-[8px] tracking-[0.15em] uppercase" style={{ color: colors.textMuted }}>রিকোয়েস্ট</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => showNotification('প্রোফাইল')}>
              <User className="w-4 h-4" style={{ color: colors.textMuted }} />
              <span className="text-[8px] tracking-[0.15em] uppercase" style={{ color: colors.textMuted }}>প্রোফাইল</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Sheets would go here - simplified for brevity */}
      {/* The sheets can be added as separate components or expanded as needed */}
    </div>
  );
}
