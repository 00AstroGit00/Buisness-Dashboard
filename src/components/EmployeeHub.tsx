/**
 * Employee Hub Component - Upgraded UI
 * Features: Staff directory, Attendance tracking, and Payroll automation.
 * Integrated with PDF generation for Salary Statements.
 */

import { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Plus,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Briefcase
} from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

// --- Types ---
interface StaffMember {
  id: string;
  name: string;
  role: 'Housekeeping' | 'Bar' | 'Front Desk' | 'Kitchen';
  basicPay: number; // Daily rate
  status: 'active' | 'inactive';
  attendance: number; // Days present this month
  image?: string;
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
  const [searchQuery, setSearchQuery] = useState('');

  // --- 1. Attendance Logic ---
  const toggleAttendance = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, attendance: s.attendance + 1 } : s));
    // In a real app, this would show a toast from NotificationProvider
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
    setTimeout(() => toPDF(), 500);
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Human Capital</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Staff <span className="text-brushed-gold">Directory</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Resource Management Active</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <ShieldCheck size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Payroll Secure</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Button variant="gold" leftIcon={<UserPlus size={18} />} className="rounded-2xl shadow-xl shadow-brushed-gold/10">
             Onboard Staff
           </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-green/5 flex items-center justify-center text-forest-green">
               <Users size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Workforce</p>
               <p className="text-2xl font-black text-forest-green">{staff.length} <span className="text-xs text-gray-400">Members</span></p>
            </div>
         </Card>
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
               <Calendar size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Daily Attendance</p>
               <p className="text-2xl font-black text-forest-green">98<span className="text-lg text-brushed-gold">%</span></p>
            </div>
         </Card>
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brushed-gold/10 text-brushed-gold flex items-center justify-center">
               <TrendingUp size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Efficiency Rate</p>
               <p className="text-2xl font-black text-forest-green">4.9<span className="text-lg text-brushed-gold">/5</span></p>
            </div>
         </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-brushed-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <Input 
              placeholder="Search by name, role, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="text-brushed-gold" size={20} />}
              className="py-4 rounded-2xl border-0 shadow-xl bg-white relative z-10 font-bold"
            />
         </div>
         <Button variant="secondary" className="rounded-2xl h-14 px-8" leftIcon={<Filter size={18} />}>
            Advanced Filters
         </Button>
      </div>

      {/* Staff Grid - Upgraded */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStaff.map((member) => (
          <Card key={member.id} padded={false} className="border-0 shadow-2xl rounded-[2.5rem] bg-white group hover:scale-[1.02] transition-all duration-500 overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-forest-green to-forest-green-light flex items-center justify-center text-brushed-gold shadow-2xl group-hover:rotate-6 transition-transform">
                       <Users size={32} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-forest-green tracking-tight">{member.name}</h3>
                    <div className="flex items-center gap-1.5 opacity-40">
                       <Briefcase size={10} className="text-forest-green" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{member.role}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-300 hover:text-forest-green transition-colors">
                   <MoreVertical size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-forest-green group-hover:text-white transition-all duration-500">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Attendance</p>
                  <p className="text-xl font-black font-mono">{member.attendance} <span className="text-[10px] opacity-40">Days</span></p>
                </div>
                <div className="p-5 bg-brushed-gold/5 rounded-3xl border border-brushed-gold/5 group-hover:bg-brushed-gold group-hover:text-forest-green transition-all duration-500">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Accrued</p>
                  <p className="text-xl font-black font-mono">{formatCurrency(calculateSalary(member.basicPay, member.attendance))}</p>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => toggleAttendance(member.id)}
                className="flex-1 rounded-2xl h-14 text-xs font-black uppercase tracking-widest"
                leftIcon={<Clock size={16}/>}
              >
                Log Attendance
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleGenerateStatement(member)}
                className="rounded-2xl h-14 w-14 p-0 border-gray-100 text-forest-green hover:text-white hover:bg-forest-green"
              >
                <FileText size={20} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Hidden Salary Statement Template for PDF - Upgraded Design */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={targetRef} className="w-[1000px] bg-white p-20 font-sans">
          <div className="flex justify-between items-end border-b-8 border-forest-green pb-12 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 bg-forest-green text-brushed-gold rounded-2xl flex items-center justify-center">
                    <Briefcase size={40} />
                 </div>
                 <div>
                    <h1 className="text-4xl font-black text-forest-green tracking-tighter">SALARY STATEMENT</h1>
                    <p className="text-xs font-black text-brushed-gold uppercase tracking-[0.4em]">Official Payment Record</p>
                 </div>
              </div>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-black text-forest-green">Deepa Hotel</h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cherpulassery, Palakkad</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-16">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Recipient Employee</p>
                <p className="text-3xl font-black text-forest-green">{selectedStaff?.name}</p>
                <Badge variant="gold" className="mt-2 uppercase text-[10px] px-3 py-1 font-black">{selectedStaff?.role}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Employee ID</p>
                    <p className="font-black text-forest-green">{selectedStaff?.id.toUpperCase()}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Department</p>
                    <p className="font-black text-forest-green">Operations</p>
                 </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payroll Period</p>
                <p className="text-2xl font-black text-forest-green">JANUARY 2026</p>
              </div>
              <div className="flex items-center gap-2 text-forest-green/40">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Transaction</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-20 bg-white border-2 border-forest-green/5 rounded-[2.5rem] p-12 shadow-2xl">
            <SalaryRow label="Daily Wage Rate" value={formatCurrency(selectedStaff?.basicPay || 0)} />
            <SalaryRow label="Monthly Attendance" value={`${selectedStaff?.attendance || 0} Working Days`} />
            <SalaryRow label="Housing & Conveyance Allowance" value="₹0.00" />
            <SalaryRow label="Performance Bonus" value="₹0.00" />
            
            <div className="pt-10 mt-10 border-t-4 border-double border-gray-100 flex justify-between items-end">
              <div>
                 <p className="text-[10px] font-black text-forest-green/40 uppercase tracking-widest mb-1">Total Net Disbursement</p>
                 <span className="text-6xl font-black text-forest-green tracking-tighter">
                    {formatCurrency(calculateSalary(selectedStaff?.basicPay || 0, selectedStaff?.attendance || 0))}
                 </span>
              </div>
              <div className="p-4 bg-forest-green text-brushed-gold rounded-2xl">
                 <CheckCircle2 size={48} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-8">
              <div className="w-64 h-px bg-gray-200"></div>
              <div>
                <p className="text-[10px] font-black text-forest-green uppercase tracking-widest">Employee Signature</p>
                <p className="text-xs text-gray-400 font-bold mt-1">Acceptance of payment & terms</p>
              </div>
            </div>
            <div className="text-right space-y-4">
               <div className="w-48 h-16 bg-forest-green/5 rounded-2xl flex items-center justify-center border border-forest-green/10">
                  <p className="font-serif italic text-forest-green text-lg opacity-30 underline decoration-brushed-gold">Management</p>
               </div>
               <p className="text-[10px] font-black text-forest-green uppercase tracking-widest">Authorized Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalaryRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">{label}</span>
      <div className="flex-1 border-b border-dashed border-gray-100 mx-4 h-1"></div>
      <span className="font-black text-forest-green text-lg">{value}</span>
    </div>
  );
}
