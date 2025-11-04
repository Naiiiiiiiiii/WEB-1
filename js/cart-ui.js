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
    
    // SỬA LỖI:
    // 1. Dùng 'item.img' thay vì 'item.product.images[0]'
    // 2. Dùng 'item.name' thay vì 'item.product.name'
    // 3. Dùng 'item.price' thay vì 'item.unitPrice'
    // 4. Dùng 'item.itemIdentifier' trong data-set để quản lý thay đổi
    // 5. Dùng 'item.price' để tính subtotal
    // Format color display - hide if N/A or show warning if not selected
    let colorDisplay = '';
    if (item.color && item.color !== 'N/A') {
        if (item.color === 'Chưa chọn') {
            colorDisplay = `<p><small>Màu sắc: <span style="color: #dc3545;">${item.color} ⚠️</span></small></p>`;
        } else {
            colorDisplay = `<p><small>Màu sắc: ${item.color}</small></p>`;
        }
    }
    
    row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="item-img">
        <div class="item-details">
            <h4 class="item-name">${item.name}</h4>
            <div class="item-meta">
                <p><small>Kích cỡ: ${renderSizeSelector(item)}</small></p>
                ${colorDisplay}
            </div>
            <p class="item-price">${formatCurrency(item.price)}</p>
        </div>
        <div class="item-controls">
            <div class="quantity-control">
                <button class="quantity-decrease" data-identifier="${item.itemIdentifier}">-</button>
                <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-identifier="${item.itemIdentifier}">
                <button class="quantity-increase" data-identifier="${item.itemIdentifier}">+</button>
            </div>
            <button class="item-remove" data-identifier="${item.itemIdentifier}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="item-subtotal">${formatCurrency(item.quantity * item.price)}</div>
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
    // SỬA LỖI: Lấy 'itemIdentifier' từ 'data-identifier'
    const itemIdentifier = target.dataset.identifier;
    if (!itemIdentifier) return;

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
    
    // SỬA LỖI: Gọi hàm updateCartItemQuantity với 2 tham số (theo file cart.js)
    updateCartItemQuantity(itemIdentifier, newQuantity);
    
    // Các hàm render/update count đã được gọi bên trong 'updateCartItemQuantity' từ cart.js
}

function handleRemoveItem(e) {
    const target = e.target.closest('.item-remove');
    if (!target) return;
    
    // SỬA LỖI: Lấy 'itemIdentifier' từ 'data-identifier'
    const itemIdentifier = target.dataset.identifier;
    if (!itemIdentifier) return;
    
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        // SỬA LỖI: Gọi hàm removeCartItem với 1 tham số (theo file cart.js)
        removeCartItem(itemIdentifier);
        
        // Các hàm render/update count đã được gọi bên trong 'removeCartItem' từ cart.js
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
    cartOverlay.style.display = 'flex'; // Set display style for robustness
    document.body.style.overflow = 'hidden'; 
}

function closeCartModal() {
    if (!cartOverlay) initializeCartDom();
    cartOverlay.classList.remove('open');
    cartOverlay.style.display = 'none'; // Explicitly set display to none
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