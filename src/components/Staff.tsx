import { useState, useRef, type TouchEvent } from 'react';
import { Users, Clock, Calendar, CheckCircle, XCircle, Plus, UserPlus } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface Employee {
  id: string;
  name: string;
  role: string;
  shift: 'morning' | 'evening' | 'night' | 'full-day';
  phone: string;
  salary: number;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  shift: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

// Swipeable Employee Row Component for Mobile
function SwipeableEmployeeRow({
  employee,
  attendanceRecord,
  shiftLabel,
  onMarkPresent,
  onMarkAbsent,
}: {
  employee: Employee;
  attendanceRecord?: AttendanceRecord;
  shiftLabel: string;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 100; // Minimum swipe distance

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStartX.current) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    
    // Only allow horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      setIsSwiping(true);
      // Limit swipe to max 160px (button width)
      setSwipeOffset(Math.max(-160, Math.min(160, deltaX)));
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping) {
      // If swiped left enough, show absent button
      if (swipeOffset < -SWIPE_THRESHOLD) {
        setSwipeOffset(-160);
      } 
      // If swiped right enough, show present button
      else if (swipeOffset > SWIPE_THRESHOLD) {
        setSwipeOffset(160);
      } 
      // Otherwise, snap back
      else {
        setSwipeOffset(0);
      }
    }
    touchStartX.current = 0;
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-white border border-hotel-gold/20">
      {/* Action Buttons (Hidden behind card) */}
      <div className="absolute inset-y-0 left-0 right-0 flex">
        <button
          onClick={() => {
            onMarkPresent();
            setSwipeOffset(0);
          }}
          className="flex-1 bg-green-600 text-white flex items-center justify-center font-semibold min-h-[60px] touch-manipulation"
        >
          ✓ Present
        </button>
        <button
          onClick={() => {
            onMarkAbsent();
            setSwipeOffset(0);
          }}
          className="flex-1 bg-red-600 text-white flex items-center justify-center font-semibold min-h-[60px] touch-manipulation"
        >
          ✗ Absent
        </button>
      </div>

      {/* Employee Card */}
      <div
        className="relative bg-white p-4 transition-transform duration-200 touch-manipulation"
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-hotel-forest">{employee.name}</h4>
            <p className="text-sm text-hotel-forest/70">{employee.role} • {shiftLabel}</p>
            <p className="text-xs text-hotel-forest/50 mt-1">
              {attendanceRecord?.checkIn ? `Checked in: ${attendanceRecord.checkIn}` : 'Not marked'}
            </p>
          </div>
          <div>
            {attendanceRecord ? (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  attendanceRecord.status === 'present'
                    ? 'bg-green-100 text-green-700'
                    : attendanceRecord.status === 'late'
                    ? 'bg-yellow-100 text-yellow-700'
                    : attendanceRecord.status === 'half-day'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {attendanceRecord.status}
              </span>
            ) : (
              <span className="text-hotel-forest/50 text-xs">Swipe →</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      role: 'Waiter',
      shift: 'full-day',
      phone: '+91 98765 43210',
      salary: 18000,
    },
    {
      id: '2',
      name: 'Priya S',
      role: 'Housekeeping',
      shift: 'morning',
      phone: '+91 98765 43211',
      salary: 15000,
    },
  ]);

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: '1',
      date: new Date().toISOString().split('T')[0],
      checkIn: '09:00',
      checkOut: '18:00',
      shift: 'full-day',
      status: 'present',
    },
  ]);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    role: '',
    shift: 'full-day',
    phone: '',
    salary: 0,
  });

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentCount = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'absent').length;

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return;

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name || '',
      role: newEmployee.role || '',
      shift: (newEmployee.shift as Employee['shift']) || 'full-day',
      phone: newEmployee.phone || '',
      salary: newEmployee.salary || 0,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      name: '',
      role: '',
      shift: 'full-day',
      phone: '',
      salary: 0,
    });
    setShowAddEmployee(false);
  };

  const markAttendance = (employeeId: string, status: AttendanceRecord['status']) => {
    const existing = attendance.find(
      (a) => a.employeeId === employeeId && a.date === today
    );

    if (existing) {
      setAttendance(
        attendance.map((a) =>
          a.id === existing.id
            ? { ...a, status, checkIn: new Date().toTimeString().slice(0, 5) }
            : a
        )
      );
    } else {
      const record: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId,
        date: today,
        checkIn: new Date().toTimeString().slice(0, 5),
        shift: employees.find((e) => e.id === employeeId)?.shift || 'full-day',
        status,
      };
      setAttendance([...attendance, record]);
    }
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendance.find((a) => a.employeeId === employeeId && a.date === today);
  };

  const shifts = [
    { value: 'morning', label: 'Morning (6 AM - 2 PM)' },
    { value: 'evening', label: 'Evening (2 PM - 10 PM)' },
    { value: 'night', label: 'Night (10 PM - 6 AM)' },
    { value: 'full-day', label: 'Full Day (9 AM - 9 PM)' },
  ];

  const roles = ['Waiter', 'Housekeeping', 'Cook', 'Manager', 'Security', 'Receptionist', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Users className="text-hotel-gold" size={32} />
          Employee Management
        </h2>
        <p className="text-hotel-forest/70">
          3-Star Hospitality Staff - Attendance and Shift Tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Employees</span>
            <Users className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Present Today</span>
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Absent Today</span>
            <XCircle className="text-red-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Payroll</span>
            <Clock className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">
            {formatCurrency(employees.reduce((sum, e) => sum + e.salary, 0))}
          </p>
        </div>
      </div>

      {/* Add Employee Form */}
      <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-hotel-forest flex items-center gap-2">
            <UserPlus className="text-hotel-gold" size={20} />
            Employee Directory
          </h3>
          <button
            onClick={() => setShowAddEmployee(!showAddEmployee)}
            className="px-4 py-2 bg-hotel-forest text-hotel-gold rounded-lg hover:bg-hotel-forest-light transition-colors font-medium flex items-center gap-2 touch-manipulation"
          >
            <Plus size={18} />
            {showAddEmployee ? 'Cancel' : 'Add Employee'}
          </button>
        </div>

        {showAddEmployee && (
          <div className="mb-6 p-4 bg-hotel-forest/5 rounded-lg border border-hotel-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="px-4 py-2 border border-hotel-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/50 text-hotel-forest touch-manipulation"
              />
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="px-4 py-2 border border-hotel-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/50 text-hotel-forest touch-manipulation"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={newEmployee.shift}
                onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value as Employee['shift'] })}
                className="px-4 py-2 border border-hotel-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/50 text-hotel-forest touch-manipulation"
              >
                {shifts.map((shift) => (
                  <option key={shift.value} value={shift.value}>
                    {shift.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="px-4 py-2 border border-hotel-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/50 text-hotel-forest touch-manipulation"
              />
              <input
                type="number"
                placeholder="Monthly Salary (₹)"
                value={newEmployee.salary || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) || 0 })}
                className="px-4 py-2 border border-hotel-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/50 text-hotel-forest touch-manipulation"
              />
              <button
                onClick={handleAddEmployee}
                className="px-6 py-2 bg-hotel-forest text-hotel-gold rounded-lg hover:bg-hotel-forest-light transition-colors font-medium touch-manipulation"
              >
                Save Employee
              </button>
            </div>
          </div>
        )}

        {/* Employee List with Attendance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-hotel-forest flex items-center gap-2">
              <Calendar className="text-hotel-gold" size={18} />
              Today's Attendance - {today}
            </h4>
          </div>

              {/* Mobile: Swipeable Cards */}
              <div className="lg:hidden space-y-3">
                {employees.map((employee) => {
                  const attendanceRecord = getEmployeeAttendance(employee.id);
                  const shiftLabel = shifts.find((s) => s.value === employee.shift)?.label || employee.shift;
                  
                  return (
                    <SwipeableEmployeeRow
                      key={employee.id}
                      employee={employee}
                      attendanceRecord={attendanceRecord}
                      shiftLabel={shiftLabel}
                      onMarkPresent={() => markAttendance(employee.id, 'present')}
                      onMarkAbsent={() => markAttendance(employee.id, 'absent')}
                    />
                  );
                })}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hotel-forest/10 border-b border-hotel-gold/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Shift</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-gold/10">
                {employees.map((employee) => {
                  const attendanceRecord = getEmployeeAttendance(employee.id);
                  const shiftLabel = shifts.find((s) => s.value === employee.shift)?.label || employee.shift;

                  return (
                    <tr key={employee.id} className="hover:bg-hotel-forest/5 transition-colors">
                      <td className="px-4 py-3 text-hotel-forest font-medium">{employee.name}</td>
                      <td className="px-4 py-3 text-hotel-forest/70">{employee.role}</td>
                      <td className="px-4 py-3 text-hotel-forest/70 text-sm">{shiftLabel}</td>
                      <td className="px-4 py-3 text-hotel-forest/70">
                        {attendanceRecord?.checkIn || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {attendanceRecord ? (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              attendanceRecord.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : attendanceRecord.status === 'late'
                                ? 'bg-yellow-100 text-yellow-700'
                                : attendanceRecord.status === 'half-day'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {attendanceRecord.status}
                          </span>
                        ) : (
                          <span className="text-hotel-forest/50 text-sm">Not marked</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => markAttendance(employee.id, 'present')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors touch-manipulation"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(employee.id, 'absent')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors touch-manipulation"
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

