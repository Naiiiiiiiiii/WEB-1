// File: checkout-ui.js
// Mục đích: Quản lý giao diện và logic checkout (thanh toán)
// Bao gồm: Multi-step checkout flow (shipping → payment → review → success)

// Import template HTML cho modal checkout từ file riêng
import { CHECKOUT_OVERLAY_HTML } from './checkout-modal-html.js';

// Biến global: Reference đến overlay modal checkout
let checkoutOverlay = null;

// Object: Cache dữ liệu đơn hàng tạm thời trong quá trình checkout
// Lưu thông tin user nhập vào các bước để dùng ở bước cuối
let orderDataCache = {}; 

// Hàm: Format số tiền theo chuẩn Việt Nam (VD: 1.000.000₫)
// @param amount: Số tiền cần format
// @return: Chuỗi tiền tệ đã format
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Hàm: Inject HTML modal checkout vào DOM (chỉ chạy 1 lần)
// Kiểm tra xem modal đã tồn tại chưa để tránh inject trùng
function injectCheckoutOverlay() {
    // Nếu đã có modal trong DOM, không inject nữa
    if (document.getElementById('checkout-overlay')) return; 
    
    // Insert HTML vào cuối body
    document.body.insertAdjacentHTML('beforeend', CHECKOUT_OVERLAY_HTML);
}

// Hàm: Khởi tạo DOM elements và event listeners cho checkout
function initializeCheckoutDom() {
    // Inject HTML nếu chưa có
    injectCheckoutOverlay(); 
    
    // Lấy reference đến overlay element
    checkoutOverlay = document.getElementById('checkout-overlay');
    
    // Setup các event listeners (nút next, back, submit...)
    setupEventListeners(); 
}

// Hàm: Hiển thị một bước cụ thể trong checkout flow
// @param stepName: Tên bước cần hiển thị ('shipping', 'payment', 'review', 'success')
function showStep(stepName) {
    // Định nghĩa các bước trong checkout flow với ID tương ứng
    const steps = [
        { name: 'shipping', id: 'step-shipping' },      // Bước 1: Thông tin giao hàng
        { name: 'payment', id: 'step-payment' },        // Bước 2: Phương thức thanh toán
        { name: 'review', id: 'step-review' },          // Bước 3: Xem lại đơn hàng
        { name: 'success', id: 'order-success-message' } // Bước 4: Thông báo thành công
    ];
    
    // Duyệt qua các bước và hiển thị/ẩn tương ứng
    steps.forEach(step => {
        const el = document.getElementById(step.id); 
        
        // Nếu step.name khớp với stepName, hiển thị (display: block)
        // Ngược lại, ẩn (display: none)
        if (el) el.style.display = (step.name === stepName) ? 'block' : 'none';
    });

    // Đảm bảo overlay có class 'open' để hiển thị modal
    if (checkoutOverlay && !checkoutOverlay.classList.contains('open')) {
        checkoutOverlay.classList.add('open');
    }
}

// Gán hàm vào window để có thể gọi từ file khác
window.showStep = showStep;

// Hàm export: Mở modal checkout và bắt đầu flow thanh toán
// Được gọi khi user click "Tiến hành thanh toán" từ giỏ hàng
export function openCheckoutModal() {
    // Khởi tạo DOM nếu chưa có
    if (!checkoutOverlay) initializeCheckoutDom(); 
    
    // Lấy references đến các hàm cần thiết từ window
    const kiemTraDangNhap = window.kiemTraDangNhap;     // Kiểm tra đăng nhập
    const getCart = window.getCart;                      // Lấy giỏ hàng
    const checkCartBeforeCheckout = window.checkCartBeforeCheckout; // Validate giỏ hàng
    
    // Validation 1: Kiểm tra hàm kiemTraDangNhap có tồn tại không
    if (typeof kiemTraDangNhap !== 'function') {
        console.error("LỖI: Thiếu hàm window.kiemTraDangNhap. Đảm bảo file user.js đã được tải.");
        alert("Lỗi hệ thống: Chức năng người dùng chưa được tải. Vui lòng thử lại sau.");
        return;  // Dừng nếu thiếu hàm
    }
    
    // Validation 2: Kiểm tra user đã đăng nhập chưa
    const user = kiemTraDangNhap();
    if (!user || !user.tenDangNhap) {
        // Nếu chưa đăng nhập, hiển thị thông báo
        alert("Vui lòng đăng nhập để tiến hành thanh toán và lưu lịch sử đơn hàng.");
        
        // Mở modal đăng nhập nếu có
        if (window.showLoginModal) window.showLoginModal();
        return;  // Dừng checkout flow
    }
    
    // Validation 3: Kiểm tra giỏ hàng có sản phẩm không
    if (!getCart || getCart().length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm.");
        return;  // Dừng nếu giỏ trống
    }

    // Validation 4: Kiểm tra giỏ hàng hợp lệ (size đã chọn, tồn kho...)
    if (typeof checkCartBeforeCheckout === 'function' && !checkCartBeforeCheckout()) {
        return;  // Dừng nếu không pass validation
    }

    // Đóng modal giỏ hàng trước khi mở checkout
    if (window.closeCartModal) {
        window.closeCartModal(); 
    }
    
    // Hiển thị bước đầu tiên: Thông tin giao hàng
    showStep('shipping'); 
    
    // Pre-fill form với thông tin từ user account
    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');

    // Điền họ tên từ user data
    if(fullNameEl) fullNameEl.value = user.hoTen || "";
    
    // Điền email từ user data
    if(emailEl) emailEl.value = user.email || "";
    
    // Giữ nguyên số điện thoại nếu đã điền trước đó
    if(phoneEl) phoneEl.value = phoneEl.value || ""; 
    
    // Pre-fill địa chỉ mặc định (demo data) nếu chưa có
    if(document.getElementById('address')) 
        document.getElementById('address').value = document.getElementById('address').value || "123 Đường Bàn Cờ";
    
    if(document.getElementById('district')) 
        document.getElementById('district').value = document.getElementById('district').value || "Quận 3"; 
    
    if(document.getElementById('province')) 
        document.getElementById('province').value = document.getElementById('province').value || "TP. Hồ Chí Minh"; 

    // Hiển thị modal checkout với animation
    if (checkoutOverlay) {
        // Set display để modal xuất hiện
        checkoutOverlay.style.display = 'flex'; 
        
        // Ẩn scroll của body khi modal mở
        document.body.style.overflow = 'hidden'; 
        
        // Dùng requestAnimationFrame để trigger CSS transition
        // Đảm bảo browser đã render display:flex trước khi add class 'open'
        requestAnimationFrame(() => checkoutOverlay.classList.add('open')); 
    }
}

// Gán hàm vào window để có thể gọi từ cart-ui.js
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