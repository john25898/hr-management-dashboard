import { NextRequest, NextResponse } from 'next/server';
import { getExcelData, Employee } from '@/lib/excel-data';

export async function GET(request: NextRequest) {
  try {
    const data = await getExcelData();
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const county = searchParams.get('county');
    const designation = searchParams.get('designation');
    const gender = searchParams.get('gender');
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');

    let filtered = data.employees;

    if (county && county !== 'all') {
      filtered = filtered.filter(emp => emp.county === county);
    }

    if (designation && designation !== 'all') {
      filtered = filtered.filter(emp => emp.designation === designation);
    }

    if (gender && gender !== 'all') {
      filtered = filtered.filter(emp => emp.gender === gender);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(emp => emp.status === status);
    }

    if (search) {
      filtered = filtered.filter(emp =>
        emp.name?.toLowerCase().includes(search) ||
        emp.phone?.toString().includes(search) ||
        emp.idNo?.toString().includes(search)
      );
    }

    return NextResponse.json({
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error in employees API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
