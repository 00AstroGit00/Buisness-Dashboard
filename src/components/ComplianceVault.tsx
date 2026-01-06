/**
 * Compliance Vault Component
 * Lists all compliance documents with expiry tracking
 * Optimized for MI Pad 7 with easy PDF access
 */

import { useState, useEffect, useMemo } from 'react';
import { FileText, Calendar, AlertTriangle, Shield, Folder, ExternalLink, Clock, CheckCircle } from 'lucide-react';

interface ComplianceDocument {
  id: string;
  name: string;
  path: string;
  type: 'license' | 'certificate' | 'tax' | 'registration' | 'other';
  expiryDate?: Date;
  issueDate?: Date;
  daysRemaining?: number;
  isExpiring?: boolean;
  isExpired?: boolean;
}

/**
 * Extract date from filename patterns like:
 * - "Bar License (2024-25).pdf" -> expiry: end of 2025
 * - "Bar License 2025-2026.pdf" -> expiry: end of 2026
 * - "GST Certificate 2024.pdf" -> expiry: 1 year from issue
 * - "License_2024-12-31.pdf" -> expiry: 2024-12-31
 */
function extractDatesFromFilename(filename: string): { issueDate?: Date; expiryDate?: Date } {
  const result: { issueDate?: Date; expiryDate?: Date } = {};

  // Pattern 1: Year range in parentheses "(2024-25)" or "(2024-2025)"
  const yearRangePattern = /\((\d{4})-(\d{2,4})\)/;
  const yearRangeMatch = filename.match(yearRangePattern);
  if (yearRangeMatch) {
    const startYear = parseInt(yearRangeMatch[1]);
    let endYear = parseInt(yearRangeMatch[2]);
    
    // If 2-digit year, assume it's the last 2 digits of a year
    if (endYear < 100) {
      endYear = startYear < 2000 ? 2000 + endYear : startYear + (endYear - (startYear % 100));
    }
    
    // Set expiry to end of the end year
    result.expiryDate = new Date(endYear, 11, 31); // December 31
    result.issueDate = new Date(startYear, 0, 1); // January 1
  }

  // Pattern 2: Year range without parentheses "2024-2025" or "2024-25"
  if (!result.expiryDate) {
    const yearRangePattern2 = /(\d{4})-(\d{2,4})/;
    const yearRangeMatch2 = filename.match(yearRangePattern2);
    if (yearRangeMatch2) {
      const startYear = parseInt(yearRangeMatch2[1]);
      let endYear = parseInt(yearRangeMatch2[2]);
      
      if (endYear < 100) {
        endYear = startYear < 2000 ? 2000 + endYear : startYear + (endYear - (startYear % 100));
      }
      
      result.expiryDate = new Date(endYear, 11, 31);
      result.issueDate = new Date(startYear, 0, 1);
    }
  }

  // Pattern 3: Single year "2024" or "2025"
  if (!result.expiryDate) {
    const singleYearPattern = /(\d{4})/;
    const singleYearMatch = filename.match(singleYearPattern);
    if (singleYearMatch) {
      const year = parseInt(singleYearMatch[1]);
      result.expiryDate = new Date(year, 11, 31); // End of that year
      result.issueDate = new Date(year, 0, 1);
    }
  }

  // Pattern 4: Full date "2024-12-31" or "31-12-2024"
  if (!result.expiryDate) {
    const fullDatePattern = /(\d{4})-(\d{2})-(\d{2})/;
    const fullDateMatch = filename.match(fullDatePattern);
    if (fullDateMatch) {
      const year = parseInt(fullDateMatch[1]);
      const month = parseInt(fullDateMatch[2]) - 1;
      const day = parseInt(fullDateMatch[3]);
      result.expiryDate = new Date(year, month, day);
    }
  }

  return result;
}

/**
 * Determine document type from filename
 */
function getDocumentType(filename: string): ComplianceDocument['type'] {
  const lower = filename.toLowerCase();
  
  if (lower.includes('license') || lower.includes('licence')) {
    return 'license';
  }
  if (lower.includes('gst') || lower.includes('tax') || lower.includes('vat')) {
    return 'tax';
  }
  if (lower.includes('certificate') || lower.includes('cert')) {
    return 'certificate';
  }
  if (lower.includes('registration') || lower.includes('register')) {
    return 'registration';
  }
  
  return 'other';
}

/**
 * Calculate days remaining until expiry
 */
function calculateDaysRemaining(expiryDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export default function ComplianceVault() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents from Business-documents folder
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      
      // In production, this would scan the actual directory
      // For now, we'll use a predefined list based on the folder structure
      const documentFiles: Array<{ name: string; path: string }> = [
        {
          name: 'GST CERTIFICATE DEEPA.pdf',
          path: 'Business-documents/Licenses_Registrations/GST CERTIFICATE DEEPA.pdf',
        },
        {
          name: 'Bar License (2024-25).pdf',
          path: 'Business-documents/Licenses_Registrations/Bar License (2024-25).pdf',
        },
        {
          name: 'Bar License 2025-2026.pdf',
          path: 'Business-documents/Licenses_Registrations/Bar License 2025-2026.pdf',
        },
        {
          name: 'Pan Card (Deepa Cherpulassery).pdf',
          path: 'Business-documents/Licenses_Registrations/Pan Card (Deepa Cherpulassery).pdf',
        },
        {
          name: 'Trade License.pdf',
          path: 'Business-documents/Licenses_Registrations/Trade License.pdf',
        },
        {
          name: 'FSSAI License.pdf',
          path: 'Business-documents/Licenses_Registrations/FSSAI License.pdf',
        },
      ];

      // Process documents with date extraction
      const processedDocs: ComplianceDocument[] = documentFiles.map((file) => {
        const { issueDate, expiryDate } = extractDatesFromFilename(file.name);
        const type = getDocumentType(file.name);
        
        let daysRemaining: number | undefined;
        let isExpiring = false;
        let isExpired = false;

        if (expiryDate) {
          daysRemaining = calculateDaysRemaining(expiryDate);
          isExpiring = daysRemaining <= 30 && daysRemaining > 0;
          isExpired = daysRemaining < 0;
        }

        return {
          id: file.path,
          name: file.name,
          path: file.path,
          type,
          issueDate,
          expiryDate,
          daysRemaining,
          isExpiring,
          isExpired,
        };
      });

      setDocuments(processedDocs);
      setIsLoading(false);
    };

    loadDocuments();
  }, []);

  // Group documents by type
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, ComplianceDocument[]> = {
      license: [],
      certificate: [],
      tax: [],
      registration: [],
      other: [],
    };

    documents.forEach((doc) => {
      groups[doc.type].push(doc);
    });

    return groups;
  }, [documents]);

  // Count expiring documents
  const expiringCount = useMemo(() => {
    return documents.filter((doc) => doc.isExpiring).length;
  }, [documents]);

  // Count expired documents
  const expiredCount = useMemo(() => {
    return documents.filter((doc) => doc.isExpired).length;
  }, [documents]);

  // Handle document open
  const handleOpenDocument = (path: string) => {
    // In production, this would open the actual file
    // For now, try to open from public folder
    window.open(`/${path}`, '_blank');
  };

  // Format date for display
  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadge = (doc: ComplianceDocument) => {
    if (doc.isExpired) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
          <AlertTriangle size={12} />
          Expired
        </span>
      );
    }
    if (doc.isExpiring) {
      return (
        <span className="px-2 py-1 bg-brushed-gold text-forest-green rounded text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          Expires in {doc.daysRemaining} days
        </span>
      );
    }
    if (doc.expiryDate) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
          <CheckCircle size={12} />
          Valid
        </span>
      );
    }
    return null;
  };

  const typeLabels: Record<string, string> = {
    license: 'Licenses',
    certificate: 'Certificates',
    tax: 'Tax Documents',
    registration: 'Registrations',
    other: 'Other Documents',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Folder className="text-hotel-gold" size={32} />
          Compliance Vault
        </h2>
        <p className="text-hotel-forest/70">
          Manage all business compliance documents with expiry tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Documents</span>
            <FileText className="text-hotel-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-hotel-forest">{documents.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Expiring Soon</span>
            <AlertTriangle className="text-brushed-gold" size={20} />
          </div>
          <p className={`text-2xl font-bold ${expiringCount > 0 ? 'text-brushed-gold' : 'text-hotel-forest'}`}>
            {expiringCount}
          </p>
          {expiringCount > 0 && (
            <p className="text-xs text-hotel-forest/60 mt-1">Within 30 days</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Expired</span>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className={`text-2xl font-bold ${expiredCount > 0 ? 'text-red-600' : 'text-hotel-forest'}`}>
            {expiredCount}
          </p>
        </div>
      </div>

      {/* Warning Alert for Expiring Documents */}
      {expiringCount > 0 && (
        <div className="bg-brushed-gold/10 border-2 border-brushed-gold rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-brushed-gold mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-hotel-forest mb-1">
                {expiringCount} {expiringCount === 1 ? 'License' : 'Licenses'} Expiring Soon
              </h3>
              <p className="text-sm text-hotel-forest/70">
                Renew these documents within the next 30 days to maintain compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents by Category */}
      {isLoading ? (
        <div className="text-center py-12 text-hotel-forest/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold"></div>
          <p className="mt-2">Loading documents...</p>
        </div>
      ) : (
        Object.entries(groupedDocuments).map(([type, docs]) => {
          if (docs.length === 0) return null;

          return (
            <div key={type} className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
              <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
                {type === 'license' && <Shield className="text-hotel-gold" size={20} />}
                {type === 'certificate' && <FileText className="text-hotel-gold" size={20} />}
                {type === 'tax' && <Calendar className="text-hotel-gold" size={20} />}
                {typeLabels[type] || 'Documents'}
                <span className="text-sm font-normal text-hotel-forest/50">
                  ({docs.length})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleOpenDocument(doc.path)}
                    className={`
                      group relative p-4 rounded-lg border-2 transition-all duration-200
                      touch-manipulation min-h-[100px]
                      ${
                        doc.isExpired
                          ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                          : doc.isExpiring
                          ? 'border-brushed-gold bg-brushed-gold/5 hover:bg-brushed-gold/10'
                          : 'border-hotel-gold/20 bg-hotel-forest/5 hover:bg-hotel-forest/10 hover:border-hotel-gold/40'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 text-left">
                        <div className="flex items-start gap-2 mb-2">
                          <FileText
                            className={`mt-1 ${
                              doc.isExpiring
                                ? 'text-brushed-gold'
                                : doc.isExpired
                                ? 'text-red-600'
                                : 'text-hotel-gold'
                            }`}
                            size={20}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-hotel-forest group-hover:text-hotel-forest/80 text-sm leading-tight mb-1">
                              {doc.name.replace('.pdf', '').replace('.PDF', '')}
                            </h4>
                            {doc.expiryDate && (
                              <div className="text-xs text-hotel-forest/60 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>Expires: {formatDate(doc.expiryDate)}</span>
                                </div>
                                {doc.issueDate && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>Issued: {formatDate(doc.issueDate)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(doc)}
                      </div>
                      <ExternalLink
                        className={`flex-shrink-0 mt-1 ${
                          doc.isExpiring
                            ? 'text-brushed-gold'
                            : 'text-hotel-gold/50 group-hover:text-hotel-gold'
                        }`}
                        size={18}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-12 text-center">
          <Folder className="mx-auto text-hotel-gold/50 mb-4" size={48} />
          <p className="text-hotel-forest/70">No documents found in Business-documents folder</p>
        </div>
      )}
    </div>
  );
}

