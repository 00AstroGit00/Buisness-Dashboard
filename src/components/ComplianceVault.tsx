/**
 * Compliance Vault Component
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
  CheckCircle,
  FileSearch,
  Lock,
  MessageCircle,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-forest-green tracking-tight">Compliance Vault</h1>
          <p className="text-gray-500 font-medium">Secure storage for hotel licenses & permits</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brushed-gold/50 w-full md:w-64"
          />
        </div>
      </div>

      {/* 3. Secure Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 group hover:border-brushed-gold transition-all duration-300 overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${
                doc.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <ShieldCheck size={24} />
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                  doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-forest-green mb-1">{doc.name}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">{doc.permitNumber}</p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-gray-50 text-forest-green rounded-xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                <FileText size={14}/> Open Copy
              </button>
              
              <button 
                onClick={() => handleShareWhatsApp(doc)}
                className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={14}/> Share
              </button>

              <button className="p-3 bg-brushed-gold/20 text-forest-green rounded-xl hover:bg-brushed-gold active:scale-95 transition-all">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

