

import { CHECKOUT_OVERLAY_HTML } from './checkout-modal-html.js';

let checkoutOverlay = null;

let orderDataCache = {}; 

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

function injectCheckoutOverlay() {
    if (document.getElementById('checkout-overlay')) return; 
    document.body.insertAdjacentHTML('beforeend', CHECKOUT_OVERLAY_HTML);
}

function initializeCheckoutDom() {
    injectCheckoutOverlay(); 
    checkoutOverlay = document.getElementById('checkout-overlay');
    

    setupEventListeners(); 
}

function showStep(stepName) {
    const steps = [
        { name: 'shipping', id: 'step-shipping' }, 
        { name: 'payment', id: 'step-payment' }, 
        { name: 'review', id: 'step-review' }, 
        { name: 'success', id: 'order-success-message' } 
    ];
    
    steps.forEach(step => {
        const el = document.getElementById(step.id); 
        if (el) el.style.display = (step.name === stepName) ? 'block' : 'none';
    });

    if (checkoutOverlay && !checkoutOverlay.classList.contains('open')) {
        checkoutOverlay.classList.add('open');
    }
}
window.showStep = showStep;

export function openCheckoutModal() {
    if (!checkoutOverlay) initializeCheckoutDom(); 
    
    const kiemTraDangNhap = window.kiemTraDangNhap;
    const getCart = window.getCart;
    const checkCartBeforeCheckout = window.checkCartBeforeCheckout;
    

    if (typeof kiemTraDangNhap !== 'function') {
        console.error("LỖI: Thiếu hàm window.kiemTraDangNhap. Đảm bảo file user.js đã được tải.");
        alert("Lỗi hệ thống: Chức năng người dùng chưa được tải. Vui lòng thử lại sau.");
        return;
    }
    
    const user = kiemTraDangNhap();
    if (!user || !user.tenDangNhap) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán và lưu lịch sử đơn hàng.");
        if (window.showLoginModal) window.showLoginModal();
        return; 
    }
    
    if (!getCart || getCart().length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm.");
        return;
    }

    if (typeof checkCartBeforeCheckout === 'function' && !checkCartBeforeCheckout()) {
        return; 
    }

    if (window.closeCartModal) {
        window.closeCartModal(); 
    }
    

    showStep('shipping'); 
    

    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');

    if(fullNameEl) fullNameEl.value = user.hoTen || "";
    if(emailEl) emailEl.value = user.email || "";
    if(phoneEl) phoneEl.value = phoneEl.value || ""; 
    

    if(document.getElementById('address')) document.getElementById('address').value = document.getElementById('address').value || "123 Đường Bàn Cờ";
    if(document.getElementById('district')) document.getElementById('district').value = document.getElementById('district').value || "Quận 3"; 
    if(document.getElementById('province')) document.getElementById('province').value = document.getElementById('province').value || "TP. Hồ Chí Minh"; 

    if (checkoutOverlay) {
        checkoutOverlay.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
        requestAnimationFrame(() => checkoutOverlay.classList.add('open')); 
    }
}
window.openCheckoutModal = openCheckoutModal; 

export function closeCheckoutModal() {
    if (checkoutOverlay) {
        checkoutOverlay.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
            checkoutOverlay.style.display = 'none';
        }, 300); 
    }
}
window.closeCheckoutModal = closeCheckoutModal; 

function handleContinueToPayment(e) {
    e.preventDefault();
    const form = document.getElementById('shipping-form');
    
    if (form && form.checkValidity()) {
        showStep('payment');
    } else if (form) {
        form.reportValidity();
    }
}

function handleContinueToReview(e) {
    e.preventDefault();
    
    const getCart = window.getCart; 
    const calculateCartTotal = window.calculateCartTotal; 
    const kiemTraDangNhap = window.kiemTraDangNhap; 
    
    const selectedPaymentEl = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPaymentEl) {
        alert("Vui lòng chọn một phương thức thanh toán!");
        return;
    }

    const shippingInfo = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email')?.value || kiemTraDangNhap()?.email || 'N/A',
        phone: document.getElementById('phone').value,
        address: `${document.getElementById('address').value}, ${document.getElementById('district').value}, ${document.getElementById('province').value}`,
        notes: document.getElementById('notes').value
    };
    const selectedPaymentMethod = selectedPaymentEl.value;
    const cartItems = getCart();
    const totalAmount = calculateCartTotal(); 

    const user = kiemTraDangNhap();
    const userId = user ? user.tenDangNhap : 'Guest-Error';

    orderDataCache = {
        shippingInfo,
        paymentMethod: selectedPaymentMethod,
        items: cartItems,
        total: totalAmount,
        orderDate: new Date().toLocaleDateString('vi-VN'),
        date: new Date().toISOString(),
        userId: userId
    };
    

    showStep('review'); 
    

    updateReviewStep(shippingInfo, selectedPaymentMethod, cartItems, totalAmount);
}

function handleFinalPlaceOrder() {
    
    const placeOrder = window.placeOrder;

    if (typeof placeOrder !== 'function') {
        console.error("LỖI: Thiếu hàm window.placeOrder. Vui lòng kiểm tra file cart.js."); 
        alert("Lỗi: Chức năng lưu đơn hàng chưa được tải. Vui lòng kiểm tra file cart.js.");
        return;
    }
    

    const reviewContentEl = document.getElementById('review-content');
    const orderProcessingEl = document.getElementById('order-processing-message');
    if (reviewContentEl) reviewContentEl.style.display = 'none'; 
    if (orderProcessingEl) orderProcessingEl.style.display = 'block'; 
    
    

    const newOrder = placeOrder(orderDataCache); 

    setTimeout(() => {
        
        if (orderProcessingEl) orderProcessingEl.style.display = 'none';

        if (newOrder && typeof newOrder === 'object' && Array.isArray(newOrder.items)) { 

            updateSuccessStep(newOrder); 
            showStep('success'); 
            

            orderDataCache = {};
            
        } else {

            console.error("Đặt hàng thất bại: Hàm placeOrder không trả về đối tượng đơn hàng hợp lệ."); 
            alert("Đã xảy ra lỗi khi đặt hàng hoặc giỏ hàng đã bị xóa bất ngờ. Vui lòng thử lại.");

            if(reviewContentEl) reviewContentEl.style.display = 'block'; 
        }

    }, 1000);
}

function updateReviewStep(shippingInfo, paymentMethod, cartItems, totalAmount) {
    if(!cartItems || cartItems.length === 0) return;
    

    const reviewContentEl = document.getElementById('review-content');
    const orderProcessingEl = document.getElementById('order-processing-message');
    
    if (reviewContentEl) reviewContentEl.style.display = 'block'; 
    if (orderProcessingEl) orderProcessingEl.style.display = 'none'; 
    

    const reviewAddressEl = document.getElementById('review-address-info');
    if(reviewAddressEl) {
        reviewAddressEl.innerHTML = 
            `<strong>${shippingInfo.fullName}</strong> (${shippingInfo.email || 'N/A'}) - ${shippingInfo.phone}<br>${shippingInfo.address}<br>
            ${shippingInfo.notes ? `<p class="review-note">Ghi chú: <em>${shippingInfo.notes}</em></p>` : ''}`;
    }
    

    let paymentText = "Thanh Toán Khi Nhận Hàng (COD)";
    if (paymentMethod === 'BANK_TRANSFER') paymentText = "Chuyển Khoản Ngân Hàng";
    else if (paymentMethod === 'ONLINE_PAYMENT') paymentText = "Thanh Toán Trực Tuyến (Không khả dụng)";
    if(document.getElementById('review-payment-method')) document.getElementById('review-payment-method').textContent = paymentText;
    

    let itemsHtml = cartItems.map(item => {
        const safeQuantity = parseInt(item.quantity) || 1;

        const displaySize = (item.size && item.size !== 'N/A') ? `Size: ${item.size}` : '';
        return `
            <div class="review-item">
                <p class="review-item-name">${item.name} ${displaySize ? `(${displaySize})` : ''}</p>
                <p class="review-item-qty-price">${safeQuantity} x ${formatCurrency(item.price)}</p>
            </div>
        `;
    }).join('');
    
    if(document.getElementById('review-cart-items')) document.getElementById('review-cart-items').innerHTML = itemsHtml;

    if(document.getElementById('review-total-price')) document.getElementById('review-total-price').textContent = formatCurrency(totalAmount);
}

function updateSuccessStep(orderData) {
    if (!orderData || !Array.isArray(orderData.items)) return;

    const orderIdEl = document.getElementById('success-order-id');
    if (orderIdEl) orderIdEl.textContent = orderData.id;

    const orderTotalEl = document.getElementById('success-order-total');
    if (orderTotalEl) orderTotalEl.textContent = formatCurrency(orderData.total);
    

    const orderDateEl = document.getElementById('success-order-date');

    if (orderDateEl) orderDateEl.textContent = orderData.orderDate; 

    let itemsHtml = orderData.items.map(item => {
        const safeQuantity = parseInt(item.quantity) || 1;

        const displaySize = (item.size && item.size !== 'N/A') ? `Size: ${item.size}` : '';
        return `
            <div class="review-item">
                <p class="review-item-name">${item.name} ${displaySize ? `(${displaySize})` : ''}</p>
                <p class="review-item-qty-price">${safeQuantity} x ${formatCurrency(item.price)}</p>
            </div>
        `;
    }).join('');
    
    const successItemsEl = document.getElementById('success-cart-items');
    if(successItemsEl) successItemsEl.innerHTML = itemsHtml;
}

function setupEventListeners() {
    if (!checkoutOverlay) return; 
    
    const closeBtn = document.getElementById('close-checkout-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);

    const continuePaymentBtn = document.getElementById('continue-payment-btn');
    if (continuePaymentBtn) continuePaymentBtn.addEventListener('click', handleContinueToPayment);
    
    const continueReviewBtn = document.getElementById('continue-review-btn');
    if (continueReviewBtn) continueReviewBtn.addEventListener('click', handleContinueToReview);
    
    const backShippingBtn = document.getElementById('back-shipping-btn');
    if (backShippingBtn) backShippingBtn.addEventListener('click', () => showStep('shipping'));
    
    const backPaymentBtn = document.getElementById('back-payment-btn');
    if (backPaymentBtn) backPaymentBtn.addEventListener('click', () => showStep('payment')); 

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) placeOrderBtn.addEventListener('click', handleFinalPlaceOrder); 
    
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCheckoutModal);
    

    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) {
            closeCheckoutModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    if (!checkoutOverlay) {
        initializeCheckoutDom();
    }
});