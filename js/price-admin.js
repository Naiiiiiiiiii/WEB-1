// File: js/price-admin.js
// Logic giao diện cho Section Quản lý Giá bán & Lợi nhuận

import { productManager, categoryManager } from './admin.js';

// --- DOM Elements ---
let priceTableBody;
let priceFilterCategory;
let priceFilterName;
let priceFilterApply;
let priceFilterReset;
let categorySelectLoaded = false;

// --- Helper Functions ---
const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);

/**
 * Tính toán % lợi nhuận thực tế (Margin)
 * Công thức: (Giá Bán - Giá Vốn) / Giá Bán
 */
function getActualSaleMarginPercent(product) {
    if (!product || product.price <= 0 || product.costPrice <= 0 || product.price < product.costPrice) {
        return 0;
    }
    const profit = product.price - product.costPrice;
    const margin = (profit / product.price) * 100;
    return margin;
}

/**
 * Hiển thị danh sách sản phẩm ra bảng
 */
export function renderPriceList() {
    if (!priceTableBody) priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;

    // Tải danh mục vào bộ lọc nếu chưa tải
    loadCategoryFilter();

    // Lấy giá trị filter
    const categoryName = priceFilterCategory ? priceFilterCategory.value : 'all';
    const searchName = priceFilterName ? priceFilterName.value.toLowerCase().trim() : '';

    const products = productManager.getAllProducts(true); // Lấy cả sản phẩm ẩn

    // Lọc sản phẩm
    const filteredProducts = products.filter(product => {
        const nameMatch = searchName === '' || product.name.toLowerCase().includes(searchName);
        const categoryMatch = categoryName === 'all' || categoryManager.getCategoryNameById(product.categoryId) === categoryName;
        return nameMatch && categoryMatch;
    });

    if (filteredProducts.length === 0) {
        priceTableBody.innerHTML = `<tr><td colspan="8" class="center">Không tìm thấy sản phẩm nào.</td></tr>`;
        return;
    }

    priceTableBody.innerHTML = ''; // Xóa nội dung cũ

    filteredProducts.forEach(product => {
        const category = categoryManager.getCategoryNameById(product.categoryId);
        
        // % Lợi nhuận thực tế
        const actualMargin = getActualSaleMarginPercent(product);
        let marginClass = 'zero';
        if (actualMargin > 0) marginClass = 'positive';
        else if (actualMargin < 0) marginClass = 'negative';

        // % Lợi nhuận mục tiêu (đã lưu)
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

    // Gắn sự kiện cho các nút Cập nhật
    attachRowEventListeners();
}

/**
 * Gắn sự kiện cho các nút "Cập nhật" trong bảng
 */
function attachRowEventListeners() {
    document.querySelectorAll('.btn-update-price').forEach(button => {
        button.addEventListener('click', handleUpdatePrice);
    });
}

/**
 * Xử lý khi nhấn nút Cập nhật
 */
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

    // Gọi phương thức mới trong ProductManager
    const success = productManager.updateProductPriceByMargin(productId, newMarginPercent);

    if (success) {
        // Cập nhật lại giá trị input để hiển thị % đã lưu
        input.value = newMarginPercent;
        alert(`Cập nhật giá bán cho sản phẩm ID ${productId} thành công!`);
        renderPriceList(); // Tải lại bảng để cập nhật Giá Bán và % Thực tế
    } else {
        alert(`Có lỗi xảy ra. Vui lòng kiểm tra giá vốn của sản phẩm (phải > 0).`);
    }
}


/**
 * Tải danh sách danh mục vào bộ lọc
 */
function loadCategoryFilter() {
    if (!priceFilterCategory) return;
    
    // Chỉ tải 1 lần
    if (categorySelectLoaded) return; 

    const categories = categoryManager.getAllCategories();
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        priceFilterCategory.appendChild(option);
    });
    categorySelectLoaded = true;
}

/**
 * Khởi tạo module Quản lý Giá
 */
export function initPriceAdmin() {
    // Cache DOM
    priceTableBody = document.getElementById('priceTableBody');
    priceFilterCategory = document.getElementById('priceFilterCategory');
    priceFilterName = document.getElementById('priceFilterName');
    priceFilterApply = document.getElementById('priceFilterApply');
    priceFilterReset = document.getElementById('priceFilterReset');

    // Gắn sự kiện cho bộ lọc
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

    // Tải danh mục cho bộ lọc (sẽ chạy khi tab được render lần đầu)
    // loadCategoryFilter(); // Bỏ ở đây, chuyển vào renderPriceList
}