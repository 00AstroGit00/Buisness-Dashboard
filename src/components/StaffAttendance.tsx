import { UserCheck } from 'lucide-react';

export default function StaffAttendance() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <UserCheck className="text-hotel-gold" size={32} />
          Staff Attendance
        </h2>
        <p className="text-hotel-forest/70">
          Monitor staff attendance, schedules, and time tracking.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-hotel-gold/20">
        <UserCheck size={64} className="mx-auto text-hotel-gold/40 mb-4" />
        <h3 className="text-xl font-semibold text-hotel-forest mb-2">
          Staff Attendance Module
        </h3>
        <p className="text-hotel-forest/60">
          This section is under development. Attendance tracking and management features will be available here.
        </p>
      </div>
    </div>
  );
}

