// src/modules/business/components/ProductManagement.tsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  storage,
  ProductCategory,
  PriceUnit,
} from "../../../services/storage/db";

interface Props {
  userId: string;
}

interface ProductFormData {
  name: string;
  emoji: string;
  category: ProductCategory;
  subCategory: string;
  price: string;
  pricePerUnit: PriceUnit;
  stock: string;
  lowStockAlert: string;
  supplier: string;
  isPerishable: boolean;
  requiresCooling: boolean;
  description: string;
  barcode: string;
  expiryDate: string;
}

export const ProductManagement: React.FC<Props> = ({ userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("vegetables");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    emoji: "🥕",
    category: "vegetables",
    subCategory: "",
    price: "",
    pricePerUnit: "piece",
    stock: "",
    lowStockAlert: "5",
    supplier: "",
    isPerishable: true,
    requiresCooling: false,
    description: "",
    barcode: "",
    expiryDate: "",
  });

  // Fetch products for this user
  const products = useLiveQuery(async () => {
    return await db.products.where("userId").equals(userId).toArray();
  }, [userId]);

  // Filter products by category and search term
  const filteredProducts = products?.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.supplier || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group products by category for stats
  const productsByCategory = products?.reduce(
    (acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Low stock count
  const lowStockCount =
    products?.filter((p) => p.stock <= p.lowStockAlert).length || 0;

  // Category icons and colors
  const categoryConfig: Record<
    ProductCategory,
    { icon: string; color: string }
  > = {
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

  // Subcategory options based on main category
  const getSubCategoryOptions = () => {
    switch (formData.category) {
      case "vegetables":
        return [
          "tomatoes",
          "onions",
          "carrots",
          "cabbage",
          "kale",
          "spinach",
          "capsicum",
          "cucumber",
          "eggplant",
          "green_beans",
          "peas",
          "other",
        ];
      case "fruits":
        return [
          "bananas",
          "oranges",
          "apples",
          "mangoes",
          "avocados",
          "pineapple",
          "watermelon",
          "passion",
          "lemons",
          "other",
        ];
      case "grains":
        return [
          "maize",
          "rice",
          "beans",
          "wheat",
          "millet",
          "sorghum",
          "green_grams",
          "cowpeas",
          "other",
        ];
      default:
        return [];
    }
  };

  // Emoji options based on category
  const getEmojiOptions = () => {
    switch (formData.category) {
      case "vegetables":
        return ["🥕", "🧅", "🌶️", "🥒", "🍅", "🥬", "🧄", "🫑", "🌽", "🥦"];
      case "fruits":
        return ["🍎", "🍌", "🍊", "🍇", "🥭", "🍍", "🥝", "🍓", "🍒", "🍉"];
      case "grains":
        return ["🌽", "🌾", "🫘", "🥜", "🌰", "🍚"];
      case "tubers":
        return ["🥔", "🍠", "🧅"];
      case "leafy_greens":
        return ["🥬", "🌿", "🥗", "🌱"];
      case "herbs":
        return ["🌿", "🌱", "🪴", "🌸"];
      case "legumes":
        return ["🫘", "🥜", "🌰", "🫛"];
      case "dairy":
        return ["🥛", "🧀", "🥚", "🍦"];
      case "beverages":
        return ["🧃", "🥤", "🧋", "☕", "🧉"];
      case "snacks":
        return ["🍪", "🍫", "🍿", "🥨", "🍩"];
      default:
        return ["📦", "🏷️", "🛒"];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.price || !formData.stock) {
      alert("Please fill in all required fields");
      return;
    }

    const productData = {
      userId,
      name: formData.name,
      emoji: formData.emoji,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      price: parseFloat(formData.price),
      pricePerUnit: formData.pricePerUnit,
      stock: parseInt(formData.stock),
      lowStockAlert: parseInt(formData.lowStockAlert),
      supplier: formData.supplier || undefined,
      isPerishable: formData.isPerishable,
      requiresCooling: formData.requiresCooling,
      description: formData.description || undefined,
      barcode: formData.barcode || undefined,
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      if (editingProduct) {
        await db.products.update(editingProduct.id, {
          ...productData,
          updatedAt: new Date(),
        });
        alert("✅ Product updated successfully");
      } else {
        await storage.addProduct(productData);
        alert("✅ Product added successfully");
      }

      // Reset form
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        emoji: "🥕",
        category: "vegetables",
        subCategory: "",
        price: "",
        pricePerUnit: "piece",
        stock: "",
        lowStockAlert: "5",
        supplier: "",
        isPerishable: true,
        requiresCooling: false,
        description: "",
        barcode: "",
        expiryDate: "",
      });
    } catch (error) {
      console.error("Error saving product:", error);
      alert("❌ Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      emoji: product.emoji,
      category: product.category,
      subCategory: product.subCategory || "",
      price: product.price.toString(),
      pricePerUnit: product.pricePerUnit,
      stock: product.stock.toString(),
      lowStockAlert: product.lowStockAlert.toString(),
      supplier: product.supplier || "",
      isPerishable: product.isPerishable,
      requiresCooling: product.requiresCooling || false,
      description: product.description || "",
      barcode: product.barcode || "",
      expiryDate: product.expiryDate
        ? new Date(product.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setSelectedCategory(product.category);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await db.products.delete(id);
        alert("✅ Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("❌ Failed to delete product");
      }
    }
  };

  const handleQuickStockUpdate = async (
    productId: string,
    currentStock: number,
    adjustment: number,
  ) => {
    const newStock = currentStock + adjustment;
    if (newStock < 0) return;

    await db.products.update(productId, {
      stock: newStock,
      updatedAt: new Date(),
    });
  };

  const getStockStatusColor = (stock: number, lowStockAlert: number) => {
    if (stock === 0) return "text-rust";
    if (stock <= lowStockAlert) return "text-amber";
    return "text-emerald";
  };

  const getStockStatusBg = (stock: number, lowStockAlert: number) => {
    if (stock === 0) return "bg-rust/10";
    if (stock <= lowStockAlert) return "bg-amber/10";
    return "bg-emerald/10";
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <i className="fas fa-boxes text-emerald"></i>
              Inventory Management
            </h3>
            <p className="text-text-secondary text-sm">
              {products?.length || 0} total products · {lowStockCount} low stock
              alerts
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: "",
                emoji: "🥕",
                category: "vegetables",
                subCategory: "",
                price: "",
                pricePerUnit: "piece",
                stock: "",
                lowStockAlert: "5",
                supplier: "",
                isPerishable: true,
                requiresCooling: false,
                description: "",
                barcode: "",
                expiryDate: "",
              });
              setShowForm(true);
            }}
            className="bg-emerald text-obsidian px-4 py-2 rounded-lg text-sm font-bold
              hover:bg-emerald/90 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Product
          </button>
        </div>

        {/* Category Pills and Search */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products or suppliers..."
              className="w-full bg-black/20 border border-white/5 rounded-lg pl-10 pr-4 py-2
                text-text-primary focus:outline-none focus:border-emerald"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all" as ProductCategory)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all
                ${
                  selectedCategory === "all"
                    ? "bg-emerald text-obsidian"
                    : "glass-card hover:border-emerald/30"
                }`}
            >
              All
            </button>
            {Object.entries(categoryConfig).map(([cat, config]) => (
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
                {productsByCategory?.[cat] && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === cat ? "bg-white/20" : "bg-white/5"
                    }`}
                  >
                    {productsByCategory[cat]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const categoryColor =
              categoryConfig[product.category]?.color || "gray";
            const stockStatus = getStockStatusColor(
              product.stock,
              product.lowStockAlert,
            );
            const stockBg = getStockStatusBg(
              product.stock,
              product.lowStockAlert,
            );

            return (
              <div
                key={product.id}
                className="glass-card p-4 relative group hover:border-emerald/30 transition-all"
              >
                {/* Quick Actions */}
                <div
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
                  transition-opacity flex gap-1"
                >
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-7 h-7 rounded-full bg-emerald/20 text-emerald 
                      hover:bg-emerald/30 flex items-center justify-center"
                    title="Edit product"
                  >
                    <i className="fas fa-edit text-xs"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id!, product.name)}
                    className="w-7 h-7 rounded-full bg-rust/20 text-rust 
                      hover:bg-rust/30 flex items-center justify-center"
                    title="Delete product"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>

                {/* Product Icon */}
                <div
                  className={`text-5xl mb-3 text-center filter drop-shadow-lg`}
                >
                  {product.emoji}
                </div>

                {/* Product Info */}
                <h4 className="font-bold text-center mb-1">{product.name}</h4>
                <p className="text-emerald font-bold text-center text-lg">
                  KSh {product.price}
                  <span className="text-xs text-text-secondary ml-1">
                    /{product.pricePerUnit}
                  </span>
                </p>

                {/* Category Badge */}
                <div className="flex justify-center mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-${categoryColor}/10 text-${categoryColor}`}
                  >
                    {product.category.replace("_", " ")}
                  </span>
                </div>

                {/* Stock Status */}
                <div
                  className={`mt-3 p-2 rounded-lg ${stockBg} flex items-center justify-between`}
                >
                  <span className="text-xs">Stock:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuickStockUpdate(product.id!, product.stock, -1)
                      }
                      className="w-5 h-5 rounded-full bg-black/20 hover:bg-black/40 
                        flex items-center justify-center text-xs"
                      disabled={product.stock <= 0}
                    >
                      -
                    </button>
                    <span className={`font-bold text-sm ${stockStatus}`}>
                      {product.stock}
                    </span>
                    <button
                      onClick={() =>
                        handleQuickStockUpdate(product.id!, product.stock, 1)
                      }
                      className="w-5 h-5 rounded-full bg-black/20 hover:bg-black/40 
                        flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-2 text-xs text-text-secondary flex flex-wrap gap-2 justify-center">
                  {product.supplier && (
                    <span className="flex items-center gap-1">
                      <i className="fas fa-truck"></i> {product.supplier}
                    </span>
                  )}
                  {product.isPerishable && (
                    <span className="flex items-center gap-1">
                      <i className="fas fa-snowflake"></i> Perishable
                    </span>
                  )}
                  {product.stock <= product.lowStockAlert && (
                    <span className="flex items-center gap-1 text-amber">
                      <i className="fas fa-exclamation-triangle"></i> Low stock
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div
            className="w-20 h-20 bg-emerald/10 rounded-full flex items-center 
            justify-center mx-auto mb-4 text-4xl text-emerald"
          >
            <i className="fas fa-box-open"></i>
          </div>
          <h3 className="text-xl font-display font-bold mb-2">
            No Products Found
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter"
              : "Start by adding your first product"}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: "",
                  emoji: "🥕",
                  category: "vegetables",
                  subCategory: "",
                  price: "",
                  pricePerUnit: "piece",
                  stock: "",
                  lowStockAlert: "5",
                  supplier: "",
                  isPerishable: true,
                  requiresCooling: false,
                  description: "",
                  barcode: "",
                  expiryDate: "",
                });
                setShowForm(true);
              }}
              className="bg-emerald text-obsidian px-6 py-3 rounded-lg font-bold
                hover:bg-emerald/90 transition-colors inline-flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-card w-full max-w-3xl my-8 p-6 relative">
            <div
              className="sticky top-0 bg-vault/90 backdrop-blur py-3 -mt-3 -mx-6 px-6 mb-4
              border-b border-white/5 flex justify-between items-center"
            >
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <i className="fas fa-edit text-emerald"></i>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-text-secondary hover:text-emerald transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCategory = e.target.value as ProductCategory;
                      setFormData({
                        ...formData,
                        category: newCategory,
                        emoji: getEmojiOptions()[0] || "📦",
                        subCategory: "",
                      });
                    }}
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                    required
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains & Cereals</option>
                    <option value="tubers">Tubers</option>
                    <option value="leafy_greens">Leafy Greens</option>
                    <option value="herbs">Herbs</option>
                    <option value="legumes">Legumes</option>
                    <option value="dairy">Dairy</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks</option>
                    <option value="household">Household</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subcategory (if applicable) */}
                {getSubCategoryOptions().length > 0 && (
                  <div>
                    <label className="block text-text-secondary text-sm mb-1 font-medium">
                      Subcategory
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                        })
                      }
                      className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                        text-text-primary focus:outline-none focus:border-emerald"
                    >
                      <option value="">Select type</option>
                      {getSubCategoryOptions().map((opt) => (
                        <option key={opt} value={opt}>
                          {opt
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Emoji Selection */}
              <div>
                <label className="block text-text-secondary text-sm mb-2 font-medium">
                  Product Icon *
                </label>
                <div className="flex gap-2 flex-wrap bg-black/20 p-3 rounded-lg">
                  {getEmojiOptions().map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`w-12 h-12 text-3xl rounded-lg transition-all ${
                        formData.emoji === emoji
                          ? "bg-emerald text-obsidian scale-110 shadow-lg"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-text-secondary text-sm mb-1 font-medium">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Fresh Tomatoes, Sukuma Wiki, etc."
                  className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-emerald"
                  required
                />
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Price (KSh) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Price Per Unit *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(
                      ["piece", "kg", "bunch", "packet", "dozen"] as PriceUnit[]
                    ).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, pricePerUnit: unit })
                        }
                        className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                          formData.pricePerUnit === unit
                            ? "bg-emerald text-obsidian"
                            : "bg-white/5 text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        {unit === "piece"
                          ? "Piece"
                          : unit === "kg"
                            ? "Kg"
                            : unit === "bunch"
                              ? "Bunch"
                              : unit === "packet"
                                ? "Packet"
                                : "Dozen"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stock Levels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Low Stock Alert *
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockAlert: e.target.value,
                      })
                    }
                    placeholder="5"
                    min="1"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                    required
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    You'll be alerted when stock falls below this number
                  </p>
                </div>
              </div>

              {/* Supplier & Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Supplier (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    placeholder="e.g., Wakulima Market, Supplier Name"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Barcode/SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder="Scan or enter barcode"
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  />
                </div>
              </div>

              {/* Perishable Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                  <label className="text-text-secondary text-sm">
                    Perishable Item?
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isPerishable: !formData.isPerishable,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isPerishable ? "bg-emerald" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isPerishable ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm">
                    {formData.isPerishable ? "Yes (needs cool storage)" : "No"}
                  </span>
                </div>

                {formData.isPerishable && (
                  <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                    <label className="text-text-secondary text-sm">
                      Requires Cooling?
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          requiresCooling: !formData.requiresCooling,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.requiresCooling ? "bg-emerald" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          formData.requiresCooling ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm">
                      {formData.requiresCooling
                        ? "Refrigerated"
                        : "Room temperature"}
                    </span>
                  </div>
                )}
              </div>

              {/* Expiry Date (for perishable items) */}
              {formData.isPerishable && (
                <div>
                  <label className="block text-text-secondary text-sm mb-1 font-medium">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                      text-text-primary focus:outline-none focus:border-emerald"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-text-secondary text-sm mb-1 font-medium">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details about the product (quality, origin, etc.)"
                  rows={3}
                  className="w-full bg-black/20 border border-white/5 rounded-lg p-3
                    text-text-primary focus:outline-none focus:border-emerald resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-transparent border border-white/10 
                    text-text-secondary py-3 rounded-lg font-bold
                    hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald text-obsidian py-3 rounded-lg font-bold
                    hover:bg-emerald/90 transition-colors"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
