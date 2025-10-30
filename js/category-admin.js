// File: js/category-admin.js - Quản lý Danh mục Sản phẩm (CRUD đầy đủ)

import {
  categoryManager,
  DOM,
  updateGeneralStats,
  productManager,
} from "./admin.js";
import { renderProductList } from "./product-admin.js";

// =========================================================
// BIẾN TOÀN CỤC CHO MODAL SỬA DANH MỤC
// =========================================================
let editingCategoryId = null;
let editingCategoryOriginalName = "";
const existingCategoryNames = [];

// =========================================================
// HÀM TIỆN ÍCH - XSS PROTECTION
// =========================================================

/**
 * Escape HTML để tránh XSS attacks
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function để giảm số lần gọi hàm
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =========================================================
// HÀM QUẢN LÝ DANH MỤC (Category) - CRUD ĐẦY ĐỦ
// =========================================================

/**
 * Hiển thị danh sách danh mục trong bảng admin
 */
export function renderCategoryList() {
  if (!DOM.categoryTableBody) return;
  DOM.categoryTableBody.innerHTML = "";
  const categories = categoryManager.getAllCategories();

  if (categories.length === 0) {
    DOM.categoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="center category-empty-state">
                    <p>Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</p>
                </td>
            </tr>
        `;
    return;
  }

  categories.forEach((category) => {
    const productCount = countProductsInCategory(category.id);

    const row = document.createElement("tr");
    row.innerHTML = `
    <td class="category-id">${escapeHtml(String(category.id))}</td>
    <td class="category-name">
      <strong>${escapeHtml(category.name)}</strong>
      <small class="product-count">(${productCount} sản phẩm)</small>
    </td>
    <td>
      <span class="status-badge status-active">Hoạt động</span>
    </td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-edit btn-edit-category" data-id="${escapeHtml(
          String(category.id)
        )}" title="Sửa danh mục">
          <i class="fa-solid fa-pen-to-square"></i> Sửa
        </button>
        <button class="btn btn-delete btn-delete-category" data-id="${escapeHtml(
          String(category.id)
        )}" title="Xóa danh mục" 
          ${productCount > 0 ? "disabled" : ""}>
          <i class="fa-solid fa-trash-can"></i> Xóa
        </button>
      </div>
    </td>
  `;

    DOM.categoryTableBody.appendChild(row);
  });
  setupCategoryEventListeners();
}

/**
 * Đếm số sản phẩm trong một danh mục
 */
function countProductsInCategory(categoryId) {
  const allProducts = productManager.getAllProducts();
  return allProducts.filter((p) => p.categoryId === categoryId).length;
}

/**
 * Gắn sự kiện cho các nút trong bảng danh mục
 */
function setupCategoryEventListeners() {
  // Nút Sửa
  document.querySelectorAll(".btn-edit-category").forEach((btn) => {
    btn.removeEventListener("click", handleEditCategory);
    btn.addEventListener("click", handleEditCategory);
  }); // Nút Xóa
  document.querySelectorAll(".btn-delete-category").forEach((btn) => {
    btn.removeEventListener("click", handleDeleteCategory);
    btn.addEventListener("click", handleDeleteCategory);
  });
}

/**
 * Xử lý thêm danh mục mới
 */
export function handleAddCategory(e) {
  e.preventDefault();

  const form = e.target;
  const nameInput = form.querySelector("#newCategoryName");
  const name = nameInput.value.trim(); // Validation

  if (!name) {
    showNotification("Vui lòng nhập tên danh mục!", "error");
    nameInput.focus();
    return;
  }

  if (name.length < 2) {
    showNotification("Tên danh mục phải có ít nhất 2 ký tự!", "error");
    nameInput.focus();
    return;
  }

  if (name.length > 50) {
    showNotification("Tên danh mục không được vượt quá 50 ký tự!", "error");
    nameInput.focus();
    return;
  } // Kiểm tra trùng tên

  const existingCategory = categoryManager
    .getAllCategories()
    .find((cat) => cat.name.toLowerCase() === name.toLowerCase());

  if (existingCategory) {
    showNotification(`Danh mục "${name}" đã tồn tại!`, "error");
    nameInput.focus();
    return;
  } // Thêm danh mục mới

  const success = categoryManager.addCategory(name);

  if (success) {
    showNotification(`✅ Thêm danh mục "${name}" thành công!`, "success");
    form.reset();
    renderCategoryList();
    updateGeneralStats(); // Cập nhật lại dropdown trong form thêm sản phẩm

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể thêm danh mục!", "error");
  }
}

// =========================================================
// MODAL SỬA DANH MỤC
// =========================================================

/**
 * Mở modal sửa danh mục
 */
function openEditCategoryModal(categoryId, categoryName) {
  const modal = document.getElementById("editCategoryModal");
  const input = document.getElementById("editCategoryNameInput");
  const currentNameDisplay = document.getElementById("currentCategoryName");

  if (!modal || !input || !currentNameDisplay) return; // Lưu thông tin danh mục đang sửa

  editingCategoryId = categoryId;
  editingCategoryOriginalName = categoryName; // Lấy danh sách tên danh mục hiện có (trừ danh mục đang sửa)

  existingCategoryNames.length = 0;
  categoryManager.getAllCategories().forEach((cat) => {
    if (cat.id !== categoryId) {
      existingCategoryNames.push(cat.name.toLowerCase());
    }
  }); // Reset form

  document.getElementById("editCategoryForm").reset();
  input.value = categoryName;
  currentNameDisplay.textContent = categoryName; // Hiển thị modal

  modal.classList.add("active"); // Focus input sau khi animation

  setTimeout(() => {
    input.focus();
    input.select();
  }, 100); // Validate ban đầu

  validateEditCategoryInput();
}

/**
 * Đóng modal sửa danh mục
 */
function closeEditCategoryModal() {
  const modal = document.getElementById("editCategoryModal");
  if (!modal) return;

  modal.classList.remove("active");
  editingCategoryId = null;
  editingCategoryOriginalName = "";
}

/**
 * Validate input trong modal sửa danh mục (real-time)
 */
const validateEditCategoryInput = debounce(() => {
  const input = document.getElementById("editCategoryNameInput");
  const helper = document.getElementById("editCategoryHelper");
  const helperText = document.getElementById("editCategoryHelperText");
  const charCounter = document.getElementById("editCategoryCharCounter");
  const saveBtn = document.getElementById("editCategorySaveBtn");

  if (!input || !helper || !helperText || !charCounter || !saveBtn) return;

  const value = input.value.trim(); // Update character counter

  charCounter.textContent = `${value.length}/50`; // Remove previous states

  input.classList.remove("error", "success");
  helper.classList.remove("error", "success"); // Empty check

  if (value.length === 0) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-info"></i> Vui lòng nhập tên danh mục';
    helper.classList.add("error");
    input.classList.add("error");
    saveBtn.disabled = true;
    return;
  } // Length check

  if (value.length < 2) {
    helperText.innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> Tên quá ngắn (tối thiểu 2 ký tự)';
    helper.classList.add("error");
    input.classList.add("error");
    saveBtn.disabled = true;
    return;
  }

  if (value.length > 50) {
    helperText.innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> Tên quá dài (tối đa 50 ký tự)';
    helper.classList.add("error");
    input.classList.add("error");
    saveBtn.disabled = true;
    return;
  } // No change check

  if (value.toLowerCase() === editingCategoryOriginalName.toLowerCase()) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-info"></i> Tên chưa thay đổi';
    saveBtn.disabled = true;
    return;
  } // Duplicate check

  if (existingCategoryNames.includes(value.toLowerCase())) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-xmark"></i> Tên danh mục đã tồn tại';
    helper.classList.add("error");
    input.classList.add("error");
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
    saveBtn.disabled = true;
    return;
  } // Success

  helperText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tên hợp lệ';
  helper.classList.add("success");
  input.classList.add("success");
  saveBtn.disabled = false;
}, 300); // Debounce 300ms

/**
 * Xử lý sửa danh mục (Mở modal)
 */
function handleEditCategory(e) {
  e.preventDefault();
  const categoryId = e.currentTarget.dataset.id;
  const category = categoryManager.getCategoryById(categoryId); // ✅ Đã có trong category.js

  if (!category) {
    showNotification("❌ Không tìm thấy danh mục!", "error");
    return;
  } // MỞ MODAL

  openEditCategoryModal(categoryId, category.name);
}

/**
 * Xử lý submit form sửa danh mục
 */
function handleEditCategorySubmit(e) {
  e.preventDefault();

  const input = document.getElementById("editCategoryNameInput");
  const newName = input.value.trim(); // Final validation

  if (newName.length < 2 || newName.length > 50) {
    showNotification("❌ Tên danh mục phải có từ 2-50 ký tự!", "error");
    return;
  } // Check duplicate

  if (existingCategoryNames.includes(newName.toLowerCase())) {
    showNotification(`❌ Tên danh mục đã tồn tại!`, "error");
    return;
  } // Check if name is the same (should be handled by validation, but double check)
  if (newName.toLowerCase() === editingCategoryOriginalName.toLowerCase()) {
    closeEditCategoryModal(); // Close if no changes
    return;
  } // Cập nhật danh mục

  const success = categoryManager.updateCategory(editingCategoryId, newName);

  if (success) {
    showNotification(
      `✅ Đã đổi tên danh mục từ "${editingCategoryOriginalName}" thành "${newName}"!`,
      "success"
    );
    closeEditCategoryModal();
    renderCategoryList();
    renderProductList(); // Cập nhật lại bảng sản phẩm vì tên danh mục đã thay đổi // Cập nhật lại dropdown

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể cập nhật danh mục!", "error");
  }
}
/**
 * Xử lý xóa danh mục
 */
function handleDeleteCategory(e) {
  e.preventDefault();
  const categoryId = e.currentTarget.dataset.id;
  const category = categoryManager.getCategoryById(categoryId);

  if (!category) {
    showNotification("❌ Không tìm thấy danh mục!", "error");
    return;
  } // Kiểm tra số sản phẩm trong danh mục

  const productCount = countProductsInCategory(categoryId);

  if (productCount > 0) {
    showNotification(
      `❌ Không thể xóa! Danh mục "${category.name}" đang có ${productCount} sản phẩm.\n\nVui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      "error"
    );
    return;
  }

  const confirmMessage = `⚠️ BẠN CÓ CHẮC MUỐN XÓA VĨNH VIỄN danh mục "${category.name}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`;

  if (!confirm(confirmMessage)) return;

  const success = categoryManager.deleteCategory(categoryId);

  if (success) {
    showNotification(
      `✅ Xóa danh mục "${category.name}" thành công!`,
      "success"
    );
    renderCategoryList();
    updateGeneralStats(); // Cập nhật lại dropdown

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể xóa danh mục!", "error");
  }
}

// =========================================================
// NOTIFICATION SYSTEM (TOAST) - CẢI TIẾN
// =========================================================

/**
 * Hiển thị thông báo
 */
function showNotification(message, type = "info", duration = 5000) {
  // Tạo container nếu chưa có
  let container = document.getElementById("notificationContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "notificationContainer";
    container.className = "notification-container";
    document.body.appendChild(container);
  } // Tạo notification element

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${escapeHtml(message)}</span>
        <button class="notification-close" title="Đóng">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

  container.appendChild(notification); // Gắn sự kiện đóng

  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }); // Animation

  setTimeout(() => notification.classList.add("show"), 10); // Auto remove (nếu duration > 0)

  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// =========================================================
// KHỞI TẠO MODULE
// =========================================================

/**
 * Khởi tạo các event listener cho module Category Admin
 */
export function initCategoryAdmin() {
  // Form thêm danh mục
  const addCategoryForm = document.getElementById("addCategoryForm");
  if (addCategoryForm) {
    addCategoryForm.removeEventListener("submit", handleAddCategory);
    addCategoryForm.addEventListener("submit", handleAddCategory);
  } // Form sửa danh mục (modal)

  const editCategoryForm = document.getElementById("editCategoryForm");
  if (editCategoryForm) {
    editCategoryForm.removeEventListener("submit", handleEditCategorySubmit);
    editCategoryForm.addEventListener("submit", handleEditCategorySubmit);
  } // Input validation trong modal (real-time)

  const editCategoryInput = document.getElementById("editCategoryNameInput");
  if (editCategoryInput) {
    editCategoryInput.removeEventListener("input", validateEditCategoryInput);
    editCategoryInput.addEventListener("input", validateEditCategoryInput);
  } // Đóng modal khi click vào overlay

  const editCategoryModal = document.getElementById("editCategoryModal");
  if (editCategoryModal) {
    editCategoryModal.addEventListener("click", (e) => {
      if (e.target === editCategoryModal) {
        closeEditCategoryModal();
      }
    });
  } // Đóng modal khi click nút close

  const closeModalBtns = document.querySelectorAll(
    ".category-modal-close, .category-modal-cancel"
  );
  closeModalBtns.forEach((btn) => {
    btn.removeEventListener("click", closeEditCategoryModal);
    btn.addEventListener("click", closeEditCategoryModal);
  }); // Đóng modal khi nhấn ESC

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      editCategoryModal &&
      editCategoryModal.classList.contains("active")
    ) {
      closeEditCategoryModal();
    }
  }); // Render danh sách ban đầu

  renderCategoryList();
}

// Export để sử dụng trong admin.js
export { setupCategoryEventListeners, showNotification, escapeHtml };
