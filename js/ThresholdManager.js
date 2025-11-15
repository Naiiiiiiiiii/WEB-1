/**
 * ThresholdManager - Quản lý ngưỡng cảnh báo tồn kho
 * @description Centralized management cho threshold settings
 */

const STORAGE_KEY = "shoestore_threshold_config";

export class ThresholdManager {
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load cấu hình từ localStorage
   * @private
   * @returns {Object} Config object
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("❌ Lỗi khi load threshold config:", error);
    }

    // Default config
    return {
      defaultThreshold: 10, // Ngưỡng mặc định
      categoryThresholds: {}, // { categoryId: threshold }
      lastUpdated: Date.now(),
    };
  }

  /**
   * Lưu cấu hình vào localStorage
   * @private
   */
  saveConfig() {
    try {
      this.config.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));

      // Dispatch event để các module khác biết config đã thay đổi
      window.dispatchEvent(
        new CustomEvent("thresholdChanged", {
          detail: this.config,
        })
      );
    } catch (error) {
      console.error("❌ Lỗi khi lưu threshold config:", error);
      throw new Error("Không thể lưu cấu hình. Vui lòng thử lại.");
    }
  }

  // ==================== GLOBAL DEFAULT ====================

  /**
   * Lấy ngưỡng mặc định toàn hệ thống
   * @returns {number}
   */
  getDefaultThreshold() {
    return this.config.defaultThreshold;
  }

  /**
   * Cập nhật ngưỡng mặc định
   * @param {number} threshold - Ngưỡng mới
   * @throws {Error} Nếu giá trị không hợp lệ
   */
  setDefaultThreshold(threshold) {
    const num = Number(threshold);
    if (isNaN(num) || num < 0) {
      throw new Error("Ngưỡng mặc định phải là số không âm");
    }
    this.config.defaultThreshold = num;
    this.saveConfig();
  }

  // ==================== CATEGORY LEVEL ====================

  /**
   * Lấy ngưỡng của một danh mục cụ thể
   * @param {number|string} categoryId
   * @returns {number|null} Threshold hoặc null nếu chưa set
   */
  getCategoryThreshold(categoryId) {
    return this.config.categoryThresholds[categoryId] ?? null;
  }

  /**
   * Đặt ngưỡng cho một danh mục
   * @param {number|string} categoryId
   * @param {number} threshold
   * @throws {Error} Nếu giá trị không hợp lệ
   */
  setCategoryThreshold(categoryId, threshold) {
    const num = Number(threshold);
    if (isNaN(num) || num < 0) {
      throw new Error("Ngưỡng danh mục phải là số không âm");
    }
    this.config.categoryThresholds[categoryId] = num;
    this.saveConfig();
  }

  /**
   * Xóa ngưỡng riêng của danh mục (fallback về default)
   * @param {number|string} categoryId
   */
  removeCategoryThreshold(categoryId) {
    delete this.config.categoryThresholds[categoryId];
    this.saveConfig();
  }

  /**
   * Lấy tất cả ngưỡng của các danh mục
   * @returns {Object} Map categoryId -> threshold
   */
  getAllCategoryThresholds() {
    return { ...this.config.categoryThresholds };
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Cập nhật ngưỡng cho nhiều sản phẩm cùng lúc (theo danh mục)
   * @param {number|string} categoryId
   * @param {number} threshold
   * @param {Object} productManager - Instance của ProductManager
   */
  bulkUpdateByCategory(categoryId, threshold, productManager) {
    if (!productManager) {
      throw new Error("ProductManager instance is required");
    }

    const products = productManager.getAllProducts(false);
    let updatedCount = 0;

    products.forEach((product) => {
      if (product.categoryId == categoryId) {
        product.setThreshold(threshold);
        updatedCount++;
      }
    });

    productManager.saveAllProducts();
    return updatedCount;
  }

  /**
   * Đặt lại tất cả về mặc định
   */
  reset() {
    this.config = {
      defaultThreshold: 10,
      categoryThresholds: {},
      lastUpdated: Date.now(),
    };
    this.saveConfig();
  }

  /**
   * Export config để backup
   * @returns {Object}
   */
  exportConfig() {
    return {
      ...this.config,
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * Import config từ backup
   * @param {Object} config
   */
  importConfig(config) {
    if (
      !config.defaultThreshold ||
      typeof config.defaultThreshold !== "number"
    ) {
      throw new Error("Cấu hình không hợp lệ");
    }
    this.config = {
      defaultThreshold: config.defaultThreshold,
      categoryThresholds: config.categoryThresholds || {},
      lastUpdated: Date.now(),
    };
    this.saveConfig();
  }
}

// Tạo singleton instance
export const thresholdManager = new ThresholdManager();

// Expose globally để các module khác dùng
if (typeof window !== "undefined") {
  window.thresholdManager = thresholdManager;
}
