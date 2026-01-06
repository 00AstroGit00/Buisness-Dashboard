import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  shift: 'Front Desk' | 'Bar' | 'Kitchen' | 'Other';
  status: 'present' | 'absent' | 'late' | 'on-leave';
  checkIn?: string;
}

export default function EmployeeHub() {
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      shift: 'Front Desk',
      status: 'present',
      checkIn: '09:00',
    },
    {
      id: '2',
      name: 'Priya S',
      shift: 'Kitchen',
      status: 'present',
      checkIn: '08:30',
    },
    {
      id: '3',
      name: 'Suresh Nair',
      shift: 'Bar',
      status: 'present',
      checkIn: '10:00',
    },
    {
      id: '4',
      name: 'Meera V',
      shift: 'Front Desk',
      status: 'late',
      checkIn: '09:45',
    },
    {
      id: '5',
      name: 'Ajith K',
      shift: 'Kitchen',
      status: 'absent',
    },
    {
      id: '6',
      name: 'Lakshmi P',
      shift: 'Bar',
      status: 'present',
      checkIn: '09:15',
    },
  ]);

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'on-leave':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: Employee['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'late':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'absent':
        return <XCircle size={20} className="text-red-600" />;
      case 'on-leave':
        return <Clock size={20} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getShiftColor = (shift: Employee['shift']) => {
    switch (shift) {
      case 'Front Desk':
        return 'bg-forest-green/10 text-forest-green border-forest-green/20';
      case 'Bar':
        return 'bg-brushed-gold/10 text-brushed-gold border-brushed-gold/30';
      case 'Kitchen':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const presentCount = employees.filter((e) => e.status === 'present').length;
  const absentCount = employees.filter((e) => e.status === 'absent').length;
  const lateCount = employees.filter((e) => e.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2 flex items-center gap-3">
          <Users className="text-brushed-gold" size={32} />
          Employee Hub
        </h2>
        <p className="text-forest-green/70">
          Staff overview with shift assignments and real-time attendance status
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-forest-green/70">Total</span>
            <Users className="text-brushed-gold" size={18} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-forest-green">{employees.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-forest-green/70">Present</span>
            <CheckCircle className="text-green-600" size={18} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-forest-green/70">Late</span>
            <AlertCircle className="text-yellow-600" size={18} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{lateCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-forest-green/70">Absent</span>
            <XCircle className="text-red-600" size={18} />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{absentCount}</p>
        </div>
      </div>

      {/* Employee Cards Grid - Responsive for Samsung S23 Ultra and MI Pad 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-xl border border-brushed-gold/20 shadow-md hover:shadow-lg transition-all duration-200 p-5 sm:p-6 touch-manipulation"
          >
            {/* Employee Name */}
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-forest-green mb-2">
                {employee.name}
              </h3>
              
              {/* Shift Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getShiftColor(employee.shift)}`}>
                {employee.shift}
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${getStatusColor(employee.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(employee.status)}
                  <span className="text-sm font-semibold capitalize">{employee.status}</span>
                </div>
              </div>

              {/* Check-in Time */}
              {employee.checkIn && (
                <div className="flex items-center gap-2 text-forest-green/70 text-sm">
                  <Clock size={16} />
                  <span>Checked in: {employee.checkIn}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {employees.length === 0 && (
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-12 text-center">
          <Users size={64} className="mx-auto text-forest-green/30 mb-4" />
          <h3 className="text-xl font-semibold text-forest-green mb-2">No Employees</h3>
          <p className="text-forest-green/60">
            Add employees to start tracking attendance and shifts.
          </p>
        </div>
      )}
    </div>
  );
}

