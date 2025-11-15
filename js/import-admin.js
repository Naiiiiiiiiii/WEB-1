

import { importManager } from './ImportSlip.js';
import { productManager } from './ProductManager.js';

let DOM = {};

function initDOM() {
    DOM = {

        addImportSlipForm: document.getElementById('addImportSlipForm'),
        importSlipItemsContainer: document.getElementById('importSlipItemsContainer'),
        addImportSlipItemBtn: document.getElementById('addImportSlipItemBtn'),
        importSupplier: document.getElementById('importSlipSupplier'),
        importNote: document.getElementById('importSlipNote'),

        importSlipsTableBody: document.getElementById('importSlipsTableBody'),

        filterStatus: document.getElementById('importFilterStatus'),
        filterProductName: document.getElementById('importFilterName'),
        filterFromDate: document.getElementById('importFilterFrom'),
        filterToDate: document.getElementById('importFilterTo'),
        filterApplyBtn: document.getElementById('importFilterApply'),
        filterResetBtn: document.getElementById('importFilterReset'),

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

export function initImportAdmin() {
    if (window.importAdminInitialized) return; // prevent double init

    initDOM();
    setupEventListeners();
    // create initial item row
    addImportItemRow();
    renderImportSlipsList();

    window.importAdminInitialized = true;
}
function setupEventListeners() {

    if (DOM.addImportSlipForm) {
        DOM.addImportSlipForm.addEventListener('submit', handleAddImportSlip);
    }

    if (DOM.addImportSlipItemBtn) {
        DOM.addImportSlipItemBtn.addEventListener('click', () => addImportItemRow());
    }

    if (DOM.filterApplyBtn) {
        DOM.filterApplyBtn.addEventListener('click', handleFilter);
    }

    if (DOM.filterResetBtn) {
        DOM.filterResetBtn.addEventListener('click', handleResetFilter);
    }

    if (DOM.closeEditModalBtn) {
        DOM.closeEditModalBtn.addEventListener('click', closeEditModal);
    }

    if (DOM.cancelEditBtn) {
        DOM.cancelEditBtn.addEventListener('click', closeEditModal);
    }

    if (DOM.editForm) {
        DOM.editForm.addEventListener('submit', handleUpdateImportSlip);
    }

    if (DOM.editModal) {
        DOM.editModal.addEventListener('click', (e) => {
            if (e.target === DOM.editModal) {
                closeEditModal();
            }
        });
    }
}

function loadProductsToSelect() {
    return productManager.getVisibleProducts();
}

function createImportItemRow(products) {
    const row = document.createElement('div');
    row.className = 'import-item-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '8px';
    row.style.alignItems = 'center';

    const select = document.createElement('select');
    select.className = 'import-item-select';
    select.required = true;
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Chọn sản phẩm --';
    select.appendChild(defaultOpt);

    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} - ${p.price.toLocaleString('vi-VN')}₫`;
        opt.dataset.hasVariants = p.variants && p.variants.length > 0 ? 'true' : 'false';
        select.appendChild(opt);
    });

    const qty = document.createElement('input');
    qty.type = 'number';
    qty.className = 'import-item-qty';
    qty.min = 1;
    qty.placeholder = 'SL';
    qty.required = true;
    qty.style.width = '80px';

    const price = document.createElement('input');
    price.type = 'number';
    price.className = 'import-item-price';
    price.min = 0;
    price.step = 1000;
    price.placeholder = 'Giá';
    price.required = true;
    price.style.width = '120px';

    const size = document.createElement('input');
    size.type = 'number';
    size.className = 'import-item-size';
    size.placeholder = 'Size';
    size.style.width = '80px';
    size.style.display = 'none';

    select.addEventListener('change', () => {
        const hasVariants = select.options[select.selectedIndex]?.dataset.hasVariants === 'true';
        size.style.display = hasVariants ? 'inline-block' : 'none';
        if (!hasVariants) size.value = '';
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-danger';
    removeBtn.textContent = 'Xóa';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(select);
    row.appendChild(qty);
    row.appendChild(price);
    row.appendChild(size);
    row.appendChild(removeBtn);

    return row;
}

function addImportItemRow() {
    const products = loadProductsToSelect();
    const row = createImportItemRow(products);
    DOM.importSlipItemsContainer.appendChild(row);
}

function handleAddImportSlip(e) {
    e.preventDefault();

    const rows = Array.from(DOM.importSlipItemsContainer.querySelectorAll('.import-item-row'));
    const supplier = DOM.importSupplier.value.trim();
    const note = DOM.importNote.value.trim();

    if (rows.length === 0) {
        alert('Vui lòng thêm ít nhất 1 sản phẩm cho phiếu nhập!');
        return;
    }

    const items = [];
    for (const r of rows) {
        const select = r.querySelector('.import-item-select');
        const qtyEl = r.querySelector('.import-item-qty');
        const priceEl = r.querySelector('.import-item-price');
        const sizeEl = r.querySelector('.import-item-size');

        const productId = Number(select.value);
        const quantity = Number(qtyEl.value);
        const importPrice = Number(priceEl.value);
        const size = sizeEl && sizeEl.value ? Number(sizeEl.value) : null;

        if (!productId || quantity <= 0 || importPrice <= 0) {
            alert('Vui lòng điền đầy đủ thông tin sản phẩm (sản phẩm, số lượng, giá nhập) hợp lệ!');
            return;
        }

        const product = productManager.getProductById(productId);
        if (!product) {
            alert('Không tìm thấy sản phẩm (một trong các dòng)!');
            return;
        }

        if (product.variants && product.variants.length > 0 && !size) {
            alert(`Sản phẩm "${product.name}" yêu cầu nhập Size!`);
            return;
        }

        items.push({
            productId,
            productName: product.name,
            variantSize: size,
            quantity,
            importPrice,
            totalValue: quantity * importPrice
        });
    }

    const newSlip = importManager.addSlip({ items, supplier, note });
    if (newSlip) {
        alert(`✅ Đã tạo phiếu nhập ${newSlip.slipNumber} thành công!\nTrạng thái: Nháp - Chưa hoàn thành`);
        DOM.addImportSlipForm.reset();
        DOM.importSlipItemsContainer.innerHTML = '';
        addImportItemRow();
        renderImportSlipsList();
    } else {
        alert('❌ Lỗi khi tạo phiếu nhập!');
    }
}

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
        const items = Array.isArray(slip.items) && slip.items.length > 0
            ? slip.items
            : [{
                productId: slip.productId,
                productName: slip.productName || '-',
                variantSize: slip.variantSize || null,
                quantity: slip.quantity || 0,
                importPrice: slip.importPrice || 0,
                totalValue: slip.totalValue || (slip.quantity * slip.importPrice || 0)
            }];

        const statusBadge = slip.status === 'COMPLETED'
            ? '<span class="status-badge status-completed">Đã hoàn thành</span>'
            : '<span class="status-badge status-draft">Nháp</span>';

        const dateDisplay = new Date(slip.createdDate).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        items.forEach((it, idx) => {
            const row = document.createElement('tr');

            const slipCell = idx === 0 ? `<td class="nowrap">${slip.slipNumber}</td>` : '<td></td>';
            const dateCell = idx === 0 ? `<td class="nowrap">${dateDisplay}</td>` : '<td></td>';
            const statusCell = idx === 0 ? `<td class="center">${statusBadge}</td>` : '<td></td>';

            const actionsCell = idx === 0 ? `
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
            ` : '<td></td>';

            const sizeDisplay = it.variantSize ? `Size ${it.variantSize}` : '<span class="text-muted">Không có</span>';
            const priceDisplay = (it.importPrice || it.importPrice === 0) ? `${Number(it.importPrice).toLocaleString('vi-VN')}₫` : '<span class="text-muted">-</span>';
            const totalDisplay = (it.totalValue || it.totalValue === 0) ? `${Number(it.totalValue).toLocaleString('vi-VN')}₫` : '<span class="text-muted">-</span>';

            row.innerHTML = `
                ${slipCell}
                <td>${it.productName}</td>
                <td class="center nowrap">${sizeDisplay}</td>
                <td class="right">${it.quantity}</td>
                <td class="right">${priceDisplay}</td>
                <td class="right"><strong>${totalDisplay}</strong></td>
                ${dateCell}
                ${statusCell}
                ${actionsCell}
            `;

            DOM.importSlipsTableBody.appendChild(row);
        });
    });

    attachSlipActionListeners();
}

function attachSlipActionListeners() {

    document.querySelectorAll('.btn-edit-slip').forEach(btn => {
        btn.addEventListener('click', () => handleEditSlip(btn.dataset.id));
    });

    document.querySelectorAll('.btn-complete-slip').forEach(btn => {
        btn.addEventListener('click', () => handleCompleteSlip(btn.dataset.id));
    });

    document.querySelectorAll('.btn-delete-slip').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteSlip(btn.dataset.id));
    });

    document.querySelectorAll('.btn-view-slip').forEach(btn => {
        btn.addEventListener('click', () => handleViewSlip(btn.dataset.id));
    });
}

function handleEditSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip || !slip.canEdit()) {
        alert('Không thể sửa phiếu này!');
        return;
    }

    // If slip contains multiple items, editing inline is complex. Ask user to recreate.
    if (Array.isArray(slip.items) && slip.items.length > 1) {
        alert('Phiếu này chứa nhiều sản phẩm. Vui lòng xóa và tạo lại nếu muốn chỉnh sửa các mục.');
        return;
    }

    const it = (Array.isArray(slip.items) && slip.items.length === 1) ? slip.items[0] : null;

    DOM.editSlipNumber.textContent = slip.slipNumber;
    DOM.editProductName.textContent = it ? it.productName : (slip.productName || '-');
    DOM.editQuantity.value = it ? it.quantity : (slip.quantity || 0);
    DOM.editPrice.value = it ? it.importPrice : (slip.importPrice || 0);
    DOM.editSize.value = it ? (it.variantSize || '') : (slip.variantSize || '');
    DOM.editSupplier.value = slip.supplier || '';
    DOM.editNote.value = slip.note || '';

    DOM.editForm.dataset.editingId = slipId;

    DOM.editModal.style.display = 'flex';
}

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

function closeEditModal() {
    DOM.editModal.style.display = 'none';
    DOM.editForm.reset();
    delete DOM.editForm.dataset.editingId;
}

function handleCompleteSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip) {
        alert('Không tìm thấy phiếu nhập!');
        return;
    }

    let confirmMsg = `Xác nhận hoàn thành phiếu nhập:\n\nSố phiếu: ${slip.slipNumber}\n`;

    if (Array.isArray(slip.items)) {
        confirmMsg += 'Sản phẩm:\n';
        slip.items.forEach(it => {
            confirmMsg += `- ${it.productName}${it.variantSize ? ` (Size ${it.variantSize})` : ''} x ${it.quantity} @ ${it.importPrice.toLocaleString('vi-VN')}₫\n`;
        });
        confirmMsg += `\nTổng giá trị: ${(slip.totalValue||0).toLocaleString('vi-VN')}₫\n\n`;
    } else {
        confirmMsg += `Sản phẩm: ${slip.productName || '-'}\nSố lượng: ${slip.quantity || 0}\nTổng giá trị: ${(slip.totalValue||0).toLocaleString('vi-VN')}₫\n\n`;
    }

    confirmMsg += '⚠️ Sau khi hoàn thành, phiếu không thể sửa đổi!';

    if (!confirm(confirmMsg)) return;

    const result = importManager.completeSlip(slipId);
    if (!result.success) {
        alert(`❌ ${result.message}`);
        return;
    }

    // process inventory updates for each item
    let allSuccess = true;
    if (Array.isArray(slip.items)) {
        for (const it of slip.items) {
            const note = `Phiếu nhập ${slip.slipNumber}${slip.supplier ? ` - NCC: ${slip.supplier}` : ''}`;
            const ok = productManager.processProductImport(
                it.productId,
                it.quantity,
                it.importPrice,
                it.variantSize,
                note
            );
            if (!ok) allSuccess = false;
        }
    } else {
        const ok = productManager.processProductImport(
            slip.productId,
            slip.quantity,
            slip.importPrice,
            slip.variantSize,
            `Phiếu nhập ${slip.slipNumber}${slip.supplier ? ` - NCC: ${slip.supplier}` : ''}`
        );
        if (!ok) allSuccess = false;
    }

    if (allSuccess) {
        alert(`✅ Hoàn thành phiếu nhập ${slip.slipNumber} thành công!\n✅ Đã cập nhật tồn kho.`);
        renderImportSlipsList();

        if (typeof window.renderInventoryTable === 'function') {
            window.renderInventoryTable();
        }
    } else {
        alert('⚠️ Phiếu đã hoàn thành nhưng có lỗi khi cập nhật tồn kho cho một số sản phẩm!');
    }
}

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

function handleViewSlip(slipId) {
    const slip = importManager.getSlipById(slipId);
    if (!slip) {
        alert('Không tìm thấy phiếu nhập!');
        return;
    }

    let details = `\n═══════════════════════════════════════\n        CHI TIẾT PHIẾU NHẬP\n═══════════════════════════════════════\n\nSố phiếu: ${slip.slipNumber}\nTrạng thái: ${slip.status === 'COMPLETED' ? '✅ Đã hoàn thành' : '📝 Nháp'}\n\n`;

    details += '───────────────────────────────────────\nTHÔNG TIN SẢN PHẨM\n───────────────────────────────────────\n';
    if (Array.isArray(slip.items)) {
        slip.items.forEach(it => {
            details += `- ${it.productName}${it.variantSize ? ` (Size ${it.variantSize})` : ''} x ${it.quantity} @ ${it.importPrice.toLocaleString('vi-VN')}₫\n`;
        });
    } else {
        details += `Tên sản phẩm: ${slip.productName}\n${slip.variantSize ? `Kích cỡ: Size ${slip.variantSize}` : 'Kích cỡ: Không có'}\n`;
    }

    details += `\n───────────────────────────────────────\nTHÔNG TIN NHẬP HÀNG\n───────────────────────────────────────\nTổng giá trị: ${(slip.totalValue||0).toLocaleString('vi-VN')}₫\n${slip.supplier ? `Nhà cung cấp: ${slip.supplier}` : ''}\n\n───────────────────────────────────────\nTHỜI GIAN\n───────────────────────────────────────\nNgày tạo: ${new Date(slip.createdDate).toLocaleString('vi-VN')}\n${slip.completedDate ? `Ngày hoàn thành: ${new Date(slip.completedDate).toLocaleString('vi-VN')}` : ''}\n`;

    if (slip.note) details += `\n───────────────────────────────────────\nGHI CHÚ\n───────────────────────────────────────\n${slip.note}\n`;

    details += '═══════════════════════════════════════\n';

    alert(details);
}

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

function handleResetFilter() {
    DOM.filterStatus.value = 'ALL';
    DOM.filterProductName.value = '';
    DOM.filterFromDate.value = '';
    DOM.filterToDate.value = '';
    renderImportSlipsList();
}