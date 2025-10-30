import { 
    getCart, 
    updateCartItemQuantity, 
    removeCartItem, 
    clearCart, 
    updateCartCount, 
    calculateCartTotal,
    renderSizeSelector,
    checkCartBeforeCheckout
} from './cart.js'; 

window.renderCartTable = renderCart; 

let cartOverlay = null;
let cartItemsContainer = null;
let cartTotalEl = null;
let emptyMessage = null;
let closeBtn = null;

function initializeCartDom() {
    cartOverlay = document.getElementById('cart-overlay');
    cartItemsContainer = document.getElementById('cart-items-container');
    cartTotalEl = document.getElementById('cart-total');
    emptyMessage = document.getElementById('empty-cart-message');
    closeBtn = document.getElementById('close-cart-btn');
}

/**
 * @description Hàm tiện ích: Format tiền tệ
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function createCartItemRow(item) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    
    row.innerHTML = `
        <img src="${item.product.images[0]}" alt="${item.product.name}" class="item-img">
        <div class="item-details">
            <h4 class="item-name">${item.product.name}</h4>
            <div class="item-meta">
                <p><small>Kích cỡ: ${renderSizeSelector(item)}</small></p>
                <p><small>Màu sắc: ${item.color}</small></p>
            </div>
            <p class="item-price">${formatCurrency(item.unitPrice)}</p>
        </div>
        <div class="item-controls">
            <div class="quantity-control">
                <button class="quantity-decrease" data-product-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">-</button>
                <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-product-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">
                <button class="quantity-increase" data-product-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">+</button>
            </div>
            <button class="item-remove" data-product-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="item-subtotal">${formatCurrency(item.quantity * item.unitPrice)}</div>
    `;

    // Gắn sự kiện tăng/giảm số lượng
    row.querySelector('.quantity-decrease').addEventListener('click', (e) => handleQuantityChange(e, -1));
    row.querySelector('.quantity-increase').addEventListener('click', (e) => handleQuantityChange(e, 1));
    row.querySelector('.item-quantity').addEventListener('change', (e) => handleQuantityChange(e, 0));
    
    // Gắn sự kiện xóa
    row.querySelector('.item-remove').addEventListener('click', (e) => handleRemoveItem(e));

    return row;
}

function handleQuantityChange(e, delta) {
    const target = e.target;
    const productId = target.dataset.productId;
    const size = target.dataset.size;
    const color = target.dataset.color;
    let newQuantity;

    if (delta !== 0) {
        // Tăng giảm từ nút
        const inputEl = target.parentElement.querySelector('.item-quantity');
        let currentQuantity = parseInt(inputEl.value);
        newQuantity = Math.max(1, currentQuantity + delta); 
        inputEl.value = newQuantity; 
    } else {
        // Thay đổi trực tiếp từ input
        newQuantity = parseInt(target.value);
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
            target.value = 1; 
        }
    }
    
    updateCartItemQuantity(productId, size, color, newQuantity);
    renderCart();
    updateCartCount();
}

function handleRemoveItem(e) {
    const target = e.target.closest('.item-remove');
    if (!target) return;
    
    const productId = target.dataset.productId;
    const size = target.dataset.size;
    const color = target.dataset.color;
    
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        removeCartItem(productId, size, color);
        renderCart(); 
        updateCartCount(); 
    }
}


function renderCart() {
    if (!cartItemsContainer || !cartTotalEl || !emptyMessage) {
        initializeCartDom();
    }
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyMessage.style.display = 'block';
        cartTotalEl.textContent = formatCurrency(0);
        document.getElementById('clear-cart-btn').style.display = 'none';
        document.getElementById('checkout-btn').style.display = 'none';
        return;
    }

    emptyMessage.style.display = 'none';
    document.getElementById('clear-cart-btn').style.display = 'inline-block';
    document.getElementById('checkout-btn').style.display = 'inline-block';
    
    cartItemsContainer.innerHTML = ''; 

    cart.forEach(item => {
        const row = createCartItemRow(item);
        cartItemsContainer.appendChild(row);
    });

    const total = calculateCartTotal();
    cartTotalEl.textContent = formatCurrency(total);
}

function openCartModal() {
    if (!cartOverlay) initializeCartDom();
    renderCart();
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; 
}

function closeCartModal() {
    if (!cartOverlay) initializeCartDom();
    cartOverlay.classList.remove('open');
    document.body.style.overflow = 'auto'; 
}

// Export functions to window for global access
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;

// Gắn sự kiện đóng/mở
document.addEventListener('DOMContentLoaded', () => {
    if (!closeBtn) initializeCartDom(); 

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartModal);
    }

    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
                clearCart();
                renderCart();
                updateCartCount();
                alert("Đã xóa toàn bộ giỏ hàng.");
            }
        });
    }

    const cartIconLink = document.querySelector('.nav-icons a[href="#cart"]');
    if (cartIconLink) {
        cartIconLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.kiemTraDangNhap && window.kiemTraDangNhap(true)) {
                openCartModal();
            }
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                closeCartModal();
            }
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
             checkoutBtn.addEventListener('click', () => {
                if (getCart && getCart().length === 0) {
                    alert("Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm.");
                    return;
                }
                
                if (checkCartBeforeCheckout && !checkCartBeforeCheckout()) {
                    return; 
                }

                if (window.openCheckoutModal) {
                    window.openCheckoutModal();
                    closeCartModal();
                } else {
                    console.error("Lỗi: Hàm window.openCheckoutModal chưa được định nghĩa.");
                    alert("Chức năng Thanh toán đang được phát triển.");
                }
            });
    }
});