// API Route for Admin Token Usage Data
import { NextResponse } from 'next/server';
import {
    getTotalTokenUsage,
    getUserTokenSummaries,
    getDailyTokenUsage,
    getUsageByPersona,
    getHourlyDistribution,
    getTokenUsageRecords,
} from '@/lib/tokenStorage';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all';
        const days = parseInt(searchParams.get('days') || '30');

        switch (type) {
            case 'total':
                return NextResponse.json(await getTotalTokenUsage());

            case 'users':
                return NextResponse.json(await getUserTokenSummaries());

            case 'daily':
                return NextResponse.json(await getDailyTokenUsage(days));

            case 'persona':
                return NextResponse.json(await getUsageByPersona());

            case 'hourly':
                return NextResponse.json(await getHourlyDistribution());

            case 'records':
                const records = await getTokenUsageRecords();
                // Return last 100 records for detailed view
                return NextResponse.json(records.slice(-100).reverse());

            case 'all':
            default:
                const [total, users, daily, persona, hourly] = await Promise.all([
                    getTotalTokenUsage(),
                    getUserTokenSummaries(),
                    getDailyTokenUsage(days),
                    getUsageByPersona(),
                    getHourlyDistribution()
                ]);

                return NextResponse.json({
                    total,
                    users,
                    daily,
                    persona,
                    hourly,
                });
        }
    } catch (error) {
        console.error('[Admin API Error]:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token usage data' },
            { status: 500 }
        );
    }
}
