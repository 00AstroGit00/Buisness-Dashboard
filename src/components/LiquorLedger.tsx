/**
 * Liquor Ledger Component - 2026 Optimized UI
 * Features: High-performance virtualization via @tanstack/react-virtual.
 * Optimized for 500+ items with minimal RAM overhead.
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  Search, Package, FileText, ChevronRight, 
  Filter, Database, ArrowUpDown, History, Loader2
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { useSearch } from '../hooks/useSearch';
import { Badge } from './Badge';
import { Input } from './Input';
import { Card } from './Card';

interface LedgerItem {
  type: 'header' | 'item';
  data: any;
  category?: string;
}

export default function LiquorLedger() {
  const { inventory } = useBusinessStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const parentRef = useRef<HTMLDivElement>(null);

  const { query, results: filteredResults, handleSearch, isSearching } = useSearch(
    inventory,
    ['productName', 'category']
  );

  // Process data into a flat list with headers for virtualization
  const flatData = useMemo(() => {
    const categories = Array.from(new Set(filteredResults.map(i => i.config.category)));
    const result: LedgerItem[] = [];

    categories.sort().forEach(cat => {
      if (categoryFilter !== 'all' && cat !== categoryFilter) return;
      
      result.push({ type: 'header', data: cat, category: cat });
      
      const catItems = filteredResults
        .filter(i => i.config.category === cat)
        .sort((a, b) => a.productName.localeCompare(b.productName));
        
      catItems.forEach(item => {
        result.push({ type: 'item', data: item, category: cat });
      });
    });

    return result;
  }, [filteredResults, categoryFilter]);

  const rowVirtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (flatData[index]?.type === 'header' ? 48 : 80),
    overscan: 5,
  });

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-brushed-gold/40 text-white rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-white h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-brushed-gold rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Compliance Ledger</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">
            Inventory <span className="gold-gradient-text">Matrix</span>
          </h2>
        </div>

        <div className="flex gap-3">
           <div className="glass px-4 py-2 rounded-2xl border-white/5 flex items-center gap-3">
              <Database size={16} className="text-brushed-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Records</span>
              <span className="text-sm font-black text-white">{inventory.length}</span>
           </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input 
            placeholder="Search brand or category... (Ctrl + F)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={isSearching ? <Loader2 size={20} className="text-brushed-gold animate-spin" /> : <Search size={20} className="text-brushed-gold" />}
            className="py-4 glass border-white/5 text-lg font-bold"
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-brushed-gold transition-colors" size={18} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-4 glass border-white/5 rounded-2xl appearance-none text-sm font-black uppercase tracking-widest outline-none focus:ring-2 ring-brushed-gold/20 transition-all"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(inventory.map(i => i.config.category))).sort().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Virtualized List Container */}
      <Card glass padded={false} className="flex-1 overflow-hidden border-white/5 flex flex-col min-h-[500px]">
        <div className="grid grid-cols-12 px-8 py-4 bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
           <div className="col-span-6 flex items-center gap-2"><Package size={12} /> Product Protocol</div>
           <div className="col-span-2 flex items-center gap-2"><ArrowUpDown size={12} /> Opening</div>
           <div className="col-span-2 flex items-center gap-2"><ArrowUpDown size={12} /> Sales</div>
           <div className="col-span-2 flex items-center gap-2"><History size={12} /> Closing</div>
        </div>

        <div 
          ref={parentRef}
          className="flex-1 overflow-auto custom-scrollbar"
          style={{ height: 'calc(100vh - 450px)' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = flatData[virtualRow.index];
              const isHeader = item.type === 'header';

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`flex flex-col px-8 ${isHeader ? 'z-10 sticky top-0' : ''}`}
                >
                  {isHeader ? (
                    <div className="h-full flex items-center bg-[#0a3d31]/90 backdrop-blur-md border-y border-white/5 -mx-8 px-8">
                       <span className="text-xs font-black uppercase tracking-[0.4em] text-brushed-gold">
                         {item.data} <span className="ml-2 text-[8px] text-white/20">({inventory.filter(i => i.config.category === item.data).length} Units)</span>
                       </span>
                    </div>
                  ) : (
                    <div className="h-full grid grid-cols-12 items-center border-b border-white/[0.02] group hover:bg-white/[0.02] transition-colors">
                       <div className="col-span-6 flex flex-col">
                          <span className="text-sm font-black text-white group-hover:text-brushed-gold transition-colors truncate">
                            {highlightText(item.data.productName, query)}
                          </span>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            Sku: {item.data.config.size}ml
                          </span>
                       </div>
                       <div className="col-span-2 font-mono text-xs font-bold text-white/40">
                          {item.data.openingStock.totalBottles} Btl
                       </div>
                       <div className="col-span-2 font-mono text-xs font-bold text-emerald-500/60">
                          -{item.data.sales || 0} Peg
                       </div>
                       <div className="col-span-2 flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-brushed-gold">
                             {item.data.currentStock.totalBottles} Btl
                          </span>
                          <ChevronRight size={14} className="text-white/5 group-hover:text-brushed-gold transition-all translate-x-4 group-hover:translate-x-0" />
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
