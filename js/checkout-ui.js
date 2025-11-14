import { CHECKOUT_OVERLAY_HTML } from './checkout-modal-html.js';

let checkoutOverlay = null;
let orderDataCache = {};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

function injectCheckoutOverlay() {
    if (document.getElementById('checkout-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', CHECKOUT_OVERLAY_HTML);
}

function setupEventListeners() {
    if (!checkoutOverlay) return;

    const closeBtn = document.getElementById('close-checkout-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);

    const continuePaymentBtn = document.getElementById('continue-payment-btn');
    if (continuePaymentBtn) continuePaymentBtn.addEventListener('click', handleContinueToPayment);

    // ALSO attach to form submit to handle Enter key or other submits
    const shippingForm = document.getElementById('shipping-form');
    if (shippingForm) {
        shippingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleContinueToPayment(e);
        });
    }

    const continueReviewBtn = document.getElementById('continue-review-btn');
    if (continueReviewBtn) continueReviewBtn.addEventListener('click', handleContinueToReview);

    const backShippingBtn = document.getElementById('back-shipping-btn');
    if (backShippingBtn) backShippingBtn.addEventListener('click', () => showStep('shipping'));

    const backPaymentBtn = document.getElementById('back-payment-btn');
    if (backPaymentBtn) backPaymentBtn.addEventListener('click', () => showStep('payment'));

    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) placeOrderBtn.addEventListener('click', handleFinalPlaceOrder);

    // Radio changes: show/hide bank info
    document.addEventListener('change', (ev) => {
        const t = ev.target;
        if (!t) return;
        if (t.name === 'paymentMethod') {
            const bankInfo = document.getElementById('bank-transfer-info');
            if (bankInfo) bankInfo.style.display = (t.value === 'BANK_TRANSFER') ? 'block' : 'none';
        }
    });

    // click outside to close
    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) closeCheckoutModal();
    });
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
    ];

    steps.forEach(step => {
        const el = document.getElementById(step.id);
        if (el) el.style.display = (step.name === stepName) ? 'block' : 'none';
    });

    if (checkoutOverlay && !checkoutOverlay.classList.contains('open')) {
        checkoutOverlay.classList.add('open');
    }
}

export function openCheckoutModal() {
    if (!checkoutOverlay) initializeCheckoutDom();

    const kiemTraDangNhap = window.kiemTraDangNhap;
    const getCart = window.getCart;
    const checkCartBeforeCheckout = window.checkCartBeforeCheckout;

    if (typeof kiemTraDangNhap !== 'function') {
        console.error("LỖI: Thiếu hàm window.kiemTraDangNhap.");
        alert("Lỗi hệ thống: chức năng người dùng chưa sẵn sàng.");
        return;
    }

    const user = kiemTraDangNhap();
    if (!user || !user.tenDangNhap) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán.");
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

    if (window.closeCartModal) window.closeCartModal();

    showStep('shipping');

    // Prefill user info if inputs present
    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');

    if (fullNameEl) fullNameEl.value = user.hoTen || '';
    if (emailEl) emailEl.value = user.email || '';
    if (phoneEl) phoneEl.value = phoneEl.value || '';

    if (document.getElementById('address')) document.getElementById('address').value = document.getElementById('address').value || '123 Đường Bàn Cờ';

    // ensure radio state triggers bank info visibility
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPayment) {
        const bankInfo = document.getElementById('bank-transfer-info');
        if (bankInfo) bankInfo.style.display = (selectedPayment.value === 'BANK_TRANSFER') ? 'block' : 'none';
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
    try {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const form = document.getElementById('shipping-form');
        // Use checkValidity to show HTML validation; if invalid, reportValidity to show message
        if (form && form.checkValidity()) {
            showStep('payment');
        } else if (form) {
            form.reportValidity();
        } else {
            // fallback
            showStep('payment');
        }
    } catch (err) {
        console.error('handleContinueToPayment error:', err);
        alert('Đã có lỗi khi chuyển sang bước thanh toán. Mở console để xem chi tiết.');
    }
}

function handleContinueToReview(e) {
    try {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const getCart = window.getCart;
        const calculateCartTotal = window.calculateCartTotal;
        const kiemTraDangNhap = window.kiemTraDangNhap;

        const selectedPaymentEl = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentEl) {
            alert("Vui lòng chọn một phương thức thanh toán!");
            return;
        }

        let shippingInfo = {};
        shippingInfo.fullName = document.getElementById('fullName')?.value || '';
        shippingInfo.email = document.getElementById('email')?.value || (kiemTraDangNhap && kiemTraDangNhap()?.email) || 'N/A';
        shippingInfo.phone = document.getElementById('phone')?.value || '';
        shippingInfo.address = `${document.getElementById('address')?.value || ''}, ${document.getElementById('district')?.value || ''}, ${document.getElementById('province')?.value || ''}`;
        shippingInfo.notes = document.getElementById('notes')?.value || '';

        const selectedPaymentMethod = selectedPaymentEl.value;
        const cartItems = typeof getCart === 'function' ? getCart() : [];
        const totalAmount = typeof calculateCartTotal === 'function' ? calculateCartTotal() : 0;

        updateReviewStep(shippingInfo, selectedPaymentMethod, cartItems, totalAmount);
        showStep('review');
    } catch (err) {
        console.error('handleContinueToReview error:', err);
        alert('Đã có lỗi khi chuyển sang bước xem lại đơn hàng. Mở console để xem chi tiết.');
    }
}

function updateReviewStep(shippingInfo, paymentMethod, cartItems, totalAmount) {
    try {
        const reviewAddressEl = document.getElementById('review-address-info');
        if (reviewAddressEl) {
            reviewAddressEl.innerHTML =
                `<strong>${shippingInfo.fullName}</strong> (${shippingInfo.email || 'N/A'}) - ${shippingInfo.phone}<br>${shippingInfo.address}<br>
                ${shippingInfo.notes ? `<p class="review-note">Ghi chú: <em>${shippingInfo.notes}</em></p>` : ''}`;
        }

        const reviewPaymentMethodEl = document.getElementById('review-payment-method');
        if (reviewPaymentMethodEl) {
            reviewPaymentMethodEl.textContent = paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Thanh Toán Khi Nhận Hàng (COD)';
        }

        const reviewBankInfo = document.getElementById('review-bank-info');
        if (paymentMethod === 'BANK_TRANSFER') {
            if (reviewBankInfo) reviewBankInfo.style.display = 'block';
            const rb = document.getElementById('review-bank-name');
            const ra = document.getElementById('review-account-number');
            const rn = document.getElementById('review-account-name');
            if (rb) rb.textContent = 'Ngân hàng Demo';
            if (ra) ra.textContent = '0123456789';
            if (rn) rn.textContent = 'Công ty Demo';
        } else {
            if (reviewBankInfo) reviewBankInfo.style.display = 'none';
        }

        const reviewItemsEl = document.getElementById('review-cart-items');
        if (reviewItemsEl) {
            reviewItemsEl.innerHTML = '';
            (cartItems || []).forEach(item => {
                const div = document.createElement('div');
                div.className = 'review-item';
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                div.innerHTML = `<div>${item.title || item.name} x ${item.quantity || 1}</div>
                                 <div>${formatCurrency(itemTotal)}</div>`;
                reviewItemsEl.appendChild(div);
            });
        }

        const reviewTotalEl = document.getElementById('review-total-price');
        if (reviewTotalEl) reviewTotalEl.textContent = formatCurrency(totalAmount || 0);
    } catch (err) {
        console.error('updateReviewStep error:', err);
    }
}

function handleFinalPlaceOrder(e) {
    try {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        // TODO: gọi API tạo đơn hàng thực tế ở đây
        alert('Đơn hàng đã được gửi (demo).');
        closeCheckoutModal();
    } catch (err) {
        console.error('handleFinalPlaceOrder error:', err);
        alert('Lỗi khi gửi đơn hàng. Mở console để xem chi tiết.');
    }
}

// Initialize on DOMContentLoaded so the modal is injected and listeners ready
document.addEventListener('DOMContentLoaded', () => {
    if (!checkoutOverlay) initializeCheckoutDom();
});