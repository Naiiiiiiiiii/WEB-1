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

function computeRows(filters) {
  const rows = [];
  const products = productManager.getVisibleProducts();

  for (const p of products) {
    const categoryName =
      productManager.getCategoryName?.(p.categoryId) || "Khác";

    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        const size = v && typeof v.size !== "undefined" ? Number(v.size) : null;
        const stock = Number(v?.stock || 0);
        const thr = thresholds.effective(p.id, size);
        rows.push({
          productId: p.id,
          name: p.name,
          category: categoryName,
          size,
          stock,
          threshold: thr,
          isLow: stock <= thr,
          price: p.price,
        });
      }
    } else {
      const stock = Number(p.initialStock || 0);
      const thr = thresholds.effective(p.id, null);
      rows.push({
        productId: p.id,
        name: p.name,
        category: categoryName,
        size: null,
        stock,
        threshold: thr,
        isLow: stock <= thr,
        price: p.price,
      });
    }
  }

  let filtered = rows;
  const name = (filters.name || "").toLowerCase().trim();
  const cat = filters.category || "all";
  const lowOnly = filters.lowOnly || false;

  if (name)
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(name));
  if (cat !== "all") filtered = filtered.filter((r) => r.category === cat);
  if (lowOnly) filtered = filtered.filter((r) => r.isLow);

  // Sort: low-first, then by stock ascending, then by name
  filtered.sort((a, b) => {
    if (a.isLow !== b.isLow) return b.isLow - a.isLow; // low first
    if (a.stock !== b.stock) return a.stock - b.stock; // stock ascending
    return a.name.localeCompare(b.name); // name ascending
  });

  return filtered;
}

// Pagination state
let currentPage = 1;
let pageSize = 25;

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const invFilterCategory = document.getElementById("invFilterCategory");
  const invFilterName = document.getElementById("invFilterName");
  const invFilterLowOnly = document.getElementById("invFilterLowOnly");

  const filters = {
    category: invFilterCategory?.value || "all",
    name: invFilterName?.value || "",
    lowOnly: invFilterLowOnly?.checked || false,
  };

  const allData = computeRows(filters);
  
  // Pagination logic
  const totalItems = allData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure currentPage is valid
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const data = allData.slice(startIdx, endIdx);

  tbody.innerHTML = "";

  if (!allData.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="center" style="padding: 24px; color: #666;">
          Không có sản phẩm phù hợp.
        </td>
      </tr>
    `;
    renderPaginationControls(0, 0);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const r of data) {
    const statusBadge = r.isLow
      ? `<span class="status-badge status-draft" title="Sắp hết">Sắp hết</span>`
      : `<span class="status-badge status-completed" title="Ổn">Ổn</span>`;

    const sizeDisplay = r.size != null ? `Size ${r.size}` : "-";
    const product = productManager.getProductById(r.productId);

    const row = document.createElement("tr");
    // Add table-warning class for low-stock rows
    if (r.isLow) {
      row.classList.add("table-warning");
    }
    row.innerHTML = `
      <td class="col-id">${r.productId}</td>
      <td>${r.name}</td>
      <td class="col-category">${r.category}</td>
      <td class="col-stock right">${r.stock}</td>
      <td class="col-price right">${formatPrice(product?.costPrice || 0)}</td>
      <td class="col-status">${statusBadge}</td>
      <td class="col-actions">
        <div class="actions" style="display:flex; gap:8px; align-items:center;">
          <span>${sizeDisplay}</span>
          <input 
            type="number" 
            min="0" 
            step="1" 
            class="row-threshold-input" 
            value="${r.threshold}"
            data-product-id="${r.productId}"
            data-size="${r.size != null ? r.size : ""}"
            style="width:90px"
            title="Ngưỡng cảnh báo cho ${
              r.size != null ? "Size " + r.size : "sản phẩm"
            }"
          />
          <button 
            class="btn" 
            data-action="save-threshold"
            data-product-id="${r.productId}"
            data-size="${r.size != null ? r.size : ""}"
            title="Lưu ngưỡng">
            Lưu
          </button>
        </div>
      </td>
    `;
    fragment.appendChild(row);
  }
  
  tbody.appendChild(fragment);
  renderPaginationControls(totalItems, totalPages);
}

function renderPaginationControls(totalItems, totalPages) {
  const container = document.getElementById("inventoryPagination");
  if (!container) return;

  if (totalItems === 0) {
    container.innerHTML = "";
    return;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px; justify-content: space-between; padding: 15px 0;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <label for="pageSizeSelect" style="font-size: 14px; color: #666;">Hiển thị:</label>
        <select id="pageSizeSelect" style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="10" ${pageSize === 10 ? "selected" : ""}>10</option>
          <option value="25" ${pageSize === 25 ? "selected" : ""}>25</option>
          <option value="50" ${pageSize === 50 ? "selected" : ""}>50</option>
          <option value="100" ${pageSize === 100 ? "selected" : ""}>100</option>
        </select>
        <span style="font-size: 14px; color: #666;">
          Hiển thị ${startItem}-${endItem} trên ${totalItems} mục
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button 
          id="prevPageBtn" 
          class="btn" 
          ${currentPage <= 1 ? "disabled" : ""}
          style="padding: 6px 12px;"
        >
          <i class="fa-solid fa-chevron-left"></i> Trước
        </button>
        <span style="font-size: 14px; color: #666;">
          Trang ${currentPage} / ${totalPages}
        </span>
        <button 
          id="nextPageBtn" 
          class="btn" 
          ${currentPage >= totalPages ? "disabled" : ""}
          style="padding: 6px 12px;"
        >
          Sau <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;

  // Bind pagination events
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const pageSizeSelect = document.getElementById("pageSizeSelect");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderInventoryTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderInventoryTable();
      }
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      pageSize = Number(e.target.value);
      currentPage = 1; // Reset to first page when changing page size
      renderInventoryTable();
    });
  }
}

function handleThresholdSave(e) {
  const btn = e.target.closest('button[data-action="save-threshold"]');
  if (!btn) return;

  const productId = Number(btn.dataset.productId);
  const sizeRaw = btn.dataset.size;
  const size = sizeRaw === "" ? null : Number(sizeRaw);

  const input = btn.parentElement.querySelector("input.row-threshold-input");
  if (!input) return;
  const val = Number(input.value);

  if (Number.isNaN(val) || val < 0) {
    alert("Ngưỡng phải là số >= 0");
    return;
  }

  if (size == null) thresholds.setProduct(productId, val);
  else thresholds.setVariant(productId, size, val);

  alert("Đã lưu ngưỡng cảnh báo");
  renderInventoryTable();
}

function bindFilters() {
  const invFilterApply = document.getElementById("invFilterApply");
  const invFilterReset = document.getElementById("invFilterReset");
  const invFilterName = document.getElementById("invFilterName");
  const invFilterCategory = document.getElementById("invFilterCategory");
  const invFilterLowOnly = document.getElementById("invFilterLowOnly");

  invFilterApply?.addEventListener("click", (e) => {
    e.preventDefault();
    currentPage = 1; // Reset to first page when applying filters
    renderInventoryTable();
  });

  invFilterReset?.addEventListener("click", (e) => {
    e.preventDefault();
    if (invFilterName) invFilterName.value = "";
    if (invFilterCategory) invFilterCategory.value = "all";
    if (invFilterLowOnly) invFilterLowOnly.checked = false;
    currentPage = 1; // Reset to first page when resetting filters
    renderInventoryTable();
  });

  // Also trigger render when low-only checkbox is toggled
  invFilterLowOnly?.addEventListener("change", () => {
    currentPage = 1; // Reset to first page when toggling low-only
    renderInventoryTable();
  });
}

function initInventoryAdmin() {
  ensureDefaultThresholdControls();
  bindFilters();

  const tbody = document.getElementById("inventoryTableBody");
  if (tbody) {
    tbody.addEventListener("click", handleThresholdSave);
  }

  // Public API cho các module khác có thể trigger refresh
  window.renderInventoryTable = renderInventoryTable;

  renderInventoryTable();
}

document.addEventListener("DOMContentLoaded", initInventoryAdmin);
