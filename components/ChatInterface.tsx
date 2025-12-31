"use client";

import React, { useEffect, useRef, useState } from 'react';

// Props to receive persona configuration from parent
interface ChatInterfaceProps {
    personaId?: string;
    personaName?: string;
    personaAvatar?: string;
    systemPrompt?: string;
}

// Message type
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// Konfigurasi persona default
const DEFAULT_PERSONA = {
    name: "Sari",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP3S1R1d0EwqTPwgXWsMXXJO3Hj17dKnzF0xtvO3ABh-CLYPlESxuuUQsk4HUIc_1ehUi2hDuoT2QISMCKqwnU9JTa9R_nlcQaxocvrwTVmEYNNwUf20Inz39vpSBX7EH0f13Kr3XTkGODqQrtiLLajPRrHvDQWfX4wQdvMaWaNAVXh-6-Z7wR3FJ7_anGR1GdJ4bVEICtTgnSPJSmtYZjAIRr9ibE7wKxPNmN1IyjdKsJXSw7SPuTffsmKwKUXvaEfdAopEwGhsY",
    systemPrompt: "Kamu adalah Sari, asisten AI yang ramah dan membantu. Selalu jawab dalam Bahasa Indonesia."
};

export default function ChatInterface({
    personaId = 'asisten-umum',
    personaName = DEFAULT_PERSONA.name,
    personaAvatar = DEFAULT_PERSONA.avatar,
    systemPrompt = DEFAULT_PERSONA.systemPrompt
}: ChatInterfaceProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // Set mounted state, current time, and initial welcome message on client side
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Set welcome message with the correct persona name
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Halo! Saya ${personaName}. Ada yang bisa saya bantu hari ini?`,
        }]);
    }, [personaName]);


    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Handle sending message
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    systemPrompt,
                    persona: personaId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            const assistantMessageId = (Date.now() + 1).toString();
            let assistantContent = '';

            // Add empty assistant message that we'll update as we stream
            setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                // Parse the SSE data format from Vercel AI SDK
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        // Text chunk format: 0:"text content"
                        try {
                            const textContent = JSON.parse(line.slice(2));
                            assistantContent += textContent;
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === assistantMessageId
                                        ? { ...m, content: assistantContent }
                                        : m
                                )
                            );
                        } catch {
                            // Skip non-JSON lines
                        }
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle retry
    const handleRetry = () => {
        setError(null);
        // Remove the last assistant message if it was empty/error
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === 'assistant' && !lastMsg.content) {
                return prev.slice(0, -1);
            }
            return prev;
        });
    };

    // Get display timestamp (client-side only)
    const displayTime = mounted ? currentTime : '';

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background-page dark:bg-background-dark relative leading-normal">
            {/* Header - Fixed at top via flex */}
            <header className="flex-none bg-background-page/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-white/10 z-50">
                <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between h-14">
                        <button
                            className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#1b150d] dark:text-white"
                            onClick={() => window.history.back()}
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                        </button>
                        <div className="flex flex-col items-center flex-1">
                            <h2 className="text-[#1b150d] dark:text-white text-lg font-bold leading-tight">{personaName}</h2>
                            <span className="text-xs font-medium text-[#1b150d]/60 dark:text-white/60 flex items-center gap-1">
                                <span className={`size-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
                                {isLoading ? 'Sedang berpikir...' : 'Asisten AI'}
                            </span>
                        </div>
                        <button className="flex items-center justify-center size-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
                            <div className="size-full bg-[#f0a14c] flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-2xl">person</span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area - Scrolls independently */}
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar" id="chat-container">
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    {/* Timestamp */}
                    <div className="flex justify-center">
                        <span className="text-xs font-medium text-[#1b150d]/40 dark:text-white/40 bg-white/20 px-3 py-1 rounded-full">
                            Hari ini {displayTime}
                        </span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span>{error}</span>
                                <button
                                    onClick={handleRetry}
                                    className="underline hover:no-underline font-medium"
                                >
                                    Coba lagi
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 group ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 shadow-sm border-2 border-white/30"
                                    style={{ backgroundImage: `url("${personaAvatar}")` }}
                                />
                            )}

                            <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.role === 'assistant' && <span className="text-[#1b150d]/60 dark:text-white/60 text-xs font-medium ml-1">{personaName}</span>}

                                <div className={`p-4 rounded-2xl shadow-sm relative ${msg.role === 'user'
                                    ? 'rounded-br-none bg-primary text-user-text'
                                    : 'rounded-bl-none bg-secondary text-ai-text'
                                    }`}>
                                    <p className="text-[15px] font-normal leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <span className="text-[#1b150d]/40 dark:text-white/40 text-[10px] mr-1 font-medium">
                                        Terkirim
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading / Typing State */}
                    {isLoading && (
                        <div className="flex items-end gap-3 group">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 shadow-sm border-2 border-white/30"
                                style={{ backgroundImage: `url("${personaAvatar}")` }}
                            />
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[#1b150d]/60 dark:text-white/60 text-xs font-medium ml-1">{personaName} sedang mengetik...</span>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-secondary text-ai-text shadow-sm flex items-center gap-1 h-[46px]">
                                    <div className="size-2 bg-ai-text/50 rounded-full typing-dot"></div>
                                    <div className="size-2 bg-ai-text/50 rounded-full typing-dot"></div>
                                    <div className="size-2 bg-ai-text/50 rounded-full typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="h-4"></div>
                </div>
            </main>

            {/* Input Area - Fixed at bottom via flex */}
            <footer className="flex-none bg-background-page dark:bg-background-dark p-4 pb-6 pt-2 z-50">
                <div className="flex items-center gap-2 w-full max-w-3xl mx-auto relative">
                    <form className="flex-1 flex gap-2 w-full" onSubmit={handleSubmit}>
                        <label className="flex-1 min-w-0 relative">
                            <div className="relative flex items-center w-full shadow-sm rounded-3xl bg-white dark:bg-[#332b24] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/50">
                                <input
                                    className="w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-[#1b150d] dark:text-white placeholder:text-[#9a744c]/60 text-base font-normal outline-none"
                                    placeholder="Ketik pesan..."
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </label>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex items-center justify-center size-12 shrink-0 rounded-full bg-primary text-white shadow-md hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-2xl ml-0.5">send</span>
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
