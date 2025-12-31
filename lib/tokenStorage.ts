// Token Usage Storage Module
// Hybrid implementation: Uses Vercel Postgres if available, falls back to JSON file for local dev.

import fs from 'fs';
import path from 'path';
import { sql } from '@vercel/postgres';

export interface TokenUsageRecord {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    persona?: string;
}

export interface UserTokenSummary {
    userId: string;
    userName: string;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    requestCount: number;
    lastUsed: string;
}

export interface DailyTokenUsage {
    date: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
}

// --------------------------------------------------------
// ADAPTER CONFIGURATION
// --------------------------------------------------------

const isPostgresAvailable = !!process.env.POSTGRES_URL;

// File path for storing token usage data (Local Fallback)
const DATA_DIR = path.join(process.cwd(), 'data');
const TOKEN_USAGE_FILE = path.join(DATA_DIR, 'token-usage.json');

// Ensure data directory exists (Local only)
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Create Table Script (For helper API)
export async function initDatabase() {
    if (!isPostgresAvailable) return { status: 'skipped', message: 'Postgres not configured' };

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS token_usage (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                user_name VARCHAR(255),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                model VARCHAR(255),
                prompt_tokens INTEGER,
                completion_tokens INTEGER,
                total_tokens INTEGER,
                persona VARCHAR(255)
            );
        `;
        return { status: 'success', message: 'Table token_usage created or already exists' };
    } catch (error) {
        console.error('Failed to init DB:', error);
        throw error;
    }
}

// --------------------------------------------------------
// DATA ACCESS METHODS
// --------------------------------------------------------

// Read all token usage records
export async function getTokenUsageRecords(): Promise<TokenUsageRecord[]> {
    // 1. Postgres Strategy
    if (isPostgresAvailable) {
        try {
            const { rows } = await sql`SELECT * FROM token_usage ORDER BY timestamp DESC LIMIT 1000`;
            return rows.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                userName: row.user_name,
                timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
                model: row.model,
                promptTokens: row.prompt_tokens,
                completionTokens: row.completion_tokens,
                totalTokens: row.total_tokens,
                persona: row.persona
            }));
        } catch (error) {
            console.error('Postgres read error:', error);
            return [];
        }
    }

    // 2. Local File Strategy
    ensureDataDir();
    try {
        if (fs.existsSync(TOKEN_USAGE_FILE)) {
            const data = fs.readFileSync(TOKEN_USAGE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading token usage file:', error);
    }
    return [];
}

// Save token usage record
export async function saveTokenUsageRecord(record: TokenUsageRecord): Promise<void> {
    // 1. Postgres Strategy
    if (isPostgresAvailable) {
        try {
            await sql`
                INSERT INTO token_usage (
                    id, user_id, user_name, timestamp, model, 
                    prompt_tokens, completion_tokens, total_tokens, persona
                ) VALUES (
                    ${record.id}, ${record.userId}, ${record.userName}, ${record.timestamp}, ${record.model},
                    ${record.promptTokens}, ${record.completionTokens}, ${record.totalTokens}, ${record.persona}
                )
            `;
            return;
        } catch (error) {
            console.error('Postgres write error:', error);
            // Fallback to local? No, usually distinct environments. Just log.
            return;
        }
    }

    // 2. Local File Strategy
    ensureDataDir();
    // For file system, we need to read first to append
    let records: TokenUsageRecord[] = [];
    try {
        if (fs.existsSync(TOKEN_USAGE_FILE)) {
            const data = fs.readFileSync(TOKEN_USAGE_FILE, 'utf-8');
            records = JSON.parse(data);
        }
    } catch (e) {
        records = [];
    }
    records.push(record);
    fs.writeFileSync(TOKEN_USAGE_FILE, JSON.stringify(records, null, 2));
}

// Get user token summaries
export async function getUserTokenSummaries(): Promise<UserTokenSummary[]> {
    const records = await getTokenUsageRecords();
    const userMap = new Map<string, UserTokenSummary>();

    for (const record of records) {
        if (!userMap.has(record.userId)) {
            userMap.set(record.userId, {
                userId: record.userId,
                userName: record.userName,
                totalPromptTokens: 0,
                totalCompletionTokens: 0,
                totalTokens: 0,
                requestCount: 0,
                lastUsed: record.timestamp,
            });
        }

        const summary = userMap.get(record.userId)!;
        summary.totalPromptTokens += record.promptTokens;
        summary.totalCompletionTokens += record.completionTokens;
        summary.totalTokens += record.totalTokens;
        summary.requestCount += 1;

        if (new Date(record.timestamp) > new Date(summary.lastUsed)) {
            summary.lastUsed = record.timestamp;
        }
    }

    return Array.from(userMap.values()).sort((a, b) => b.totalTokens - a.totalTokens);
}

// Get total token usage across all users
export async function getTotalTokenUsage() {
    const records = await getTokenUsageRecords();
    const uniqueUsers = new Set(records.map(r => r.userId));

    return {
        totalPromptTokens: records.reduce((sum, r) => sum + r.promptTokens, 0),
        totalCompletionTokens: records.reduce((sum, r) => sum + r.completionTokens, 0),
        totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
        totalRequests: records.length,
        totalUsers: uniqueUsers.size,
    };
}

// Get daily token usage for charts
export async function getDailyTokenUsage(days: number = 30): Promise<DailyTokenUsage[]> {
    const records = await getTokenUsageRecords();
    const dailyMap = new Map<string, DailyTokenUsage>();

    // Initialize last N days
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, {
            date: dateStr,
            totalTokens: 0,
            promptTokens: 0,
            completionTokens: 0,
            requestCount: 0,
        });
    }

    // Aggregate records by date
    for (const record of records) {
        let dateStr = '';
        if (typeof record.timestamp === 'string') {
            dateStr = record.timestamp.split('T')[0];
        } else {
            dateStr = new Date(record.timestamp).toISOString().split('T')[0];
        }

        if (dailyMap.has(dateStr)) {
            const daily = dailyMap.get(dateStr)!;
            daily.totalTokens += record.totalTokens;
            daily.promptTokens += record.promptTokens;
            daily.completionTokens += record.completionTokens;
            daily.requestCount += 1;
        }
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Get usage by persona
export async function getUsageByPersona() {
    const records = await getTokenUsageRecords();
    const personaMap = new Map<string, { totalTokens: number; requestCount: number }>();

    for (const record of records) {
        const persona = record.persona || 'unknown';
        if (!personaMap.has(persona)) {
            personaMap.set(persona, { totalTokens: 0, requestCount: 0 });
        }
        const data = personaMap.get(persona)!;
        data.totalTokens += record.totalTokens;
        data.requestCount += 1;
    }

    return Array.from(personaMap.entries())
        .map(([persona, data]) => ({ persona, ...data }))
        .sort((a, b) => b.totalTokens - a.totalTokens);
}

// Get hourly usage distribution
export async function getHourlyDistribution() {
    const records = await getTokenUsageRecords();
    const hourlyMap = new Map<number, { requestCount: number; totalTokens: number }>();

    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, { requestCount: 0, totalTokens: 0 });
    }

    for (const record of records) {
        const hour = new Date(record.timestamp).getHours();
        const data = hourlyMap.get(hour)!;
        data.requestCount += 1;
        data.totalTokens += record.totalTokens;
    }

    return Array.from(hourlyMap.entries())
        .map(([hour, data]) => ({ hour, ...data }))
        .sort((a, b) => a.hour - b.hour);
}
