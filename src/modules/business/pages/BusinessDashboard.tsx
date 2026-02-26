import React, { useState } from "react";
import { QuoteItem, ReceiptItem, Customer, Product } from "@/core/types";

export const BusinessDashboard: React.FC = () => {
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showIOU, setShowIOU] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteNumber, setQuoteNumber] = useState(1001);
  const [receiptItems] = useState<ReceiptItem[]>([
    { name: "Tomatoes", qty: 2, price: 50 },
    { name: "Onions", qty: 1, price: 30 },
  ]);

  const products: Product[] = [
    { emoji: "🍅", name: "Tomato", price: 50 },
    { emoji: "🧅", name: "Onion", price: 30 },
    { emoji: "🥔", name: "Potato", price: 40 },
    { emoji: "🌽", name: "Maize", price: 20 },
    { emoji: "🥬", name: "Kale", price: 15 },
    { emoji: "🍌", name: "Banana", price: 10 },
  ];

  const customers: Customer[] = [
    { name: "Mama Kevin", amount: 500, daysOverdue: 3 },
    { name: "Boda John", amount: 400, dueTomorrow: true },
  ];

  const calculateSubtotal = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  const calculateVAT = (items: QuoteItem[]) => {
    return Math.round(calculateSubtotal(items) * 0.16);
  };

  const calculateTotal = (items: QuoteItem[]) => {
    return calculateSubtotal(items) + calculateVAT(items);
  };

  const addToQuote = (name: string, price: number) => {
    setQuoteItems([...quoteItems, { name, qty: 1, price }]);
    setShowQuoteBuilder(true);
    setShowReceipt(false);
    setShowIOU(false);
  };

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { name: "New item", qty: 1, price: 0 }]);
  };

  const removeQuoteItem = (index: number) => {
    const newItems = [...quoteItems];
    newItems.splice(index, 1);
    setQuoteItems(newItems);
  };

  const saveQuote = () => {
    alert(`✅ Quote #QTE-${quoteNumber} saved locally`);
    setQuoteItems([]);
    setQuoteNumber(quoteNumber + 1);
    setShowQuoteBuilder(false);
  };

  const total = receiptItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );
  const date = new Date().toLocaleDateString("en-KE");
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="dashboard-grid">
      {/* Business Header */}
      <div className="business-header">
        <div className="business-avatar">MJ</div>
        <div>
          <div style={{ color: "var(--text-secondary)" }}>Mama Jane's</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
            }}
          >
            Green Grocer
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Sales today</div>
          <div className="stat-value">KSh 3,450</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cash</div>
          <div className="stat-value">KSh 2,150</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Credit owed</div>
          <div className="stat-value">KSh 1,200</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value">KSh 850</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={() => {
            setShowQuoteBuilder(!showQuoteBuilder);
            setShowReceipt(false);
            setShowIOU(false);
          }}
        >
          <i className="fas fa-file-invoice"></i>
          <span>Quote</span>
        </button>
        <button
          className="action-btn"
          onClick={() => {
            setShowReceipt(!showReceipt);
            setShowQuoteBuilder(false);
            setShowIOU(false);
          }}
        >
          <i className="fas fa-receipt"></i>
          <span>Receipt</span>
        </button>
        <button
          className="action-btn"
          onClick={() => {
            setShowIOU(!showIOU);
            setShowQuoteBuilder(false);
            setShowReceipt(false);
          }}
        >
          <i className="fas fa-hand-holding-usd"></i>
          <span>IOU</span>
        </button>
      </div>

      {/* Quote Builder */}
      {showQuoteBuilder && (
        <div className="quote-builder">
          <div className="quote-header">
            <h3>
              <i
                className="fas fa-file-invoice"
                style={{ color: "var(--accent-emerald)" }}
              ></i>{" "}
              New Quotation
            </h3>
            <span className="quote-number">#QTE-{quoteNumber}</span>
          </div>

          <div className="customer-info">
            <div className="customer-row">
              <input
                type="text"
                placeholder="Customer name"
                defaultValue="Mama Kevin"
              />
            </div>
            <div className="customer-row">
              <input type="email" placeholder="Email (optional)" />
              <input type="tel" placeholder="Phone" />
            </div>
          </div>

          <div className="quote-items">
            {quoteItems.map((item, index) => (
              <div className="quote-item-row" key={index}>
                <input
                  className="item-name"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...quoteItems];
                    newItems[index].name = e.target.value;
                    setQuoteItems(newItems);
                  }}
                />
                <input
                  className="item-qty"
                  type="number"
                  value={item.qty}
                  min="1"
                  onChange={(e) => {
                    const newItems = [...quoteItems];
                    newItems[index].qty = parseInt(e.target.value) || 1;
                    setQuoteItems(newItems);
                  }}
                />
                <input
                  className="item-price"
                  type="number"
                  value={item.price}
                  min="0"
                  onChange={(e) => {
                    const newItems = [...quoteItems];
                    newItems[index].price = parseInt(e.target.value) || 0;
                    setQuoteItems(newItems);
                  }}
                />
                <span className="item-total">KSh {item.qty * item.price}</span>
                <i
                  className="fas fa-times remove-item"
                  onClick={() => removeQuoteItem(index)}
                ></i>
              </div>
            ))}
          </div>

          <button className="add-item-btn" onClick={addQuoteItem}>
            <i className="fas fa-plus"></i> Add item
          </button>

          <div className="quote-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>KSh {calculateSubtotal(quoteItems)}</span>
            </div>
            <div className="summary-row">
              <span>VAT (16%):</span>
              <span>KSh {calculateVAT(quoteItems)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>KSh {calculateTotal(quoteItems)}</span>
            </div>
          </div>

          <div className="customer-row" style={{ margin: "16px 0" }}>
            <input type="date" defaultValue={nextWeek} />
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: "13px",
                marginLeft: "8px",
              }}
            >
              Valid until
            </span>
          </div>

          <div className="quote-actions">
            <button
              className="quote-btn preview"
              onClick={() => {
                const customerName =
                  (
                    document.querySelector(
                      ".customer-info input",
                    ) as HTMLInputElement
                  )?.value || "Customer";
                alert(
                  `📋 Preview for ${customerName}\nTotal: KSh ${calculateTotal(quoteItems)}`,
                );
              }}
            >
              <i className="fas fa-eye"></i> Preview
            </button>
            <button className="quote-btn save" onClick={saveQuote}>
              <i className="fas fa-save"></i> Save Quote
            </button>
          </div>
        </div>
      )}

      {/* Receipt Display */}
      {showReceipt && (
        <div className="receipt-card">
          <div className="preview-header">
            <span className="preview-business">Mama Jane's</span>
            <span>{date}</span>
          </div>

          <div style={{ margin: "16px 0" }}>
            {receiptItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>
                  {item.name} x{item.qty}
                </span>
                <span>KSh {item.qty * item.price}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px dashed var(--accent-emerald)",
              paddingTop: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              <span>Total</span>
              <span>KSh {total}</span>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                color: "var(--accent-emerald)",
              }}
            >
              <i className="fas fa-check-circle"></i> Paid · Thank you!
            </div>
          </div>

          <button
            className="quote-btn preview"
            style={{ width: "100%", marginTop: "16px" }}
            onClick={() => setShowReceipt(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* IOU Form */}
      {showIOU && (
        <div className="iou-card">
          <h3
            style={{
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i
              className="fas fa-hand-holding-usd"
              style={{ color: "var(--accent-amber)" }}
            ></i>{" "}
            Record IOU
          </h3>

          <div className="customer-row">
            <input
              type="text"
              placeholder="Customer name"
              defaultValue="Boda John"
            />
          </div>

          <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
            <input
              type="number"
              placeholder="Amount"
              defaultValue="400"
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px",
                color: "white",
              }}
            />
            <input
              type="date"
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px",
                color: "white",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              className="quote-btn preview"
              style={{ flex: 1 }}
              onClick={() => setShowIOU(false)}
            >
              Cancel
            </button>
            <button
              className="quote-btn save"
              style={{ flex: 1 }}
              onClick={() => {
                alert("✅ IOU saved. Customer will be reminded locally.");
                setShowIOU(false);
              }}
            >
              Save IOU
            </button>
          </div>
        </div>
      )}

      {/* Quick Sale Grid */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontWeight: 600 }}>Quick sale</span>
          <span style={{ color: "var(--accent-emerald)" }}>View all →</span>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <button
              key={index}
              className="product-btn"
              onClick={() => addToQuote(product.name, product.price)}
            >
              <span className="product-emoji">{product.emoji}</span>
              <span className="product-price">KSh {product.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Credit Alerts */}
      <div className="alert-section">
        <div className="alert-title">
          <i
            className="fas fa-exclamation-triangle"
            style={{ color: "var(--accent-amber)" }}
          ></i>{" "}
          Customers who owe
        </div>
        {customers.map((customer, index) => (
          <div className="alert-item" key={index}>
            <div className="alert-left">
              <div className="alert-icon">
                <i className="fas fa-user"></i>
              </div>
              <div className="alert-details">
                <h4>{customer.name}</h4>
                <p>
                  {customer.daysOverdue
                    ? `${customer.daysOverdue} days overdue`
                    : customer.dueTomorrow
                      ? "Due tomorrow"
                      : ""}
                </p>
              </div>
            </div>
            <div
              className={customer.daysOverdue ? "alert-right overdue" : ""}
              style={
                customer.dueTomorrow
                  ? { color: "var(--accent-amber)", fontWeight: 600 }
                  : {}
              }
            >
              KSh {customer.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Stock Alerts */}
      <div className="alert-section">
        <div className="alert-title">
          <i className="fas fa-boxes"></i> Low stock
        </div>
        <div className="alert-item">
          <div className="alert-left">
            <div className="alert-icon">
              <i className="fas fa-apple-alt"></i>
            </div>
            <div className="alert-details">
              <h4>Tomatoes</h4>
              <p>2kg left · Min 5kg</p>
            </div>
          </div>
          <button
            style={{
              background: "var(--accent-emerald)",
              border: "none",
              color: "var(--bg-obsidian)",
              padding: "8px 16px",
              borderRadius: "24px",
              fontWeight: 600,
            }}
          >
            Restock
          </button>
        </div>
      </div>
    </div>
  );
};
