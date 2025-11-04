/**
 * product-detail.js - Logic hiển thị chi tiết sản phẩm trên trang product-detail.html
 */

import { ProductManager } from './ProductManager.js'; 
// Import hàm khởi tạo mới
import { initializeProductDetailPage } from './product-detail-logic.js'; 

const productManager = new ProductManager();

// Helper function để ngăn chặn XSS
function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}

// ===============================================
// HÀM RENDER HTML 
// ===============================================
function renderProductDetail(product) {
    const detailContainer = document.getElementById('product-detail');
    if (!detailContainer) return;

    // Chuẩn bị danh sách Size và Màu duy nhất cho nút bấm
    const variants = product.variants || [];
    const uniqueSizes = [...new Set(variants.map(v => v.size))].filter(s => s);
    // Use product.colors array if available, otherwise fall back to variants
    const uniqueColors = product.colors && product.colors.length > 0 
        ? product.colors 
        : [...new Set(variants.map(v => v.color))].filter(c => c);
    
    const hasSizes = uniqueSizes.length > 0; 
    const hasColors = uniqueColors.length > 0;
    const hasAnyVariant = hasSizes || hasColors; 

    // Tạo HTML cho nút Size
    const sizeOptionsHtml = uniqueSizes.map(size => 
        `<button type="button" class="size-option" data-size="${escapeHtml(size)}">${escapeHtml(size)}</button>`
    ).join('');

    // Tạo HTML cho nút Color
    const colorOptionsHtml = uniqueColors.map(color => {
        // Map Vietnamese color names to CSS colors
        const colorMap = {
            'Trắng': 'white',
            'Đen': 'black',
            'Xám': 'gray',
            'Nâu': 'brown',
            'Xanh navy': 'navy',
            'Đỏ': 'red',
            'Xanh': 'blue'
        };
        
        let displayColor = colorMap[color] || color.toLowerCase();
        
        return `<button type="button" class="color-option" data-color="${escapeHtml(color)}" 
                             style="background-color: ${escapeHtml(displayColor)}; ${displayColor === 'white' ? 'border: 1px solid #ddd;' : ''}" 
                             title="${escapeHtml(color)}">
                           </button>`;
    }).join('');
    
    // HTML giá cũ (nếu có)
    const oldPriceHtml = product.oldPrice && product.isOnSale() ? 
        `<span id="product-old-price" class="old-price">${product.getFormattedOldPrice()}</span>` : '';

    // RENDER TOÀN BỘ CẤU TRÚC SẢN PHẨM VÀO #product-detail
    detailContainer.innerHTML = `
        <div class="product-detail-content">
            <div class="product-gallery">
                <img src="${escapeHtml(product.img || './img/default.avif')}" alt="${escapeHtml(product.name)}" class="main-product-img">
            </div>
            
            <div class="product-summary">
                <h1 class="product-name">${escapeHtml(product.name)}</h1>
                <p class="product-category">Danh mục: ${escapeHtml(product.category || 'Chưa phân loại')}</p>
                
                <div class="price-section">
                    <span id="product-price" class="current-price" data-price="${product.price}">
                        ${product.getFormattedPrice()}
                    </span>
                    ${oldPriceHtml}
                </div>

                ${hasAnyVariant ? `
                    <div class="variant-selection">
                        
                        ${hasSizes ? `
                            <h3>Kích cỡ:</h3>
                            <div class="size-options-group">${sizeOptionsHtml}</div>
                        ` : ''}

                        ${hasColors ? `
                            <h3>Màu sắc:</h3>
                            <div class="color-options-group">${colorOptionsHtml}</div>
                        ` : ''}

                    </div>
                ` : '<div class="variant-selection"><p>Sản phẩm này không có biến thể size/màu.</p></div>'}


                <p id="product-stock-status" class="status-warning">${hasSizes ? 'Vui lòng chọn Kích cỡ' : 'Đang kiểm tra tồn kho...'}</p> 
                
                <div class="quantity-control">
                    <button id="decreaseQty" class="qty-btn" type="button">-</button>
                    <input type="number" id="qtyInput" value="1" min="1" max="99" readonly>
                    <button id="increaseQty" class="qty-btn" type="button">+</button>
                </div>
                
                <button id="buyNowBtn" class="buy-now-btn btn-primary" type="button">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng  </button>
            </div>
        </div>
        
        <div class="product-description-full">
            <h2>Mô tả sản phẩm</h2>
            <p>${escapeHtml(product.description || 'Sản phẩm đang được cập nhật mô tả chi tiết.')}</p>
        </div>
    `;
}

// ===============================================
// LOGIC KHỞI TẠO (ĐỌC ID TỪ URL)
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy tham số ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get('id')); 

    const detailContainer = document.getElementById('product-detail');
    if (!detailContainer) return;

    if (productId && !isNaN(productId)) {
        // 2. Tìm sản phẩm
        const product = productManager.getProductById(productId);

        if (product) {
            // 3. Render HTML chi tiết sản phẩm
            renderProductDetail(product); 
            
            // 4. Gắn logic tương tác SAU KHI HTML đã được RENDER
            // Truyền productId và productManager instance
            const detailLogic = initializeProductDetailPage(productId, productManager);
            window.updateProductStockUI = detailLogic.updateStock;
            
        } else {
            // ID có nhưng không tìm thấy
            detailContainer.innerHTML = 
                '<h2 class="error-msg" style="text-align: center; padding: 50px;">❌ Rất tiếc! Không tìm thấy sản phẩm có ID: ' + productId + '.</h2>';
        }
    } else {
        // Không có ID hoặc ID không hợp lệ
        detailContainer.innerHTML = 
            '<h2 class="error-msg" style="text-align: center; padding: 50px;">Vui lòng truy cập trang chi tiết sản phẩm bằng đường dẫn hợp lệ (ví dụ: product-detail.html?id=1).</h2>';
    }
});