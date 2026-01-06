/**
 * Purchase Inward Component
 * Upload and process liquor purchase invoices
 * Automatically updates inventory stock using case-to-bottle conversion
 */

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertTriangle, Package, Loader2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/Store';
import {
  type ProductInventory,
  type BottleSize,
  getLiquorConfig,
  addPurchase,
  calculateInventoryValue,
  casesAndBottlesToStockState,
} from '../utils/liquorLogic';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';

interface PurchaseItem {
  brandName: string;
  volume: BottleSize; // in ml
  caseCount: number;
  bottlesPerCase?: number; // Optional, will be calculated from volume
  purchaseCostPerCase?: number;
  lineTotal?: number;
}

interface ParsedPurchaseInvoice {
  items: PurchaseItem[];
  invoiceNumber?: string;
  invoiceDate?: string;
  supplier?: string;
  totalAmount?: number;
}

// Helper to parse bottle size from various formats
function parseBottleSize(volumeStr: string | number): BottleSize | null {
  if (typeof volumeStr === 'number') {
    if ([1000, 750, 500, 375, 650].includes(volumeStr)) {
      return volumeStr as BottleSize;
    }
  }

  const str = String(volumeStr).toLowerCase();
  
  // Match patterns like "750ml", "750 ml", "0.75L", "750ML"
  const mlMatch = str.match(/(\d+)\s*ml/i);
  if (mlMatch) {
    const ml = parseInt(mlMatch[1]);
    if ([1000, 750, 500, 375, 650].includes(ml)) {
      return ml as BottleSize;
    }
  }

  // Match liter patterns like "0.75L", "0.5L", "1L"
  const literMatch = str.match(/(\d+\.?\d*)\s*l/i);
  if (literMatch) {
    const liters = parseFloat(literMatch[1]);
    const ml = Math.round(liters * 1000);
    if ([1000, 750, 500, 375, 650].includes(ml)) {
      return ml as BottleSize;
    }
  }

  return null;
}

// Helper to extract brand name and clean it
function extractBrandName(brandStr: string): string {
  return String(brandStr)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\d+\s*ml/gi, '')
    .replace(/[()]/g, '')
    .trim();
}

// Generate inventory ID (matching Store.ts logic)
const generateInventoryId = (product: ProductInventory): string => {
  return `${product.productName.replace(/\s+/g, '_')}_${product.config.size}`;
};

export default function PurchaseInward() {
  const { inventory, updateInventoryItem, addInventoryItem } = useStore();
  const [parsedInvoice, setParsedInvoice] = useState<ParsedPurchaseInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [processedItems, setProcessedItems] = useState<Set<string>>(new Set());

  // Parse Excel/CSV invoice file
  const parseInvoiceFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      
      // Try to find the main data sheet (could be named "Invoice", "Purchase", "Items", etc.)
      const sheetNames = workbook.SheetNames;
      const dataSheet = 
        workbook.Sheets[sheetNames.find(name => 
          name.toLowerCase().includes('invoice') || 
          name.toLowerCase().includes('purchase') ||
          name.toLowerCase().includes('items') ||
          name.toLowerCase().includes('bill')
        ) || sheetNames[0]];

      if (!dataSheet) {
        throw new Error('Could not find data sheet in invoice file');
      }

      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(dataSheet, { raw: false, defval: '' }) as Record<string, unknown>[];

      // Extract purchase items
      const items: PurchaseItem[] = [];
      let invoiceNumber = '';
      let invoiceDate = '';
      let supplier = '';
      let totalAmount = 0;

      jsonData.forEach((row, index) => {
        // Try to extract invoice metadata from first few rows or headers
        if (index < 3) {
          const rowStr = JSON.stringify(row).toLowerCase();
          if (rowStr.includes('invoice') && !invoiceNumber) {
            invoiceNumber = String(Object.values(row)[0] || '');
          }
          if (rowStr.includes('date') && !invoiceDate) {
            invoiceDate = String(Object.values(row)[1] || Object.values(row)[0] || '');
          }
          if (rowStr.includes('supplier') || rowStr.includes('vendor')) {
            supplier = String(Object.values(row)[1] || Object.values(row)[0] || '');
          }
        }

        // Extract purchase items - try multiple column name variations
        const brandName = 
          row['Brand Name'] || 
          row['Brand'] || 
          row['Product'] || 
          row['Product Name'] || 
          row['Item'] ||
          row['Description'] ||
          '';

        const volumeStr = 
          row['Volume'] || 
          row['Size'] || 
          row['Capacity'] || 
          row['ML'] ||
          row['Quantity'] ||
          '';

        const caseCount = parseFloat(
          String(
            row['Case Count'] || 
            row['Cases'] || 
            row['No. of Cases'] || 
            row['Qty'] ||
            row['Quantity'] ||
            0
          ).replace(/[^\d.]/g, '')
        ) || 0;

        const costPerCase = parseFloat(
          String(
            row['Purchase Cost'] || 
            row['Cost Per Case'] || 
            row['Price'] ||
            row['Rate'] ||
            row['Amount'] ||
            0
          ).replace(/[₹,]/g, '')
        ) || 0;

        // Only add if we have essential data
        if (brandName && volumeStr && caseCount > 0) {
          const volume = parseBottleSize(volumeStr as string | number);
          if (volume) {
            const brand = extractBrandName(String(brandName));
            const config = getLiquorConfig(volume, false);
            const bottlesPerCase = config.bottlesPerCase;
            const lineTotal = costPerCase * caseCount;
            totalAmount += lineTotal;

            items.push({
              brandName: brand,
              volume,
              caseCount,
              bottlesPerCase,
              purchaseCostPerCase: costPerCase || undefined,
              lineTotal,
            });
          }
        }
      });

      if (items.length === 0) {
        throw new Error('No valid purchase items found in invoice. Please check the file format.');
      }

      setParsedInvoice({
        items,
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: invoiceDate || new Date().toLocaleDateString('en-IN'),
        supplier: supplier || 'Unknown Supplier',
        totalAmount,
      });
      setProcessedItems(new Set());
    } catch (err) {
      console.error('Error parsing invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse invoice file');
      setParsedInvoice(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        parseInvoiceFile(file);
      }
    },
    [parseInvoiceFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  // Find matching inventory item for a purchase item
  const findMatchingInventoryItem = (
    brandName: string,
    volume: BottleSize
  ): ProductInventory | null => {
    // Try exact match first (product name contains brand and volume)
    let match = inventory.find((item) => {
      const itemName = item.productName.toLowerCase();
      const brand = brandName.toLowerCase();
      return itemName.includes(brand) && item.config.size === volume;
    });

    // Try fuzzy match (brand name only, same volume)
    if (!match) {
      match = inventory.find((item) => {
        const itemName = item.productName.toLowerCase();
        const brand = brandName.toLowerCase();
        // Check if brand name words match
        const brandWords = brand.split(/\s+/);
        return (
          brandWords.some((word) => itemName.includes(word)) &&
          item.config.size === volume
        );
      });
    }

    return match || null;
  };

  // Process a single purchase item and update inventory
  const processPurchaseItem = (item: PurchaseItem, itemKey: string) => {
    if (processedItems.has(itemKey)) {
      return; // Already processed
    }

    const matchingInventory = findMatchingInventoryItem(item.brandName, item.volume);

    if (matchingInventory) {
      // Update existing inventory item
      const updatedInventory = addPurchase(matchingInventory, item.caseCount, 0);
      
      // Update purchase cost if provided
      if (item.purchaseCostPerCase && item.purchaseCostPerCase > 0) {
        updatedInventory.priceData.purchaseCostPerCase = item.purchaseCostPerCase;
      }

      const itemId = generateInventoryId(matchingInventory);
      updateInventoryItem(itemId, updatedInventory);

      setProcessedItems((prev) => new Set([...prev, itemKey]));
    } else {
      // Create new inventory item
      const config = getLiquorConfig(item.volume, false);
      const purchaseStock = casesAndBottlesToStockState(item.caseCount, 0, config);

      const newInventory: ProductInventory = {
        productName: `${item.brandName} ${item.volume}ml`,
        config,
        openingStock: {
          totalMl: 0,
          fullCases: 0,
          looseBottles: 0,
          loosePegs: 0,
          totalBottles: 0,
          totalPegs: 0,
        },
        purchases: purchaseStock,
        sales: 0,
        priceData: {
          productName: item.brandName,
          size: item.volume,
          category: config.category,
          purchaseCostPerCase: item.purchaseCostPerCase || 0,
        },
        currentStock: purchaseStock,
        wastage: 0,
        remainingVolumeInCurrentBottle: 0,
      };

      addInventoryItem(newInventory);
      setProcessedItems((prev) => new Set([...prev, itemKey]));
    }
  };

  // Process all purchase items
  const handleProcessAll = () => {
    if (!parsedInvoice) return;

    parsedInvoice.items.forEach((item, index) => {
      const itemKey = `${item.brandName}_${item.volume}_${index}`;
      processPurchaseItem(item, itemKey);
    });
  };

  // Process single item
  const handleProcessItem = (item: PurchaseItem, index: number) => {
    const itemKey = `${item.brandName}_${item.volume}_${index}`;
    processPurchaseItem(item, itemKey);
  };

  // Calculate updated closing stock values
  const updatedStockValues = useMemo(() => {
    if (!parsedInvoice) return new Map();

    const values = new Map<string, number>();

    parsedInvoice.items.forEach((item, index) => {
      const itemKey = `${item.brandName}_${item.volume}_${index}`;
      const matchingInventory = findMatchingInventoryItem(item.brandName, item.volume);

      if (matchingInventory) {
        // Calculate what the stock will be after adding purchase
        const tempInventory = addPurchase(matchingInventory, item.caseCount, 0);
        
        // Update price if provided
        if (item.purchaseCostPerCase && item.purchaseCostPerCase > 0) {
          tempInventory.priceData.purchaseCostPerCase = item.purchaseCostPerCase;
        }

        const stockValue = calculateInventoryValue(
          tempInventory.currentStock,
          tempInventory.priceData,
          tempInventory.config
        );
        values.set(itemKey, stockValue);
      } else {
        // New item - calculate value from purchase
        const config = getLiquorConfig(item.volume, false);
        const purchaseStock = casesAndBottlesToStockState(item.caseCount, 0, config);
        const priceData = {
          productName: item.brandName,
          size: item.volume,
          category: config.category,
          purchaseCostPerCase: item.purchaseCostPerCase || 0,
        };
        const stockValue = calculateInventoryValue(purchaseStock, priceData, config);
        values.set(itemKey, stockValue);
      }
    });

    return values;
  }, [parsedInvoice, inventory]);

  // Calculate total processed items count
  const processedCount = processedItems.size;
  const totalItems = parsedInvoice?.items.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Upload className="text-hotel-gold" size={32} />
          Purchase Inward
        </h2>
        <p className="text-hotel-forest/70">
          Upload liquor purchase invoices to automatically update inventory stock
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all touch-manipulation
            ${
              isDragActive
                ? 'border-brushed-gold bg-brushed-gold/10'
                : 'border-hotel-gold/30 hover:border-hotel-gold/50 hover:bg-hotel-forest/5'
            }
          `}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-hotel-gold" size={48} />
              <p className="text-hotel-forest font-medium">Processing invoice...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto text-hotel-gold mb-4" size={48} />
              <p className="text-hotel-forest font-medium text-lg mb-2">
                {isDragActive ? 'Drop invoice file here' : 'Drag & drop invoice file here'}
              </p>
              <p className="text-hotel-forest/60 text-sm">
                or click to browse (Excel, CSV supported)
              </p>
              {uploadedFileName && (
                <p className="text-hotel-forest/50 text-xs mt-2">
                  Last uploaded: {uploadedFileName}
                </p>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="text-red-700 font-medium">Error Processing Invoice</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Parsed Invoice Details */}
      {parsedInvoice && (
        <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6 space-y-6">
          {/* Invoice Header */}
          <div className="border-b border-hotel-gold/20 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-hotel-forest flex items-center gap-2">
                <FileText className="text-hotel-gold" size={24} />
                Invoice Details
              </h3>
              <button
                onClick={() => {
                  setParsedInvoice(null);
                  setUploadedFileName('');
                  setError(null);
                  setProcessedItems(new Set());
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-hotel-forest/60">Invoice Number:</span>
                <p className="text-hotel-forest font-medium">{parsedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="text-hotel-forest/60">Date:</span>
                <p className="text-hotel-forest font-medium">{parsedInvoice.invoiceDate}</p>
              </div>
              <div>
                <span className="text-hotel-forest/60">Supplier:</span>
                <p className="text-hotel-forest font-medium">{parsedInvoice.supplier}</p>
              </div>
              {(parsedInvoice.totalAmount ?? 0) > 0 && (
                <div className="md:col-span-3">
                  <span className="text-hotel-forest/60">Total Amount:</span>
                  <p className="text-hotel-forest font-bold text-lg">
                    {formatCurrency(parsedInvoice.totalAmount ?? 0)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Items Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-hotel-forest">
                Purchase Items ({totalItems})
              </h4>
              {processedCount < totalItems && (
                <button
                  onClick={handleProcessAll}
                  className="px-4 py-2 bg-hotel-forest text-hotel-gold rounded-lg hover:bg-hotel-forest-light transition-colors font-medium flex items-center gap-2 touch-manipulation"
                >
                  <Package size={18} />
                  Process All Items
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hotel-forest/10 border-b border-hotel-gold/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Brand Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Cases
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Bottles/Case
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Cost/Case
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Closing Stock Value
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-hotel-forest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hotel-gold/10">
                  {parsedInvoice.items.map((item, index) => {
                    const itemKey = `${item.brandName}_${item.volume}_${index}`;
                    const isProcessed = processedItems.has(itemKey);
                    const matchingInventory = findMatchingInventoryItem(item.brandName, item.volume);
                    const stockValue = updatedStockValues.get(itemKey) || 0;

                    return (
                      <tr
                        key={itemKey}
                        className={`hover:bg-hotel-forest/5 transition-colors ${
                          isProcessed ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-hotel-forest font-medium">
                          {item.brandName}
                          {matchingInventory && (
                            <span className="text-xs text-hotel-forest/50 block mt-1">
                              ✓ Matches existing inventory
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-hotel-forest">{item.volume}ml</td>
                        <td className="px-4 py-3 text-hotel-forest font-semibold">
                          {formatNumber(item.caseCount, 0)}
                        </td>
                        <td className="px-4 py-3 text-hotel-forest/70">
                          {item.bottlesPerCase || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-hotel-forest">
                          {item.purchaseCostPerCase
                            ? formatCurrency(item.purchaseCostPerCase)
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-hotel-forest font-semibold">
                          {formatCurrency(stockValue)}
                        </td>
                        <td className="px-4 py-3">
                          {isProcessed ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle size={16} />
                              Processed
                            </span>
                          ) : (
                            <span className="text-hotel-forest/50">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!isProcessed && (
                            <button
                              onClick={() => handleProcessItem(item, index)}
                              className="px-3 py-1.5 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors font-medium text-sm touch-manipulation"
                            >
                              Add to Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {processedCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <CheckCircle size={20} />
                Successfully processed {processedCount} of {totalItems} items
              </p>
              <p className="text-green-600 text-sm mt-1">
                Inventory has been updated. Check the Inventory page to view updated stock levels.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

