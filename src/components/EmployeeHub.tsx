/**
 * Employee Hub Component
 * Features: Staff directory, Attendance tracking, and Payroll automation.
 * Integrated with PDF generation for Salary Statements.
 */

import { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Wallet, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  Plus,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';

// --- Types ---
interface StaffMember {
  id: string;
  name: string;
  role: 'Housekeeping' | 'Bar' | 'Front Desk' | 'Kitchen';
  basicPay: number; // Daily rate
  status: 'active' | 'inactive';
  attendance: number; // Days present this month
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Rajesh Kumar', role: 'Front Desk', basicPay: 800, status: 'active', attendance: 24 },
  { id: 's2', name: 'Suresh Nair', role: 'Bar', basicPay: 750, status: 'active', attendance: 26 },
  { id: 's3', name: 'Anita Varghese', role: 'Housekeeping', basicPay: 600, status: 'active', attendance: 22 },
  { id: 's4', name: 'Lakshmi Menon', role: 'Kitchen', basicPay: 700, status: 'active', attendance: 25 },
];

export default function EmployeeHub() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // --- 1. Attendance Logic ---
  const toggleAttendance = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, attendance: s.attendance + 1 } : s));
    alert('Attendance Logged: Added 1 day to monthly total.');
  };

  // --- 2. Payroll Logic ---
  const calculateSalary = (basic: number, days: number) => basic * days;

  // --- 3. PDF Reporting Logic ---
  const { toPDF, targetRef } = usePDF({
    filename: `Salary_Statement_${selectedStaff?.name.replace(/\s+/g, '_')}.pdf`,
    page: { margin: 20 }
  });

  const handleGenerateStatement = (member: StaffMember) => {
    setSelectedStaff(member);
    // Modal or background trigger
    setTimeout(() => toPDF(), 500);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
            <Users className="text-brushed-gold" size={32} />
            Staff Directory & Payroll
          </h2>
          <p className="text-forest-green/60 text-xs font-bold uppercase tracking-widest mt-1">Deepa Tourist Home Resource Management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-forest-green text-brushed-gold rounded-xl font-bold shadow-lg hover:bg-forest-green-light active:scale-95 transition-all">
          <UserPlus size={18} /> Add Staff Member
        </button>
      </div>

      {/* 4. Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 group hover:border-brushed-gold transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-forest-green group-hover:bg-brushed-gold/10 group-hover:text-brushed-gold transition-colors">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-black text-forest-green uppercase tracking-tight">{member.name}</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.role}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-green-600"><CheckCircle size={16} /></span>
                <span className="text-[8px] font-bold text-gray-300 uppercase mt-1">On Shift</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Attendance</p>
                <p className="text-lg font-black text-forest-green">{member.attendance} <span className="text-[10px] opacity-40">Days</span></p>
              </div>
              <div className="p-3 bg-forest-green/5 rounded-2xl border border-forest-green/10">
                <p className="text-[9px] font-bold text-forest-green/40 uppercase mb-1">Est. Wage</p>
                <p className="text-lg font-black text-forest-green">{formatCurrency(calculateSalary(member.basicPay, member.attendance))}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => toggleAttendance(member.id)}
                className="flex-1 py-3 bg-gray-100 text-forest-green rounded-xl font-black text-[10px] uppercase hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Clock size={14}/> Log Check-in
              </button>
              <button 
                onClick={() => handleGenerateStatement(member)}
                className="p-3 bg-brushed-gold/20 text-forest-green rounded-xl hover:bg-brushed-gold hover:text-white active:scale-95 transition-all"
                title="Generate Salary Statement"
              >
                <FileText size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Salary Statement Template for PDF */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={targetRef} className="w-[800px] bg-white p-12">
          <div className="text-center border-b-4 border-forest-green pb-8 mb-10">
            <h1 className="text-3xl font-black text-forest-green">MONTHLY SALARY STATEMENT</h1>
            <p className="text-brushed-gold font-bold uppercase tracking-widest">Deepa Restaurant & Tourist Home</p>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Employee Details</p>
              <p className="text-xl font-black text-forest-green">{selectedStaff?.name}</p>
              <p className="font-bold text-forest-green/60 uppercase text-xs">{selectedStaff?.role}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Statement Period</p>
              <p className="font-black text-forest-green">JANUARY 2026</p>
            </div>
          </div>

          <div className="space-y-4 border-y border-gray-100 py-10 mb-10">
            <SalaryRow label="Basic Pay (Daily Rate)" value={formatCurrency(selectedStaff?.basicPay || 0)} />
            <SalaryRow label="Total Attendance (Days)" value={selectedStaff?.attendance || 0} />
            <SalaryRow label="Allowances / Bonuses" value="₹0.00" />
            <div className="pt-6 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-xl font-black text-forest-green">TOTAL NET PAYABLE</span>
              <span className="text-3xl font-black text-forest-green">
                {formatCurrency(calculateSalary(selectedStaff?.basicPay || 0, selectedStaff?.attendance || 0))}
              </span>
            </div>
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="text-center">
              <div className="w-40 h-px bg-gray-400 mb-2"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Employee Signature</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase">Authorized By</p>
              <p className="font-black text-forest-green">Deepa Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalaryRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-600">{label}</span>
      <span className="font-black text-forest-green">{value}</span>
    </div>
  );
}