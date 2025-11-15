/**
 * Product Class - Enhanced với threshold management và UI methods
 * @class Product
 * @description Domain model cho sản phẩm với đầy đủ business logic và presentation methods
 */
export class Product {
  /**
   * @param {Object} data - Dữ liệu khởi tạo product
   */
  constructor(data) {
    // Core properties
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

    // Rating & Badge fields
    this.rating = data.rating || 0;
    this.ratingCount = data.ratingCount || 0;
    this.badge = data.badge || null;
    this.targetProfitMargin = data.targetProfitMargin || null;

    // Threshold management
    this.lowStockThreshold = data.lowStockThreshold ?? null;
  }

  // ========================================
  // UI PRESENTATION METHODS
  // ========================================

  /**
   * Render HTML stars rating với Font Awesome icons
   * @returns {string} HTML string của rating stars
   * @example
   * // Rating 4.5 → "★★★★☆" (4 full stars, 1 half star)
   * product.renderStars() // '<i class="fas fa-star"></i>...'
   */
  renderStars() {
    const rating = this.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = "";

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="far fa-star"></i>';
    }

    return starsHtml;
  }

  /**
   * Kiểm tra xem sản phẩm có đang sale không
   * @returns {boolean} true nếu có giá cũ và giá cũ > giá hiện tại
   */
  isOnSale() {
    return Boolean(this.oldPrice && this.oldPrice > this.price);
  }

  /**
   * Format giá bán theo chuẩn VND với dấu phân cách hàng nghìn
   * @returns {string} Giá đã format (ví dụ: "2.500.000₫")
   */
  getFormattedPrice() {
    return new Intl.NumberFormat("vi-VN").format(this.price || 0) + "₫";
  }

  /**
   * Format giá cũ (oldPrice) theo chuẩn VND
   * @returns {string} Giá cũ đã format
   */
  getFormattedOldPrice() {
    return new Intl.NumberFormat("vi-VN").format(this.oldPrice || 0) + "₫";
  }

  /**
   * Lấy text hiển thị của badge với emoji
   * @returns {string} Badge text có format đẹp, trả về empty string nếu không có badge
   * @example
   * product.badge = 'hot'
   * product.getBadgeText() // "🔥 Hot"
   */
  getBadgeText() {
    if (!this.badge) return "";

    const badgeMap = {
      hot: "🔥 Hot",
      new: "✨ Mới",
      sale: "💰 Giảm giá",
      "best-seller": "⭐ Bán chạy",
    };

    return badgeMap[this.badge] || this.badge;
  }

  /**
   * Lấy danh sách sizes có sẵn từ variants (unique & sorted)
   * @returns {Array<string|number>} Mảng các sizes đã loại trùng
   */
  getAvailableSizes() {
    if (!this.variants || this.variants.length === 0) {
      return [];
    }

    const sizes = [...new Set(this.variants.map((v) => v.size))].filter(
      Boolean
    );

    // Sort sizes if they're numbers
    return sizes.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return String(a).localeCompare(String(b));
    });
  }

  /**
   * Lấy danh sách màu có sẵn từ variants (unique)
   * @returns {Array<string>} Mảng các màu đã loại trùng
   */
  getAvailableColors() {
    if (!this.variants || this.variants.length === 0) {
      return [];
    }

    return [...new Set(this.variants.map((v) => v.color))].filter(Boolean);
  }

  /**
   * Tìm variant cụ thể theo size và color
   * @param {string|number} size - Size cần tìm
   * @param {string|null} [color=null] - Color cần tìm (optional)
   * @returns {Object|null} Variant object hoặc null nếu không tìm thấy
   */
  getVariant(size, color = null) {
    if (!this.variants || this.variants.length === 0) {
      return null;
    }

    return (
      this.variants.find((v) => {
        const matchSize = v.size && v.size.toString() === size?.toString();
        const matchColor =
          !color || (v.color && v.color.toString() === color.toString());
        return matchSize && matchColor;
      }) || null
    );
  }

  /**
   * Kiểm tra xem variant có còn hàng không
   * @param {string|number} size - Size cần check
   * @param {string|null} [color=null] - Color cần check (optional)
   * @returns {boolean} true nếu còn hàng (stock > 0)
   */
  hasVariantInStock(size, color = null) {
    const variant = this.getVariant(size, color);

    if (!variant) {
      // Nếu không có variant system, fallback sang initialStock
      return (this.initialStock || 0) > 0;
    }

    return (variant.stock || 0) > 0;
  }

  /**
   * Lấy số lượng tồn kho của variant cụ thể
   * @param {string|number} size - Size
   * @param {string|null} [color=null] - Color (optional)
   * @returns {number} Số lượng tồn kho, trả về 0 nếu không tìm thấy
   */
  getVariantStock(size, color = null) {
    const variant = this.getVariant(size, color);

    if (!variant) {
      // Fallback sang initialStock nếu không có variant
      return this.initialStock || 0;
    }

    return variant.stock || 0;
  }

  /**
   * Lấy giá của variant cụ thể (nếu variant có giá riêng)
   * @param {string|number} size - Size
   * @param {string|null} [color=null] - Color (optional)
   * @returns {number} Giá của variant hoặc giá mặc định của product
   */
  getVariantPrice(size, color = null) {
    const variant = this.getVariant(size, color);

    if (variant && variant.price !== undefined) {
      return variant.price;
    }

    // Fallback sang giá mặc định
    return this.price;
  }

  // ========================================
  // INVENTORY MANAGEMENT METHODS
  // ========================================

  /**
   * Lấy tổng số lượng tồn kho hiện tại
   * @returns {number} Tổng số lượng (sum tất cả variants hoặc initialStock)
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
   * @returns {number} Ngưỡng cảnh báo tồn kho
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
   * Lấy trạng thái tồn kho chi tiết với severity level
   * @returns {Object} { isLow, currentStock, threshold, percentage, severity }
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
   * Xác định mức độ nghiêm trọng của tồn kho
   * @private
   * @param {number} stock - Số lượng tồn kho hiện tại
   * @param {number} threshold - Ngưỡng cảnh báo
   * @returns {string} 'out' | 'critical' | 'warning' | 'safe'
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
   * @throws {Error} Nếu threshold không hợp lệ
   */
  setThreshold(threshold) {
    if (threshold === null || threshold === undefined) {
      this.lowStockThreshold = null;
      return;
    }

    const num = Number(threshold);
    if (isNaN(num) || num < 0) {
      throw new Error("Ngưỡng cảnh báo phải là số không âm");
    }

    this.lowStockThreshold = num;
  }

  // ========================================
  // SERIALIZATION METHODS
  // ========================================

  /**
   * Chuyển đổi Product instance sang plain object để lưu vào localStorage
   * @returns {Object} Plain object chứa tất cả properties
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

  /**
   * Tạo Product instance từ plain object (từ localStorage)
   * @static
   * @param {Object} data - Plain object
   * @returns {Product} Product instance với đầy đủ methods
   */
  static fromJSON(data) {
    return new Product(data);
  }
}
