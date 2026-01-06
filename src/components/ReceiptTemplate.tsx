/**
 * Receipt Template Component
 * 3-Star Standard receipt with Deepa branding
 * Mobile-print friendly for S23 Ultra
 */

import { getBusinessDetails } from '../utils/complianceHelper';
import { formatCurrency } from '../utils/formatCurrency';
import type { TaxCalculation } from '../utils/gstCalculator';

export interface ReceiptItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category: 'food' | 'beverages' | 'liquor' | 'room' | 'other';
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  tableNumber?: string;
  customerName?: string;
  items: ReceiptItem[];
  taxCalculation: TaxCalculation;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'other';
  paymentReceived?: number;
  change?: number;
}

interface ReceiptTemplateProps {
  data: ReceiptData;
}

export default function ReceiptTemplate({ data }: ReceiptTemplateProps) {
  const businessDetails = getBusinessDetails();

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '80mm', // Standard thermal printer width, mobile-friendly
        margin: '0 auto',
        padding: '12px',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#0a3d31',
        lineHeight: '1.4',
      }}
      className="receipt-print"
    >
      {/* Header with Logo */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '12px',
          borderBottom: '2px solid #c5a059',
          paddingBottom: '10px',
        }}
      >
              <img 
                src="/assets/images/logo-with-branding.png" 
                alt="Logo" 
                className="h-16 w-auto mx-auto mb-2 opacity-80 grayscale contrast-125"
              />
        <h1
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '4px 0',
            color: '#0a3d31',
          }}
        >
          {businessDetails.businessName}
        </h1>
        <p style={{ fontSize: '9px', color: '#666', margin: '2px 0' }}>
          {businessDetails.address}
        </p>
        {businessDetails.gstNumber && (
          <p style={{ fontSize: '9px', color: '#666', margin: '2px 0' }}>
            GSTIN: {businessDetails.gstNumber}
          </p>
        )}
        <p
          style={{
            fontSize: '10px',
            color: '#c5a059',
            marginTop: '4px',
            fontWeight: '600',
          }}
        >
          3-Star Hotel & Restaurant
        </p>
      </div>

      {/* Receipt Details */}
      <div style={{ marginBottom: '10px', fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#666' }}>Receipt #:</span>
          <span style={{ fontWeight: '600' }}>{data.receiptNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#666' }}>Date:</span>
          <span>{data.date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#666' }}>Time:</span>
          <span>{data.time}</span>
        </div>
        {data.tableNumber && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Table:</span>
            <span>{data.tableNumber}</span>
          </div>
        )}
        {data.customerName && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>Customer:</span>
            <span>{data.customerName}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px dashed #c5a059',
          margin: '10px 0',
        }}
      />

      {/* Items */}
      <div style={{ marginBottom: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '4px 0', color: '#0a3d31', fontSize: '9px' }}>
                Item
              </th>
              <th style={{ textAlign: 'center', padding: '4px 0', color: '#0a3d31', fontSize: '9px' }}>
                Qty
              </th>
              <th style={{ textAlign: 'right', padding: '4px 0', color: '#0a3d31', fontSize: '9px' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px dotted #ddd' }}>
                <td style={{ padding: '6px 0', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: '500' }}>{item.description}</div>
                  <div style={{ fontSize: '9px', color: '#666' }}>
                    {item.quantity} × {formatCurrency(item.rate)}
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: '500' }}>
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px dashed #c5a059',
          margin: '10px 0',
        }}
      />

      {/* Tax Breakdown */}
      <div style={{ marginBottom: '10px', fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(data.taxCalculation.subtotal)}</span>
        </div>

        {data.taxCalculation.excise && data.taxCalculation.excise > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>Excise Duty:</span>
            <span>{formatCurrency(data.taxCalculation.excise)}</span>
          </div>
        )}

        {data.taxCalculation.cgst > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>CGST ({data.taxCalculation.breakdown.cgstRate.toFixed(2)}%):</span>
            <span>{formatCurrency(data.taxCalculation.cgst)}</span>
          </div>
        )}

        {data.taxCalculation.sgst > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>SGST ({data.taxCalculation.breakdown.sgstRate.toFixed(2)}%):</span>
            <span>{formatCurrency(data.taxCalculation.sgst)}</span>
          </div>
        )}

        {data.taxCalculation.igst > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '9px',
              color: '#666',
            }}
          >
            <span>IGST ({data.taxCalculation.breakdown.igstRate.toFixed(2)}%):</span>
            <span>{formatCurrency(data.taxCalculation.igst)}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '2px solid #c5a059',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          <span style={{ color: '#0a3d31' }}>Total:</span>
          <span style={{ color: '#c5a059' }}>{formatCurrency(data.taxCalculation.total)}</span>
        </div>
      </div>

      {/* Payment Details */}
      {data.paymentMethod && (
        <>
          <div
            style={{
              borderTop: '1px dashed #c5a059',
              margin: '10px 0',
              paddingTop: '8px',
            }}
          />
          <div style={{ fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#666' }}>Payment:</span>
              <span style={{ textTransform: 'capitalize' }}>{data.paymentMethod}</span>
            </div>
            {data.paymentReceived && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#666' }}>Received:</span>
                <span>{formatCurrency(data.paymentReceived)}</span>
              </div>
            )}
            {data.change && data.change > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#666' }}>Change:</span>
                <span>{formatCurrency(data.change)}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '2px solid #c5a059',
          textAlign: 'center',
          fontSize: '9px',
          color: '#666',
        }}
      >
        <p style={{ margin: '4px 0' }}>Thank you for visiting!</p>
        <p style={{ margin: '4px 0' }}>Visit us again soon</p>
        <p style={{ margin: '4px 0', color: '#c5a059', fontWeight: '600' }}>
          Deepa Restaurant & Tourist Home
        </p>
        <p style={{ margin: '4px 0', fontSize: '8px' }}>
          This is a computer-generated receipt
        </p>
      </div>
    </div>
  );
}

