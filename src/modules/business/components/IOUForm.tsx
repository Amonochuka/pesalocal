import React, { useState } from "react";
import { storage } from "../../../services/storage/db";

interface Props {
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

export const IOUForm: React.FC<Props> = ({ userId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    amount: "",
    dueDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.amount || !formData.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    await storage.addIOU({
      userId,
      customerName: formData.customerName,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate),
      notes: formData.notes,
      isPaid: false,
    });

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card w-full max-w-md p-6 animate-slideIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <i className="fas fa-hand-holding-usd text-amber"></i>
            Record IOU
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-emerald transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              placeholder="e.g., Mama Kevin"
              className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                text-text-primary focus:outline-none focus:border-emerald"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Amount (KSh) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              min="0"
              step="1"
              className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                text-text-primary focus:outline-none focus:border-emerald"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                text-text-primary focus:outline-none focus:border-emerald"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional details..."
              rows={3}
              className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                text-text-primary focus:outline-none focus:border-emerald resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-white/10 
                text-text-secondary py-3 rounded-lg font-bold
                hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber text-obsidian py-3 rounded-lg font-bold
                hover:bg-amber/90 transition-colors"
            >
              Save IOU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
