/**
 * cart.js
 * Quản lý logic giỏ hàng: thêm, xóa, cập nhật số lượng, tính tổng, và xử lý tồn kho.
 * Gồm các hàm: addToCart, removeCartItem, updateCartItemSize, clearCart, placeOrder.
 */

import { ProductManager } from './ProductManager.js'; 
const productManager = new ProductManager(); 

const USER_MANAGER_KEY = 'nguoiDungHienTai'; 

function getCurrentUsername() {
    try {
        const currentUserData = localStorage.getItem(USER_MANAGER_KEY);
        if (currentUserData) {
            const user = JSON.parse(currentUserData);
            return user.tenDangNhap;
        }
    } catch (e) {
        console.error("Lỗi khi đọc current user:", e);
    }
    return null;
}

export function getCart() {
    const username = getCurrentUsername();
    if (!username) {
        return [];
    }
    const cartKey = `cart_${username}`;
    try {
        const cartString = localStorage.getItem(cartKey);
        const cart = JSON.parse(cartString) || [];
        return cart.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: parseInt(item.quantity) || 0,
            itemIdentifier: item.itemIdentifier || `${item.id}-${item.size || 'N/A'}`
        }));
    } catch (e) {
        console.error("Lỗi khi tải giỏ hàng:", e);
        return [];
    }
}
window.getCart = getCart; 

function saveCart(cart) {
    const username = getCurrentUsername();
    if (!username) {
        console.warn("Không thể lưu giỏ hàng: Người dùng chưa đăng nhập.");
        return;
    }
    const cartKey = `cart_${username}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
}


// --------------------------------------------------------------------
// Xử lý biến thể và cập nhật giỏ hàng
// --------------------------------------------------------------------

function findVariant(productId, size) {
    const product = productManager.getProductById(productId);
    if (!product || !product.variants || product.variants.length === 0) {
        return null;
    }
    return product.variants.find(v => v.size.toString() === size.toString()) || null;
}

export function updateCartItemSize(oldItemIdentifier, newSize) {
    let cart = getCart();
    const oldIndex = cart.findIndex(item => item.itemIdentifier === oldItemIdentifier);

    if (oldIndex === -1) return false;

    const oldItem = cart[oldIndex];
    const newSizeStr = newSize.toString();
    const newId = oldItem.id;
    const newIdentifier = `${newId}-${newSizeStr}`;

    const existingIndex = cart.findIndex(item => item.itemIdentifier === newIdentifier);

    if (existingIndex > -1 && existingIndex !== oldIndex) {
        cart[existingIndex].quantity += oldItem.quantity;
        cart.splice(oldIndex, 1);
    } else {
        const product = productManager.getProductById(newId);
        let newPrice = product ? product.price : oldItem.price;
        
        if (product && product.variants && product.variants.length > 0) {
            const variant = findVariant(newId, newSizeStr);
            newPrice = variant ? (variant.price !== undefined ? variant.price : product.price) : product.price;
        }

        oldItem.size = newSizeStr;
        oldItem.price = Number(newPrice);
        oldItem.itemIdentifier = newIdentifier;
    }

    saveCart(cart);
    
    if (window.renderCartTable) {
        window.renderCartTable();
    }
    
    if (window.updateCartCount) {
        window.updateCartCount();
    }

    return true;
}
window.updateCartItemSize = updateCartItemSize;


// --------------------------------------------------------------------
// Các hàm tính toán và cập nhật cơ bản
// --------------------------------------------------------------------

export function calculateCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 0)), 0);
}
window.calculateCartTotal = calculateCartTotal; 

export function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    const countElement = document.querySelector('.cart-count');
    
    if (countElement) {
        const currentCount = parseInt(countElement.textContent) || 0; 
        
        countElement.textContent = totalCount;
        countElement.style.display = totalCount > 0 ? 'flex' : 'none'; 
        
        if (totalCount > currentCount || (totalCount > 0 && currentCount === 0)) {
            const iconWrapper = countElement.closest('.cart-icon-wrapper');
            if (iconWrapper) { 
                iconWrapper.classList.remove('bounce');
                void iconWrapper.offsetWidth; 
                iconWrapper.classList.add('bounce');
                setTimeout(() => iconWrapper.classList.remove('bounce'), 600);
            }
        }
    }
}
window.updateCartCount = updateCartCount; 


// --------------------------------------------------------------------
// Thêm sản phẩm vào giỏ và xử lý tồn kho
// --------------------------------------------------------------------

export function addToCart(productId, name, price, img, size, color, quantity = 1) { 
    const username = getCurrentUsername();
    if (!username) {
        if (window.openLoginModal) {
            window.openLoginModal();
        }
        return false;
    }
    
    let priceString = String(price);
    priceString = priceString.replace(/[^\d]/g, ''); 
    const safePrice = parseInt(priceString) || 0; 
    
    if (safePrice > 10000000000) { 
        console.error("Lỗi: Giá trị sản phẩm có vẻ bị nhân đôi. Vui lòng xóa Local Storage thủ công.");
        return false; 
    }
    
    const safeQuantity = parseInt(quantity) || 1;
    const product = productManager.getProductById(productId);
    const hasVariants = product && product.variants && product.variants.length > 0;

    let safeSize;
    let sizeForStockUpdate = null; 

    if (hasVariants) {
        safeSize = (size === null || size === 'Chưa chọn' || size === undefined) ? 'Chưa chọn' : String(size); 
        if (safeSize !== 'Chưa chọn') {
            sizeForStockUpdate = safeSize;
        }
    } else {
        safeSize = 'N/A';
    }
    const safeColor = color || 'N/A';

    let stockDecreased = false;
    
    if (safeSize !== 'Chưa chọn') {
        stockDecreased = productManager.decreaseStock(
            productId, 
            safeQuantity, 
            safeSize === 'N/A' ? null : Number(safeSize)
        );
    } else {
        stockDecreased = true;
    }

    if (stockDecreased) {
        let cart = getCart();
        const itemIdentifier = `${productId}-${safeSize}`; 
        const existingItemIndex = cart.findIndex(
            item => item.itemIdentifier === itemIdentifier
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += safeQuantity;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: safePrice, 
                img: img,
                size: safeSize, 
                color: safeColor, 
                quantity: safeQuantity,
                itemIdentifier: itemIdentifier
            });
        }
        
        saveCart(cart);
        
        if (window.updateCartCount) {
            window.updateCartCount();
        }
        
        if (window.updateProductStockUI) {
            window.updateProductStockUI(); 
        }
        
        return true;
    }
    
    console.error("Lỗi: Giảm tồn kho thất bại. Có thể do hết hàng.");
    return false;
}
window.addToCart = addToCart;

export function updateCartItemQuantity(itemIdentifier, newQuantity) {
    let cart = getCart();
    const item = cart.find(i => i.itemIdentifier === itemIdentifier);

    if (item) {
        item.quantity = Number(newQuantity);
        if (item.quantity < 1) {
            removeCartItem(itemIdentifier);
        } else {
            saveCart(cart);
        }
    }
    if (window.updateCartCount) window.updateCartCount();
    if (window.renderCartTable) window.renderCartTable();
}
window.updateCartItemQuantity = updateCartItemQuantity;

export function removeCartItem(itemIdentifier) {
    let cart = getCart();
    const initialLength = cart.length;
    
    cart = cart.filter(i => i.itemIdentifier !== itemIdentifier);
    
    if (cart.length < initialLength) {
        saveCart(cart);
    }
    if (window.updateCartCount) window.updateCartCount();
    if (window.renderCartTable) window.renderCartTable();
}
window.removeCartItem = removeCartItem;


export function clearCart() { 
    const username = getCurrentUsername();
    if (username) {
        localStorage.removeItem(`cart_${username}`);
    }
    if (window.updateCartCount) window.updateCartCount();
    if (window.renderCartTable) window.renderCartTable(); 
}
window.clearCart = clearCart; 


// --------------------------------------------------------------------
// Hiển thị chọn kích cỡ trong giỏ hàng
// --------------------------------------------------------------------

export function renderSizeSelector(cartItem) {
    const product = productManager.getProductById(cartItem.id);
    
    if (!product || !product.variants || product.variants.length === 0) {
        if (cartItem.size === 'N/A') {
            return '';
        }
        return `Size: ${cartItem.size}`; 
    }
    
    const uniqueSizes = [...new Set(product.variants.map(v => v.size.toString()))];
    let html = `<select class="cart-size-selector form-select form-select-sm" data-id="${cartItem.itemIdentifier}">`;
    const isSizeMissing = cartItem.size === 'Chưa chọn';
    if (isSizeMissing) {
        html += `<option value="Chưa chọn" selected disabled>-- Chọn Size --</option>`;
    }
    uniqueSizes.forEach(size => {
        const variant = findVariant(cartItem.id, size);
        const stock = variant ? (variant.stock || 0) : 0;
        const disabled = stock <= 0 ? 'disabled' : '';
        const selected = !isSizeMissing && cartItem.size.toString() === size.toString() ? 'selected' : '';
        const stockText = stock <= 0 ? ' (Hết hàng)' : '';
        html += `<option value="${size}" ${selected} ${disabled}>${size} ${stockText}</option>`;
    });
    html += `</select>`;
    if (isSizeMissing) {
        html += `<div class="text-danger mt-1 small">Bắt buộc chọn Size</div>`;
    }
    return html;
}
window.renderSizeSelector = renderSizeSelector;

export function handleCartTableEvents() {
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-size-selector')) {
            const selectEl = e.target;
            const oldIdentifier = selectEl.dataset.id;
            const newSize = selectEl.value;
            
            if (newSize !== 'Chưa chọn') {
                updateCartItemSize(oldIdentifier, newSize);
            }
        }
    });
}
window.handleCartTableEvents = handleCartTableEvents;

export function checkCartBeforeCheckout() {
    const cart = getCart();
    
    // Check for missing size
    const missingSizeItem = cart.find(item => item.size === 'Chưa chọn');
    if (missingSizeItem) {
        alert(`Vui lòng chọn Kích cỡ cho sản phẩm: "${missingSizeItem.name}" trước khi thanh toán.`);
        return false;
    }
    
    // Check for missing color (if product has colors)
    const missingColorItem = cart.find(item => {
        const product = productManager.getProductById(item.id);
        // If product has colors defined and item color is not selected, block checkout
        return product && product.colors && product.colors.length > 0 && 
               (item.color === 'Chưa chọn' || item.color === 'N/A' || !item.color);
    });
    
    if (missingColorItem) {
        alert(`Vui lòng chọn Màu sắc cho sản phẩm: "${missingColorItem.name}" trước khi thanh toán.`);
        return false;
    }
    
    return true;
}
window.checkCartBeforeCheckout = checkCartBeforeCheckout;


// --------------------------------------------------------------------
// Xử lý đặt hàng (checkout)
// --------------------------------------------------------------------

export function placeOrder(orderData) {
    if (!window.checkCartBeforeCheckout()) {
        return false;
    }
    
    const newOrder = {
        ...orderData,
        id: `ORD-${Date.now()}`
    };
    
    console.log("Đơn hàng đã được đặt thành công!");

    window.clearCart(); 

    if (window.updateProductStockUI) {
        window.updateProductStockUI(); 
    }
    
    return newOrder; 
}
window.placeOrder = placeOrder; 

updateCartCount();
handleCartTableEvents();
