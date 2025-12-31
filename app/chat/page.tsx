"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { getPersona } from '@/lib/personas';

function ChatContent() {
    const searchParams = useSearchParams();
    const personaId = searchParams.get('persona');

    // Dapatkan konfigurasi persona berdasarkan parameter URL
    const persona = getPersona(personaId);

    return (
        <ChatInterface
            personaId={persona.id}
            personaName={persona.name}
            personaAvatar={persona.avatar}
            systemPrompt={persona.systemPrompt}
        />
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background-page dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#1b150d]/60 dark:text-white/60 text-sm font-medium">Memuat obrolan...</p>
                </div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
