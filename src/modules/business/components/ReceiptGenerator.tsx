// src/modules/business/components/ReceiptGenerator.tsx
import React, { useRef } from "react";
import type { Sale } from "../../../services/storage/db";

interface Props {
  sale: Sale;
  businessName: string;
  businessPhone?: string;
  businessLocation?: string;
  onClose: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

export const ReceiptGenerator: React.FC<Props> = ({
  sale,
  businessName,
  businessPhone,
  businessLocation,
  onClose,
  onPrint,
  onShare,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const date = new Date(sale.date).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return "💵";
      case "mpesa":
        return "📱";
      case "credit":
        return "📝";
      case "combined":
        return "📱";
      default:
        return "💰";
    }
  };

  const getPaymentMethodText = () => {
    if (sale.paymentMethod === "combined" && sale.mpesaDetails) {
      const type = sale.mpesaDetails.paymentType;
      if (type === "paybill") return "M-PESA Paybill";
      if (type === "till") return "M-PESA Buy Goods";
      if (type === "pochi") return "Pochi la Biashara";
      return "M-PESA";
    }
    if (sale.paymentMethod === "mpesa") return "M-PESA";
    return (
      sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)
    );
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && receiptRef.current) {
      const receiptContent = receiptRef.current.innerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${sale.receiptNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                padding: 20px; 
                max-width: 400px; 
                margin: 0 auto;
                background: white;
                color: black;
              }
              .receipt { 
                border: 1px dashed #ccc; 
                padding: 20px; 
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .border-t { border-top: 1px dashed #ccc; }
              .border-b { border-bottom: 1px dashed #ccc; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .mt-3 { margin-top: 12px; }
              .mt-4 { margin-top: 16px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .text-emerald { color: #3BCEAC; }
              .text-xs { font-size: 10px; }
              .text-sm { font-size: 12px; }
              .text-lg { font-size: 18px; }
              .text-xl { font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${receiptContent}
            </div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    onPrint?.();
  };

  const handleShare = () => {
    // Create receipt text
    const receiptText = `
🏪 *${businessName}*
${businessLocation ? `📍 ${businessLocation}` : ""}
${businessPhone ? `📞 ${businessPhone}` : ""}
═════════════════════════
Receipt: ${sale.receiptNumber}
Date: ${date}
═════════════════════════

${sale.items
  .map((item) => `${item.name} x${item.quantity}  KSh ${item.total}`)
  .join("\n")}

═════════════════════════
Subtotal:        KSh ${sale.subtotal}
VAT (16%):       KSh ${sale.tax}
TOTAL:           KSh ${sale.total}
═════════════════════════
Payment: ${getPaymentMethodText()}
${sale.mpesaDetails?.transactionCode ? `M-PESA: ${sale.mpesaDetails.transactionCode}` : ""}
${sale.mpesaDetails?.phoneNumber ? `Phone: ${sale.mpesaDetails.phoneNumber}` : ""}
${sale.customerName ? `Customer: ${sale.customerName}` : ""}
═════════════════════════
Thank you for your business!
Data stored locally · 100% private
    `;

    // Share via WhatsApp
    const encodedText = encodeURIComponent(receiptText);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    onShare?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card w-full max-w-md p-6 animate-slideIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <i className="fas fa-receipt text-mint"></i>
            Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-emerald transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Receipt Content */}
        <div
          ref={receiptRef}
          className="bg-white/5 rounded-lg p-5 mb-4 font-mono text-sm"
          id="receipt-content"
        >
          {/* Header */}
          <div className="text-center mb-4 border-b border-dashed border-white/20 pb-4">
            <div className="text-emerald font-bold text-xl mb-1">
              {businessName}
            </div>
            {businessLocation && (
              <div className="text-text-secondary text-xs flex items-center justify-center gap-1">
                <i className="fas fa-map-marker-alt"></i> {businessLocation}
              </div>
            )}
            {businessPhone && (
              <div className="text-text-secondary text-xs flex items-center justify-center gap-1">
                <i className="fas fa-phone"></i> {businessPhone}
              </div>
            )}
          </div>

          {/* Receipt Info */}
          <div className="mb-4 text-xs text-text-secondary">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="text-text-primary font-medium">
                {sale.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-text-primary">{date}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="text-text-primary">{sale.customerName}</span>
              </div>
            )}
            {sale.mpesaDetails?.payerName && (
              <div className="flex justify-between">
                <span>Payer:</span>
                <span className="text-text-primary">
                  {sale.mpesaDetails.payerName}
                </span>
              </div>
            )}
          </div>

          {/* Items Header */}
          <div className="grid grid-cols-12 gap-1 text-xs font-bold mb-2 text-emerald border-b border-white/10 pb-2">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Items */}
          <div className="space-y-1 mb-4">
            {sale.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-1 text-xs">
                <div className="col-span-6 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{item.price}</div>
                <div className="col-span-2 text-right font-medium">
                  {item.total}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-dashed border-white/20 pt-3 mb-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>KSh {sale.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (16%):</span>
              <span>KSh {sale.tax}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-white/20">
              <span>TOTAL:</span>
              <span className="text-emerald">KSh {sale.total}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-dashed border-white/20 pt-3 mb-3 text-xs">
            <div className="flex justify-between items-center">
              <span>Payment Method:</span>
              <span className="flex items-center gap-1 font-medium">
                {getPaymentMethodIcon(sale.paymentMethod)}{" "}
                {getPaymentMethodText()}
              </span>
            </div>
            {sale.mpesaDetails?.transactionCode && (
              <div className="flex justify-between">
                <span>M-PESA Code:</span>
                <span className="font-mono">
                  {sale.mpesaDetails.transactionCode}
                </span>
              </div>
            )}
            {sale.mpesaDetails?.phoneNumber && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{sale.mpesaDetails.phoneNumber}</span>
              </div>
            )}
            {sale.cashAmount && (
              <div className="flex justify-between">
                <span>Cash Amount:</span>
                <span>KSh {sale.cashAmount}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-4 text-[8px] text-text-secondary border-t border-dashed border-white/20 pt-3">
            <div className="flex justify-center gap-3 mb-1">
              <span>🔒 100% Local</span>
              <span>📱 PesaLocal</span>
            </div>
            <div className="font-medium text-xs mt-1">
              Thank you for your business!
            </div>
            <div className="mt-1">Goods once sold cannot be returned</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-transparent border border-white/10 
              text-text-secondary py-3 rounded-lg font-bold
              hover:border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-print"></i>
            Print
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
              hover:bg-emerald/90 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fab fa-whatsapp"></i>
            Share
          </button>
        </div>
      </div>
    </div>
  );
};
