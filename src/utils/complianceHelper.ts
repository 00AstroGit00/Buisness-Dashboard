/**
 * Compliance Helper
 * Extracts business registration details from documents
 */

export interface BusinessDetails {
  businessName: string;
  gstNumber?: string;
  licenseNumber?: string;
  address?: string;
  panNumber?: string;
}

// Default business details (can be extracted from PDFs in production)
export const DEFAULT_BUSINESS_DETAILS: BusinessDetails = {
  businessName: 'Deepa Restaurant & Tourist Home',
  address: 'Cherpulassery, Palakkad',
};

/**
 * Extract GST number from GST certificate
 * Note: In production, this would parse PDF files
 */
export function extractGSTDetails(): Partial<BusinessDetails> {
  // TODO: Implement PDF parsing using pdfjs-dist
  // For now, return default structure
  return {
    gstNumber: '29XXXXX1234X1Z5', // Placeholder - should be extracted from PDF
  };
}

/**
 * Extract license details from bar license
 * Note: In production, this would parse PDF files
 */
export function extractLicenseDetails(): Partial<BusinessDetails> {
  // TODO: Implement PDF parsing using pdfjs-dist
  return {
    licenseNumber: 'L-XXX-XXXX-XXXX', // Placeholder - should be extracted from PDF
  };
}

/**
 * Get all business details for headers/invoices
 */
export function getBusinessDetails(): BusinessDetails {
  const gstDetails = extractGSTDetails();
  const licenseDetails = extractLicenseDetails();

  return {
    ...DEFAULT_BUSINESS_DETAILS,
    ...gstDetails,
    ...licenseDetails,
  };
}

