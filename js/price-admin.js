import { productManager, categoryManager } from './admin.js';

let priceTableBody;
let priceFilterCategory;
let priceFilterName;
let priceFilterApply;
let priceFilterReset;
// THÊM MỚI: Biến cho cập nhật hàng loạt
let bulkCategorySelect;
let bulkMarginInput;
let applyBulkUpdate;

// Đổi tên biến cờ để chỉ trạng thái option đã được load
let categoryOptionsLoaded = false; 

const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);

function getActualSaleMarginPercent(product) {
    if (!product || product.price <= 0 || product.costPrice <= 0 || product.price < product.costPrice) {
        return 0;
    }
    const profit = product.price - product.costPrice;
    // Công thức: (Lợi nhuận / Giá bán) * 100
    const margin = (profit / product.price) * 100; 
    return margin;
}

/**
 * Tải danh mục vào các dropdown trên trang, chỉ thực hiện một lần
 */
function loadCategoryFilter() {
    if (categoryOptionsLoaded) return; 
    
    // Đảm bảo các element cần thiết đã được khởi tạo
    if (!priceFilterCategory || !bulkCategorySelect) return;

    const categories = categoryManager.getAllCategories();
    
    // Khởi tạo options cho cả hai dropdown
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        
        // Thêm vào dropdown Filter (giữ option "Tất cả")
        priceFilterCategory.appendChild(option.cloneNode(true));
        
        // Thêm vào dropdown Bulk Update (giữ option "-- Chọn Danh mục --")
        bulkCategorySelect.appendChild(option.cloneNode(true));
    });

    categoryOptionsLoaded = true;
}

export function renderPriceList() {
    if (!priceTableBody) priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;

    // Gọi hàm loadCategoryFilter để đảm bảo dropdown được điền
    loadCategoryFilter(); 

    const categoryName = priceFilterCategory ? priceFilterCategory.value : 'all';
    const searchName = priceFilterName ? priceFilterName.value.toLowerCase().trim() : '';

    const products = productManager.getAllProducts(true);

    const filteredProducts = products.filter(product => {
        const nameMatch = searchName === '' || product.name.toLowerCase().includes(searchName);
        const categoryMatch = categoryName === 'all' || categoryManager.getCategoryNameById(product.categoryId) === categoryName;
        return nameMatch && categoryMatch;
    });

    if (filteredProducts.length === 0) {
        priceTableBody.innerHTML = `<tr><td colspan="8" class="center">Không tìm thấy sản phẩm nào.</td></tr>`;
        return;
    }

    priceTableBody.innerHTML = '';

    filteredProducts.forEach(product => {
        const category = categoryManager.getCategoryNameById(product.categoryId);
        
        const actualMargin = getActualSaleMarginPercent(product);
        let marginClass = 'zero';
        if (actualMargin > 0) marginClass = 'positive';
        else if (actualMargin < 0) marginClass = 'negative';

        const targetMargin = product.targetProfitMargin || '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="nowrap">${product.id}</td>
            <td>${product.name}</td>
            <td class="nowrap">${category}</td>
            <td class="nowrap right cost-price">${formatCurrency(product.costPrice)} ₫</td>
            <td class="nowrap right sale-price">${formatCurrency(product.price)} ₫</td>
            <td class="nowrap right profit-margin ${marginClass}">
                ${actualMargin.toFixed(1)}%
            </td>
            <td class="nowrap center">
                <div class="margin-input-group" data-product-id="${product.id}">
                    <input 
                        type="number" 
                        class="margin-input" 
                        placeholder="VD: 20" 
                        value="${targetMargin}"
                        min="1" 
                        max="99" 
                        step="0.5"
                        ${product.costPrice <= 0 ? 'disabled' : ''}
                        title="${product.costPrice <= 0 ? 'Phải có giá vốn' : 'Nhập % lợi nhuận (1-99)'}"
                    >
                    <span>%</span>
                </div>
            </td>
            <td class="nowrap">
                <button 
                    class="btn btn-update-price" 
                    data-product-id="${product.id}"
                    ${product.costPrice <= 0 ? 'disabled' : ''}
                    title="${product.costPrice <= 0 ? 'Không thể cập nhật khi giá vốn = 0' : 'Cập nhật giá bán'}"
                >
                    <i class="fa-solid fa-calculator"></i> Cập nhật
                </button>
            </td>
        `;
        
        priceTableBody.appendChild(row);
    });

    attachRowEventListeners();
}

function attachRowEventListeners() {
    document.querySelectorAll('.btn-update-price').forEach(button => {
        button.addEventListener('click', handleUpdatePrice);
    });
}

function handleUpdatePrice(event) {
    const button = event.currentTarget;
    const productId = button.dataset.productId;
    
    const input = document.querySelector(`.margin-input-group[data-product-id="${productId}"] .margin-input`);
    if (!input) return;

    const newMarginPercent = parseFloat(input.value);

    if (isNaN(newMarginPercent) || newMarginPercent <= 0 || newMarginPercent >= 100) {
        alert('Vui lòng nhập Tỉ lệ Lợi nhuận là một số LỚN HƠN 0 và NHỎ HƠN 100.');
        input.focus();
        return;
    }

    const success = productManager.updateProductPriceByMargin(productId, newMarginPercent);

    if (success) {

        input.value = newMarginPercent;
        alert(`Cập nhật giá bán cho sản phẩm ID ${productId} thành công!`);
        renderPriceList();
    } else {
        alert(`Có lỗi xảy ra. Vui lòng kiểm tra giá vốn của sản phẩm (phải > 0).`);
    }
}

// THÊM MỚI: Xử lý cập nhật giá hàng loạt theo danh mục
function handleBulkUpdatePrice() {
    if (!bulkCategorySelect || !bulkMarginInput) return;

    const categoryName = bulkCategorySelect.value;
    const newMarginPercent = parseFloat(bulkMarginInput.value);

    // 1. Kiểm tra đầu vào
    if (categoryName === '') {
        alert('Vui lòng chọn một Danh mục để cập nhật.');
        return;
    }

    if (isNaN(newMarginPercent) || newMarginPercent <= 0 || newMarginPercent >= 100) {
        alert('Vui lòng nhập Tỉ lệ Lợi nhuận là một số LỚN HƠN 0 và NHỎ HƠN 100.');
        bulkMarginInput.focus();
        return;
    }
    
    // 2. Lấy categoryId
    const category = categoryManager.getAllCategories().find(c => c.name === categoryName);
    const categoryId = category ? category.id : null;
    
    if (!categoryId) {
         alert(`Lỗi: Không tìm thấy ID cho danh mục "${categoryName}".`);
         return;
    }

    if (!confirm(`Bạn có chắc chắn muốn cập nhật Lợi nhuận mục tiêu cho TẤT CẢ sản phẩm trong danh mục "${categoryName}" lên ${newMarginPercent}% không? Thao tác này sẽ thay đổi giá bán của chúng.`)) {
        return;
    }

    // 3. Thực hiện cập nhật
    const products = productManager.getAllProducts(true);
    let updateCount = 0;
    let failedCount = 0;

    products.forEach(product => {
        // Lọc theo ID danh mục
        if (product.categoryId === categoryId) {
            const success = productManager.updateProductPriceByMargin(product.id, newMarginPercent);
            
            if (success) {
                updateCount++;
            } else {
                failedCount++;
            }
        }
    });

    // 4. Thông báo và cập nhật lại bảng
    const totalProcessed = updateCount + failedCount;
    if (totalProcessed > 0) {
        let message = `Đã cố gắng cập nhật ${totalProcessed} sản phẩm trong danh mục "${categoryName}".\n`;
        message += `- Thành công: ${updateCount} sản phẩm.\n`;
        if (failedCount > 0) {
            message += `- Thất bại: ${failedCount} sản phẩm (Có thể do Giá vốn = 0).`;
        }
        alert(message);
        bulkMarginInput.value = ''; // Xóa margin sau khi update thành công
    } else {
        alert(`Không tìm thấy sản phẩm nào trong danh mục "${categoryName}" để cập nhật.`);
    }

    // Luôn gọi renderPriceList để làm mới bảng
    renderPriceList(); 
}


export function initPriceAdmin() {

    priceTableBody = document.getElementById('priceTableBody');
    priceFilterCategory = document.getElementById('priceFilterCategory');
    priceFilterName = document.getElementById('priceFilterName');
    priceFilterApply = document.getElementById('priceFilterApply');
    priceFilterReset = document.getElementById('priceFilterReset');

    // THÊM MỚI: Khởi tạo phần tử cập nhật hàng loạt
    bulkCategorySelect = document.getElementById('bulkCategorySelect');
    bulkMarginInput = document.getElementById('bulkMarginInput');
    applyBulkUpdate = document.getElementById('applyBulkUpdate');

    if (priceFilterApply) {
        priceFilterApply.addEventListener('click', renderPriceList);
    }
    
    if (priceFilterReset) {
        priceFilterReset.addEventListener('click', () => {
            if (priceFilterCategory) priceFilterCategory.value = 'all';
            if (priceFilterName) priceFilterName.value = '';
            renderPriceList();
        });
    }

    // THÊM MỚI: Gắn sự kiện cho nút cập nhật hàng loạt
    if (applyBulkUpdate) {
        applyBulkUpdate.addEventListener('click', handleBulkUpdatePrice);
    }

    // Load category lần đầu khi init
    loadCategoryFilter(); 

}