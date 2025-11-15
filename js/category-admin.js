import {
  categoryManager,
  DOM,
  updateGeneralStats,
  productManager,
} from "./admin.js";
import { renderProductList } from "./product-admin.js";

let editingCategoryId = null;
let editingCategoryOriginalName = "";
const existingCategoryNames = [];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

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
        )}" title="Xóa danh mục">
          <i class="fa-solid fa-trash-can"></i> Xóa
        </button>
      </div>
    </td>
  `;

    DOM.categoryTableBody.appendChild(row);
  });
  setupCategoryEventListeners();
}

function countProductsInCategory(categoryId) {
  const allProducts = productManager.getAllProducts();
  return allProducts.filter((p) => p.categoryId === categoryId).length;
}

function setupCategoryEventListeners() {
  document.querySelectorAll(".btn-edit-category").forEach((btn) => {
    btn.removeEventListener("click", handleEditCategory);
    btn.addEventListener("click", handleEditCategory);
  });
  document.querySelectorAll(".btn-delete-category").forEach((btn) => {
    btn.removeEventListener("click", handleDeleteCategory);
    btn.addEventListener("click", handleDeleteCategory);
  });
}

export function handleAddCategory(e) {
  e.preventDefault();

  const form = e.target;
  const nameInput = form.querySelector("#newCategoryName");
  const name = nameInput.value.trim();

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
  }

  const existingCategory = categoryManager
    .getAllCategories()
    .find((cat) => cat.name.toLowerCase() === name.toLowerCase());

  if (existingCategory) {
    showNotification(`Danh mục "${name}" đã tồn tại!`, "error");
    nameInput.focus();
    return;
  }

  const success = categoryManager.addCategory(name);

  if (success) {
    showNotification(`✅ Thêm danh mục "${name}" thành công!`, "success");
    form.reset();
    renderCategoryList();
    updateGeneralStats();

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể thêm danh mục!", "error");
  }
}

function openEditCategoryModal(categoryId, categoryName) {
  const modal = document.getElementById("editCategoryModal");
  const input = document.getElementById("editCategoryNameInput");
  const currentNameDisplay = document.getElementById("currentCategoryName");

  if (!modal || !input || !currentNameDisplay) return;

  editingCategoryId = categoryId;
  editingCategoryOriginalName = categoryName;

  existingCategoryNames.length = 0;
  categoryManager.getAllCategories().forEach((cat) => {
    if (cat.id !== categoryId) {
      existingCategoryNames.push(cat.name.toLowerCase());
    }
  });

  document.getElementById("editCategoryForm").reset();
  input.value = categoryName;
  currentNameDisplay.textContent = categoryName;

  modal.classList.add("active");

  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);

  validateEditCategoryInput();
}

function closeEditCategoryModal() {
  const modal = document.getElementById("editCategoryModal");
  if (!modal) return;

  modal.classList.remove("active");
  editingCategoryId = null;
  editingCategoryOriginalName = "";
}

const validateEditCategoryInput = debounce(() => {
  const input = document.getElementById("editCategoryNameInput");
  const helper = document.getElementById("editCategoryHelper");
  const helperText = document.getElementById("editCategoryHelperText");
  const charCounter = document.getElementById("editCategoryCharCounter");
  const saveBtn = document.getElementById("editCategorySaveBtn");

  if (!input || !helper || !helperText || !charCounter || !saveBtn) return;

  const value = input.value.trim();

  charCounter.textContent = `${value.length}/50`;

  input.classList.remove("error", "success");
  helper.classList.remove("error", "success");

  if (value.length === 0) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-info"></i> Vui lòng nhập tên danh mục';
    helper.classList.add("error");
    input.classList.add("error");
    saveBtn.disabled = true;
    return;
  }

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
  }

  if (value.toLowerCase() === editingCategoryOriginalName.toLowerCase()) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-info"></i> Tên chưa thay đổi';
    saveBtn.disabled = true;
    return;
  }

  if (existingCategoryNames.includes(value.toLowerCase())) {
    helperText.innerHTML =
      '<i class="fa-solid fa-circle-xmark"></i> Tên danh mục đã tồn tại';
    helper.classList.add("error");
    input.classList.add("error");
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
    saveBtn.disabled = true;
    return;
  }

  helperText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tên hợp lệ';
  helper.classList.add("success");
  input.classList.add("success");
  saveBtn.disabled = false;
}, 300);

function handleEditCategory(e) {
  e.preventDefault();
  const categoryId = e.currentTarget.dataset.id;
  const category = categoryManager.getCategoryById(categoryId);

  if (!category) {
    showNotification("❌ Không tìm thấy danh mục!", "error");
    return;
  }

  openEditCategoryModal(categoryId, category.name);
}

function handleEditCategorySubmit(e) {
  e.preventDefault();

  const input = document.getElementById("editCategoryNameInput");
  const newName = input.value.trim();

  if (newName.length < 2 || newName.length > 50) {
    showNotification("❌ Tên danh mục phải có từ 2-50 ký tự!", "error");
    return;
  }

  if (existingCategoryNames.includes(newName.toLowerCase())) {
    showNotification(`❌ Tên danh mục đã tồn tại!`, "error");
    return;
  }
  if (newName.toLowerCase() === editingCategoryOriginalName.toLowerCase()) {
    closeEditCategoryModal();
    return;
  }

  const success = categoryManager.updateCategory(editingCategoryId, newName);

  if (success) {
    showNotification(
      `✅ Đã đổi tên danh mục từ "${editingCategoryOriginalName}" thành "${newName}"!`,
      "success"
    );
    closeEditCategoryModal();
    renderCategoryList();
    renderProductList();

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể cập nhật danh mục!", "error");
  }
}

function handleDeleteCategory(e) {
  e.preventDefault();
  const categoryId = e.currentTarget.dataset.id;
  const category = categoryManager.getCategoryById(categoryId);

  if (!category) {
    showNotification("❌ Không tìm thấy danh mục!", "error");
    return;
  }

  const confirmMessage = `⚠️ BẠN CÓ CHẮC MUỐN XÓA VĨNH VIỄN danh mục "${category.name}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC! (Sản phẩm thuộc danh mục này sẽ bị mất tham chiếu danh mục.)`;

  if (!confirm(confirmMessage)) return;

  const success = categoryManager.deleteCategory(categoryId);

  if (success) {
    showNotification(
      `✅ Xóa danh mục "${category.name}" thành công!`,
      "success"
    );

    // Cần gọi renderProductList để cập nhật bảng sản phẩm
    // 0--để xử lý các sản phẩm bị mất categoryId
    renderCategoryList();
    renderProductList();
    updateGeneralStats();

    if (window.loadCategoriesToSelect) {
      window.loadCategoriesToSelect("productCategory");
      window.loadCategoriesToSelect("importProductSelect");
    }
  } else {
    showNotification("❌ Lỗi: Không thể xóa danh mục!", "error");
  }
}

function showNotification(message, type = "info", duration = 5000) {
  let container = document.getElementById("notificationContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "notificationContainer";
    container.className = "notification-container";
    document.body.appendChild(container);
  }

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

  container.appendChild(notification);

  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  });

  setTimeout(() => notification.classList.add("show"), 10);

  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

export function initCategoryAdmin() {
  const addCategoryForm = document.getElementById("addCategoryForm");
  if (addCategoryForm) {
    addCategoryForm.removeEventListener("submit", handleAddCategory);
    addCategoryForm.addEventListener("submit", handleAddCategory);
  }

  const editCategoryForm = document.getElementById("editCategoryForm");
  if (editCategoryForm) {
    editCategoryForm.removeEventListener("submit", handleEditCategorySubmit);
    editCategoryForm.addEventListener("submit", handleEditCategorySubmit);
  }

  const editCategoryInput = document.getElementById("editCategoryNameInput");
  if (editCategoryInput) {
    editCategoryInput.removeEventListener("input", validateEditCategoryInput);
    editCategoryInput.addEventListener("input", validateEditCategoryInput);
  }

  const editCategoryModal = document.getElementById("editCategoryModal");
  if (editCategoryModal) {
    editCategoryModal.addEventListener("click", (e) => {
      if (e.target === editCategoryModal) {
        closeEditCategoryModal();
      }
    });
  }

  const closeModalBtns = document.querySelectorAll(
    ".category-modal-close, .category-modal-cancel"
  );
  closeModalBtns.forEach((btn) => {
    btn.removeEventListener("click", closeEditCategoryModal);
    btn.addEventListener("click", closeEditCategoryModal);
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      editCategoryModal &&
      editCategoryModal.classList.contains("active")
    ) {
      closeEditCategoryModal();
    }
  });

  renderCategoryList();
}

export { setupCategoryEventListeners, showNotification, escapeHtml };
