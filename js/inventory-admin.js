import { productManager } from "./ProductManager.js";

const THRESHOLDS_KEY = "shoestore_lowstock_thresholds_v1";

function loadThresholdConfig() {
  try {
    const raw = localStorage.getItem(THRESHOLDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { default: 5, product: {}, variant: {} };
}

function saveThresholdConfig(cfg) {
  localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(cfg));
}

const thresholds = {
  getDefault() {
    return loadThresholdConfig().default ?? 5;
  },
  setDefault(n) {
    const cfg = loadThresholdConfig();
    cfg.default = Math.max(0, Number(n) || 0);
    saveThresholdConfig(cfg);
  },
  getProduct(productId) {
    const cfg = loadThresholdConfig();
    return cfg.product?.[productId];
  },
  setProduct(productId, n) {
    const cfg = loadThresholdConfig();
    cfg.product = cfg.product || {};
    cfg.product[productId] = Math.max(0, Number(n) || 0);
    saveThresholdConfig(cfg);
  },
  getVariant(productId, size) {
    const cfg = loadThresholdConfig();
    return cfg.variant?.[productId]?.[size];
  },
  setVariant(productId, size, n) {
    const cfg = loadThresholdConfig();
    cfg.variant = cfg.variant || {};
    cfg.variant[productId] = cfg.variant[productId] || {};
    cfg.variant[productId][size] = Math.max(0, Number(n) || 0);
    saveThresholdConfig(cfg);
  },
  effective(productId, size) {
    if (size != null) {
      const v = thresholds.getVariant(productId, size);
      if (typeof v === "number") return v;
    }
    const p = thresholds.getProduct(productId);
    if (typeof p === "number") return p;
    return thresholds.getDefault();
  },
  effectiveProduct(productId) {
    const p = thresholds.getProduct(productId);
    if (typeof p === "number") return p;
    return thresholds.getDefault();
  },
};

function formatPrice(n) {
  try {
    return Number(n).toLocaleString("vi-VN") + "₫";
  } catch {
    return String(n);
  }
}

function ensureDefaultThresholdControls() {
  const inventorySection = document.querySelector("section.inventory");
  if (!inventorySection) return;

  if (!document.getElementById("lowStockConfig")) {
    const toolbar = document.createElement("div");
    toolbar.className = "section-toolbar";
    toolbar.id = "lowStockConfig";
    toolbar.innerHTML = `
      <div class="field">
        <label for="defaultLowStockThreshold">
          <i class="fa-solid fa-triangle-exclamation"></i> Ngưỡng cảnh báo mặc định
        </label>
        <input type="number" id="defaultLowStockThreshold" min="0" step="1" class="w-160" />
      </div>
      <div class="field">
        <button class="btn primary" id="defaultLowStockSave">
          <i class="fa-solid fa-floppy-disk"></i> Lưu
        </button>
      </div>
    `;
    const h3 = inventorySection.querySelector("h3.mt-40");
    const firstToolbar = inventorySection.querySelector(".section-toolbar");
    // đặt ngay sau toolbar lọc đầu tiên (nếu có), trước bảng
    if (firstToolbar) {
      inventorySection.insertBefore(toolbar, firstToolbar.nextSibling);
    } else if (h3) {
      inventorySection.insertBefore(toolbar, h3.nextSibling);
    } else {
      inventorySection.prepend(toolbar);
    }
  }

  const input = document.getElementById("defaultLowStockThreshold");
  const saveBtn = document.getElementById("defaultLowStockSave");
  if (input) input.value = thresholds.getDefault();
  if (saveBtn) {
    saveBtn.onclick = () => {
      const val = Number(input.value);
      if (Number.isNaN(val) || val < 0) {
        alert("Ngưỡng mặc định phải là số >= 0");
        return;
      }
      thresholds.setDefault(val);
      alert("Đã lưu ngưỡng cảnh báo mặc định");
      renderInventoryTable();
    };
  }
}

// Compute aggregated product rows (one row per product)
function computeAggregatedRows(filters) {
  const rows = [];
  const products = productManager.getVisibleProducts();

  for (const p of products) {
    const categoryName =
      productManager.getCategoryName?.(p.categoryId) || "Khác";

    let totalStock = 0;
    
    // Calculate total stock: sum of variants OR initialStock
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      totalStock = p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    } else {
      totalStock = Number(p.initialStock || 0);
    }

    // Use product-level threshold (or default) for row status
    const productThreshold = thresholds.effectiveProduct(p.id);
    
    rows.push({
      productId: p.id,
      name: p.name,
      category: categoryName,
      totalStock,
      threshold: productThreshold,
      isLow: totalStock <= productThreshold,
      costPrice: p.costPrice || 0,
      hasVariants: Array.isArray(p.variants) && p.variants.length > 0,
    });
  }

  let filtered = rows;
  const name = (filters.name || "").toLowerCase().trim();
  const cat = filters.category || "all";

  if (name)
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(name));
  if (cat !== "all") filtered = filtered.filter((r) => r.category === cat);

  return filtered;
}

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const invFilterCategory = document.getElementById("invFilterCategory");
  const invFilterName = document.getElementById("invFilterName");

  const filters = {
    category: invFilterCategory?.value || "all",
    name: invFilterName?.value || "",
  };

  const data = computeAggregatedRows(filters);

  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="center" style="padding: 24px; color: #666;">
          Không có sản phẩm phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  // Use DocumentFragment for performance
  const fragment = document.createDocumentFragment();

  for (const r of data) {
    const statusBadge = r.isLow
      ? `<span class="status-badge status-draft" title="Sắp hết">Sắp hết</span>`
      : `<span class="status-badge status-completed" title="Ổn">Ổn</span>`;

    const row = document.createElement("tr");
    if (r.isLow) {
      row.classList.add("table-warning");
    }
    
    row.innerHTML = `
      <td class="col-id">${r.productId}</td>
      <td>${r.name}</td>
      <td class="col-category">${r.category}</td>
      <td class="col-stock right">${r.totalStock}</td>
      <td class="col-price right">${formatPrice(r.costPrice)}</td>
      <td class="col-status">${statusBadge}</td>
      <td class="col-actions">
        <div class="actions" style="display:flex; gap:8px; align-items:center; justify-content:center;">
          <input 
            type="number" 
            min="0" 
            step="1" 
            class="product-threshold-input" 
            value="${r.threshold}"
            data-product-id="${r.productId}"
            style="width:80px"
            title="Ngưỡng cảnh báo sản phẩm"
          />
          <button 
            class="btn" 
            data-action="save-product-threshold"
            data-product-id="${r.productId}"
            title="Lưu ngưỡng sản phẩm"
            style="min-width:50px;">
            Lưu
          </button>
          <button 
            class="btn btn-view-movements" 
            data-action="view-variants"
            data-product-id="${r.productId}"
            title="Xem chi tiết biến thể"
            style="min-width:60px;">
            <i class="fa-solid fa-eye"></i> Xem
          </button>
        </div>
      </td>
    `;
    fragment.appendChild(row);
  }

  tbody.appendChild(fragment);
}

function handleTableClick(e) {
  // Handle product threshold save
  const saveBtn = e.target.closest('button[data-action="save-product-threshold"]');
  if (saveBtn) {
    const productId = Number(saveBtn.dataset.productId);
    const input = saveBtn.parentElement.querySelector("input.product-threshold-input");
    if (!input) return;
    const val = Number(input.value);

    if (Number.isNaN(val) || val < 0) {
      alert("Ngưỡng phải là số >= 0");
      return;
    }

    thresholds.setProduct(productId, val);
    alert("Đã lưu ngưỡng cảnh báo sản phẩm");
    renderInventoryTable();
    return;
  }

  // Handle view variants button
  const viewBtn = e.target.closest('button[data-action="view-variants"]');
  if (viewBtn) {
    const productId = Number(viewBtn.dataset.productId);
    renderVariantModal(productId);
    return;
  }
}

// Render the variant details modal
function renderVariantModal(productId) {
  const product = productManager.getProductById(productId);
  if (!product) {
    alert("Không tìm thấy sản phẩm");
    return;
  }

  const modal = document.getElementById("variantStockModal");
  const modalTitle = document.getElementById("variantModalTitle");
  const modalBody = document.getElementById("variantModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `Chi tiết tồn kho: ${product.name}`;

  // Check if product has variants
  if (!product.variants || product.variants.length === 0) {
    modalBody.innerHTML = `
      <div class="no-variants-message">
        <i class="fa-solid fa-info-circle"></i>
        <p>Sản phẩm này không có biến thể (size).</p>
        <p>Tồn kho: <strong>${product.initialStock || 0}</strong></p>
        <p>Chỉ có thể đặt ngưỡng cảnh báo ở cấp sản phẩm (trong bảng chính).</p>
      </div>
    `;
  } else {
    // Build variant table
    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Size</th>
            <th style="text-align:center;">Tồn kho</th>
            <th style="text-align:center;">Ngưỡng cảnh báo</th>
            <th style="text-align:center;">Trạng thái</th>
            <th style="text-align:center;">Hành động</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const variant of product.variants) {
      const size = variant.size;
      const stock = Number(variant.stock || 0);
      const variantThreshold = thresholds.effective(productId, size);
      const isLow = stock <= variantThreshold;
      const statusText = isLow ? "Sắp hết" : "Ổn";
      const statusClass = isLow ? "stock-status-low" : "stock-status-ok";

      tableHTML += `
        <tr>
          <td style="font-weight:600;">Size ${size}</td>
          <td style="text-align:center;">${stock}</td>
          <td style="text-align:center;">
            <input 
              type="number" 
              min="0" 
              step="1" 
              class="variant-threshold-input" 
              value="${variantThreshold}"
              data-product-id="${productId}"
              data-size="${size}"
            />
          </td>
          <td style="text-align:center;">
            <span class="${statusClass}">${statusText}</span>
          </td>
          <td style="text-align:center;">
            <button 
              class="btn-save-threshold" 
              data-action="save-variant-threshold"
              data-product-id="${productId}"
              data-size="${size}">
              Lưu
            </button>
          </td>
        </tr>
      `;
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    modalBody.innerHTML = tableHTML;

    // Add event listener for save buttons in modal
    modalBody.addEventListener("click", handleVariantThresholdSave);
  }

  // Show modal
  modal.style.display = "block";
}

// Handle variant threshold save in modal
function handleVariantThresholdSave(e) {
  const btn = e.target.closest('button[data-action="save-variant-threshold"]');
  if (!btn) return;

  const productId = Number(btn.dataset.productId);
  const size = Number(btn.dataset.size);
  const input = btn.parentElement.parentElement.querySelector(".variant-threshold-input");
  
  if (!input) return;
  const val = Number(input.value);

  if (Number.isNaN(val) || val < 0) {
    alert("Ngưỡng phải là số >= 0");
    return;
  }

  thresholds.setVariant(productId, size, val);
  alert("Đã lưu ngưỡng cảnh báo cho biến thể");
  
  // Re-render modal to update status
  renderVariantModal(productId);
  
  // Also refresh main table
  renderInventoryTable();
}

// Ensure variant modal structure and bind close button
function ensureVariantModalStructure() {
  const modal = document.getElementById("variantStockModal");
  const closeBtn = document.getElementById("variantModalClose");

  if (closeBtn) {
    closeBtn.onclick = () => {
      if (modal) modal.style.display = "none";
    };
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

function bindFilters() {
  const invFilterApply = document.getElementById("invFilterApply");
  const invFilterReset = document.getElementById("invFilterReset");
  const invFilterName = document.getElementById("invFilterName");
  const invFilterCategory = document.getElementById("invFilterCategory");

  invFilterApply?.addEventListener("click", (e) => {
    e.preventDefault();
    renderInventoryTable();
  });

  invFilterReset?.addEventListener("click", (e) => {
    e.preventDefault();
    if (invFilterName) invFilterName.value = "";
    if (invFilterCategory) invFilterCategory.value = "all";
    renderInventoryTable();
  });
}

function initInventoryAdmin() {
  ensureDefaultThresholdControls();
  ensureVariantModalStructure();
  bindFilters();

  const tbody = document.getElementById("inventoryTableBody");
  if (tbody) {
    tbody.addEventListener("click", handleTableClick);
  }

  // Public API cho các module khác có thể trigger refresh
  window.renderInventoryTable = renderInventoryTable;

  renderInventoryTable();
}

document.addEventListener("DOMContentLoaded", initInventoryAdmin);
