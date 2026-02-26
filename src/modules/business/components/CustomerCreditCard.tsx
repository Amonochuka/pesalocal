import React from "react";

interface Props {
  customer: {
    id?: string;
    name: string;
    phone?: string;
    creditBalance: number;
    avatar?: string;
    avatarColor?: string;
    lastTransaction: Date;
    transactionCount?: number;
  };
  onRemind: () => void;
  onPayment: () => void;
}

export const CustomerCreditCard: React.FC<Props> = ({
  customer,
  onRemind,
  onPayment,
}) => {
  const getDaysOverdue = () => {
    const days = Math.floor(
      (Date.now() - new Date(customer.lastTransaction).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const daysOverdue = getDaysOverdue();
  const isOverdue = daysOverdue > 7;
  const isDueSoon = daysOverdue > 3 && daysOverdue <= 7;

  return (
    <div className="alert-item group hover:bg-vault/20 transition-all">
      <div className="alert-left">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-lg ${customer.avatarColor || "bg-emerald"} 
          flex items-center justify-center text-obsidian font-bold text-lg shrink-0`}
        >
          {customer.avatar || customer.name.charAt(0).toUpperCase()}
        </div>

        {/* Customer Info */}
        <div className="alert-details">
          <h4 className="font-medium flex items-center gap-2">
            {customer.name}
            {customer.phone && (
              <span className="text-xs text-text-secondary">
                <i className="fas fa-phone-alt"></i>
              </span>
            )}
          </h4>
          <p className="text-xs text-text-secondary flex items-center gap-2">
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-rust" : isDueSoon ? "text-amber" : ""
              }`}
            >
              <i
                className={`fas fa-clock text-xs ${
                  isOverdue ? "text-rust" : isDueSoon ? "text-amber" : ""
                }`}
              ></i>
              {daysOverdue === 0
                ? "Today"
                : daysOverdue === 1
                  ? "Yesterday"
                  : `${daysOverdue} days ago`}
            </span>
            <span>•</span>
            <span>{customer.transactionCount || 1} transactions</span>
          </p>
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center gap-3">
        <span
          className={`font-semibold ${
            isOverdue ? "text-rust" : isDueSoon ? "text-amber" : "text-emerald"
          }`}
        >
          KSh {customer.creditBalance}
        </span>

        <button
          onClick={onRemind}
          className="w-8 h-8 rounded-full bg-amber/10 text-amber 
            hover:bg-amber/20 transition-colors flex items-center justify-center"
          title="Send reminder"
        >
          <i className="fas fa-bell text-sm"></i>
        </button>

        <button
          onClick={onPayment}
          className="w-8 h-8 rounded-full bg-emerald/10 text-emerald 
            hover:bg-emerald/20 transition-colors flex items-center justify-center"
          title="Record payment"
        >
          <i className="fas fa-check-circle text-sm"></i>
        </button>
      </div>
    </div>
  );
};
