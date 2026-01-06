import { Wine } from 'lucide-react';

export default function BarInventory() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Wine className="text-hotel-gold" size={32} />
          Bar Inventory
        </h2>
        <p className="text-hotel-forest/70">
          Track and manage your bar stock and inventory levels.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-hotel-gold/20">
        <Wine size={64} className="mx-auto text-hotel-gold/40 mb-4" />
        <h3 className="text-xl font-semibold text-hotel-forest mb-2">
          Bar Inventory Module
        </h3>
        <p className="text-hotel-forest/60">
          This section is under development. Inventory tracking and management features will be available here.
        </p>
      </div>
    </div>
  );
}

