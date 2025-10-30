// File: js/checkout-ui.js
// Quản lý giao diện và luồng thanh toán 3 bước (Shipping -> Payment -> Review -> Success).

import { CHECKOUT_OVERLAY_HTML } from './checkout-modal-html.js';

// Khai báo biến DOM
let checkoutOverlay = null;

// Lưu trữ thông tin đơn hàng tạm thời (dùng khi chuyển giữa các bước)
let orderDataCache = {}; 

// Hàm tiện ích: Format tiền tệ 
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// =========================================================================
// 1. INJECT VÀ KHỞI TẠO DOM
// =========================================================================

function injectCheckoutOverlay() {
    if (document.getElementById('checkout-overlay')) return; 
    document.body.insertAdjacentHTML('beforeend', CHECKOUT_OVERLAY_HTML);
}

function initializeCheckoutDom() {
    injectCheckoutOverlay(); 
    checkoutOverlay = document.getElementById('checkout-overlay');
    
    // Gán sự kiện ngay sau khi DOM được tạo
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

// =========================================================================
// 2. MỞ/ĐÓNG MODAL
// =========================================================================

export function openCheckoutModal() {
    if (!checkoutOverlay) initializeCheckoutDom(); 
    
    const kiemTraDangNhap = window.kiemTraDangNhap;
    const getCart = window.getCart;
    const checkCartBeforeCheckout = window.checkCartBeforeCheckout;
    
    // BẮT BUỘC ĐĂNG NHẬP TRƯỚC KHI THANH TOÁN
    if (typeof kiemTraDangNhap !== 'function') {
        console.error("LỖI: Thiếu hàm window.kiemTraDangNhap. Đảm bảo file user.js đã được tải.");
        alert("Lỗi hệ thống: Chức năng người dùng chưa được tải. Vui lòng thử lại sau.");
        return;
    }
    
    const user = kiemTraDangNhap(); // Kiểm tra đăng nhập
    if (!user || !user.tenDangNhap) {
        alert("Vui lòng đăng nhập để tiến hành thanh toán và lưu lịch sử đơn hàng.");
        if (window.showLoginModal) window.showLoginModal(); // Mở modal đăng nhập nếu có
        return; 
    }
    
    if (!getCart || getCart().length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm.");
        return;
    }

    // BẮT BUỘC: Kiểm tra sản phẩm đã chọn size/màu chưa (nếu có)
    if (typeof checkCartBeforeCheckout === 'function' && !checkCartBeforeCheckout()) {
        return; 
    }

    // Đóng modal giỏ hàng (nếu đang mở)
    if (window.closeCartModal) {
        window.closeCartModal(); 
    }
    
    // Reset và chuyển về bước Giao hàng
    showStep('shipping'); 
    
    // Đặt giá trị mặc định cho form từ User Data (nếu có)
    const fullNameEl = document.getElementById('fullName');
    const emailEl = document.getElementById('email'); // <== THÊM: Tìm input email
    const phoneEl = document.getElementById('phone');

    // SỬ DỤNG DỮ LIỆU USER ĐỂ ĐẶT GIÁ TRỊ MẶC ĐỊNH
    if(fullNameEl) fullNameEl.value = user.hoTen || "";
    if(emailEl) emailEl.value = user.email || ""; // <== CẢI TIẾN: Điền Email từ hồ sơ
    if(phoneEl) phoneEl.value = phoneEl.value || ""; 
    
    // Dữ liệu demo cho địa chỉ
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

// =========================================================================
// 3. XỬ LÝ THANH TOÁN (3 BƯỚC)
// =========================================================================

// Bước 1: Chuyển từ Giao hàng -> Thanh toán
function handleContinueToPayment(e) {
    e.preventDefault();
    const form = document.getElementById('shipping-form');
    
    if (form && form.checkValidity()) {
        showStep('payment');
    } else if (form) {
        form.reportValidity();
    }
}

// Bước 2: Chuyển từ Thanh toán -> Review
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

    // Thu thập dữ liệu
    const shippingInfo = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email')?.value || kiemTraDangNhap()?.email || 'N/A', // <== CẢI TIẾN: Thu thập Email (hoặc lấy từ User nếu input không tồn tại)
        phone: document.getElementById('phone').value,
        address: `${document.getElementById('address').value}, ${document.getElementById('district').value}, ${document.getElementById('province').value}`,
        notes: document.getElementById('notes').value
    };
    const selectedPaymentMethod = selectedPaymentEl.value;
    const cartItems = getCart();
    const totalAmount = calculateCartTotal(); 

    // 🔥 LẤY USER ID VÀ LƯU VÀO CACHE
    const user = kiemTraDangNhap();
    const userId = user ? user.tenDangNhap : 'Guest-Error';

    // LƯU DỮ LIỆU ĐƠN HÀNG TẠM THỜI
    orderDataCache = {
        shippingInfo,
        paymentMethod: selectedPaymentMethod,
        items: cartItems,
        total: totalAmount,
        orderDate: new Date().toLocaleDateString('vi-VN'),
        date: new Date().toISOString(),
        userId: userId
    };
    
    // Chuyển sang Bước 3: Review
    showStep('review'); 
    
    // Cập nhật giao diện Review
    updateReviewStep(shippingInfo, selectedPaymentMethod, cartItems, totalAmount);
}


// Bước 3: Đặt hàng cuối cùng
function handleFinalPlaceOrder() {
    
    const placeOrder = window.placeOrder;
    // const clearCart = window.clearCart; // Không cần gọi lại nếu placeOrder đã làm
    // const updateCartCount = window.updateCartCount; // Không cần gọi lại nếu placeOrder đã làm

    if (typeof placeOrder !== 'function') {
        console.error("LỖI: Thiếu hàm window.placeOrder. Vui lòng kiểm tra file cart.js."); 
        alert("Lỗi: Chức năng lưu đơn hàng chưa được tải. Vui lòng kiểm tra file cart.js.");
        return;
    }
    
    // Hiển thị trạng thái Đang xử lý
    const reviewContentEl = document.getElementById('review-content');
    const orderProcessingEl = document.getElementById('order-processing-message');
    if (reviewContentEl) reviewContentEl.style.display = 'none'; 
    if (orderProcessingEl) orderProcessingEl.style.display = 'block'; 
    
    
    // GỌI placeOrder VỚI orderDataCache VÀ GÁN KẾT QUẢ TRẢ VỀ
    const newOrder = placeOrder(orderDataCache); 

    // Giả lập thời gian xử lý 1 giây
    setTimeout(() => {
        
        if (orderProcessingEl) orderProcessingEl.style.display = 'none';

        // SỬA LỖI: Kiểm tra newOrder là object và có thuộc tính items (an toàn hơn)
        if (newOrder && typeof newOrder === 'object' && Array.isArray(newOrder.items)) { 
            // Đặt hàng thành công
            updateSuccessStep(newOrder); 
            showStep('success'); 
            
            // Xóa cache sau khi đặt hàng thành công
            orderDataCache = {};
            
        } else {
            // Xử lý thất bại 
            console.error("Đặt hàng thất bại: Hàm placeOrder không trả về đối tượng đơn hàng hợp lệ."); 
            alert("Đã xảy ra lỗi khi đặt hàng hoặc giỏ hàng đã bị xóa bất ngờ. Vui lòng thử lại.");
            // Hiển thị lại nội dung review nếu thất bại
            if(reviewContentEl) reviewContentEl.style.display = 'block'; 
        }

    }, 1000);
}

// Cập nhật dữ liệu cho bước 3: Review
function updateReviewStep(shippingInfo, paymentMethod, cartItems, totalAmount) {
    if(!cartItems || cartItems.length === 0) return;
    
    // Đảm bảo nội dung xem lại chính được hiển thị
    const reviewContentEl = document.getElementById('review-content');
    const orderProcessingEl = document.getElementById('order-processing-message');
    
    if (reviewContentEl) reviewContentEl.style.display = 'block'; 
    if (orderProcessingEl) orderProcessingEl.style.display = 'none'; 
    
    // Cập nhật Địa chỉ
    const reviewAddressEl = document.getElementById('review-address-info');
    if(reviewAddressEl) {
        reviewAddressEl.innerHTML = 
            `<strong>${shippingInfo.fullName}</strong> (${shippingInfo.email || 'N/A'}) - ${shippingInfo.phone}<br>${shippingInfo.address}<br>
            ${shippingInfo.notes ? `<p class="review-note">Ghi chú: <em>${shippingInfo.notes}</em></p>` : ''}`;
    }
    
    // Cập nhật Phương thức thanh toán
    let paymentText = "Thanh Toán Khi Nhận Hàng (COD)";
    if (paymentMethod === 'BANK_TRANSFER') paymentText = "Chuyển Khoản Ngân Hàng";
    else if (paymentMethod === 'ONLINE_PAYMENT') paymentText = "Thanh Toán Trực Tuyến (Không khả dụng)";
    if(document.getElementById('review-payment-method')) document.getElementById('review-payment-method').textContent = paymentText;
    
    // Cập nhật Chi tiết sản phẩm
    let itemsHtml = cartItems.map(item => {
        const safeQuantity = parseInt(item.quantity) || 1;
        // Size đã được làm sạch thành 'N/A' (nếu không có biến thể) hoặc số/chuỗi
        const displaySize = (item.size && item.size !== 'N/A') ? `Size: ${item.size}` : '';
        return `
            <div class="review-item">
                <p class="review-item-name">${item.name} ${displaySize ? `(${displaySize})` : ''}</p>
                <p class="review-item-qty-price">${safeQuantity} x ${formatCurrency(item.price)}</p>
            </div>
        `;
    }).join('');
    
    if(document.getElementById('review-cart-items')) document.getElementById('review-cart-items').innerHTML = itemsHtml;
    // Cập nhật Tổng cộng
    if(document.getElementById('review-total-price')) document.getElementById('review-total-price').textContent = formatCurrency(totalAmount);
}

// =========================================================================
// 4. CẬP NHẬT GIAO DIỆN THÀNH CÔNG
// =========================================================================

function updateSuccessStep(orderData) {
    if (!orderData || !Array.isArray(orderData.items)) return; // ⬅️ THÊM KIỂM TRA AN TOÀN

    // Cập nhật ID đơn hàng
    const orderIdEl = document.getElementById('success-order-id');
    if (orderIdEl) orderIdEl.textContent = orderData.id;

    // Cập nhật Tổng tiền
    const orderTotalEl = document.getElementById('success-order-total');
    if (orderTotalEl) orderTotalEl.textContent = formatCurrency(orderData.total);
    
    // Cập nhật Ngày đặt hàng
    const orderDateEl = document.getElementById('success-order-date');
    // orderData.orderDate đã được định dạng ở handleContinueToReview
    if (orderDateEl) orderDateEl.textContent = orderData.orderDate; 

    // Cập nhật Chi tiết sản phẩm
    let itemsHtml = orderData.items.map(item => {
        const safeQuantity = parseInt(item.quantity) || 1;
        // Size đã được làm sạch thành 'N/A' (nếu không có biến thể) hoặc số/chuỗi
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


// =========================================================================
// 5. GẮN SỰ KIỆN
// =========================================================================

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
    
    // Đóng khi click ra ngoài
    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) {
            closeCheckoutModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo DOM ngay khi trang tải (nếu chưa được gọi)
    if (!checkoutOverlay) {
        initializeCheckoutDom();
    }
});