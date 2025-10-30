// File: js/import-admin.js - Logic Giao diện Quản lý Nhập hàng

import { importManager } from './ImportSlip.js';
import { productManager } from './ProductManager.js';

// ============================================================
// DOM ELEMENTS
// ============================================================
let DOM = {};

/**
 * Khởi tạo DOM cache
 */
function initDOM() {
    DOM = {
        // Form thêm phiếu nhập
        addImportSlipForm: document.getElementById('addImportSlipForm'),
        importProductSelect: document.getElementById('importSlipProductSelect'),
        importQuantity: document.getElementById('importSlipQuantity'),
        importPrice: document.getElementById('importSlipPrice'),
        importSize: document.getElementById('importSlipSize'),
        importSizeGroup: document.getElementById('importSlipSizeGroup'),
        importSupplier: document.getElementById('importSlipSupplier'),
        importNote: document.getElementById('importSlipNote'),

        // Bảng danh sách phiếu nhập
        importSlipsTableBody: document.getElementById('importSlipsTableBody'),

        // Bộ lọc
        filterStatus: document.getElementById('importFilterStatus'),
        filterProductName: document.getElementById('importFilterName'),
        filterFromDate: document.getElementById('importFilterFrom'),
        filterToDate: document.getElementById('importFilterTo'),
        filterApplyBtn: document.getElementById('importFilterApply'),
        filterResetBtn: document.getElementById('importFilterReset'),

        // Modal sửa phiếu
        editModal: document.getElementById('editImportSlipModal'),
        editForm: document.getElementById('editImportSlipForm'),
        editSlipNumber: document.getElementById('editSlipNumber'),
        editProductName: document.getElementById('editProductName'),
        editQuantity: document.getElementById('editImportSlipQuantity'),
        editPrice: document.getElementById('editImportSlipPrice'),
        editSize: document.getElementById('editImportSlipSize'),
        editSupplier: document.getElementById('editImportSlipSupplier'),
        editNote: document.getElementById('editImportSlipNote'),
        closeEditModalBtn: document.querySelector('#editImportSlipModal .close-modal-btn'),
        cancelEditBtn: document.querySelector('#editImportSlipModal .cancel-modal-btn')
    };
}

// ============================================================
// KHỞI TẠO MODULE
// ============================================================

/**
 * Khởi tạo module Import Admin
 */
export function initImportAdmin() {
    initDOM();
    setupEventListeners();
    loadProductsToSelect();
    renderImportSlipsList();
}

/**
 * Gắn các sự kiện
 */
function setupEventListeners() {
    // Form thêm phiếu nhập
    if (DOM.addImportSlipForm) {
        DOM.addImportSlipForm.addEventListener('submit', handleAddImportSlip);
    }

    // Thay đổi sản phẩm -> Hiện/ẩn trường Size
    if (DOM.importProductSelect) {
        DOM.importProductSelect.addEventListener('change', handleProductChange);
    }

    // Bộ lọc
    if (DOM.filterApplyBtn) {
        DOM.filterApplyBtn.addEventListener('click', handleFilter);
    }

    if (DOM.filterResetBtn) {
        DOM.filterResetBtn.addEventListener('click', handleResetFilter);
    }

    // Modal sửa phiếu
    if (DOM.closeEditModalBtn) {
        DOM.closeEditModalBtn.addEventListener('click', closeEditModal);
    }

    if (DOM.cancelEditBtn) {
        DOM.cancelEditBtn.addEventListener('click', closeEditModal);
    }

    if (DOM.editForm) {
        DOM.editForm.addEventListener('submit', handleUpdateImportSlip);
    }

    // Đóng modal khi click bên ngoài
    if (DOM.editModal) {
        DOM.editModal.addEventListener('click', (e) => {
            if (e.target === DOM.editModal) {
                closeEditModal();
            }
        });
    }
}

// ============================================================
// LOAD DỮ LIỆU VÀO SELECT
// ============================================================

/**
 * Load danh sách sản phẩm vào dropdown
 */
function loadProductsToSelect() {
    if (!DOM.importProductSelect) return;

    const products = productManager.getVisibleProducts();
    
    DOM.importProductSelect.innerHTML = '<option value="">-- Chọn Sản phẩm --</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${product.price.toLocaleString('vi-VN')}₫`;
        option.dataset.hasVariants = product.variants && product.variants.length > 0 ? 'true' : 'false';
        DOM.importProductSelect.appendChild(option);
    });
}

/**
 * Xử lý khi thay đổi sản phẩm
 */
function handleProductChange() {
    const selectedOption = DOM.importProductSelect.options[DOM.importProductSelect.selectedIndex];
    const hasVariants = selectedOption?.dataset.hasVariants === 'true';

    if (DOM.importSizeGroup) {
        DOM.importSizeGroup.style.display = hasVariants ? 'flex' : 'none';
        
        if (DOM.importSize) {
            DOM.importSize.required = hasVariants;
            if (!hasVariants) {
                DOM.importSize.value = '';
            }
        }
    }
}

// ============================================================
// THÊM PHIẾU NHẬP MỚI
// ============================================================

/**
 * Xử lý form thêm phiếu nhập
 */
function handleAddImportSlip(e) {
    e.preventDefault();

    const productId = Number(DOM.importProductSelect.value);
    const quantity = Number(DOM.importQuantity.value);
    const importPrice = Number(DOM.importPrice.value);
    const size = DOM.importSize.value ? Number(DOM.importSize.value) : null;
    const supplier = DOM.importSupplier.value.trim();
    const note = DOM.importNote.value.trim();

    // Validate
    if (!productId || quantity <= 0 || importPrice <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
        return;
    }

    const product = productManager.getProductById(productId);
    if (!product) {
        alert('Không tìm thấy sản phẩm!');
        return;
    }

    // Kiểm tra size nếu sản phẩm có biến thể
    if (product.variants && product.variants.length > 0 && !size) {
        alert('Vui lòng chọn Size cho sản phẩm này!');
        return;
    }

    // Tạo phiếu nhập
    const newSlip = importManager.addSlip({
        productId,
        productName: product.name,
        variantSize: size,
        quantity,
        importPrice,
        supplier,
        note
    });

    if (newSlip) {
        alert(`✅ Đã tạo phiếu nhập ${newSlip.slipNumber} thành công!\nTrạng thái: Nháp - Chưa hoàn thành`);
        DOM.addImportSlipForm.reset();
        DOM.importSizeGroup.style.display = 'none';
        renderImportSlipsList();
    } else {
        alert('❌ Lỗi khi tạo phiếu nhập!');
    }
}

// ============================================================
// HIỂN THỊ DANH SÁCH PHIẾU NHẬP
// ============================================================

/**
 * Render danh sách phiếu nhập
 */
export function renderImportSlipsList(slips = null) {
    if (!DOM.importSlipsTableBody) return;

    const slipsList = slips || importManager.getAllSlips();
    DOM.importSlipsTableBody.innerHTML = '';

    if (slipsList.length === 0) {
        DOM.importSlipsTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="center" style="padding: 30px;">
                    <i class="fa-solid fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
                    <p style="color: #888;">Chưa có phiếu nhập nào</p>
                </td>
            </tr>
        `;
        return;
    }

    slipsList.forEach(slip => {
        const row = document.createElement('tr');
        
        const statusBadge = slip.status === 'COMPLETED' 
            ? '<span class="status-badge status-completed">Đã hoàn thành</span>'
            : '<span class="status-badge status-draft">Nháp</span>';

        const sizeDisplay = slip.variantSize 
            ? `Size ${slip.variantSize}` 
            : '<span class="text-muted">Không có</span>';

        const dateDisplay = new Date(slip.createdDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const completedDateDisplay = slip.completedDate 
            ? new Date(slip.completedDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            : '<span class="text-muted">-</span>';

        row.innerHTML = `
            <td class="nowrap">${slip.slipNumber}</td>
            <td>${slip.productName}</td>
            <td class="center nowrap">${sizeDisplay}</td>
            <td class="right">${slip.quantity}</td>
            <td class="right">${slip.importPrice.toLocaleString('vi-VN')}₫</td>
            <td class="right"><strong>${slip.totalValue.toLocaleString('vi-VN')}₫</strong></td>
            <td class="nowrap">${dateDisplay}</td>
            <td class="center">${statusBadge}</td>
            <td class="action-buttons">
                ${slip.status === 'DRAFT' ? `
                    <button class="btn btn-primary btn-edit-slip" data-id="${slip.id}" title="Sửa phiếu">
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                    <button class="btn btn-success btn-complete-slip" data-id="${slip.id}" title="Hoàn thành & Cập nhật kho">
                        <i class="fa-solid fa-check"></i> Hoàn thành
                    </button>
                    <button class="btn btn-delete btn-delete-slip" data-id="${slip.id}" title="Xóa phiếu">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                ` : `
                    <button class="btn btn-info btn-view-slip" data-id="${slip.id}" title="Xem chi tiết">
                        <i class="fa-solid fa-eye"></i> Xem
                    </button>
                `}
            </td>
        `;

        DOM.importSlipsTableBody.appendChild(row);
    });

    // Gắn sự kiện cho các nút
    attachSlipActionListeners();
}

/**
 * Gắn sự kiện cho các nút trong bảng
 */
function attachSlipActionListeners() {
    // Nút Sửa
    document.querySelectorAll('.btn-edit-slip').forEach(btn => {
        btn.addEventListener('click', () => handleEditSlip(btn.dataset.id));
    });

    // Nút Hoàn thành
    document.querySelectorAll('.btn-complete-slip').forEach(btn => {
        btn.addEventListener('click', () => handleCompleteSlip(btn.dataset.id));
    });

    // Nút Xóa
    document.querySelectorAll('.btn-delete-slip').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSlip(btn.dataset.id));
    });

    // Nút Xem
    document.querySelectorAll('.btn-view-slip').forEach(btn => {
        btn.addEventListener('click', () => handleViewSlip(btn.dataset.id));
    });
}

// ============================================================
// SỬA PHIẾU NHẬP
// ============================================================

/**
 * Mở modal sửa phiếu nhập
 */
function handleEditSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip || !slip.canEdit()) {
        alert('Không thể sửa phiếu này!');
        return;
    }

    // Điền dữ liệu vào form
    DOM.editSlipNumber.textContent = slip.slipNumber;
    DOM.editProductName.textContent = slip.productName;
    DOM.editQuantity.value = slip.quantity;
    DOM.editPrice.value = slip.importPrice;
    DOM.editSize.value = slip.variantSize || '';
    DOM.editSupplier.value = slip.supplier || '';
    DOM.editNote.value = slip.note || '';

    // Lưu ID đang sửa
    DOM.editForm.dataset.editingId = slipId;

    // Hiển thị modal
    DOM.editModal.style.display = 'flex';
}

/**
 * Xử lý cập nhật phiếu nhập
 */
function handleUpdateImportSlip(e) {
    e.preventDefault();

    const slipId = Number(DOM.editForm.dataset.editingId);
    const updatedData = {
        quantity: Number(DOM.editQuantity.value),
        importPrice: Number(DOM.editPrice.value),
        variantSize: DOM.editSize.value ? Number(DOM.editSize.value) : null,
        supplier: DOM.editSupplier.value.trim(),
        note: DOM.editNote.value.trim()
    };

    if (importManager.updateSlip(slipId, updatedData)) {
        alert('✅ Cập nhật phiếu nhập thành công!');
        closeEditModal();
        renderImportSlipsList();
    } else {
        alert('❌ Lỗi khi cập nhật phiếu nhập!');
    }
}

/**
 * Đóng modal sửa phiếu
 */
function closeEditModal() {
    DOM.editModal.style.display = 'none';
    DOM.editForm.reset();
    delete DOM.editForm.dataset.editingId;
}

// ============================================================
// HOÀN THÀNH PHIẾU NHẬP
// ============================================================

/**
 * Hoàn thành phiếu nhập và cập nhật tồn kho
 */
function handleCompleteSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip) {
        alert('Không tìm thấy phiếu nhập!');
        return;
    }

    const confirmMsg = `Xác nhận hoàn thành phiếu nhập:\n\n` +
        `Số phiếu: ${slip.slipNumber}\n` +
        `Sản phẩm: ${slip.productName}${slip.variantSize ? ` (Size ${slip.variantSize})` : ''}\n` +
        `Số lượng: ${slip.quantity}\n` +
        `Giá nhập: ${slip.importPrice.toLocaleString('vi-VN')}₫\n` +
        `Tổng giá trị: ${slip.totalValue.toLocaleString('vi-VN')}₫\n\n` +
        `⚠️ Sau khi hoàn thành, phiếu không thể sửa đổi!`;

    if (!confirm(confirmMsg)) return;

    // Hoàn thành phiếu
    const result = importManager.completeSlip(slipId);
    if (!result.success) {
        alert(`❌ ${result.message}`);
        return;
    }

    // Cập nhật tồn kho trong ProductManager
    const updateSuccess = productManager.processProductImport(
        slip.productId,
        slip.quantity,
        slip.importPrice,
        slip.variantSize,
        `Phiếu nhập ${slip.slipNumber}${slip.supplier ? ` - NCC: ${slip.supplier}` : ''}`
    );

    if (updateSuccess) {
        alert(`✅ Hoàn thành phiếu nhập ${slip.slipNumber} thành công!\n✅ Đã cập nhật tồn kho.`);
        renderImportSlipsList();
        
        // Cập nhật bảng tồn kho nếu đang mở
        if (typeof window.renderInventoryTable === 'function') {
            window.renderInventoryTable();
        }
    } else {
        alert('⚠️ Phiếu đã hoàn thành nhưng có lỗi khi cập nhật tồn kho!');
    }
}

// ============================================================
// XÓA PHIẾU NHẬP
// ============================================================

/**
 * Xóa phiếu nhập (chỉ phiếu nháp)
 */
function handleDeleteSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip) {
        alert('Không tìm thấy phiếu nhập!');
        return;
    }

    if (!confirm(`Xác nhận xóa phiếu nhập ${slip.slipNumber}?\n\nThao tác này không thể hoàn tác!`)) {
        return;
    }

    if (importManager.deleteSlip(slipId)) {
        alert('✅ Đã xóa phiếu nhập!');
        renderImportSlipsList();
    } else {
        alert('❌ Không thể xóa phiếu nhập này!');
    }
}

// ============================================================
// XEM CHI TIẾT PHIẾU NHẬP
// ============================================================

/**
 * Xem chi tiết phiếu nhập đã hoàn thành
 */
function handleViewSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip) {
        alert('Không tìm thấy phiếu nhập!');
        return;
    }

    const details = `
═══════════════════════════════════════
        CHI TIẾT PHIẾU NHẬP
═══════════════════════════════════════

Số phiếu: ${slip.slipNumber}
Trạng thái: ${slip.status === 'COMPLETED' ? '✅ Đã hoàn thành' : '📝 Nháp'}

───────────────────────────────────────
THÔNG TIN SẢN PHẨM
───────────────────────────────────────
Tên sản phẩm: ${slip.productName}
${slip.variantSize ? `Kích cỡ: Size ${slip.variantSize}` : 'Kích cỡ: Không có'}

───────────────────────────────────────
THÔNG TIN NHẬP HÀNG
───────────────────────────────────────
Số lượng: ${slip.quantity}
Giá nhập: ${slip.importPrice.toLocaleString('vi-VN')}₫
Tổng giá trị: ${slip.totalValue.toLocaleString('vi-VN')}₫
${slip.supplier ? `Nhà cung cấp: ${slip.supplier}` : ''}

───────────────────────────────────────
THỜI GIAN
───────────────────────────────────────
Ngày tạo: ${new Date(slip.createdDate).toLocaleString('vi-VN')}
${slip.completedDate ? `Ngày hoàn thành: ${new Date(slip.completedDate).toLocaleString('vi-VN')}` : ''}

${slip.note ? `\n───────────────────────────────────────\nGHI CHÚ\n───────────────────────────────────────\n${slip.note}` : ''}

═══════════════════════════════════════
    `;

    alert(details);
}

// ============================================================
// LỌC & TÌM KIẾM
// ============================================================

/**
 * Xử lý lọc danh sách
 */
function handleFilter() {
    const filters = {
        status: DOM.filterStatus.value,
        productName: DOM.filterProductName.value,
        fromDate: DOM.filterFromDate.value,
        toDate: DOM.filterToDate.value
    };

    const results = importManager.searchSlips(filters);
    renderImportSlipsList(results);
}

/**
 * Reset bộ lọc
 */
function handleResetFilter() {
    DOM.filterStatus.value = 'ALL';
    DOM.filterProductName.value = '';
    DOM.filterFromDate.value = '';
    DOM.filterToDate.value = '';
    renderImportSlipsList();
}