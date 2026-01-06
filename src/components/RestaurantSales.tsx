import { TrendingUp } from 'lucide-react';

export default function RestaurantSales() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <TrendingUp className="text-hotel-gold" size={32} />
          Restaurant Sales
        </h2>
        <p className="text-hotel-forest/70">
          View sales reports, analytics, and revenue trends.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-hotel-gold/20">
        <TrendingUp size={64} className="mx-auto text-hotel-gold/40 mb-4" />
        <h3 className="text-xl font-semibold text-hotel-forest mb-2">
          Restaurant Sales Module
        </h3>
        <p className="text-hotel-forest/60">
          This section is under development. Sales analytics and reporting features will be available here.
        </p>
      </div>
    </div>
  );
}

