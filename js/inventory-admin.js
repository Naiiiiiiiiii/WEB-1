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

  const data = computeRows(filters);

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

  for (const r of data) {
    const statusBadge = r.isLow
      ? `<span class="status-badge status-draft" title="Sắp hết">Sắp hết</span>`
      : `<span class="status-badge status-completed" title="Ổn">Ổn</span>`;

    const sizeDisplay = r.size != null ? `Size ${r.size}` : "-";
    const product = productManager.getProductById(r.productId);

    const row = document.createElement("tr");
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
    tbody.appendChild(row);
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
