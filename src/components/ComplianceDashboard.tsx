/**
 * Compliance Dashboard Component
 * Monitors files for GST/Tax keywords and calculates tax liability
 */

import { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { useStore } from '../store/Store';

interface TaxDocument {
  name: string;
  path: string;
  type: 'gst' | 'tax' | 'invoice' | 'receipt';
  date: string;
  amount?: number;
  taxAmount?: number;
}

interface ComplianceStatus {
  totalTaxLiability: number;
  documentsFound: number;
  gstDocuments: number;
  taxDocuments: number;
  lastUpdated: string;
  warnings: string[];
}

export default function ComplianceDashboard() {
  const { dailySales } = useStore();
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scan for tax-related documents (simulated - in production would scan file system)
  useEffect(() => {
    const scanDocuments = async () => {
      setIsLoading(true);
      
      // Simulate scanning Business-documents folder for GST/Tax files
      // In production, this would use a backend API to scan the directory
      const foundDocuments: TaxDocument[] = [
        {
          name: 'GST CERTIFICATE DEEPA.pdf',
          path: 'Business-documents/Licenses_Registrations/GST CERTIFICATE DEEPA.pdf',
          type: 'gst',
          date: '2024-01-15',
        },
        {
          name: 'Monthly GST Return - January 2024',
          path: 'Business-documents/Tax/GST_Return_Jan_2024.xlsx',
          type: 'gst',
          date: '2024-01-31',
          amount: 150000,
          taxAmount: 7500, // 5% GST
        },
        {
          name: 'Tax Receipt - January 2024',
          path: 'Business-documents/Tax/Tax_Receipt_Jan_2024.pdf',
          type: 'tax',
          date: '2024-01-31',
          amount: 150000,
          taxAmount: 7500,
        },
      ];

      // Add documents found in daily sales (if they contain tax info)
      // This is a simplified version - in production, you'd parse actual files
      setDocuments(foundDocuments);
      setIsLoading(false);
    };

    scanDocuments();
  }, []);

  // Calculate tax liability from sales data
  const complianceStatus = useMemo<ComplianceStatus>(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthSales = dailySales.filter((sale) => sale.date.startsWith(currentMonth));

    // Calculate total revenue for the month
    const monthlyRevenue = monthSales.reduce((sum, sale) => {
      return sum + sale.roomRent + sale.restaurantBills + sale.barSales;
    }, 0);

    // GST calculation (5% for hotel services in India)
    const gstRate = 0.05; // 5%
    const cgstRate = 0.025; // 2.5% (Central GST)
    const sgstRate = 0.025; // 2.5% (State GST)
    
    const totalTaxLiability = monthlyRevenue * gstRate;
    const cgstLiability = monthlyRevenue * cgstRate;
    const sgstLiability = monthlyRevenue * sgstRate;

    // Calculate from tax documents
    const taxFromDocs = documents
      .filter((doc) => doc.taxAmount)
      .reduce((sum, doc) => sum + (doc.taxAmount || 0), 0);

    // Total liability = sales tax + any additional taxes from documents
    const totalLiability = totalTaxLiability + taxFromDocs;

    // Count documents by type
    const gstDocuments = documents.filter((doc) => doc.type === 'gst').length;
    const taxDocuments = documents.filter((doc) => doc.type === 'tax' || doc.type === 'invoice').length;

    // Generate warnings
    const warnings: string[] = [];
    const today = new Date();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 20); // GST filing due on 20th
    
    const daysUntilFiling = Math.ceil((monthEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilFiling <= 7 && daysUntilFiling > 0) {
      warnings.push(`GST filing due in ${daysUntilFiling} days (${monthEnd.toLocaleDateString()})`);
    }
    
    if (daysUntilFiling < 0) {
      warnings.push(`GST filing overdue by ${Math.abs(daysUntilFiling)} days!`);
    }

    return {
      totalTaxLiability: totalLiability,
      documentsFound: documents.length,
      gstDocuments,
      taxDocuments,
      lastUpdated: new Date().toISOString(),
      warnings,
      // Additional breakdown for display
      monthlyRevenue,
      cgstLiability,
      sgstLiability,
      taxFromDocs,
    } as ComplianceStatus & {
      monthlyRevenue: number;
      cgstLiability: number;
      sgstLiability: number;
      taxFromDocs: number;
    };
  }, [dailySales, documents]);

  const status = complianceStatus as ComplianceStatus & {
    monthlyRevenue: number;
    cgstLiability: number;
    sgstLiability: number;
    taxFromDocs: number;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Shield className="text-hotel-gold" size={32} />
          Compliance Dashboard
        </h2>
        <p className="text-hotel-forest/70">
          Tax liability monitoring and GST compliance tracking
        </p>
      </div>

      {/* Warnings */}
      {status.warnings.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Compliance Warnings</h3>
              <ul className="list-disc list-inside space-y-1">
                {status.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700 text-sm">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tax Liability Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Monthly Revenue</span>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">
            {formatCurrency(status.monthlyRevenue)}
          </p>
        </div>

        <div className="bg-linear-to-br from-forest-green to-forest-green/80 rounded-xl p-6 border-2 border-brushed-gold/30 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brushed-gold/90">Total Tax Liability</span>
            <DollarSign className="text-brushed-gold" size={20} />
          </div>
          <p className="text-3xl font-bold text-brushed-gold">
            {formatCurrency(status.totalTaxLiability)}
          </p>
          <p className="text-xs text-brushed-gold/80 mt-1">This Month</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">CGST (2.5%)</span>
            <FileText className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">
            {formatCurrency(status.cgstLiability)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">SGST (2.5%)</span>
            <FileText className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">
            {formatCurrency(status.sgstLiability)}
          </p>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">GST Documents</span>
            <FileText className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">{status.gstDocuments}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Tax Documents</span>
            <FileText className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">{status.taxDocuments}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Documents</span>
            <Shield className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">{status.documentsFound}</p>
        </div>
      </div>

      {/* Tax Documents List */}
      <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
          <Calendar className="text-hotel-gold" size={20} />
          Tax Documents Found
        </h3>
        {isLoading ? (
          <div className="text-center py-8 text-hotel-forest/50">Scanning documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-hotel-forest/50">
            No tax documents found in Business-documents folder
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hotel-forest/10 border-b border-hotel-gold/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Document Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-hotel-forest">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-hotel-forest">Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hotel-gold/10">
                {documents.map((doc, index) => (
                  <tr key={index} className="hover:bg-hotel-forest/5 transition-colors">
                    <td className="px-4 py-3 text-hotel-forest font-medium">{doc.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          doc.type === 'gst'
                            ? 'bg-green-100 text-green-700'
                            : doc.type === 'tax'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {doc.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-hotel-forest/70">{doc.date}</td>
                    <td className="px-4 py-3 text-right text-hotel-forest">
                      {doc.amount ? formatCurrency(doc.amount) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-hotel-forest font-semibold">
                      {doc.taxAmount ? formatCurrency(doc.taxAmount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-hotel-gold/20">
          <p className="text-xs text-hotel-forest/50 text-center">
            Last updated: {new Date(status.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

