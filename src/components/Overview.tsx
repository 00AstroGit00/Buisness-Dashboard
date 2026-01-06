import { DollarSign, BedDouble, Wine, Clock } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
  bgGradient: string;
  iconBg: string;
}

function KPICard({ title, value, icon, trend, trendColor, bgGradient, iconBg }: KPICardProps) {
  return (
    <div className={`${bgGradient} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-hotel-gold/20`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-lg border border-hotel-gold/30`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-hotel-forest/80 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl md:text-3xl font-bold text-hotel-forest">{value}</p>
    </div>
  );
}

export default function Overview() {
  const kpis = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      icon: <DollarSign size={24} className="text-hotel-gold" />,
      trend: '+12.5%',
      trendColor: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-white to-green-50/50',
      iconBg: 'bg-hotel-forest/10',
    },
    {
      title: 'Occupancy Rate',
      value: '87.5%',
      icon: <BedDouble size={24} className="text-hotel-gold" />,
      trend: '+5.2%',
      trendColor: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-white to-green-50/50',
      iconBg: 'bg-hotel-forest/10',
    },
    {
      title: 'Bar Sales',
      value: '₹45,920',
      icon: <Wine size={24} className="text-hotel-gold" />,
      trend: '+8.3%',
      trendColor: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-white to-green-50/50',
      iconBg: 'bg-hotel-forest/10',
    },
    {
      title: 'Pending Check-ins',
      value: '12',
      icon: <Clock size={24} className="text-hotel-gold" />,
      trend: '3 Today',
      trendColor: 'text-amber-600',
      bgGradient: 'bg-gradient-to-br from-white to-green-50/50',
      iconBg: 'bg-hotel-forest/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2">
          Dashboard Overview
        </h2>
        <p className="text-hotel-forest/70">
          Welcome back! Here's what's happening at your hotel today.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Additional Content Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-hotel-gold/20">
        <h3 className="text-xl font-semibold text-hotel-forest mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-50/50 to-green-50 rounded-lg border border-hotel-gold/20">
            <p className="text-sm text-hotel-forest/70 mb-1">Average Stay Duration</p>
            <p className="text-2xl font-bold text-hotel-forest">2.5 days</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50/50 to-green-50 rounded-lg border border-hotel-gold/20">
            <p className="text-sm text-hotel-forest/70 mb-1">Restaurant Covers Today</p>
            <p className="text-2xl font-bold text-hotel-forest">156</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50/50 to-green-50 rounded-lg border border-hotel-gold/20">
            <p className="text-sm text-hotel-forest/70 mb-1">Staff On Duty</p>
            <p className="text-2xl font-bold text-hotel-forest">18 / 24</p>
          </div>
        </div>
      </div>
    </div>
  );
}

