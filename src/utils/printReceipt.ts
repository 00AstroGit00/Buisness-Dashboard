/**
 * Specialized Printing Utility for 80mm Thermal Printers
 * Formats invoices with centered branding and itemized tax breakdowns.
 * Optimized for Deepa Restaurant & Tourist Home.
 */

import { formatCurrency } from './formatCurrency';

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  roomNumber?: string;
  guestName?: string;
  items: Array<{
    description: string;
    qty: number;
    amount: number;
    category: 'food' | 'liquor' | 'room';
  }>;
  taxSummary: {
    foodGst: number;
    liquorTax: number;
  };
  total: number;
}

/**
 * Generates an 80mm-width HTML template for thermal printing.
 */
export function generateReceiptHTML(data: ReceiptData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding: 4px 0; font-size: 11px;">
        ${item.description.toUpperCase()}
        <br/>
        <span style="font-size: 9px; opacity: 0.7;">${item.qty} x ${formatCurrency(item.amount / item.qty)}</span>
      </td>
      <td style="text-align: right; padding: 4px 0; vertical-align: top; font-weight: bold;">
        ${formatCurrency(item.amount)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${data.receiptNumber}</title>
        <style>
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 0; padding: 5mm; width: 80mm; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; }
            .no-print { display: none; }
          }
          body { width: 80mm; margin: 0 auto; padding: 20px; font-family: 'Courier New', Courier, monospace; background: #fff; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .logo { font-size: 24px; letter-spacing: 2px; margin-bottom: 2px; color: #0a3d31; }
          .sub-logo { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; color: #0a3d31; }
          table { width: 100%; border-collapse: collapse; }
          .total-box { border: 1px solid #000; padding: 8px; text-align: center; font-size: 18px; margin-top: 15px; font-weight: 900; }
          .tax-table { font-size: 10px; color: #333; margin-top: 5px; }
          .header-info { font-size: 10px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <!-- CENTERING LOGO AND DETAILS -->
        <div class="center">
          <div class="logo bold">DEEPA</div>
          <div class="sub-logo">Restaurant & Tourist Home</div>
          <div class="header-info">
            Cherpulassery, Palakkad - 679335<br/>
            Phone: +91 466 2282201<br/>
            <span class="bold underline">TAX INVOICE</span><br/>
            <span class="bold">GSTIN: 32AABFD4421R1Z5</span>
          </div>
        </div>

        <div class="divider"></div>

        <div style="font-size: 11px; margin-bottom: 5px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Inv No: <span class="bold">${data.receiptNumber}</span></span>
            <span>Date: ${data.date}</span>
          </div>
          ${data.roomNumber ? `<div style="margin-top: 2px;">Room: <span class="bold">${data.roomNumber}</span></div>` : ''}
          ${data.guestName ? `<div style="margin-top: 2px;">Guest: <span class="bold">${data.guestName}</span></div>` : ''}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000; font-size: 10px; text-transform: uppercase;">
              <th style="text-align: left; padding-bottom: 5px;">Description</th>
              <th style="text-align: right; padding-bottom: 5px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="divider"></div>

        <table class="tax-table">
          <tr>
            <td>SUBTOTAL:</td>
            <td style="text-align: right;">${formatCurrency(data.total - data.taxSummary.foodGst - data.taxSummary.liquorTax)}</td>
          </tr>
          <!-- DETAILED BREAKDOWN -->
          ${data.taxSummary.foodGst > 0 ? `
          <tr>
            <td>REST. FOOD GST (5%):</td>
            <td style="text-align: right;">${formatCurrency(data.taxSummary.foodGst)}</td>
          </tr>` : ''}
          ${data.taxSummary.liquorTax > 0 ? `
          <tr>
            <td>BAR LIQUOR TAX/EXCISE:</td>
            <td style="text-align: right;">${formatCurrency(data.taxSummary.liquorTax)}</td>
          </tr>` : ''}
        </table>

        <div class="total-box">
          NET PAYABLE: ${formatCurrency(data.total)}
        </div>

        <div class="divider"></div>

        <div class="center" style="font-size: 10px; margin-top: 10px;">
          THANK YOU FOR VISITING DEEPA<br/>
          HAVE A PLEASANT STAY<br/>
          ***
        </div>
      </body>
    </html>
  `;
}

/**
 * Triggers the browser's native print dialog for a specialized invoice.
 */
export function printInvoice(data: ReceiptData) {
  const printWindow = window.open('', '_blank', 'width=450,height=800');
  if (printWindow) {
    printWindow.document.write(generateReceiptHTML(data));
    printWindow.document.close();
    
    // Set a timeout to allow fonts and styles to be ready
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Keep window open for a bit on mobile then provide close option
    }, 500);
  }
}
