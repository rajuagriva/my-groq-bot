"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import { PERSONAS } from '@/lib/personas';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  // Konversi objek personas ke array untuk rendering
  const personaList = Object.values(PERSONAS);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-page dark:bg-background-dark overflow-x-hidden">

      {/* Modal Login Overlay */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <LoginModal />
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <div className="flex items-center px-6 py-4 justify-between pt-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white rounded-full p-2 shadow-sm text-secondary">
            <span className="material-symbols-outlined !text-[28px]">smart_toy</span>
          </div>
          <h2 className="text-[#1b150d] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Chatbot AI</h2>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center justify-center overflow-hidden rounded-full size-12 bg-white/50 backdrop-blur-sm hover:bg-white transition-colors text-[#1b150d] dark:text-white"
        >
          <div className="size-12 bg-center bg-cover" data-alt="Avatar profil pengguna" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYOrOrvzSlK9g_fS2dGiQeh_rNjyN7zu6UFSVyl2c5D6BMxqGEvkgQAffK0wl7jjBH8g4Faelb53SXnycdor0LjQe2n6yFx23oDuTJybAIpRJzbhzWGA6Js_gM39IBqpqvEsyldfJ7T3djb8T0fIygMPDJ22uVU0cwvZ9jqrIvBxpqQtXllthCSoQ0Rq8aIXvGT8ouB-yJ0OMFpJj9MvEFrydwjcte37Br43QTKC7y1xUMy0k4BJgKYNECjuCOF1tOJeGci1UciXI")' }}></div>
        </button>
      </div>

      {/* Bagian Hero */}
      <div className="flex flex-col px-6 pt-6 pb-4">
        <h1 className="text-[#1b150d] dark:text-white tracking-tight text-[32px] font-bold leading-[1.1] mb-2">Pilih <br /><span className="text-secondary dark:text-primary">Teman AI-mu</span></h1>
        <p className="text-[#4a5568] dark:text-gray-300 text-base font-normal leading-relaxed">Pilih persona untuk menyesuaikan pengalaman chat-mu.</p>
      </div>

      {/* Grid Persona */}
      <div className="flex-1 px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personaList.map((persona) => (
            <Link
              key={persona.id}
              href={`/chat?persona=${persona.id}`}
              className={`group flex flex-col rounded-2xl p-4 shadow-sm border-2 border-transparent hover:border-primary active:border-primary transition-all duration-200 hover:-translate-y-1 active:scale-95 text-left h-full ${persona.id === 'kustom'
                ? 'bg-white/60 dark:bg-[#2A2A2A]/60 border-dashed !border-secondary hover:!border-primary hover:bg-white dark:hover:bg-[#2A2A2A]'
                : 'bg-white dark:bg-[#2A2A2A]'
                }`}
            >
              <div className={`mb-4 size-14 rounded-xl flex items-center justify-center transition-colors ${persona.id === 'kustom'
                ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                : 'bg-secondary/20 text-secondary dark:text-secondary group-hover:bg-primary group-hover:text-white'
                }`}>
                <span className="material-symbols-outlined !text-[32px]">{persona.icon}</span>
              </div>
              <div className="mt-auto">
                <h3 className="text-[#1b150d] dark:text-white text-lg font-bold leading-tight mb-1">{persona.name}</h3>
                <p className="text-[#64748b] dark:text-gray-400 text-xs font-medium leading-normal">{persona.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigasi Bawah */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Gaya Nav Mengambang untuk tampilan modern */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-background-page via-background-page/90 to-transparent dark:from-background-dark dark:via-background-dark/90 pointer-events-none"></div>
        <div className="relative mx-4 mb-6 bg-white dark:bg-[#1E1E1E] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 px-6 py-3 flex justify-around items-center backdrop-blur-md">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-primary">
            <span className="material-symbols-outlined !text-[26px]">home</span>
            <span className="text-[10px] font-bold tracking-wide uppercase">Beranda</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:text-secondary transition-colors">
            <span className="material-symbols-outlined !text-[26px]">chat_bubble</span>
            <span className="text-[10px] font-bold tracking-wide uppercase">Obrolan</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-gray-500 hover:text-secondary transition-colors">
            <span className="material-symbols-outlined !text-[26px]">admin_panel_settings</span>
            <span className="text-[10px] font-bold tracking-wide uppercase">Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
