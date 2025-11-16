import { UserManager } from "./user.js";
import { categoryManager } from "./category.js";

import { ProductManager } from "./ProductManager.js";
import {
  setupInventoryModule,
  registerInventoryUpdateListener,
} from "./inventory.js";
import { initProductAdmin, renderProductList } from "./product-admin.js";
import { initCategoryAdmin, renderCategoryList } from "./category-admin.js";
import { initImportAdmin, renderImportSlipsList } from "./import-admin.js";
import { importManager } from "./ImportSlip.js";
import { initPriceAdmin, renderPriceList } from "./price-admin.js";

import { getOrders } from "./order-manager.js";
import { initOrderAdmin, loadAndRenderOrders } from "./order-admin.js";

export function syncToStorage(key, data, silent = false) {
  try {
    const currentUser = userManager?.layAdminHienTai?.();

    const payload = {
      data: data,
      timestamp: Date.now(),
      updatedBy: currentUser?.tenDangNhap || "admin",
      version: "1.0",
    };

    localStorage.setItem(key, JSON.stringify(payload));

    window.dispatchEvent(
      new CustomEvent("storage-sync", {
        detail: { key, data, timestamp: payload.timestamp },
      })
    );

    if (!silent) {
      console.log(
        `✅ [Storage Sync] Đã lưu "${key}" lúc ${new Date().toLocaleTimeString()}`
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi lưu "${key}":`, error);

    if (error.name === "QuotaExceededError") {
      alert("⚠️ Dung lượng LocalStorage đã đầy! Hãy dọn dẹp dữ liệu cũ.");
      return false;
    }

    return false;
  }
}

export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);

    if (!item) {
      return defaultValue;
    }

    const parsed = JSON.parse(item);

    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return parsed.data;
    }

    return parsed;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi đọc "${key}":`, error);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ [Storage Sync] Đã xóa "${key}"`);

    window.dispatchEvent(
      new CustomEvent("storage-sync", {
        detail: { key, data: null, timestamp: Date.now(), action: "remove" },
      })
    );

    return true;
  } catch (error) {
    console.error(`❌ [Storage Sync] Lỗi khi xóa "${key}":`, error);
    return false;
  }
}

export function batchSyncToStorage(updates) {
  const results = [];

  Object.entries(updates).forEach(([key, value]) => {
    results.push(syncToStorage(key, value, true));
  });

  console.log(
    `✅ [Storage Sync] Batch update: ${results.filter((r) => r).length}/${
      results.length
    } thành công`
  );

  return results.every((r) => r === true);
}

export function showStorageStats() {
  try {
    let totalSize = 0;
    const items = {};

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage.getItem(key).length;
        totalSize += size;
        items[key] = (size / 1024).toFixed(2) + " KB";
      }
    }

    const totalKB = (totalSize / 1024).toFixed(2);
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);

    console.group("📊 LocalStorage Usage");
    console.table(items);
    console.log(`Tổng: ${totalKB} KB (${totalMB} MB)`);
    console.log(`Đã sử dụng: ${percentUsed}% / 5MB`);
    console.groupEnd();

    if (parseFloat(percentUsed) > 80) {
      console.warn("⚠️ LocalStorage sắp đầy!");
    }

    return { totalSize, items, percentUsed };
  } catch (error) {
    console.error("❌ Không thể lấy storage stats:", error);
    return null;
  }
}

window.addEventListener("storage", (e) => {
  if (e.key && e.newValue) {
    console.log(` [Cross-Tab Sync] "${e.key}" đã được cập nhật từ tab khác`);
  }
});

window.addEventListener("storage-sync", (e) => {
  console.log(` [Storage Event] "${e.detail.key}" đã thay đổi`, e.detail);
});

const userManager = new UserManager();
const productManager = new ProductManager();
const inventoryModule = setupInventoryModule(productManager, categoryManager);

export { userManager, productManager, categoryManager, importManager };

if (inventoryModule && inventoryModule.hienThiDanhSachTonKho) {
  window.renderInventoryTable = inventoryModule.hienThiDanhSachTonKho;
  registerInventoryUpdateListener(inventoryModule.hienThiDanhSachTonKho);
}

window.renderProductList = renderProductList;

export const DOM = {
  loginPage: document.getElementById("loginPage"),
  adminPanel: document.getElementById("adminPanel"),
  formDangNhap: document.getElementById("formDangNhap"),
  usernameInput: document.getElementById("username"),
  passwordInput: document.getElementById("password"),
  adminNameDisplay: document.querySelector(".header span b"),
  logoutBtn: document.querySelector(".logout"),
  sections: document.querySelectorAll(".main-content section"),
  navLinks: document.querySelectorAll(".nav-menu a"),

  countAccount: document.getElementById("countAccount"),
  countProducts: document.getElementById("countProducts"),
  countOrders: document.getElementById("countOrders"),

  userTableBody: document.getElementById("userTableBody"),
  adminOrderModal: document.getElementById("adminOrderModal"),
  adminOrderModalBody: document.getElementById("adminOrderModalBody"),

  productTableBody: document.getElementById("productTableBody"),
  addProductBtn: document.getElementById("addProductBtn"),
  productModal: document.getElementById("productModal"),
  productModalForm: document.getElementById("productModalForm"),

  categoryTableBody: document.getElementById("categoryTableBody"),
  addCategoryForm: document.getElementById("addCategoryForm"),

  inventoryTableBody: document.getElementById("inventoryTableBody"),

  importSlipsTableBody: document.getElementById("importSlipsTableBody"),

  priceTableBody: document.getElementById("priceTableBody"),

  orderFilterFrom: document.getElementById("orderFilterFrom"),
  orderFilterTo: document.getElementById("orderFilterTo"),
  orderFilterStatus: document.getElementById("orderFilterStatus"),
  orderFilterApply: document.getElementById("orderFilterApply"),
  orderFilterReset: document.getElementById("orderFilterReset"),
  ordersTableBody: document.querySelector("#ordersTable tbody"),
  orderDetailBox: document.getElementById("orderDetailBox"),
  orderDetailMeta: document.getElementById("orderDetailMeta"),
  orderDetailItems: document.getElementById("orderDetailItems"),
  orderDetailClose: document.getElementById("orderDetailClose"),
  orderStatusUpdateForm: document.getElementById("orderStatusUpdateForm"),
  orderStatusUpdateSelect: document.getElementById("orderStatusUpdateSelect"),
  orderStatusUpdateBtn: document.getElementById("orderStatusUpdateBtn"),
};

function hideAllSections() {
  DOM.sections.forEach((section) => {
    section.style.display = "none";
  });
  DOM.navLinks.forEach((link) => link.classList.remove("active"));
}

function setupNavigation() {
  DOM.navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllSections();

      const targetId = e.target.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.style.display = "block";
        e.target.classList.add("active");

        if (targetId === "index") {
          updateGeneralStats();
        } else if (targetId === "user") {
          initializeUserManagement();
        } else if (targetId === "products") {
          if (!window.productAdminInitialized) {
            initProductAdmin();
            window.productAdminInitialized = true;
          }
          renderProductList();
        } else if (targetId === "categories") {
          if (!window.categoryAdminInitialized) {
            initCategoryAdmin();
            window.categoryAdminInitialized = true;
          }
          renderCategoryList();
        } else if (targetId === "orders") {
          if (!window.orderAdminInitialized) {
            initOrderAdmin();
            window.orderAdminInitialized = true;
          }
          loadAndRenderOrders();
        } else if (targetId === "inventory") {
          if (inventoryModule && inventoryModule.initializeInventoryTab) {
            inventoryModule.initializeInventoryTab();
          }
        } else if (targetId === "price") {
          if (!window.priceAdminInitialized) {
            initPriceAdmin();
            window.priceAdminInitialized = true;
          }
          renderPriceList();
        } else if (targetId === "import-slips") {
          if (window.needsReloadForImportSlips) {
            window.location.reload();
            return;
          }
          if (!window.importAdminInitialized) {
            initImportAdmin();
            window.importAdminInitialized = true;
          }
          renderImportSlipsList();
        }
      }
    });
  });

  const firstLink = DOM.navLinks[0];
  if (firstLink) {
    firstLink.click();
  }
}

export function markNeedsReloadForImportSlips() {
  window.needsReloadForImportSlips = true;
}

export function updateGeneralStats() {
  if (DOM.countAccount) {
    DOM.countAccount.textContent = `Số tài khoản hiện có: ${userManager.users.length}`;
  }

  if (DOM.countProducts) {
    const visibleProducts = productManager.getVisibleProducts();
    DOM.countProducts.textContent = `Số sản phẩm hiện có: ${visibleProducts.length}`;
  }

  if (DOM.countOrders) {
    const totalOrders = getOrders().length;
    DOM.countOrders.textContent = `Số đơn đặt hàng hiện có: ${totalOrders}`;
  }

  if (document.getElementById("countImportSlips")) {
    const slipsCount = importManager.getSlipsCount();
    document.getElementById(
      "countImportSlips"
    ).textContent = `Phiếu nhập: ${slipsCount.completed} hoàn thành / ${slipsCount.draft} nháp`;
  }
}

function updateSoLuongTaiKhoan() {
  if (DOM.countAccount) {
    DOM.countAccount.textContent = `Số tài khoản hiện có: ${userManager.users.length}`;
  }
}

function hienThiDanhSachUser() {
  if (!DOM.userTableBody) return;

  DOM.userTableBody.innerHTML = "";

  userManager.users.forEach((user, index) => {
    const orderCount = (user.orders && user.orders.length) || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.hoTen}</td>
            <td>${user.tenDangNhap}</td>
            <td>${user.email}</td>
            <td>${orderCount}</td>
            <td>
                <span class="status-badge status-active">Hoạt động</span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-warning btn-reset" data-index="${index}">
                    <i class="fa-solid fa-key"></i> Reset MK
                </button>
                <button class="btn btn-delete btn-delete" data-index="${index}">
                    <i class="fa-solid fa-trash-can"></i> Xóa
                </button>
            </td>
        `;
    DOM.userTableBody.appendChild(row);
  });

  ganSuKienNut();
}

function ganSuKienNut() {
  const resetBtns = document.querySelectorAll(".btn-reset");
  const deleteBtns = document.querySelectorAll(".btn-delete");
  const viewOrderBtns = document.querySelectorAll(".btn-view-orders");

  resetBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      resetMatKhau(btn.getAttribute("data-index"));
    })
  );

  deleteBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      xoaTaiKhoan(btn.getAttribute("data-index"));
    })
  );

  viewOrderBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      hienThiDonHangCuaUser(btn.getAttribute("data-username"));
    })
  );
}

function hienThiDonHangCuaUser(username) {
  const user = userManager.users.find((u) => u.tenDangNhap === username);
  if (!user) {
    alert(`Không tìm thấy người dùng: ${username}`);
    return;
  }

  const orders = user.orders || [];

  console.log(`Lịch sử đơn hàng của ${username}:`, orders);

  if (orders.length === 0) {
    alert(`Người dùng ${user.hoTen} chưa có đơn hàng nào.`);
    return;
  }

  let orderSummary = `Lịch sử đơn hàng của: ${user.hoTen} (${username})\n\n`;
  orders.forEach((order, index) => {
    orderSummary += `${index + 1}. Đơn #${order.id} - ${
      order.status
    } - ${new Date(order.date).toLocaleDateString("vi-VN")}\n`;
    orderSummary += `   Tổng: ${order.total.toLocaleString("vi-VN")} ₫\n\n`;
  });

  alert(orderSummary + "\nXem chi tiết trong Console (F12)");
}

function resetMatKhau(index) {
  const user = userManager.users[index];
  if (!user) return;

  if (!confirm(`Bạn có muốn reset mật khẩu của ${user.hoTen} về "123456"?`))
    return;

  user.matKhau = "123456";
  userManager.luuDanhSachUser();
  alert(`Mật khẩu của ${user.hoTen} đã được reset thành 123456`);
}

function xoaTaiKhoan(index) {
  const user = userManager.users[index];
  if (!user) return;

  if (
    !confirm(
      `Bạn có muốn xóa người dùng ${user.hoTen}? Thao tác này không thể hoàn tác.`
    )
  )
    return;

  userManager.users.splice(index, 1);
  userManager.luuDanhSachUser();
  hienThiDanhSachUser();
  updateSoLuongTaiKhoan();
  updateGeneralStats();
  alert(`Xóa tài khoản ${user.hoTen} thành công!`);
}

function initializeUserManagement() {
  updateSoLuongTaiKhoan();
  hienThiDanhSachUser();
}

function displayAdminPanel() {
  const user = userManager.layAdminHienTai();

  if (user && user.tenDangNhap === "admin") {
    if (DOM.loginPage) DOM.loginPage.style.display = "none";
    if (DOM.adminPanel) DOM.adminPanel.style.display = "flex";

    if (DOM.adminNameDisplay)
      DOM.adminNameDisplay.textContent = user.hoTen || "ADMIN";

    setupNavigation();
    updateGeneralStats();
  } else {
    if (DOM.loginPage) DOM.loginPage.style.display = "flex";
    if (DOM.adminPanel) DOM.adminPanel.style.display = "none";
  }
}

function handleLogin(e) {
  e.preventDefault();
  const tenDangNhap = DOM.usernameInput.value.trim();
  const matKhau = DOM.passwordInput.value;

  const user = userManager.timTaiKhoan(tenDangNhap, matKhau);

  if (user && user.tenDangNhap === "admin") {
    userManager.luuAdminHienTai(user);
    alert("Đăng nhập Admin thành công!");
    displayAdminPanel();
  } else if (user) {
    alert("Lỗi: Tài khoản này không phải tài khoản Quản trị.");
  } else {
    alert("Sai tên đăng nhập/email hoặc mật khẩu.");
  }
}

function handleLogout(e) {
  e.preventDefault();
  userManager.xoaAdminHienTai();
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  initProductAdmin();
  initCategoryAdmin();
  initImportAdmin();
  initPriceAdmin();
  initOrderAdmin();

  if (DOM.formDangNhap) {
    DOM.formDangNhap.addEventListener("submit", handleLogin);
  }
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", handleLogout);
  }

  displayAdminPanel();
});