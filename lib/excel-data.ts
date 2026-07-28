'use server';

import { read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';

export interface Employee {
  id?: string | number;
  name: string;
  gender?: string;
  phone?: string;
  idNo?: string;
  designation?: string;
  county?: string;
  subCounty?: string;
  station?: string;
  dateEmployed?: string | Date;
  dob?: string | Date;
  age?: number;
  educationLevel?: string;
  qualification?: string;
  regulatoryBody?: string;
  practiseeLicence?: string;
  validUntil?: string | Date;
  status?: string;
  [key: string]: any;
}

// Column mapping from Excel headers to normalized keys
const columnMapping: { [key: string]: string } = {
  '__EMPTY': 'id',
  '__EMPTY_1': 'name',
  '__EMPTY_2': 'gender',
  '__EMPTY_3': 'phone',
  '__EMPTY_4': 'idNo',
  '__EMPTY_6': 'designation',
  '__EMPTY_7': 'county',
  '__EMPTY_8': 'subCounty',
  '__EMPTY_9': 'station',
  '__EMPTY_10': 'dateEmployed',
  '__EMPTY_11': 'dob',
  '__EMPTY_12': 'dobCleaned',
  '__EMPTY_13': 'age',
  '__EMPTY_14': 'educationLevel',
  '__EMPTY_15': 'qualification',
  '__EMPTY_18': 'regulatoryBody',
  '__EMPTY_19': 'practiseeLicence',
  '__EMPTY_20': 'validUntil',
  '__EMPTY_21': 'status',
};

function normalizeCounty(county?: any): string {
  if (!county) return 'Unknown';
  const normalized = county.toString().trim().toUpperCase();
  
  // Handle variations
  if (normalized.includes('EMBU')) return 'Embu';
  if (normalized.includes('MERU')) return 'Meru';
  if (normalized.includes('NYANDARUA')) return 'Nyandarua';
  if (normalized.includes('THARAKA')) return 'Tharaka Nithi';
  
  return county.toString().trim();
}

function isHeaderRow(row: any): boolean {
  // Check if this row contains header text values instead of actual data
  const headerKeywords = ['EMPLOYEE NAME', 'EMPLOYEE DETAILS', 'S/No', 'DESIGNATION', 'COUNTY'];
  
  for (const value of Object.values(row)) {
    if (typeof value === 'string') {
      const valUpper = value.toString().toUpperCase();
      if (headerKeywords.some(kw => valUpper.includes(kw))) {
        return true;
      }
    }
  }
  
  return false;
}

function normalizeEmployee(row: any): Employee {
  const normalized: any = {};
  
  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = columnMapping[key] || key;
    normalized[normalizedKey] = value;
  });

  // Normalize county name
  if (normalized.county) {
    normalized.county = normalizeCounty(normalized.county);
  }

  return normalized as Employee;
}

export async function getExcelData() {
  try {
    const filePath = path.join(process.cwd(), 'data/UJTP-HRH-Master-DATABASE-2025-EM-430b41.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = read(fileBuffer, { cellDates: true });

    // Get the "All" sheet with all employee data
    const allSheet = workbook.Sheets['All'];
    const allRawData = utils.sheet_to_json(allSheet);
    const allData = allRawData
      .filter(row => !isHeaderRow(row))
      .map(normalizeEmployee)
      .filter(emp => emp.name && emp.name !== 'EMPLOYEE NAME');

    // Get county-specific sheets
    const countyData: { [key: string]: Employee[] } = {};
    ['Embu', 'Meru', 'Nyandarua', 'Tharaka Nithi'].forEach(county => {
      if (workbook.Sheets[county]) {
        const rawData = utils.sheet_to_json(workbook.Sheets[county]);
        countyData[county] = rawData
          .filter(row => !isHeaderRow(row))
          .map(normalizeEmployee)
          .filter(emp => emp.name && emp.name !== 'EMPLOYEE NAME');
      }
    });

    // Get Layworkers data
    const layworkersRaw = utils.sheet_to_json(workbook.Sheets['Layworkers'] || {});
    const layworkersData = layworkersRaw.map((row: any) => ({
      id: row['NO'],
      name: row['NAME'],
      facility: row['FACILITY'],
      county: row['COUNTY'],
      subCounty: row['SUB COUNTY'],
    })).filter(emp => emp.name);

    return {
      employees: allData,
      counties: countyData,
      layworkers: layworkersData,
      summary: {
        totalEmployees: allData.length,
        totalLayworkers: layworkersData.length,
        byCounty: Object.keys(countyData).reduce((acc, county) => {
          acc[county] = countyData[county].length;
          return acc;
        }, {} as { [key: string]: number }),
      },
    };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return null;
  }
}
