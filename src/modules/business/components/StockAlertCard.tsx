import React from "react";
import type { Product } from "../../../services/storage/db";

interface Props {
  product: Product;
  onRestock: () => void;
}

export const StockAlertCard: React.FC<Props> = ({ product, onRestock }) => {
  const percentage = Math.round((product.stock / product.lowStockAlert) * 100);
  const isCritical = product.stock === 0;
  const isLow = product.stock <= product.lowStockAlert / 2;

  return (
    <div className="alert-item">
      <div className="alert-left">
        <div
          className={`alert-icon ${
            isCritical ? "bg-rust/10" : isLow ? "bg-amber/10" : "bg-emerald/10"
          }`}
        >
          <span className="text-2xl">{product.emoji}</span>
        </div>
        <div className="alert-details">
          <h4>{product.name}</h4>
          <p className="flex items-center gap-2">
            <span
              className={`text-sm ${
                isCritical ? "text-rust" : isLow ? "text-amber" : "text-emerald"
              }`}
            >
              {product.stock} left
            </span>
            <span className="text-text-secondary text-xs">
              (min {product.lowStockAlert})
            </span>
          </p>
          {/* Stock level bar */}
          <div className="w-24 h-1 bg-white/10 rounded-full mt-1">
            <div
              className={`h-full rounded-full ${
                isCritical ? "bg-rust" : isLow ? "bg-amber" : "bg-emerald"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={onRestock}
        className="bg-emerald text-obsidian px-4 py-2 rounded-lg text-sm font-bold
          hover:bg-emerald/90 transition-colors"
      >
        Restock
      </button>
    </div>
  );
};
