// File: js/product-admin.js - Quản lý Sản phẩm (CRUD Đầy đủ với Modal)
import { productManager, categoryManager, DOM, updateGeneralStats } from './admin.js';

// =========================================================
// QUẢN LÝ MODAL
// =========================================================

let currentEditingProductId = null;

/**
 * Hiển thị modal thêm sản phẩm
 */
export function showAddProductModal() {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const form = document.getElementById('productModalForm');
    
    if (!modal || !form) return;
    
    // Reset form và state
    form.reset();
    currentEditingProductId = null;
    modalTitle.textContent = '➕ Thêm Sản phẩm Mới';
    
    // Load categories vào dropdown
    loadCategoriesToModalSelect();
    
    // Hiển thị modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Focus vào field đầu tiên
    document.getElementById('modalProductName')?.focus();
}

/**
 * Hiển thị modal sửa sản phẩm với dữ liệu đã điền sẵn
 */
export function showEditProductModal(productId) {
    const product = productManager.getProductById(productId);
    if (!product) {
        showNotification('❌ Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const form = document.getElementById('productModalForm');
    
    if (!modal || !form) return;
    
    // Set state
    currentEditingProductId = productId;
    modalTitle.textContent = '✏️ Sửa Sản phẩm';
    
    // Load categories
    loadCategoriesToModalSelect();
    
    // Điền dữ liệu vào form
    document.getElementById('modalProductName').value = product.name;
    document.getElementById('modalProductCategory').value = product.categoryId;
    document.getElementById('modalProductPrice').value = product.price;
    document.getElementById('modalProductDescription').value = product.description;
    document.getElementById('modalProductImage').value = product.img;
    
    // Hiển thị preview ảnh nếu có
    updateImagePreview(product.img);
    
    // Hiển thị modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

/**
 * Đóng modal
 */
export function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentEditingProductId = null;
    }, 300);
}

/**
 * Cập nhật preview ảnh
 */
function updateImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (!preview || !previewImg) return;
    
    if (imageUrl && imageUrl.trim() !== '') {
        previewImg.src = imageUrl;
        previewImg.onerror = () => {
            preview.style.display = 'none';
        };
        previewImg.onload = () => {
            preview.style.display = 'block';
        };
    } else {
        preview.style.display = 'none';
    }
}

// =========================================================
// XỬ LÝ FORM
// =========================================================

/**
 * Xử lý submit form (Thêm hoặc Sửa)
 */
export function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // Lấy dữ liệu từ form
    const productData = {
        name: form.querySelector('#modalProductName').value.trim(),
        categoryId: form.querySelector('#modalProductCategory').value,
        price: parseFloat(form.querySelector('#modalProductPrice').value),
        description: form.querySelector('#modalProductDescription').value.trim(),
        img: form.querySelector('#modalProductImage').value.trim(), 
    };
    
    // Validation
    if (!validateProductData(productData)) {
        return;
    }
    
    // Xử lý thêm hoặc sửa
    if (currentEditingProductId) {
        handleUpdateProduct(currentEditingProductId, productData);
    } else {
        handleAddProduct(productData);
    }
}

/**
 * Validate dữ liệu sản phẩm
 */
function validateProductData(data) {
    if (!data.name) {
        showNotification('⚠️ Vui lòng nhập tên sản phẩm!', 'error');
        document.getElementById('modalProductName')?.focus();
        return false;
    }
    
    if (data.name.length < 3) {
        showNotification('⚠️ Tên sản phẩm phải có ít nhất 3 ký tự!', 'error');
        document.getElementById('modalProductName')?.focus();
        return false;
    }
    
    if (!data.categoryId) {
        showNotification('⚠️ Vui lòng chọn danh mục!', 'error');
        document.getElementById('modalProductCategory')?.focus();
        return false;
    }
    
    if (isNaN(data.price) || data.price <= 0) {
        showNotification('⚠️ Giá sản phẩm phải lớn hơn 0!', 'error');
        document.getElementById('modalProductPrice')?.focus();
        return false;
    }
    
    if (!data.description) {
        showNotification('⚠️ Vui lòng nhập mô tả sản phẩm!', 'error');
        document.getElementById('modalProductDescription')?.focus();
        return false;
    }
    
    if (!data.img) { 
        showNotification('⚠️ Vui lòng nhập URL hình ảnh!', 'error');
        document.getElementById('modalProductImage')?.focus();
        return false;
    }
    
    return true;
}

/**
 * Xử lý thêm sản phẩm mới
 */
function handleAddProduct(productData) {
    // Thêm initialStock = 0 khi tạo mới (sẽ nhập kho sau)
    const newProductData = {
        ...productData,
        initialStock: 0,
        variants: [], // Mặc định không có biến thể
    };
    
    const newProduct = productManager.addProduct(newProductData);
    
    if (newProduct) {
        showNotification(`✅ Thêm sản phẩm "${newProductData.name}" thành công!`, 'success');
        closeProductModal();
        renderProductList();
        updateGeneralStats();
    } else {
        showNotification('❌ Lỗi: Không thể thêm sản phẩm!', 'error');
    }
}

/**
 * Xử lý cập nhật sản phẩm
 */
function handleUpdateProduct(productId, productData) {
    const product = productManager.getProductById(productId);
    if (!product) {
        showNotification('❌ Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    const success = productManager.updateProduct(productId, productData);
    
    if (success) {
        showNotification(`✅ Cập nhật sản phẩm "${productData.name}" thành công!`, 'success');
        closeProductModal();
        renderProductList();
    } else {
        showNotification('❌ Lỗi: Không thể cập nhật sản phẩm!', 'error');
    }
}

// =========================================================
// HIỂN THỊ DANH SÁCH SẢN PHẨM
// =========================================================

/**
 * Render danh sách sản phẩm
 */
export function renderProductList() {
    if (!DOM.productTableBody) return;
    DOM.productTableBody.innerHTML = '';
    
    const products = productManager.getAllProducts(true); // Bao gồm cả sản phẩm ẩn
    
    if (products.length === 0) {
        DOM.productTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="center" style="padding: 40px; color: #999;">
                    <i class="fa-solid fa-box-open" style="font-size: 48px; opacity: 0.3;"></i>
                    <p style="margin-top: 15px;">Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(p => {
        const categoryName = categoryManager.getCategoryNameById(p.categoryId);
        const currentStock = p.getCurrentStock();
        const isLowStock = p.isLowStock();
        const statusClass = p.isHidden ? 'status-hidden' : 'status-active';
        const statusText = p.isHidden ? 'Đang ẩn' : 'Hoạt động';
        
        const rowHTML = `
            <td class="product-id">${p.id}</td>
            <td class="product-name">
                <div class="product-name-wrapper">
                    <img src="${p.img}" alt="${p.name}" class="product-thumb" onerror="this.src='./img/placeholder.png'">
                    <strong>${p.name}</strong>
                </div>
            </td>
            <td class="category-name">${categoryName}</td>
            <td class="right price-cell">${p.price.toLocaleString('vi-VN')} ₫</td>
            <td class="center stock-cell ${isLowStock ? 'low-stock' : ''}">
                ${currentStock}
                ${isLowStock ? '<i class="fa-solid fa-triangle-exclamation" title="Tồn kho thấp"></i>' : ''}
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-info btn-view-product" data-id="${p.id}" title="Xem chi tiết">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-edit btn-edit-product" data-id="${p.id}" title="Sửa sản phẩm">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-ghost ${p.isHidden ? 'btn-show' : 'btn-hide'} btn-toggle-product" data-id="${p.id}" title="${p.isHidden ? 'Hiển thị' : 'Ẩn'} sản phẩm">
                    <i class="fa-solid ${p.isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
                </button>
                <button class="btn btn-delete btn-delete-product" data-id="${p.id}" title="Xóa sản phẩm">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        
        const row = document.createElement('tr');
        if (p.isHidden) {
            row.classList.add('row-hidden');
        }
        if (isLowStock && !p.isHidden) {
            row.classList.add('table-warning');
        }
        row.innerHTML = rowHTML;
        DOM.productTableBody.appendChild(row);
    });
    
    // Gắn sự kiện
    setupProductEventListeners();
}

/**
 * Hiển thị chi tiết sản phẩm (Read-only modal)
 */
function showProductDetail(productId) {
    const product = productManager.getProductById(productId);
    if (!product) {
        showNotification('❌ Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    const categoryName = categoryManager.getCategoryNameById(product.categoryId);
    const currentStock = product.getCurrentStock();
    
    const detailHTML = `
        <div class="product-detail-modal">
            <div class="product-detail-header">
                <h3>📦 Chi tiết Sản phẩm</h3>
                <button class="close-detail-btn" onclick="this.closest('.product-detail-modal').parentElement.remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="product-detail-body">
                <div class="product-detail-image">
                    <img src="${product.img}" alt="${product.name}" onerror="this.src='./img/placeholder.png'">
                </div>
                <div class="product-detail-info">
                    <div class="detail-row">
                        <span class="detail-label">Mã sản phẩm:</span>
                        <span class="detail-value">#${product.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tên sản phẩm:</span>
                        <span class="detail-value"><strong>${product.name}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Danh mục:</span>
                        <span class="detail-value">${categoryName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Giá bán:</span>
                        <span class="detail-value price">${product.price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tồn kho:</span>
                        <span class="detail-value stock">${currentStock}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Trạng thái:</span>
                        <span class="detail-value">
                            <span class="status-badge ${product.isHidden ? 'status-hidden' : 'status-active'}">
                                ${product.isHidden ? 'Đang ẩn' : 'Hoạt động'}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row full-width">
                        <span class="detail-label">Mô tả:</span>
                        <p class="detail-description">${product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'product-detail-overlay';
    overlay.innerHTML = detailHTML;
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Click overlay để đóng
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}

// =========================================================
// XỬ LÝ CÁC HÀNH ĐỘNG
// =========================================================

/**
 * Xử lý ẩn/hiện sản phẩm
 */
function handleToggleProduct(e) {
    e.preventDefault();
    const productId = e.currentTarget.dataset.id;
    const product = productManager.getProductById(productId);
    
    if (!product) {
        showNotification('❌ Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    const action = product.isHidden ? 'hiển thị' : 'ẩn';
    const confirmMessage = `Bạn có chắc muốn ${action.toUpperCase()} sản phẩm "${product.name}"?`;
    
    if (!confirm(confirmMessage)) return;
    
    const success = productManager.toggleHideStatus(productId);
    
    if (success) {
        const newStatus = product.isHidden ? 'đã được hiển thị' : 'đã được ẩn';
        showNotification(`✅ Sản phẩm "${product.name}" ${newStatus}!`, 'success');
        renderProductList();
    } else {
        showNotification(`❌ Lỗi: Không thể ${action} sản phẩm!`, 'error');
    }
}

/**
 * Xử lý xóa sản phẩm
 */
function handleDeleteProduct(e) {
    e.preventDefault();
    const productId = e.currentTarget.dataset.id;
    const product = productManager.getProductById(productId);
    
    if (!product) {
        showNotification('❌ Không tìm thấy sản phẩm!', 'error');
        return;
    }
    
    const confirmMessage = `⚠️ BẠN CÓ CHẮC MUỐN XÓA VĨNH VIỄN sản phẩm "${product.name}" (ID: ${productId})?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`;
    
    if (!confirm(confirmMessage)) return;
    
    const success = productManager.deleteProduct(productId);
    
    if (success) {
        showNotification(`✅ Xóa sản phẩm "${product.name}" thành công!`, 'success');
        renderProductList();
        updateGeneralStats();
    } else {
        showNotification('❌ Lỗi: Không thể xóa sản phẩm!', 'error');
    }
}

// =========================================================
//tiên ÍCH HỖ TRỢ
// =========================================================


function loadCategoriesToModalSelect() {
    const selectElement = document.getElementById('modalProductCategory');
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">-- Chọn Danh mục --</option>';
    const categories = categoryManager.getAllCategories(); // Chỉ lấy danh mục đang hoạt động
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    });
}


export function loadCategoriesToSelect(selectElementId, selectedId = null) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    
    selectElement.innerHTML = '<option value="">-- Chọn Danh mục --</option>';
    const categories = categoryManager.getAllCategories();
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        if (selectedId === cat.id) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

/**
 * Hiển thị thông báo
 */
function showNotification(message, type = 'info') {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;
    
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Gắn sự kiện cho các nút trong bảng
 */
function setupProductEventListeners() {
    // Nút Xem chi tiết
    document.querySelectorAll('.btn-view-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showProductDetail(e.currentTarget.dataset.id);
        });
    });
    
    // Nút Sửa
    document.querySelectorAll('.btn-edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showEditProductModal(e.currentTarget.dataset.id);
        });
    });
    
    // Nút Ẩn/Hiện
    document.querySelectorAll('.btn-toggle-product').forEach(btn => {
        btn.addEventListener('click', handleToggleProduct);
    });
    
    // Nút Xóa
    document.querySelectorAll('.btn-delete-product').forEach(btn => {
        btn.addEventListener('click', handleDeleteProduct);
    });
}

/**
 * Khởi tạo module Product Admin
 */
export function initProductAdmin() {
    // Nút mở modal thêm sản phẩm
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }
    
    // Form submit trong modal
    const modalForm = document.getElementById('productModalForm');
    if (modalForm) {
        modalForm.addEventListener('submit', handleProductFormSubmit);
    }
    
    // Nút đóng modal
    const closeModalBtns = document.querySelectorAll('.close-modal-btn, .cancel-modal-btn');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeProductModal);
    });
    
    // Click overlay để đóng modal
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Preview ảnh khi thay đổi URL
    const imageInput = document.getElementById('modalProductImage');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            updateImagePreview(e.target.value);
        });
    }
    
    // Render danh sách ban đầu
    renderProductList();
}

// Export để sử dụng trong admin.js và các module khác
window.loadCategoriesToSelect = loadCategoriesToSelect;
export { setupProductEventListeners };