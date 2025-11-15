/**
 * Product Class - Enhanced với threshold management
 */
export class Product {
  constructor(data) {
    // ... existing properties ...
    this.id = data.id;
    this.name = data.name;
    this.categoryId = data.categoryId;
    this.price = data.price;
    this.oldPrice = data.oldPrice || null;
    this.img = data.img || data.imageUrl;
    this.images = data.images || [];
    this.variants = data.variants || [];
    this.description = data.description || "";

    // Inventory fields
    this.costPrice = data.costPrice || 0;
    this.initialStock = data.initialStock || 0;
    this.imports = data.imports || [];
    this.sales = data.sales || [];
    this.isHidden = data.isHidden || false;

    // Rating fields
    this.rating = data.rating || 0;
    this.ratingCount = data.ratingCount || 0;
    this.badge = data.badge || null;
    this.targetProfitMargin = data.targetProfitMargin || null;

    /**
     * NEW: Product-specific threshold (optional)
     * Nếu null -> fallback sang category hoặc default threshold
     */
    this.lowStockThreshold = data.lowStockThreshold ?? null;
  }

  /**
   * Lấy tổng tồn kho hiện tại
   * @returns {number} Tổng số lượng tồn
   */
  getCurrentStock() {
    if (this.variants && this.variants.length > 0) {
      // Sản phẩm có variants: tính tổng stock của tất cả variants
      return this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    // Sản phẩm đơn giản: dùng initialStock
    return Number(this.initialStock) || 0;
  }

  /**
   * Lấy ngưỡng cảnh báo hiệu quả cho sản phẩm này
   * Priority: Product-specific > Category-level > Global default
   * @returns {number} Ngưỡng cảnh báo
   */
  getEffectiveThreshold() {
    // Kiểm tra window.thresholdManager có tồn tại không
    if (typeof window === "undefined" || !window.thresholdManager) {
      // Fallback: dùng threshold riêng của product hoặc 10
      return this.lowStockThreshold ?? 10;
    }

    const manager = window.thresholdManager;

    // Priority 1: Threshold riêng của sản phẩm
    if (
      this.lowStockThreshold !== null &&
      this.lowStockThreshold !== undefined
    ) {
      return this.lowStockThreshold;
    }

    // Priority 2: Threshold của danh mục
    const categoryThreshold = manager.getCategoryThreshold(this.categoryId);
    if (categoryThreshold !== null) {
      return categoryThreshold;
    }

    // Priority 3: Threshold mặc định toàn hệ thống
    return manager.getDefaultThreshold();
  }

  /**
   * Kiểm tra xem sản phẩm có sắp hết hàng không
   * @returns {boolean} true nếu tồn kho <= ngưỡng cảnh báo
   */
  isLowStock() {
    const currentStock = this.getCurrentStock();
    const threshold = this.getEffectiveThreshold();
    return currentStock <= threshold;
  }

  /**
   * Lấy trạng thái tồn kho chi tiết
   * @returns {Object} { isLow, currentStock, threshold, percentage }
   */
  getStockStatus() {
    const currentStock = this.getCurrentStock();
    const threshold = this.getEffectiveThreshold();
    const isLow = currentStock <= threshold;

    return {
      isLow,
      currentStock,
      threshold,
      percentage:
        threshold > 0 ? Math.round((currentStock / threshold) * 100) : 0,
      severity: this._getStockSeverity(currentStock, threshold),
    };
  }

  /**
   * Private: Xác định mức độ nghiêm trọng
   * @private
   */
  _getStockSeverity(stock, threshold) {
    if (stock === 0) return "out"; // Hết hàng
    if (stock <= threshold * 0.3) return "critical"; // Nguy hiểm (≤30% threshold)
    if (stock <= threshold) return "warning"; // Cảnh báo
    return "safe"; // An toàn
  }

  /**
   * Cập nhật ngưỡng cảnh báo cho sản phẩm này
   * @param {number|null} threshold - Ngưỡng mới (null = xóa và dùng category/default)
   */
  setThreshold(threshold) {
    if (threshold === null || threshold === undefined) {
      this.lowStockThreshold = null;
    } else {
      const num = Number(threshold);
      if (isNaN(num) || num < 0) {
        throw new Error("Ngưỡng cảnh báo phải là số không âm");
      }
      this.lowStockThreshold = num;
    }
  }

  // ... existing methods (getAvailableSizes, getVariant, etc.) ...

  /**
   * Chuyển đổi sang JSON để lưu vào localStorage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      price: this.price,
      oldPrice: this.oldPrice,
      img: this.img,
      images: this.images,
      rating: this.rating,
      ratingCount: this.ratingCount,
      badge: this.badge,
      description: this.description,
      costPrice: this.costPrice,
      initialStock: this.initialStock,
      lowStockThreshold: this.lowStockThreshold,
      imports: this.imports,
      sales: this.sales,
      isHidden: this.isHidden,
      variants: this.variants,
      targetProfitMargin: this.targetProfitMargin,
    };
  }

  static fromJSON(data) {
    return new Product(data);
  }
}
