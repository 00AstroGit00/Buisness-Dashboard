/**
 * Invoice Template Component
 * Official 3-star hotel invoice with Forest Green and Gold branding
 * Designed for react-to-pdf export
 */

import { getBusinessDetails } from '../utils/complianceHelper';
import { formatCurrency } from '../utils/formatCurrency';

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate?: number; // Default 5% for hotel services
  gstAmount?: number;
  total: number;
  paymentTerms?: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

export default function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  const businessDetails = getBusinessDetails();
  const gstRate = data.gstRate ?? 5;
  const gstAmount = data.gstAmount ?? (data.subtotal * gstRate) / 100;
  const total = data.total ?? data.subtotal + gstAmount;

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#0a3d31',
      }}
    >
      {/* Header with Forest Green background and Gold accents */}
      <div
        style={{
          backgroundColor: '#0a3d31',
          color: '#c5a059',
          padding: '30px',
          borderRadius: '8px',
          marginBottom: '30px',
          borderBottom: '4px solid #c5a059',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#c5a059',
              }}
            >
              {businessDetails.businessName}
            </h1>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#d4b371' }}>
              {businessDetails.address}
            </p>
            {businessDetails.gstNumber && (
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#d4b371' }}>
                GST: {businessDetails.gstNumber}
              </p>
            )}
            {businessDetails.licenseNumber && (
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#d4b371' }}>
                License: {businessDetails.licenseNumber}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                backgroundColor: '#c5a059',
                color: '#0a3d31',
                padding: '15px 25px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              TAX INVOICE
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h3 style={{ color: '#0a3d31', marginBottom: '10px', fontSize: '16px' }}>
            Bill To:
          </h3>
          {data.customerName && (
            <p style={{ margin: '5px 0', fontSize: '14px' }}>{data.customerName}</p>
          )}
          {data.customerAddress && (
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
              {data.customerAddress}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Invoice #:</strong> {data.invoiceNumber}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>Date:</strong> {data.invoiceDate}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#0a3d31',
              color: '#c5a059',
            }}
          >
            <th
              style={{
                padding: '12px',
                textAlign: 'left',
                border: '1px solid #c5a059',
                fontSize: '14px',
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #c5a059',
                fontSize: '14px',
              }}
            >
              Qty
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                border: '1px solid #c5a059',
                fontSize: '14px',
              }}
            >
              Rate
            </th>
            <th
              style={{
                padding: '12px',
                textAlign: 'right',
                border: '1px solid #c5a059',
                fontSize: '14px',
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
              }}
            >
              <td
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              >
                {item.description}
              </td>
              <td
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  padding: '10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              >
                {formatCurrency(item.rate)}
              </td>
              <td
                style={{
                  padding: '10px',
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {formatCurrency(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '300px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            <span>GST ({gstRate}%):</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: '2px solid #c5a059',
              borderBottom: '2px solid #c5a059',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0a3d31',
              backgroundColor: '#f5f5f5',
              marginTop: '10px',
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
          >
            <span>Total:</span>
            <span style={{ color: '#c5a059' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px solid #c5a059',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        {data.paymentTerms && (
          <p style={{ margin: '5px 0' }}>
            <strong>Payment Terms:</strong> {data.paymentTerms}
          </p>
        )}
        <p style={{ margin: '5px 0' }}>
          Thank you for your business! We look forward to serving you again.
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '11px' }}>
          This is a computer-generated invoice. No signature required.
        </p>
      </div>
    </div>
  );
}

