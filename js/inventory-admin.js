import { productManager } from "./ProductManager.js";
import { thresholdManager } from "./ThresholdManager.js";
import { importManager } from "./ImportSlip.js";

// ==================== UI COMPONENTS ====================

/**
 * Render panel cấu hình ngưỡng cảnh báo
 */
function renderThresholdConfigPanel() {
  const section = document.querySelector("section.inventory");
  if (!section) return;

  let panel = document.getElementById("thresholdConfigPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "thresholdConfigPanel";
    panel.className = "threshold-config-panel";

    const heading = section.querySelector("h3");
    if (heading) {
      heading.after(panel);
    } else {
      section.prepend(panel);
    }
  }

  const defaultThreshold = thresholdManager.getDefaultThreshold();
  const categories = productManager.getAllCategories?.() || [];
  const categoryThresholds = thresholdManager.getAllCategoryThresholds();

  panel.innerHTML = `
    <div class="config-card">
      <div class="config-header">
        <h4>
          <i class="fa-solid fa-sliders"></i>
          Cấu hình ngưỡng cảnh báo
        </h4>
        <button class="btn btn-secondary btn-sm" onclick="resetAllThresholds()">
          <i class="fa-solid fa-rotate-left"></i>
          Đặt lại
        </button>
      </div>

      <div class="config-section">
        <label class="config-label">
          <i class="fa-solid fa-globe"></i>
          Ngưỡng mặc định (áp dụng cho tất cả)
        </label>
        <div class="config-input-group">
          <input 
            type="number" 
            id="defaultThresholdInput" 
            value="${defaultThreshold}"
            min="0" 
            step="1"
            class="config-input"
            placeholder="Ví dụ: 10"
          />
          <button class="btn btn-primary" onclick="saveDefaultThreshold()">
            <i class="fa-solid fa-floppy-disk"></i>
            Lưu
          </button>
        </div>
        <p class="config-hint">
          Sản phẩm có tồn kho ≤ ngưỡng này sẽ được cảnh báo
        </p>
      </div>

      <div class="config-section">
        <label class="config-label">
          <i class="fa-solid fa-layer-group"></i>
          Ngưỡng theo danh mục
        </label>
        <div class="category-threshold-list">
          ${categories
            .map((category) => {
              const threshold = categoryThresholds[category.id];
              const hasCustom = threshold !== null && threshold !== undefined;
              const displayValue = hasCustom ? threshold : defaultThreshold;

              return `
                <div class="category-threshold-item ${
                  hasCustom ? "has-custom" : ""
                }">
                  <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="category-badge ${
                      hasCustom ? "badge-custom" : "badge-default"
                    }">
                      ${hasCustom ? "Tùy chỉnh" : "Mặc định"}
                    </span>
                  </div>
                  
                  <div class="category-actions">
                    <input 
                      type="number" 
                      value="${displayValue}"
                      min="0" 
                      step="1"
                      class="config-input config-input-sm"
                      id="categoryThresholdInput-${category.id}"
                      data-category-id="${category.id}"
                      placeholder="Nhập ngưỡng"
                    />
                    
                    <!-- ✅ FIX: Thêm dấu ngoặc kép cho categoryId -->
                    <button 
                      class="btn btn-primary btn-sm" 
                      onclick="saveCategoryThreshold('${category.id}')"
                      title="Lưu ngưỡng cho ${category.name}">
                      <i class="fa-solid fa-floppy-disk"></i>
                      Lưu
                    </button>
                    
                    <button 
                      class="btn btn-ghost btn-sm" 
                      onclick="removeCategoryThreshold('${category.id}')"
                      ${!hasCustom ? "disabled" : ""}
                      title="${
                        hasCustom
                          ? "Xóa ngưỡng tùy chỉnh và dùng mặc định"
                          : "Chưa có ngưỡng tùy chỉnh"
                      }">
                      <i class="fa-solid fa-xmark"></i>
                      Xóa
                    </button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <div class="config-info">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Ưu tiên áp dụng:</strong>
          <ol>
            <li>Ngưỡng riêng của sản phẩm (nếu có)</li>
            <li>Ngưỡng của danh mục (nếu có)</li>
            <li>Ngưỡng mặc định</li>
          </ol>
        </div>
      </div>
    </div>
  `;
}
function getLatestImportTime(productId) {
  const slips = importManager.getAllSlips();

  // Lọc các phiếu hoàn thành của sản phẩm này
  const completedSlips = slips.filter(
    (slip) => slip.productId === productId && slip.status === "COMPLETED"
  );

  if (completedSlips.length === 0) {
    return null;
  }

  // Sắp xếp theo ngày mới nhất
  completedSlips.sort(
    (a, b) => new Date(b.completedDate) - new Date(a.completedDate)
  );

  return completedSlips[0].completedDate;
}

/**
 * Format thời gian hiển thị
 */
function formatImportTime(dateString) {
  if (!dateString) return '<span class="text-muted">Không rõ</span>';

  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Render bảng tồn kho với cảnh báo
 */
function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const products = productManager.getVisibleProducts();

  // Tính toán statistics
  const stats = {
    total: products.length,
    lowStock: 0,
    outOfStock: 0,
    critical: 0,
  };

  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 24px; color: #666;">
                    Không có sản phẩm nào.
                </td>
            </tr>
        `;
    return;
  }

  products.forEach((product) => {
    const status = product.getStockStatus();
    const categoryName =
      productManager.getCategoryName(product.categoryId) || "Không rõ";

    // Update stats
    if (status.isLow) stats.lowStock++;
    if (status.currentStock === 0) stats.outOfStock++;
    if (status.severity === "critical") stats.critical++;

    const lastImportTime = getLatestImportTime(product.id);

    // Determine row class and status badge
    let rowClass = "";
    let statusBadge = "";

    switch (status.severity) {
      case "out":
        rowClass = "row-out-of-stock";
        statusBadge = `<span class="badge badge-out"><i class="fa-solid fa-circle-xmark"></i> Hết hàng</span>`;
        break;
      case "critical":
        rowClass = "row-critical";
        statusBadge = `<span class="badge badge-critical"><i class="fa-solid fa-triangle-exclamation"></i> Nguy hiểm</span>`;
        break;
      case "warning":
        rowClass = "row-warning";
        statusBadge = `<span class="badge badge-warning"><i class="fa-solid fa-exclamation-circle"></i> Cảnh báo</span>`;
        break;
      default:
        statusBadge = `<span class="badge badge-safe"><i class="fa-solid fa-circle-check"></i>Còn hàng</span>`;
    }

    const row = document.createElement("tr");
    row.className = rowClass;
    // ✅ CODE MỚI
    row.innerHTML = `
  <td class="col-id">${product.id}</td>
  <td>
    <div class="product-cell">
      <strong>${product.name}</strong>
      ${
        status.isLow
          ? '<span class="low-stock-indicator" title="Sắp hết hàng">⚠️</span>'
          : ""
      }
    </div>
  </td>
  <td class="col-category">${categoryName}</td>
  <td class="col-stock text-center">
    <div class="stock-info">
      <span class="stock-value ${status.severity}">${status.currentStock}</span>
      <span class="stock-threshold">/ ${status.threshold}</span>
    </div>
  </td>
  <td class="col-status">${statusBadge}</td>
  <td class="col-actions">
    <div class="action-buttons-inventory">
      <input 
        type="number" 
        class="threshold-input" 
        value="${product.lowStockThreshold ?? ""}"
        placeholder="${status.threshold}"
        min="0" 
        step="1"
        title="Ngưỡng riêng cho sản phẩm này"
        data-product-id="${product.id}"
      />
      
      <!-- Nút LƯU -->
      <button 
        class="btn btn-sm btn-primary" 
        onclick="saveProductThreshold(${product.id})"
        title="Lưu ngưỡng">
        <i class="fa-solid fa-floppy-disk"></i>
      </button>
      
      <!-- ✨ Nút XÓA - Luôn hiển thị, disabled khi chưa có ngưỡng riêng -->
      <button 
        class="btn btn-sm btn-ghost" 
        onclick="clearProductThreshold(${product.id})"
        ${product.lowStockThreshold === null ? "disabled" : ""}
        title="${
          product.lowStockThreshold !== null
            ? "Xóa ngưỡng riêng và dùng ngưỡng danh mục/mặc định"
            : "Chưa có ngưỡng riêng"
        }">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </td>
  <td class="col-times">${formatImportTime(lastImportTime)}</td>
`;

    tbody.appendChild(row);
  });

  // Render statistics summary
  renderStockSummary(stats);
}

/**
 * Render summary statistics
 */
function renderStockSummary(stats) {
  const section = document.querySelector("section.inventory");
  if (!section) return;

  let summary = document.getElementById("stockSummary");
  if (!summary) {
    summary = document.createElement("div");
    summary.id = "stockSummary";
    summary.className = "stock-summary";

    const table = section.querySelector("table");
    if (table) {
      table.before(summary);
    }
  }

  const lowStockPercent =
    stats.total > 0 ? ((stats.lowStock / stats.total) * 100).toFixed(1) : 0;

  summary.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-icon bg-blue">
                    <i class="fa-solid fa-boxes-stacked"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-value">${stats.total}</div>
                    <div class="summary-label">Tổng sản phẩm</div>
                </div>
            </div>

            <div class="summary-card ${stats.lowStock > 0 ? "alert" : ""}">
                <div class="summary-icon bg-amber">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-value">${stats.lowStock}</div>
                    <div class="summary-label">Cảnh báo (${lowStockPercent}%)</div>
                </div>
            </div>

            <div class="summary-card ${stats.critical > 0 ? "alert" : ""}">
                <div class="summary-icon bg-red">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-value">${stats.critical}</div>
                    <div class="summary-label">Nguy hiểm</div>
                </div>
            </div>

            <div class="summary-card ${stats.outOfStock > 0 ? "alert" : ""}">
                <div class="summary-icon bg-black">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-value">${stats.outOfStock}</div>
                    <div class="summary-label">Hết hàng</div>
                </div>
            </div>
        </div>

        ${
          stats.lowStock > 0
            ? `
            <div class="alert-banner">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Có <strong>${stats.lowStock}</strong> sản phẩm đang sắp hết hàng. Vui lòng kiểm tra và nhập hàng kịp thời!</span>
            </div>
        `
            : ""
        }
    `;
}

/**
 * Apply filters and search
 */
window.applyInventoryFilter = function () {
  const categoryId =
    document.getElementById("invFilterCategory")?.value || "all";
  const statusFilter =
    document.getElementById("invFilterStatus")?.value || "all";
  const searchText =
    document.getElementById("invFilterName")?.value.toLowerCase().trim() || "";
  const fromDate = document.getElementById("invFilterFromDate")?.value || "";
  const toDate = document.getElementById("invFilterToDate")?.value || "";

  filterAndRenderInventory(
    categoryId,
    statusFilter,
    searchText,
    fromDate,
    toDate
  );
};

/**
 * Reset filters
 */
window.resetInventoryFilter = function () {
  const categorySelect = document.getElementById("invFilterCategory");
  const statusSelect = document.getElementById("invFilterStatus");
  const searchInput = document.getElementById("invFilterName");
  const fromDateInput = document.getElementById("invFilterFromDate");
  const toDateInput = document.getElementById("invFilterToDate");

  if (categorySelect) categorySelect.value = "all";
  if (statusSelect) statusSelect.value = "all";
  if (searchInput) searchInput.value = "";
  if (fromDateInput) fromDateInput.value = "";
  if (toDateInput) toDateInput.value = "";

  filterAndRenderInventory("all", "all", "", "", "");
};

/**
 * Filter products by category and search term
 */
function filterAndRenderInventory(
  categoryId,
  statusFilter,
  searchText,
  fromDate,
  toDate
) {
  let products = productManager.getVisibleProducts();

  // 1. Filter by category
  if (categoryId !== "all") {
    products = products.filter((p) => p.categoryId === categoryId);
  }

  // 2. ✨ Filter by status (TÍNH NĂNG MỚI)
  if (statusFilter !== "all") {
    products = products.filter((product) => {
      const status = product.getStockStatus();
      const stock = status.currentStock;
      const threshold = status.threshold;

      switch (statusFilter) {
        case "safe":
          // Chỉ hiển thị sản phẩm ĐỦ hàng
          return stock >= threshold;

        case "warning":
          // ⚠️ Hiển thị TẤT CẢ sản phẩm DƯỚI ngưỡng (bao gồm critical và out)
          return stock < threshold;

        case "critical":
          // Chỉ hiển thị sản phẩm NGUY HIỂM (dưới 50% ngưỡng nhưng > 0)
          return stock > 0 && stock < threshold * 0.5;

        case "out":
          // Chỉ hiển thị sản phẩm HẾT HÀNG
          return stock === 0;

        default:
          return true;
      }
    });
  }

  // 3. Filter by date range
  if (fromDate || toDate) {
    products = products.filter((product) => {
      const lastImportTime = getLatestImportTime(product.id);

      if (!lastImportTime) {
        return false;
      }

      const importDate = new Date(lastImportTime);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && importDate < from) {
        return false;
      }

      if (to) {
        const toDateEnd = new Date(to);
        toDateEnd.setDate(toDateEnd.getDate() + 1);
        if (importDate >= toDateEnd) {
          return false;
        }
      }

      return true;
    });
  }

  // 4. Filter by search text
  if (searchText) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchText) ||
        p.id.toString().includes(searchText)
    );
  }

  // Render filtered results
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 24px; color: #666;">
          <i class="fa-solid fa-magnifying-glass"></i>
          Không tìm thấy sản phẩm nào phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  // Render products (giữ nguyên phần render hiện tại)
  products.forEach((product) => {
    const status = product.getStockStatus();
    const categoryName =
      productManager.getCategoryName(product.categoryId) || "Không rõ";
    const lastImportTime = getLatestImportTime(product.id);

    let rowClass = "";
    let statusBadge = "";

    switch (status.severity) {
      case "out":
        rowClass = "row-out-of-stock";
        statusBadge = `<span class="badge badge-out"><i class="fa-solid fa-circle-xmark"></i> Hết hàng</span>`;
        break;
      case "critical":
        rowClass = "row-critical";
        statusBadge = `<span class="badge badge-critical"><i class="fa-solid fa-triangle-exclamation"></i> Nguy hiểm</span>`;
        break;
      case "warning":
        rowClass = "row-warning";
        statusBadge = `<span class="badge badge-warning"><i class="fa-solid fa-exclamation-circle"></i> Cảnh báo</span>`;
        break;
      default:
        statusBadge = `<span class="badge badge-safe"><i class="fa-solid fa-circle-check"></i> Còn hàng</span>`;
    }

    const row = document.createElement("tr");
    row.className = rowClass;
    row.innerHTML = `
      <td class="col-id">${product.id}</td>
      <td>
        <div class="product-cell">
          <strong>${product.name}</strong>
          ${
            status.isLow
              ? '<span class="low-stock-indicator" title="Sắp hết hàng">⚠️</span>'
              : ""
          }
        </div>
      </td>
      <td class="col-category">${categoryName}</td>
      <td class="col-stock text-center">
        <div class="stock-info">
          <span class="stock-value ${status.severity}">${
      status.currentStock
    }</span>
          <span class="stock-threshold">/ ${status.threshold}</span>
        </div>
      </td>
      <td class="col-status">${statusBadge}</td>
      <td class="col-actions">
        <div class="action-buttons-inventory">
          <input 
            type="number" 
            class="threshold-input" 
            value="${product.lowStockThreshold ?? ""}"
            placeholder="${status.threshold}"
            min="0" 
            step="1"
            title="Ngưỡng riêng cho sản phẩm này"
            data-product-id="${product.id}"
          />
<button 
    class="btn btn-sm btn-primary" 
    onclick="saveProductThreshold(${product.id})"
    title="Lưu ngưỡng">
    <i class="fa-solid fa-floppy-disk"></i>
</button>

<button 
    class="btn btn-sm btn-ghost" 
    onclick="clearProductThreshold(${product.id})"
    title="Xóa ngưỡng riêng">
    <i class="fa-solid fa-xmark"></i>
</button>

        </div>
      </td>
      <td class="col-times">${formatImportTime(lastImportTime)}</td>
    `;

    tbody.appendChild(row);
  });
}
// ==================== EVENT HANDLERS ====================

/**
 * Lưu ngưỡng mặc định
 */
window.saveDefaultThreshold = function () {
  const input = document.getElementById("defaultThresholdInput");
  if (!input) return;

  try {
    const value = Number(input.value);
    if (isNaN(value) || value < 0) {
      alert("❌ Ngưỡng phải là số không âm");
      return;
    }

    thresholdManager.setDefaultThreshold(value);
    alert("✅ Đã lưu ngưỡng mặc định");
    renderThresholdConfigPanel();
    renderInventoryTable();
  } catch (error) {
    alert("❌ " + error.message);
  }
};

/**
 * Cập nhật ngưỡng của danh mục
 */

/**
 * Xóa ngưỡng riêng của danh mục
 */
window.removeCategoryThreshold = function (categoryId) {
  if (confirm("Xóa ngưỡng riêng và dùng ngưỡng mặc định?")) {
    thresholdManager.removeCategoryThreshold(categoryId);
    renderThresholdConfigPanel();
    renderInventoryTable();
  }
};

/**
 * Lưu ngưỡng riêng cho sản phẩm
 */
window.saveProductThreshold = function (productId) {
  const input = document.querySelector(
    `input.threshold-input[data-product-id="${productId}"]`
  );
  if (!input) return;

  try {
    const value = input.value.trim();
    const product = productManager.getProductById(productId);

    if (!product) {
      alert("❌ Không tìm thấy sản phẩm");
      return;
    }

    if (value === "") {
      // Empty = remove custom threshold
      product.setThreshold(null);
    } else {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        alert("❌ Ngưỡng phải là số không âm");
        return;
      }
      product.setThreshold(num);
    }

    productManager.saveAllProducts();
    renderInventoryTable();
    alert("✅ Đã lưu ngưỡng cho sản phẩm");
  } catch (error) {
    alert("❌ " + error.message);
  }
};

/**
 * Xóa ngưỡng riêng của sản phẩm
 */
window.clearProductThreshold = function (productId) {
  if (confirm("Xóa ngưỡng riêng và dùng ngưỡng danh mục/mặc định?")) {
    const product = productManager.getProductById(productId);
    if (product) {
      product.setThreshold(null);
      productManager.saveAllProducts();
      renderInventoryTable();
    }
  }
};

/**
 * Reset tất cả về mặc định
 */
window.resetAllThresholds = function () {
  if (
    confirm(
      "Đặt lại TẤT CẢ ngưỡng cảnh báo về mặc định? Hành động này không thể hoàn tác."
    )
  ) {
    thresholdManager.reset();

    // Xóa threshold của tất cả products
    const products = productManager.getAllProducts(false);
    products.forEach((product) => {
      product.setThreshold(null);
    });
    productManager.saveAllProducts();

    renderThresholdConfigPanel();
    renderInventoryTable();
    alert("✅ Đã đặt lại tất cả ngưỡng về mặc định");
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Populate category filter dropdown
 */
function populateCategoryFilter() {
  const select = document.getElementById("invFilterCategory");
  if (!select) return;

  const categories = productManager.getAllCategories();

  // Keep the "Tất cả" option and add categories
  const currentHtml = select.innerHTML;
  const allOption = '<option value="all">Tất cả</option>';

  const categoryOptions = categories
    .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
    .join("");

  select.innerHTML = allOption + categoryOptions;
}

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
}

// ==================== EVENT HANDLERS ====================

/**
 * ✨ HÀM MỚI: Lưu ngưỡng cho danh mục cụ thể
 * @param {number|string} categoryId - ID của danh mục
 */
window.saveCategoryThreshold = function (categoryId) {
  const input = document.getElementById(`categoryThresholdInput-${categoryId}`);
  if (!input) {
    alert("❌ Không tìm thấy input");
    return;
  }

  try {
    const value = input.value.trim();

    // Validate empty
    if (value === "") {
      alert("❌ Vui lòng nhập giá trị ngưỡng");
      input.focus();
      return;
    }

    // Validate number
    const num = Number(value);
    if (isNaN(num)) {
      alert("❌ Ngưỡng phải là số");
      input.focus();
      return;
    }

    // Validate non-negative
    if (num < 0) {
      alert("❌ Ngưỡng phải là số không âm");
      input.focus();
      return;
    }

    // Save to manager
    thresholdManager.setCategoryThreshold(categoryId, num);

    // Show success feedback
    alert(`✅ Đã lưu ngưỡng ${num} cho danh mục này`);

    // Re-render UI
    renderThresholdConfigPanel();
    renderInventoryTable();
  } catch (error) {
    console.error("Error saving category threshold:", error);
    alert("❌ Có lỗi xảy ra: " + error.message);
  }
};

/**
 * Xóa ngưỡng riêng của danh mục - CẢI TIẾN với validation
 */
window.removeCategoryThreshold = function (categoryId) {
  // Check if has custom threshold
  const categoryThresholds = thresholdManager.getAllCategoryThresholds();
  const hasCustom =
    categoryThresholds[categoryId] !== null &&
    categoryThresholds[categoryId] !== undefined;

  if (!hasCustom) {
    alert("ℹ️ Danh mục này đang dùng ngưỡng mặc định");
    return;
  }

  if (confirm("Xóa ngưỡng riêng và dùng ngưỡng mặc định?")) {
    try {
      thresholdManager.removeCategoryThreshold(categoryId);
      alert("✅ Đã xóa ngưỡng tùy chỉnh");
      renderThresholdConfigPanel();
      renderInventoryTable();
    } catch (error) {
      console.error("Error removing category threshold:", error);
      alert("❌ Có lỗi xảy ra: " + error.message);
    }
  }
};

// ... (các hàm event handlers khác giữ nguyên)

// ==================== INITIALIZATION ====================

function initInventoryAdmin() {
  console.log("📦 Initializing Inventory Admin...");

  // Populate category filter
  populateCategoryFilter();

  // Render UI components
  renderThresholdConfigPanel();
  renderInventoryTable();

  const filterApplyBtn = document.getElementById("invFilterApply");
  const filterResetBtn = document.getElementById("invFilterReset");
  const searchInput = document.getElementById("invFilterName");
  const fromDateInput = document.getElementById("invFilterFromDate");
  const toDateInput = document.getElementById("invFilterToDate");

  if (filterApplyBtn) {
    filterApplyBtn.addEventListener("click", applyInventoryFilter);
  }

  if (filterResetBtn) {
    filterResetBtn.addEventListener("click", resetInventoryFilter);
  }
  // ✨ Auto-apply khi thay đổi status filter
  const statusSelect = document.getElementById("invFilterStatus");
  if (statusSelect) {
    statusSelect.addEventListener("change", applyInventoryFilter);
  }

  if (fromDateInput) {
    fromDateInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyInventoryFilter();
      }
    });
  }

  if (toDateInput) {
    toDateInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyInventoryFilter();
      }
    });
  }

  // Listen to threshold changes
  window.addEventListener("thresholdChanged", () => {
    console.log("🔄 Threshold changed, re-rendering...");
    renderInventoryTable();
  });

  console.log("✅ Inventory Admin initialized");
}

// Auto-init when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInventoryAdmin);
} else {
  initInventoryAdmin();
}

// Export for external access
window.renderInventoryTable = renderInventoryTable;
window.renderThresholdConfigPanel = renderThresholdConfigPanel;
window.applyInventoryFilter = applyInventoryFilter;
window.resetInventoryFilter = resetInventoryFilter;
