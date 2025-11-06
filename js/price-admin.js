

import { productManager, categoryManager } from './admin.js';

let priceTableBody;
let priceFilterCategory;
let priceFilterName;
let priceFilterApply;
let priceFilterReset;
let categorySelectLoaded = false;

const formatCurrency = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);

function getActualSaleMarginPercent(product) {
    if (!product || product.price <= 0 || product.costPrice <= 0 || product.price < product.costPrice) {
        return 0;
    }
    const profit = product.price - product.costPrice;
    const margin = (profit / product.price) * 100;
    return margin;
}

export function renderPriceList() {
    if (!priceTableBody) priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;

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

function loadCategoryFilter() {
    if (!priceFilterCategory) return;
    

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

export function initPriceAdmin() {

    priceTableBody = document.getElementById('priceTableBody');
    priceFilterCategory = document.getElementById('priceFilterCategory');
    priceFilterName = document.getElementById('priceFilterName');
    priceFilterApply = document.getElementById('priceFilterApply');
    priceFilterReset = document.getElementById('priceFilterReset');

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

}