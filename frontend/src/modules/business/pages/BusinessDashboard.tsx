// src/modules/business/pages/BusinessDashboard.tsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserId } from "../../../hooks/useCurrentUser";
import { db, storage } from "../../../services/storage/db";
import { QuickSaleGrid } from "../components/QuickSaleGrid";
import { CustomerCreditCard } from "../components/CustomerCreditCard";
import { StockAlertCard } from "../components/StockAlertCard";
import { TodayStats } from "../components/TodayStats";
import { QuoteBuilder } from "../components/QuoteBuilder";
import { ReceiptGenerator } from "../components/ReceiptGenerator";
import { IOUForm } from "../components/IOUForm";
import { ProductManagement } from "../components/ProductManagement";

export const BusinessDashboard: React.FC = () => {
  const userId = useUserId();
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showIOU, setShowIOU] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [lastSale, setLastSale] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "customers"
  >("overview");

  // Fetch user's business data
  const user = useLiveQuery(
    async () => (userId ? await db.users.get(userId) : null),
    [userId],
  );

  // Fetch today's sales
  const todaySales = useLiveQuery(async () => {
    if (!userId) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.sales
      .where("userId")
      .equals(userId)
      .filter((sale) => sale.date >= today && sale.date < tomorrow)
      .toArray();
  }, [userId]);

  // Fetch customers with credit
  const creditCustomers = useLiveQuery(async () => {
    if (!userId) return [];
    return await storage.getCustomersWithCredit(userId);
  }, [userId]);

  // Fetch low stock products
  const lowStockProducts = useLiveQuery(async () => {
    if (!userId) return [];
    return await storage.getLowStockProducts(userId);
  }, [userId]);

  // Fetch recent sales
  const recentSales = useLiveQuery(async () => {
    if (!userId) return [];
    return await storage.getSalesByUser(userId, 5);
  }, [userId]);

  // Fetch M-PESA transactions for today
  const todayMpesaTransactions = useLiveQuery(async () => {
    if (!userId) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.mpesaTransactions
      .where("userId")
      .equals(userId)
      .filter(
        (tx) => tx.completionTime >= today && tx.completionTime < tomorrow,
      )
      .toArray();
  }, [userId]);

  // Calculate today's stats with enhanced breakdown
  const todayTotal =
    todaySales?.reduce((sum, sale) => sum + sale.total, 0) || 0;

  const todayCash =
    todaySales
      ?.filter((s) => s.paymentMethod === "cash")
      .reduce((sum, sale) => sum + sale.total, 0) || 0;

  const todayMpesa =
    todaySales
      ?.filter(
        (s) => s.paymentMethod === "mpesa" || s.paymentMethod === "combined",
      )
      .reduce((sum, sale) => sum + (s.mpesaAmount || sale.total), 0) || 0;

  const todayCredit =
    todaySales
      ?.filter((s) => s.paymentMethod === "credit")
      .reduce((sum, sale) => sum + sale.total, 0) || 0;

  // M-PESA breakdown by payment type
  const mpesaBreakdown = {
    paybill:
      todayMpesaTransactions
        ?.filter((tx) => tx.paymentType === "paybill")
        .reduce((sum, tx) => sum + tx.amount, 0) || 0,
    till:
      todayMpesaTransactions
        ?.filter((tx) => tx.paymentType === "till")
        .reduce((sum, tx) => sum + tx.amount, 0) || 0,
    pochi:
      todayMpesaTransactions
        ?.filter((tx) => tx.paymentType === "pochi")
        .reduce((sum, tx) => sum + tx.amount, 0) || 0,
  };

  const totalCreditOwed =
    creditCustomers?.reduce((sum, c) => sum + c.creditBalance, 0) || 0;

  // Handle sale completion
  const handleSaleComplete = (sale: any) => {
    setLastSale(sale);
    setShowReceipt(true);
  };

  // Handle payment reminder
  const handlePaymentReminder = (customer: any) => {
    const message = `Dear ${customer.name}, your balance of KSh ${customer.creditBalance} is due. Please pay at your earliest convenience. Thank you for your business!`;
    window.location.href = `sms:${customer.phone || ""}?body=${encodeURIComponent(message)}`;
  };

  // Handle payment recording
  const handleRecordPayment = async (customer: any, amount: number) => {
    if (!customer.id) return;

    try {
      await storage.recordCustomerPayment(customer.id, {
        amount,
        date: new Date(),
        method: "cash",
        customerId: customer.id,
      });
      alert(`✅ Payment of KSh ${amount} recorded for ${customer.name}`);
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment");
    }
  };

  if (!userId) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Business Header with User Info */}
      <div className="business-header">
        <div className="business-avatar">
          {user?.businessName?.charAt(0) || "B"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-secondary text-sm">
                {user?.businessType === "retail"
                  ? "🛍️ Retail Shop"
                  : user?.businessType === "food"
                    ? "🍲 Food Vendor"
                    : user?.businessType === "boda"
                      ? "🛵 Boda Boda"
                      : "🏪 Business"}
              </div>
              <div className="text-xl md:text-2xl font-bold font-display">
                {user?.businessName || "Your Business"}
              </div>
            </div>
            <button
              onClick={() => setShowProductManagement(true)}
              className="bg-emerald/10 text-emerald px-3 py-1.5 rounded-lg text-sm
                hover:bg-emerald/20 transition-colors flex items-center gap-1"
              title="Manage Products"
            >
              <i className="fas fa-boxes"></i>
              <span className="hidden sm:inline">Inventory</span>
            </button>
          </div>
          {user?.location && (
            <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
              <i className="fas fa-map-marker-alt"></i> {user.location}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              activeTab === "overview"
                ? "bg-emerald text-obsidian"
                : "text-text-secondary hover:bg-white/5"
            }`}
        >
          <i className="fas fa-chart-line mr-2"></i>
          Overview
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              activeTab === "products"
                ? "bg-emerald text-obsidian"
                : "text-text-secondary hover:bg-white/5"
            }`}
        >
          <i className="fas fa-boxes mr-2"></i>
          Products
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              activeTab === "customers"
                ? "bg-emerald text-obsidian"
                : "text-text-secondary hover:bg-white/5"
            }`}
        >
          <i className="fas fa-users mr-2"></i>
          Customers
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="dashboard-grid">
          {/* Today's Stats */}
          <TodayStats
            totalSales={todayTotal}
            cash={todayCash}
            mpesa={todayMpesa}
            credit={todayCredit}
            creditOwed={totalCreditOwed}
            mpesaBreakdown={mpesaBreakdown}
          />

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn group"
              onClick={() => {
                setShowQuoteBuilder(true);
                setShowReceipt(false);
                setShowIOU(false);
              }}
            >
              <i className="fas fa-file-invoice text-emerald group-hover:scale-110 transition-transform"></i>
              <span>Quote</span>
            </button>
            <button
              className="action-btn group"
              onClick={() => {
                setShowReceipt(true);
                setShowQuoteBuilder(false);
                setShowIOU(false);
              }}
            >
              <i className="fas fa-receipt text-mint group-hover:scale-110 transition-transform"></i>
              <span>Receipt</span>
            </button>
            <button
              className="action-btn group"
              onClick={() => {
                setShowIOU(true);
                setShowQuoteBuilder(false);
                setShowReceipt(false);
              }}
            >
              <i className="fas fa-hand-holding-usd text-amber group-hover:scale-110 transition-transform"></i>
              <span>IOU</span>
            </button>
          </div>

          {/* Modals */}
          {showQuoteBuilder && (
            <QuoteBuilder
              userId={userId}
              onClose={() => setShowQuoteBuilder(false)}
              onSave={() => setShowQuoteBuilder(false)}
            />
          )}

          {showReceipt && lastSale && (
            <ReceiptGenerator
              sale={lastSale}
              businessName={user?.businessName || "Your Business"}
              businessPhone={user?.preferences?.businessPhone}
              businessLocation={user?.location}
              onClose={() => {
                setShowReceipt(false);
                setLastSale(null);
              }}
              onPrint={() => console.log("Printing...")}
              onShare={() => console.log("Sharing...")}
            />
          )}

          {showIOU && (
            <IOUForm
              userId={userId}
              onClose={() => setShowIOU(false)}
              onSave={() => setShowIOU(false)}
            />
          )}

          {/* Quick Sale Grid */}
          <QuickSaleGrid userId={userId} onSaleComplete={handleSaleComplete} />

          {/* Credit Customers */}
          {creditCustomers && creditCustomers.length > 0 && (
            <div className="alert-section">
              <div className="alert-title">
                <i className="fas fa-exclamation-triangle text-amber"></i>
                Customers who owe ({creditCustomers.length})
              </div>
              {creditCustomers.map((customer) => (
                <CustomerCreditCard
                  key={customer.id}
                  customer={customer}
                  onRemind={() => handlePaymentReminder(customer)}
                  onPayment={() => {
                    const amount = prompt(
                      `Enter payment amount for ${customer.name}:`,
                      customer.creditBalance.toString(),
                    );
                    if (amount) {
                      handleRecordPayment(customer, parseFloat(amount));
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Low Stock Alerts */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="alert-section">
              <div className="alert-title">
                <i className="fas fa-boxes text-rust"></i>
                Low Stock ({lowStockProducts.length})
              </div>
              {lowStockProducts.map((product) => (
                <StockAlertCard
                  key={product.id}
                  product={product}
                  onRestock={() => {
                    const quantity = prompt(
                      `Enter new stock quantity for ${product.name}:`,
                      product.lowStockAlert.toString(),
                    );
                    if (quantity) {
                      // Update stock logic here
                      console.log("Restock:", product.name, quantity);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* Recent Activity */}
          {recentSales && recentSales.length > 0 && (
            <div className="alert-section">
              <div className="alert-title">
                <i className="fas fa-history"></i>
                Recent Sales
              </div>
              {recentSales.map((sale) => (
                <div key={sale.id} className="alert-item">
                  <div className="alert-left">
                    <div
                      className={`alert-icon ${
                        sale.paymentMethod === "cash"
                          ? "bg-emerald/10"
                          : sale.paymentMethod === "mpesa" ||
                              sale.paymentMethod === "combined"
                            ? "bg-mint/10"
                            : "bg-amber/10"
                      }`}
                    >
                      <i
                        className={`fas fa-${
                          sale.paymentMethod === "cash"
                            ? "money-bill"
                            : sale.paymentMethod === "mpesa" ||
                                sale.paymentMethod === "combined"
                              ? "mobile-alt"
                              : "book"
                        } text-${
                          sale.paymentMethod === "cash"
                            ? "emerald"
                            : sale.paymentMethod === "mpesa" ||
                                sale.paymentMethod === "combined"
                              ? "mint"
                              : "amber"
                        }`}
                      ></i>
                    </div>
                    <div className="alert-details">
                      <h4>{sale.customerName || "Walk-in Customer"}</h4>
                      <p>
                        {new Date(sale.date).toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {sale.items.length} items
                        {sale.mpesaDetails?.transactionCode && (
                          <span className="ml-2 text-xs text-mint">
                            <i className="fas fa-check-circle"></i> M-PESA
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold text-emerald">
                    KSh {sale.total}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!creditCustomers || creditCustomers.length === 0) &&
            (!lowStockProducts || lowStockProducts.length === 0) &&
            (!recentSales || recentSales.length === 0) && (
              <div className="glass-card p-12 text-center">
                <div
                  className="w-20 h-20 bg-emerald/10 rounded-full flex items-center 
                justify-center mx-auto mb-4 text-4xl text-emerald"
                >
                  <i className="fas fa-store"></i>
                </div>
                <h3 className="text-xl font-display font-bold mb-2">
                  Welcome to Your Business Dashboard
                </h3>
                <p className="text-text-secondary mb-6">
                  Start by adding products and recording your first sale
                </p>
                <button
                  onClick={() => setShowProductManagement(true)}
                  className="bg-emerald text-obsidian px-6 py-3 rounded-lg font-bold
                hover:bg-emerald/90 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Product
                </button>
              </div>
            )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && <ProductManagement userId={userId} />}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-users text-emerald"></i>
            Customer Management
          </h3>

          {creditCustomers && creditCustomers.length > 0 ? (
            <div className="space-y-3">
              {creditCustomers.map((customer) => (
                <div key={customer.id} className="bg-black/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${customer.avatarColor || "bg-emerald"} 
                        flex items-center justify-center text-obsidian font-bold`}
                      >
                        {customer.avatar || customer.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        {customer.phone && (
                          <p className="text-xs text-text-secondary">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">Balance</p>
                      <p className="font-bold text-amber">
                        KSh {customer.creditBalance}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handlePaymentReminder(customer)}
                      className="flex-1 text-xs bg-amber/10 text-amber py-2 rounded-lg
                        hover:bg-amber/20 transition-colors"
                    >
                      <i className="fas fa-bell mr-1"></i> Remind
                    </button>
                    <button
                      onClick={() => {
                        const amount = prompt(
                          `Enter payment amount:`,
                          customer.creditBalance.toString(),
                        );
                        if (amount)
                          handleRecordPayment(customer, parseFloat(amount));
                      }}
                      className="flex-1 text-xs bg-emerald/10 text-emerald py-2 rounded-lg
                        hover:bg-emerald/20 transition-colors"
                    >
                      <i className="fas fa-check-circle mr-1"></i> Record
                      Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">
              No customers with credit yet
            </p>
          )}
        </div>
      )}

      {/* Product Management Modal */}
      {showProductManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card w-full max-w-4xl my-8 relative">
            <div
              className="sticky top-0 bg-vault/90 backdrop-blur p-4 border-b border-white/5
              flex justify-between items-center"
            >
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <i className="fas fa-boxes text-emerald"></i>
                Product Management
              </h3>
              <button
                onClick={() => setShowProductManagement(false)}
                className="text-text-secondary hover:text-emerald transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <ProductManagement userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
