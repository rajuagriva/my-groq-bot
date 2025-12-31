
import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/tokenStorage';

export async function GET() {
    try {
        const result = await initDatabase();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to initialize database', details: String(error) },
            { status: 500 }
        );
    }
}
