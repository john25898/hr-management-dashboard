import { NextResponse } from 'next/server';
import { getExcelData } from '@/lib/excel-data';

export async function GET() {
  try {
    const data = await getExcelData();
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }

    return NextResponse.json({
      layworkers: data.layworkers,
      total: data.layworkers?.length || 0,
      summary: data.summary,
    });
  } catch (error) {
    console.error('Error in layworkers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
