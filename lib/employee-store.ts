"use client";

export interface EmployeeEdit {
  endOfContract?: string;
  exitReason?: "death" | "resignation" | "retirement" | "termination" | "";
  exitDate?: string;
  isDeparted?: boolean;
}

export interface DisabilityRecord {
  id: string;
  name: string;
  gender: string;
  disability: string;
  county: string;
  subCounty: string;
  facility: string;
  designation: string;
  phone: string;
  supportNeeded: string;
  // Extended master-DB fields (UJTP master workbook)
  idNo?: string;
  dob?: string;
  dateEmployed?: string;
  contractEnd?: string;
  educationLevel?: string;
  qualification?: string;
  othersCert?: string;
  regulatoryBody?: string;
  licenceNo?: string;
  validUntil?: string;
}

export interface TransferRecord {
  id: string;
  employeeName: string;
  fromCounty: string;
  toCounty: string;
  fromFacility: string;
  toFacility: string;
  fromSubCounty: string;
  toSubCounty: string;
  designation: string;
  transferDate: string;
  reason: string;
}

export interface NewWorkerRecord {
  id: string;
  name: string;
  gender: string;
  phone: string;
  idNo: string;
  county: string;
  subCounty: string;
  facility: string;
  designation: string;
  designationGroup: string;
  designationOriginal: string;
  dateEmployed: string;
  contractEnd: string;
  dob: string;
  educationLevel: string;
  qualification: string;
  othersCert: string;
  regulatoryBody: string;
  licenceNo: string;
  validUntil: string;
}

export interface HRModifications {
  employeeEdits: Record<string, EmployeeEdit>;
  disabilities: DisabilityRecord[];
  transfers: TransferRecord[];
  newWorkers: NewWorkerRecord[];
}

const STORAGE_KEY = "hr-modifications";

export function getModifications(): HRModifications {
  if (typeof window === "undefined")
    return {
      employeeEdits: {},
      disabilities: [],
      transfers: [],
      newWorkers: [],
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { employeeEdits: {}, disabilities: [], transfers: [], newWorkers: [] };
}

export function saveModifications(mods: HRModifications): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mods));
}

export function updateEmployeeEdit(name: string, edit: EmployeeEdit): void {
  const mods = getModifications();
  mods.employeeEdits[name] = { ...mods.employeeEdits[name], ...edit };
  saveModifications(mods);
}

export function getEmployeeEdit(name: string): EmployeeEdit | undefined {
  const mods = getModifications();
  return mods.employeeEdits[name];
}

export function addDisability(record: DisabilityRecord): void {
  const mods = getModifications();
  mods.disabilities.push(record);
  saveModifications(mods);
}

export function removeDisability(id: string): void {
  const mods = getModifications();
  mods.disabilities = mods.disabilities.filter((d) => d.id !== id);
  saveModifications(mods);
}

export function getDisabilities(): DisabilityRecord[] {
  return getModifications().disabilities;
}

// Transfer functions
export function addTransfer(record: TransferRecord): void {
  const mods = getModifications();
  mods.transfers.push(record);
  saveModifications(mods);
}

export function getTransfers(): TransferRecord[] {
  return getModifications().transfers;
}

// New Worker functions
export function addNewWorker(record: NewWorkerRecord): void {
  const mods = getModifications();
  mods.newWorkers.push(record);
  saveModifications(mods);
}

export function getNewWorkers(): NewWorkerRecord[] {
  return getModifications().newWorkers;
}
