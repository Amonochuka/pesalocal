import React, { useState } from "react";
import { storage } from "../../../services/storage/db";

interface Props {
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

interface QuoteItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export const QuoteBuilder: React.FC<Props> = ({ userId, onClose, onSave }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([
    { name: "", quantity: 1, price: 0, total: 0 },
  ]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    return Math.round(calculateSubtotal() * 0.16);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const updateItem = (
    index: number,
    field: keyof QuoteItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "name") {
      item.name = value as string;
    } else if (field === "quantity") {
      item.quantity = Math.max(1, parseInt(value as string) || 1);
      item.total = item.quantity * item.price;
    } else if (field === "price") {
      item.price = Math.max(0, parseFloat(value as string) || 0);
      item.total = item.quantity * item.price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!customerName) {
      alert("Please enter customer name");
      return;
    }

    const validItems = items.filter((item) => item.name && item.price > 0);
    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const quoteNumber = Math.floor(1000 + Math.random() * 9000);

    await storage.addQuote({
      userId,
      quoteNumber,
      customerName,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone || undefined,
      items: validItems,
      subtotal: calculateSubtotal(),
      vat: calculateVAT(),
      total: calculateTotal(),
      validUntil: new Date(validUntil),
      status: "draft",
      createdAt: new Date(),
    });

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl p-6 animate-slideIn my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <i className="fas fa-file-invoice text-emerald"></i>
            New Quotation
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-emerald transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Customer Info */}
        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-3">Customer Details</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name *"
              className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                text-text-primary focus:outline-none focus:border-emerald"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                  text-text-primary focus:outline-none focus:border-emerald"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                  text-text-primary focus:outline-none focus:border-emerald"
              />
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Items</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Item name"
                  className="flex-[2] bg-black/30 border border-white/5 rounded-lg p-2
                    text-text-primary text-sm focus:outline-none focus:border-emerald"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", e.target.value)
                  }
                  min="1"
                  placeholder="Qty"
                  className="w-16 bg-black/30 border border-white/5 rounded-lg p-2
                    text-text-primary text-sm focus:outline-none focus:border-emerald"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  min="0"
                  placeholder="Price"
                  className="w-24 bg-black/30 border border-white/5 rounded-lg p-2
                    text-text-primary text-sm focus:outline-none focus:border-emerald"
                />
                <div className="w-20 text-right font-semibold text-emerald text-sm py-2">
                  KSh {item.total}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="text-rust hover:text-rust/80 p-2"
                  disabled={items.length === 1}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="mt-3 text-emerald hover:text-emerald/80 text-sm flex items-center gap-1"
          >
            <i className="fas fa-plus"></i> Add item
          </button>
        </div>

        {/* Valid Until */}
        <div className="mb-4">
          <label className="block text-text-secondary text-sm mb-1">
            Valid Until
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="bg-black/30 border border-white/5 rounded-lg p-2
              text-text-primary focus:outline-none focus:border-emerald"
          />
        </div>

        {/* Summary */}
        <div className="bg-black/20 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal:</span>
              <span>KSh {calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">VAT (16%):</span>
              <span>KSh {calculateVAT()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
              <span>Total:</span>
              <span className="text-emerald">KSh {calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/10 
              text-text-secondary py-3 rounded-lg font-bold
              hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
              hover:bg-emerald/90 transition-colors"
          >
            Save Quote
          </button>
        </div>
      </div>
    </div>
  );
};
