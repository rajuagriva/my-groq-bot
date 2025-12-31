import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/tokenStorage';

// GET /api/init-db - Initialize database tables
export async function GET() {
    try {
        const result = await initDatabase();
        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            details: result
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
