/**
 * Compliance Vault Component - Upgraded UI
 * Secure storage for hotel licenses and permits with expiry tracking.
 */

import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Plus, 
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileSearch,
  Lock,
  MessageCircle,
  Share2,
  ChevronRight,
  Shield,
  Eye,
  Activity,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

interface Document {
  id: string;
  name: string;
  type: 'GST' | 'Excise' | 'FSSAI' | 'Health' | 'Police';
  expiryDate: string; // YYYY-MM-DD
  status: 'active' | 'expired' | 'expiring_soon';
  filePath: string;
  permitNumber: string;
}

const INITIAL_DOCS: Document[] = [
  { id: '1', name: 'GST Registration Certificate', type: 'GST', expiryDate: '2026-12-31', status: 'active', filePath: 'Business-documents/Licenses/GST_Deepa.pdf', permitNumber: '32AABFD4421R1Z5' },
  { id: '2', name: 'FL-3 Bar License (Excise)', type: 'Excise', expiryDate: '2026-03-31', status: 'expiring_soon', filePath: 'Business-documents/Licenses/Excise_2026.pdf', permitNumber: 'KER-EX-2024-442' },
  { id: '3', name: 'FSSAI Food Safety License', type: 'FSSAI', expiryDate: '2026-01-25', status: 'expiring_soon', filePath: 'Business-documents/Licenses/FSSAI_2026.pdf', permitNumber: '11324001000123' },
];

export default function ComplianceVault() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Document[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');

  // --- 1. One-Click Share Logic ---
  const handleShareWhatsApp = (doc: Document) => {
    const message = encodeURIComponent(
      `*OFFICIAL COMPLIANCE DOCUMENT*\n` +
      `Deepa Restaurant & Tourist Home\n\n` +
      `*Document:* ${doc.name}\n` +
      `*Permit #:* ${doc.permitNumber}\n` +
      `*Expiry:* ${new Date(doc.expiryDate).toLocaleDateString('en-IN')}\n\n` +
      `This is an automated share from the Management Dashboard.`
    );
    window.open(`whatsapp://send?text=${message}`, '_blank');
  };

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.permitNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [docs, search]);

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Regulatory Affairs</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Compliance <span className="text-brushed-gold">Vault</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Biometric Authentication Enabled</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <Shield size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">End-to-End Encryption</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Button variant="gold" leftIcon={<Plus size={18} />} className="rounded-2xl shadow-xl shadow-brushed-gold/10">
             Deposit Document
           </Button>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-forest-green border-0 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <Lock size={100} />
            </div>
            <CardHeader className="mb-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Vault Integrity</p>
               <Badge variant="gold" className="bg-white/20 text-white border-0 font-black">SECURE</Badge>
            </CardHeader>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Verified Storage</h3>
            <p className="text-[10px] font-bold text-brushed-gold mt-2 uppercase tracking-widest flex items-center gap-1">
               <CheckCircle2 size={12} /> Last scan: Today, 09:42 AM
            </p>
         </Card>

         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
               <Clock size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pending Renewals</p>
               <p className="text-2xl font-black text-forest-green">02 <span className="text-xs text-gray-400 uppercase font-bold tracking-widest ml-1">Items</span></p>
            </div>
         </Card>

         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-green/5 flex items-center justify-center text-forest-green">
               <History size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Audit History</p>
               <p className="text-2xl font-black text-forest-green">100<span className="text-lg text-brushed-gold">%</span></p>
            </div>
         </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-brushed-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <Input 
              placeholder="Search by license name, permit number or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="text-brushed-gold" size={20} />}
              className="py-4 rounded-2xl border-0 shadow-xl bg-white relative z-10 font-bold"
            />
         </div>
         <Button variant="secondary" className="rounded-2xl h-14 px-8" leftIcon={<FileSearch size={18} />}>
            Full Audit View
         </Button>
      </div>

      {/* Document Gallery - Upgraded UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} padded={false} className="border-0 shadow-2xl rounded-[2.5rem] bg-white group hover:scale-[1.02] transition-all duration-500 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-[1.5rem] bg-gradient-to-tr transition-all duration-500 ${ 
                  doc.status === 'active' ? 'from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20' : 'from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                }`}>
                  <ShieldCheck size={32} />
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <Badge variant={doc.status === 'active' ? 'success' : 'warning'} className="uppercase font-black px-3 py-1 border-0">
                    {doc.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-forest-green/30 uppercase tracking-widest">
                     <Clock size={10} />
                     Expires {new Date(doc.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-forest-green tracking-tight group-hover:text-brushed-gold transition-colors">{doc.name}</h3>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-bold text-gray-400 font-mono tracking-widest">{doc.permitNumber}</p>
                   <Badge variant="secondary" className="bg-forest-green/5 text-forest-green border-0 text-[8px] uppercase">{doc.type}</Badge>
                </div>
              </div>

              {/* Document Preview Placeholder */}
              <div className="mt-6 relative h-32 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group-hover:bg-forest-green transition-all duration-500">
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:opacity-0 transition-opacity">
                    <FileText size={24} className="text-gray-200" />
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Encrypted PDF View</span>
                 </div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                    <Button variant="gold" size="xs" className="rounded-lg h-8 px-4" leftIcon={<Eye size={12} />}>View Details</Button>
                 </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest"
                leftIcon={<FileText size={16}/>}
              >
                Open Copy
              </Button>
              
              <Button 
                onClick={() => handleShareWhatsApp(doc)}
                className="flex-1 rounded-2xl h-14 bg-[#25D366] hover:bg-[#128C7E] text-white border-0 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20"
                leftIcon={<MessageCircle size={16}/>}
              >
                Share
              </Button>

              <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-gray-100 text-forest-green hover:bg-forest-green hover:text-white">
                <Download size={20} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}