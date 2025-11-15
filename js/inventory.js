
export function setupInventoryModule(productManager, categoryManager) {
    

    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const addImportForm = document.getElementById('addImportForm');
    const productSelect = document.getElementById('importProductSelect');
    const sizeInputGroup = document.getElementById('importSizeInputGroup'); 
    const sizeInput = document.getElementById('importSize'); 
    

    const lowStockAlertsContainer = document.querySelector('.section-toolbar'); 
    const stockMovementModal = document.getElementById('stockMovementModal');
    const movementFilterForm = document.getElementById('movementFilterForm');
    const closeMovementModalBtn = document.getElementById('closeMovementModal'); 
    const closeMovementModalFooterBtn = document.getElementById('closeMovementModalFooter'); 

    const summaryStartStock = document.getElementById('summaryStartStock');
    const summaryTotalIn = document.getElementById('summaryTotalIn');
    const summaryTotalOut = document.getElementById('summaryTotalOut');
    const summaryEndStock = document.getElementById('summaryEndStock');

    const LOW_STOCK_THRESHOLD = 5;

    if (!inventoryTableBody || !addImportForm || !productSelect || !sizeInputGroup || !sizeInput || !stockMovementModal || !movementFilterForm || !closeMovementModalBtn || !closeMovementModalFooterBtn || !summaryStartStock || !summaryTotalIn || !summaryTotalOut || !summaryEndStock) {
        console.error("LỖI KHỞI TẠO INVENTORY MODULE: Thiếu một hoặc nhiều phần tử HTML cần thiết. Kiểm tra ID.");

        if (!summaryStartStock) console.error("Thiếu #summaryStartStock");
        if (!summaryTotalIn) console.error("Thiếu #summaryTotalIn");
        if (!summaryTotalOut) console.error("Thiếu #summaryTotalOut");
        if (!summaryEndStock) console.error("Thiếu #summaryEndStock");
        return { initializeInventoryTab: () => {}, hienThiDanhSachTonKho: () => {} };
    }

    
    function calculateStockMovement(productId, startDate, endDate) {
        const product = productManager.getProductById(productId);
        if (!product) {
            return { startStock: 0, totalIn: 0, totalOut: 0, endStock: 0, logEntries: [] };
        }
        
        const end = new Date(new Date(endDate).getTime() + 86399999); 
        const start = new Date(startDate);
        
        let totalIn = 0;
        let totalOut = 0;
        const logEntries = [];
        

        product.imports.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= start && itemDate <= end) {
                const qty = item.qty || 0;
                totalIn += qty;
                logEntries.push({
                    date: itemDate,
                    type: 'Nhập',
                    quantity: qty, 
                    note: item.note || `Nhập kho: ${item.variantSize || 'Chung'}`,
                    costPrice: item.costPrice || product.costPrice
                });
            }
        });
        

        product.sales.forEach(item => {
            const itemDate = new Date(item.date);
            if (itemDate >= start && itemDate <= end) {
                const qty = item.qty || 0;
                totalOut += qty;
                logEntries.push({
                    date: itemDate,
                    type: 'Xuất',
                    quantity: -qty,
                    note: `Xuất bán` + (item.variantSize ? ` (Size: ${item.variantSize})` : ''),
                    costPrice: product.costPrice 
                });
            }
        });

        const endStock = product.getCurrentStock(); 
        const startStock = endStock - (totalIn - totalOut);
        
        logEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

        return {
            startStock,
            totalIn, 
            totalOut,
            endStock,
            logEntries
        };
    }
    
    function getLowStockAlerts() {
        const products = productManager.getAllProducts(false);
        const alerts = [];

        products.forEach(p => {
             if (p.isLowStock()) { 
                 alerts.push({
                    id: p.id,
                    name: p.name,
                    currentStock: p.getCurrentStock()
                 });
            }
        });
        return alerts;
    }

    function displayLowStockAlerts() {
        const alerts = getLowStockAlerts();
        let alertDiv = document.getElementById('lowStockAlertDiv');
        if (!alertDiv) {
             alertDiv = document.createElement('div');
             alertDiv.id = 'lowStockAlertDiv';
             lowStockAlertsContainer.insertAdjacentElement('afterend', alertDiv); 
        }
        alertDiv.innerHTML = ''; 
        
        if (alerts.length > 0) {
            let alertHtml = `<div class="alert alert-warning mb-3">⚠️ **Cảnh báo!** Có **${alerts.length}** mục sắp hết hàng (<= ${LOW_STOCK_THRESHOLD}):<br>`;
            
            alerts.slice(0, 5).forEach(alert => { 
                alertHtml += `**[ID: ${alert.id}]** ${alert.name}: **${alert.currentStock}** (Tồn)<br>`;
            });
            
            if(alerts.length > 5) {
                alertHtml += `... và ${alerts.length - 5} mục khác.`;
            }
            alertHtml += '</div>';
            alertDiv.innerHTML = alertHtml;
        }
    }

    
    function loadProductsToSelect() {
        productSelect.innerHTML = '<option value="">-- Chọn Sản phẩm --</option>';
        const products = productManager.getAllProducts(true); 

        products.forEach(p => {
            const currentStock = p.getCurrentStock(); 
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `[ID: ${p.id}] ${p.name} (Tồn: ${currentStock})`; 
            productSelect.appendChild(option);
        });
    }

    function hienThiDanhSachTonKho() {
        inventoryTableBody.innerHTML = '';
        const products = productManager.getAllProducts(true);
        
        displayLowStockAlerts(); 
        
        products.forEach(p => {
            const categoryName = productManager.getCategoryName(p.categoryId) || 'Không rõ'; 
            const statusText = p.isHidden ? 'ĐÃ ẨN' : 'HIỂN THỊ';
            const statusClass = p.isHidden ? 'badge badge-canceled' : 'badge badge-delivered';
            
            const currentStock = p.getCurrentStock(); 
            const lowStockClass = p.isLowStock() ? 'table-warning' : ''; 
            
            const row = document.createElement('tr');
            row.className = lowStockClass;
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${categoryName}</td>
                <td class="right"><strong>${currentStock}</strong></td> 
                <td class="right">${(p.costPrice || 0).toLocaleString('vi-VN')} VNĐ</td> 
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-ghost btn-view-movements" data-id="${p.id}">Lịch sử</button>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });
        
        ganSuKienTonKho();
    }

    function handleProductSelectChange() {
        const productId = productSelect.value;
        const product = productManager.getProductById(productId);

        if (product && product.variants && product.variants.length > 0) {
            sizeInputGroup.style.display = 'block';
            sizeInput.required = true;
        } else {
            sizeInputGroup.style.display = 'none';
            sizeInput.required = false;
        }
    }

    function themPhieuNhap(e) {
        e.preventDefault();
        
        const form = e.target;
        const productId = form.querySelector('#importProductSelect').value;
        const quantity = parseInt(form.querySelector('#importQuantity').value);
        const importPrice = parseFloat(form.querySelector('#importPrice').value);
        const note = form.querySelector('#importNote').value.trim();
        const size = form.querySelector('#importSize').value.trim() || null; 

        if (!productId || isNaN(quantity) || quantity <= 0 || isNaN(importPrice) || importPrice <= 0) {
            alert('Vui lòng nhập đầy đủ và chính xác các trường Bắt buộc (*).');
            return;
        }
        
        const product = productManager.getProductById(productId);
        if (product && product.variants && product.variants.length > 0 && !size) {
            alert('Sản phẩm này quản lý tồn kho theo Size, vui lòng nhập Kích cỡ.');
            return;
        }
        
        const success = productManager.processProductImport(productId, quantity, importPrice, size, note); 

        if (success) {
            alert(`Nhập hàng thành công: +${quantity} vào sản phẩm ID ${productId}` + (size ? ` Size ${size}` : "") + `.`);
            form.reset();
            handleProductSelectChange();
            hienThiDanhSachTonKho();
            loadProductsToSelect();
        } else {
            alert('Lỗi: Không thể thực hiện phiếu nhập. (Kiểm tra ID sản phẩm/Size)');
        }
    }
    
    function showMovementModal(productId) {
        const product = productManager.getProductById(productId);
        if (!product) return;
        
        document.getElementById('movementProductName').innerHTML = 
            `Tên Sản phẩm: <strong>${product.name} (ID: ${productId})</strong>`;
        stockMovementModal.setAttribute('data-product-id', productId);
        
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        document.getElementById('movementEndDate').value = today.toISOString().split('T')[0];
        document.getElementById('movementStartDate').value = thirtyDaysAgo.toISOString().split('T')[0];

        stockMovementModal.style.display = 'flex';
        handleMovementFilter({ preventDefault: () => {} }); 
    }

    function closeMovementModal() {
        stockMovementModal.style.display = 'none';
        document.getElementById('movementLogTableBody').innerHTML = '<tr><td colspan="5" class="center">Vui lòng chọn khoảng thời gian để xem chi tiết.</td></tr>';
    }

    
    function handleMovementFilter(e) {
        if (e) e.preventDefault();
        
        const productId = stockMovementModal.getAttribute('data-product-id');
        const startDateStr = document.getElementById('movementStartDate').value;
        const endDateStr = document.getElementById('movementEndDate').value;
        const logTableBody = document.getElementById('movementLogTableBody');
        
        if (!productId || !startDateStr || !endDateStr || !logTableBody) return;

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        const data = calculateStockMovement(productId, startDate, endDate);
        

        summaryStartStock.textContent = data.startStock;
        summaryTotalIn.textContent = data.totalIn;
        summaryTotalOut.textContent = data.totalOut;
        summaryEndStock.textContent = data.endStock;

        let logHtml = '';
        const hasMovement = data.logEntries.length > 0;

        data.logEntries.forEach(log => {
            const dateStr = log.date.toLocaleDateString('vi-VN');
            const quantity = log.quantity > 0 ? `<span class="text-success">+${log.quantity}</span>` : `<span class="text-danger">${log.quantity}</span>`;
            const typeBadge = log.type === 'Xuất' ? `<span class="badge badge-canceled">Xuất</span>` : `<span class="badge badge-delivered">Nhập</span>`;
            
            logHtml += `
                <tr>
                    <td>${dateStr}</td>
                    <td>${typeBadge}</td>
                    <td class="right">${quantity}</td>
                    <td>${log.note}</td>
                    <td class="right">${(log.costPrice || 0).toLocaleString('vi-VN')}</td>
                </tr>
            `;
        });

        if (!hasMovement) {
            logHtml = '<tr><td colspan="5" class="center">Không có giao dịch Nhập/Xuất nào trong khoảng thời gian này.</td></tr>';
        }

        logTableBody.innerHTML = logHtml;
    }

    function handleViewMovements(e) {
        const productId = e.currentTarget.getAttribute('data-id');
        showMovementModal(productId);
    }

    function ganSuKienTonKho() {

        addImportForm.removeEventListener('submit', themPhieuNhap); 
        addImportForm.addEventListener('submit', themPhieuNhap);
        

        productSelect.removeEventListener('change', handleProductSelectChange);
        productSelect.addEventListener('change', handleProductSelectChange);
        

        const viewMovementBtns = document.querySelectorAll('.btn-view-movements');
        viewMovementBtns.forEach(btn => {
            btn.removeEventListener('click', handleViewMovements);
            btn.addEventListener('click', handleViewMovements);
        });

        closeMovementModalBtn.removeEventListener('click', closeMovementModal);
        closeMovementModalBtn.addEventListener('click', closeMovementModal);
        
        closeMovementModalFooterBtn.removeEventListener('click', closeMovementModal);
        closeMovementModalFooterBtn.addEventListener('click', closeMovementModal);
        

        movementFilterForm.removeEventListener('submit', handleMovementFilter);
        movementFilterForm.addEventListener('submit', handleMovementFilter);
        
        handleProductSelectChange();
    }
    

    stockMovementModal.addEventListener('click', (e) => {
        if (e.target === stockMovementModal) {
            closeMovementModal();
        }
    });
    

    
    function initializeInventoryTab() {
        loadProductsToSelect();
        hienThiDanhSachTonKho();
    }
    
    return {
        initializeInventoryTab,
        hienThiDanhSachTonKho 
    };
}


// Register listener for inventory updates (moved outside setupInventoryModule so it runs immediately on module load)
export function registerInventoryUpdateListener(hienThiDanhSachTonKho) {
    window.addEventListener('inventoryUpdated', (e) => {
        console.log('🔄 [inventory] Inventory updated event received:', e.detail);
        if (typeof hienThiDanhSachTonKho === 'function') {
            hienThiDanhSachTonKho();
        }
    });
}