import { ProductManager } from './ProductManager.js'; 
import { initializeProductDetailPage } from './product-detail-logic.js'; 

const productManager = new ProductManager();

function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}

function renderProductDetail(product) {
    const detailContainer = document.getElementById('product-detail');
    if (!detailContainer) return;

    const variants = product.variants || [];
    const uniqueSizes = [...new Set(variants.map(v => v.size))].filter(s => s);
    const uniqueColors = [...new Set(variants.map(v => v.color))].filter(c => c);
    
    const hasSizes = uniqueSizes.length > 0; 
    const hasColors = uniqueColors.length > 0;
    const hasAnyVariant = hasSizes || hasColors; 

    const sizeOptionsHtml = uniqueSizes.map(size => 
        `<button type="button" class="size-option" data-size="${escapeHtml(size)}">${escapeHtml(size)}</button>`
    ).join('');

    const colorOptionsHtml = uniqueColors.map(color => {
        let displayColor = color;
        if (color.includes('/')) {
            displayColor = color.split('/')[0].trim();
        }
        
        return `<button type="button" class="color-option" data-color="${escapeHtml(color)}" 
                        style="background-color: ${escapeHtml(displayColor.toLowerCase())};" 
                        title="${escapeHtml(color)}">
                </button>`;
    }).join('');
    
    // === SỬA LỖI HIỂN THỊ (LẤY TỪ FILE search-overlay) ===
    // Sửa lại hàm này để nó không gọi hàm của class
    const formattedPrice = (product.price || 0).toLocaleString('vi-VN') + ' ₫';
    const isOnSale = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);
    const oldPriceHtml = isOnSale ? 
        `<span id="product-old-price" class="old-price">${(product.oldPrice || 0).toLocaleString('vi-VN')} ₫</span>` : '';
    // === KẾT THÚC SỬA ===

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
                        ${formattedPrice}
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
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng  </button>
            </div>
        </div>
        
        <div class="product-description-full">
            <h2>Mô tả sản phẩm</h2>
            <p>${(product.description || 'Sản phẩm đang được cập nhật mô tả chi tiết.').replace(/\n/g, '<br>')}</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {

    // === SỬA LỖI: BỌC TRONG SETTIMEOUT ===
    // Thêm độ trễ 50ms để productManager kịp tải dữ liệu
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = Number(urlParams.get('id')); 

        const detailContainer = document.getElementById('product-detail');
        if (!detailContainer) return;

        if (productId && !isNaN(productId)) {

            // Bây giờ hàm này sẽ tìm thấy sản phẩm
            const product = productManager.getProductById(productId);

            if (product) {
                renderProductDetail(product); 
                
                const detailLogic = initializeProductDetailPage(productId, productManager);
                window.updateProductStockUI = detailLogic.updateStock;
                
            } else {
                detailContainer.innerHTML = 
                    '<h2 class="error-msg" style="text-align: center; padding: 50px;">❌ Rất tiếc! Không tìm thấy sản phẩm có ID: ' + productId + '.</h2>';
            }
        } else {
            detailContainer.innerHTML = 
                '<h2 class="error-msg" style="text-align: center; padding: 50px;">Vui lòng truy cập trang chi tiết sản phẩm bằng đường dẫn hợp lệ (ví dụ: product-detail.html?id=1).</h2>';
        }
    }, 50); // 50ms là đủ
});