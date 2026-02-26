// src/modules/business/components/QuickSaleGrid.tsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, storage, ProductCategory } from "../../../services/storage/db";

interface Props {
  userId: string;
  onSaleComplete: (sale: any) => void;
}

interface CartItem {
  productId: string;
  name: string;
  emoji: string;
  quantity: number;
  price: number;
  total: number;
  category: string;
  isPerishable?: boolean;
}

interface MpesaDetails {
  transactionCode: string;
  phoneNumber: string;
  payerName: string;
  paymentType: "paybill" | "till" | "pochi";
}

export const QuickSaleGrid: React.FC<Props> = ({ userId, onSaleComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "all"
  >("all");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "mpesa" | "credit"
  >("cash");
  const [mpesaDetails, setMpesaDetails] = useState<MpesaDetails>({
    transactionCode: "",
    phoneNumber: "",
    payerName: "",
    paymentType: "till",
  });
  const [customerName, setCustomerName] = useState("");
  const [showCustomerInput, setShowCustomerInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products for this user
  const products = useLiveQuery(async () => {
    return await db.products.where("userId").equals(userId).toArray();
  }, [userId]);

  // Filter products by category
  const filteredProducts = products?.filter(
    (product) =>
      selectedCategory === "all" || product.category === selectedCategory,
  );

  // Group products by category for category pills
  const productsByCategory = products?.reduce(
    (acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Category configuration
  const categoryConfig: Record<string, { icon: string; color: string }> = {
    vegetables: { icon: "🥕", color: "emerald" },
    fruits: { icon: "🍎", color: "amber" },
    grains: { icon: "🌽", color: "amber" },
    tubers: { icon: "🥔", color: "rust" },
    leafy_greens: { icon: "🥬", color: "emerald" },
    herbs: { icon: "🌿", color: "mint" },
    legumes: { icon: "🫘", color: "amber" },
    dairy: { icon: "🥛", color: "blue" },
    beverages: { icon: "🧃", color: "blue" },
    snacks: { icon: "🍪", color: "amber" },
    household: { icon: "🧹", color: "gray" },
    other: { icon: "📦", color: "gray" },
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          emoji: product.emoji,
          quantity: 1,
          price: product.price,
          total: product.price,
          category: product.category,
          isPerishable: product.isPerishable,
        },
      ];
    });
    setShowCart(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    if (cart.length === 1) setShowCart(false);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item,
      ),
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.16); // 16% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateMpesaDetails = () => {
    if (
      !mpesaDetails.transactionCode ||
      mpesaDetails.transactionCode.length < 10
    ) {
      alert("Please enter a valid M-PESA transaction code");
      return false;
    }
    if (!mpesaDetails.phoneNumber || mpesaDetails.phoneNumber.length < 9) {
      alert("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (paymentMethod === "credit" && !customerName) {
      alert("Please enter customer name for credit sale");
      return;
    }

    if (paymentMethod === "mpesa" && !validateMpesaDetails()) {
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      const sale = {
        userId,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethod === "mpesa" ? "combined" : paymentMethod,
        cashAmount: paymentMethod === "cash" ? total : undefined,
        mpesaAmount: paymentMethod === "mpesa" ? total : undefined,
        creditAmount: paymentMethod === "credit" ? total : undefined,
        mpesaDetails:
          paymentMethod === "mpesa"
            ? {
                transactionCode: mpesaDetails.transactionCode,
                phoneNumber: mpesaDetails.phoneNumber,
                payerName: mpesaDetails.payerName || undefined,
                paymentType: mpesaDetails.paymentType,
                businessNumber: userId.slice(0, 6), // Use part of userId as business number
                accountNumber: `CUST-${Date.now().toString().slice(-6)}`,
                transactionDate: new Date(),
              }
            : undefined,
        customerName: paymentMethod === "credit" ? customerName : undefined,
        date: new Date(),
        receiptNumber: `RCP-${Date.now()}`,
      };

      const saleId = await storage.addSale(sale);

      // Record M-PESA transaction if applicable
      if (paymentMethod === "mpesa" && mpesaDetails.transactionCode) {
        await db.mpesaTransactions.add({
          userId,
          transactionCode: mpesaDetails.transactionCode,
          completionTime: new Date(),
          amount: total,
          phoneNumber: mpesaDetails.phoneNumber,
          payerName: mpesaDetails.payerName,
          paymentType: mpesaDetails.paymentType,
          businessNumber: userId.slice(0, 6),
          accountNumber: `CUST-${Date.now().toString().slice(-6)}`,
          receiptNumber: sale.receiptNumber,
          saleId,
          isReconciled: true,
        });
      }

      // If credit sale, update or create customer
      if (paymentMethod === "credit" && customerName) {
        const customer = await storage.findOrCreateCustomer(
          userId,
          customerName,
        );
        if (customer?.id) {
          await storage.updateCustomerCredit(customer.id, -total);
        }
      }

      // Clear cart
      setCart([]);
      setShowCart(false);
      setCustomerName("");
      setShowCustomerInput(false);
      setMpesaDetails({
        transactionCode: "",
        phoneNumber: "",
        payerName: "",
        paymentType: "till",
      });

      // Notify parent component
      onSaleComplete(sale);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to complete sale. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div
          className="w-16 h-16 bg-emerald/10 rounded-full flex items-center 
          justify-center mx-auto mb-4 text-3xl text-emerald"
        >
          <i className="fas fa-box-open"></i>
        </div>
        <p className="text-text-secondary mb-3">No products in inventory</p>
        <button className="text-emerald hover:underline text-sm">
          Add your first product
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all
            ${
              selectedCategory === "all"
                ? "bg-emerald text-obsidian"
                : "glass-card hover:border-emerald/30"
            }`}
        >
          All ({products.length})
        </button>
        {Object.entries(categoryConfig).map(([cat, config]) => {
          const count = productsByCategory?.[cat] || 0;
          if (count === 0) return null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as ProductCategory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all
                ${
                  selectedCategory === cat
                    ? `bg-${config.color} text-obsidian`
                    : "glass-card hover:border-emerald/30"
                }`}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{cat.replace("_", " ")}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat ? "bg-white/20" : "bg-white/5"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display font-semibold">
            {selectedCategory === "all"
              ? "All Products"
              : selectedCategory.replace("_", " ")}
          </h3>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative text-emerald text-sm flex items-center gap-1"
          >
            <i className="fas fa-shopping-cart"></i>
            Cart ({cart.length})
            {cart.length > 0 && (
              <span
                className="absolute -top-2 -right-2 w-4 h-4 bg-emerald 
                text-obsidian text-xs rounded-full flex items-center justify-center animate-pulse"
              >
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="product-grid">
          {filteredProducts?.map((product) => {
            const isLowStock = product.stock <= product.lowStockAlert;
            const categoryColor =
              categoryConfig[product.category]?.color || "gray";

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`product-btn group relative ${
                  product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={product.name}
              >
                <span className="product-emoji group-hover:scale-110 transition-transform">
                  {product.emoji}
                </span>
                <span className="product-price">KSh {product.price}</span>
                <span className="text-xs text-text-secondary">
                  /{product.pricePerUnit || "piece"}
                </span>

                {/* Stock indicator */}
                <div
                  className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    product.stock === 0
                      ? "bg-rust"
                      : isLowStock
                        ? "bg-amber animate-pulse"
                        : "bg-emerald"
                  }`}
                  title={`${product.stock} left`}
                />

                {/* Stock level on hover */}
                <div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                  bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 
                  group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                >
                  {product.stock} left
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg max-h-[80vh] overflow-auto p-6 animate-slideIn">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-vault/90 backdrop-blur py-2">
              <h4 className="font-display font-semibold flex items-center gap-2">
                <i className="fas fa-shopping-cart text-emerald"></i>
                Current Sale
              </h4>
              <button
                onClick={() => setShowCart(false)}
                className="text-text-secondary hover:text-emerald"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 bg-black/20 p-3 rounded-lg"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-text-secondary">
                      KSh {item.price} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-emerald/20 
                        flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-emerald/20 
                        flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-emerald w-20 text-right">
                    KSh {item.total}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-rust hover:text-rust/80 ml-2"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-text-secondary text-sm mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setPaymentMethod("cash");
                    setShowCustomerInput(false);
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    paymentMethod === "cash"
                      ? "bg-emerald text-obsidian"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <i className="fas fa-money-bill text-xl"></i>
                  <span>Cash</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("mpesa");
                    setShowCustomerInput(false);
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    paymentMethod === "mpesa"
                      ? "bg-emerald text-obsidian"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <i className="fas fa-mobile-alt text-xl"></i>
                  <span>M-PESA</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("credit");
                    setShowCustomerInput(true);
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                    paymentMethod === "credit"
                      ? "bg-amber text-obsidian"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <i className="fas fa-book text-xl"></i>
                  <span>Credit</span>
                </button>
              </div>
            </div>

            {/* M-PESA Details */}
            {paymentMethod === "mpesa" && (
              <div className="mb-4 space-y-3 bg-black/20 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setMpesaDetails({ ...mpesaDetails, paymentType: "till" })
                    }
                    className={`p-2 rounded-lg text-xs ${
                      mpesaDetails.paymentType === "till"
                        ? "bg-emerald text-obsidian"
                        : "bg-white/5 text-text-secondary"
                    }`}
                  >
                    Till Number
                  </button>
                  <button
                    onClick={() =>
                      setMpesaDetails({
                        ...mpesaDetails,
                        paymentType: "paybill",
                      })
                    }
                    className={`p-2 rounded-lg text-xs ${
                      mpesaDetails.paymentType === "paybill"
                        ? "bg-emerald text-obsidian"
                        : "bg-white/5 text-text-secondary"
                    }`}
                  >
                    Paybill
                  </button>
                  <button
                    onClick={() =>
                      setMpesaDetails({ ...mpesaDetails, paymentType: "pochi" })
                    }
                    className={`p-2 rounded-lg text-xs ${
                      mpesaDetails.paymentType === "pochi"
                        ? "bg-emerald text-obsidian"
                        : "bg-white/5 text-text-secondary"
                    }`}
                  >
                    Pochi la Biashara
                  </button>
                </div>
                <input
                  type="text"
                  value={mpesaDetails.transactionCode}
                  onChange={(e) =>
                    setMpesaDetails({
                      ...mpesaDetails,
                      transactionCode: e.target.value,
                    })
                  }
                  placeholder="M-PESA Transaction Code"
                  className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-emerald"
                />
                <input
                  type="tel"
                  value={mpesaDetails.phoneNumber}
                  onChange={(e) =>
                    setMpesaDetails({
                      ...mpesaDetails,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Customer Phone (e.g., 0712345678)"
                  className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-emerald"
                />
                <input
                  type="text"
                  value={mpesaDetails.payerName}
                  onChange={(e) =>
                    setMpesaDetails({
                      ...mpesaDetails,
                      payerName: e.target.value,
                    })
                  }
                  placeholder="Payer Name (optional)"
                  className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-emerald"
                />
              </div>
            )}

            {/* Customer Name (for credit) */}
            {showCustomerInput && paymentMethod === "credit" && (
              <div className="mb-4">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full bg-black/30 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-amber"
                  autoFocus
                />
              </div>
            )}

            {/* Summary */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal:</span>
                  <span>KSh {calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">VAT (16%):</span>
                  <span>KSh {calculateTax()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="text-emerald">KSh {calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={
                (paymentMethod === "credit" && !customerName) ||
                (paymentMethod === "mpesa" &&
                  (!mpesaDetails.transactionCode ||
                    !mpesaDetails.phoneNumber)) ||
                cart.length === 0 ||
                isProcessing
              }
              className="w-full bg-emerald text-obsidian py-4 rounded-lg font-bold
                hover:bg-emerald/90 transition-colors disabled:opacity-50 
                disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-pulse"></i>
                  Processing...
                </span>
              ) : (
                `Complete Sale · KSh ${calculateTotal()}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
