// Import các hàm xử lý giỏ hàng từ module cart.js
import { 
    getCart,                    // Lấy giỏ hàng hiện tại
    updateCartItemQuantity,     // Cập nhật số lượng sản phẩm
    removeCartItem,             // Xóa sản phẩm khỏi giỏ
    clearCart,                  // Xóa toàn bộ giỏ hàng
    updateCartCount,            // Cập nhật badge số lượng
    calculateCartTotal,         // Tính tổng tiền giỏ hàng
    renderSizeSelector,         // Render dropdown chọn size
    checkCartBeforeCheckout     // Kiểm tra giỏ hàng trước khi thanh toán
} from './cart.js'; 

// Gán hàm renderCart vào window để có thể gọi từ file khác
window.renderCartTable = renderCart; 

// Biến global lưu các DOM elements của giỏ hàng
let cartOverlay = null;          // Overlay (màn phủ) của modal giỏ hàng
let cartItemsContainer = null;   // Container chứa danh sách sản phẩm
let cartTotalEl = null;          // Element hiển thị tổng tiền
let emptyMessage = null;         // Element thông báo giỏ hàng trống
let closeBtn = null;             // Nút đóng modal

// Hàm: Khởi tạo các DOM elements của giỏ hàng
// Được gọi khi cần sử dụng các elements nhưng chưa được khởi tạo
function initializeCartDom() {
    // Lấy overlay modal giỏ hàng
    cartOverlay = document.getElementById('cart-overlay');
    
    // Lấy container chứa các items trong giỏ
    cartItemsContainer = document.getElementById('cart-items-container');
    
    // Lấy element hiển thị tổng tiền
    cartTotalEl = document.getElementById('cart-total');
    
    // Lấy element thông báo giỏ trống
    emptyMessage = document.getElementById('empty-cart-message');
    
    // Lấy nút đóng modal
    closeBtn = document.getElementById('close-cart-btn');
}

// Hàm: Format số tiền theo định dạng Việt Nam (VD: 1.000.000₫)
// @param amount: Số tiền cần format (kiểu Number)
// @return: Chuỗi tiền tệ đã format (VD: "1.000.000₫")
function formatCurrency(amount) {
    // Sử dụng Intl.NumberFormat API với locale 'vi-VN' và currency 'VND'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm: Tạo HTML row cho một sản phẩm trong giỏ hàng
// @param item: Object chứa thông tin sản phẩm (name, img, price, quantity, size, color...)
// @return: DOM element (div) đại diện cho một sản phẩm trong giỏ
function createCartItemRow(item) {
    // Tạo thẻ div container cho row
    const row = document.createElement('div');
    row.className = 'cart-item';  // Gán class cho styling
    
    // Tạo HTML bên trong row với template literal
    // Bao gồm: Ảnh, Tên, Size, Màu, Giá, Controls (tăng/giảm/xóa), Tổng tiền
    row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="item-img">
        <div class="item-details">
            <h4 class="item-name">${item.name}</h4>
            <div class="item-meta">
                <p><small>Kích cỡ: ${renderSizeSelector(item)}</small></p>
                <p><small>Màu sắc: ${item.color}</small></p>
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

    // Gắn event listener cho nút giảm số lượng (-)
    // handleQuantityChange với delta = -1 để giảm 1
    row.querySelector('.quantity-decrease').addEventListener('click', (e) => handleQuantityChange(e, -1));
    
    // Gắn event listener cho nút tăng số lượng (+)
    // handleQuantityChange với delta = 1 để tăng 1
    row.querySelector('.quantity-increase').addEventListener('click', (e) => handleQuantityChange(e, 1));
    
    // Gắn event listener cho input số lượng (khi user nhập trực tiếp)
    // handleQuantityChange với delta = 0 để dùng giá trị từ input
    row.querySelector('.item-quantity').addEventListener('change', (e) => handleQuantityChange(e, 0));
    
    // Gắn event listener cho nút xóa sản phẩm (icon trash)
    row.querySelector('.item-remove').addEventListener('click', (e) => handleRemoveItem(e));

    // Trả về row đã tạo để append vào container
    return row;
}

// Hàm: Xử lý thay đổi số lượng sản phẩm trong giỏ hàng
// @param e: Event object từ click hoặc change
// @param delta: Số thay đổi (+1 = tăng, -1 = giảm, 0 = lấy từ input)
function handleQuantityChange(e, delta) {
    // Lấy element đã trigger event
    const target = e.target;

    // Lấy itemIdentifier từ data attribute để xác định sản phẩm
    // itemIdentifier có format: "productId-size" (VD: "1-39")
    const itemIdentifier = target.dataset.identifier;
    if (!itemIdentifier) return;  // Nếu không có identifier, thoát

    let newQuantity;  // Biến lưu số lượng mới

    // Xử lý theo loại thay đổi
    if (delta !== 0) {
        // Trường hợp: Click nút +/- (delta = 1 hoặc -1)
        
        // Tìm input element để lấy số lượng hiện tại
        const inputEl = target.parentElement.querySelector('.item-quantity');
        let currentQuantity = parseInt(inputEl.value);  // Parse sang số nguyên
        
        // Tính số lượng mới = hiện tại + delta, nhưng tối thiểu = 1
        newQuantity = Math.max(1, currentQuantity + delta); 
        
        // Cập nhật giá trị hiển thị trong input
        inputEl.value = newQuantity; 
    } else {
        // Trường hợp: User nhập trực tiếp vào input (delta = 0)
        
        // Lấy giá trị từ input
        newQuantity = parseInt(target.value);
        
        // Validate: Nếu không phải số hoặc < 1, reset về 1
        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
            target.value = 1;  // Cập nhật lại input
        }
    }
    
    // Gọi hàm cập nhật số lượng trong cart.js
    // Hàm này sẽ update localStorage và re-render giỏ hàng
    updateCartItemQuantity(itemIdentifier, newQuantity);
}

// Hàm: Xử lý xóa sản phẩm khỏi giỏ hàng
// @param e: Event object từ click vào nút xóa
function handleRemoveItem(e) {
    // Tìm element nút xóa gần nhất (dùng closest để đảm bảo lấy đúng button)
    const target = e.target.closest('.item-remove');
    if (!target) return;  // Nếu không tìm thấy, thoát
    
    // Lấy itemIdentifier từ data attribute
    const itemIdentifier = target.dataset.identifier;
    if (!itemIdentifier) return;  // Nếu không có identifier, thoát
    
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
        // Nếu user confirm, gọi hàm xóa từ cart.js
        // Hàm này sẽ xóa khỏi localStorage và re-render giỏ hàng
        removeCartItem(itemIdentifier);
    }
}

// Hàm: Render (hiển thị) giỏ hàng lên UI
// Được gọi mỗi khi có thay đổi trong giỏ hàng (thêm/xóa/sửa)
function renderCart() {
    // Kiểm tra xem các DOM elements đã được khởi tạo chưa
    // Nếu chưa, gọi initializeCartDom() để khởi tạo
    if (!cartItemsContainer || !cartTotalEl || !emptyMessage) {
        initializeCartDom();
    }
    
    // Lấy giỏ hàng hiện tại từ localStorage
    const cart = getCart();
    
    // Trường hợp 1: Giỏ hàng trống
    if (cart.length === 0) {
        // Xóa toàn bộ nội dung container
        cartItemsContainer.innerHTML = '';
        
        // Hiển thị thông báo giỏ hàng trống
        emptyMessage.style.display = 'block';
        
        // Hiển thị tổng tiền = 0
        cartTotalEl.textContent = formatCurrency(0);
        
        // Ẩn nút "Xóa toàn bộ giỏ hàng" (vì giỏ đã trống)
        document.getElementById('clear-cart-btn').style.display = 'none';
        
        // Ẩn nút "Thanh toán" (không có gì để thanh toán)
        document.getElementById('checkout-btn').style.display = 'none';
        
        // Thoát khỏi hàm
        return;
    }

    // Trường hợp 2: Giỏ hàng có sản phẩm
    // Ẩn thông báo giỏ trống
    emptyMessage.style.display = 'none';
    
    // Hiển thị các nút xóa và thanh toán
    document.getElementById('clear-cart-btn').style.display = 'inline-block';
    document.getElementById('checkout-btn').style.display = 'inline-block';
    
    // Xóa nội dung cũ trong container (để render lại từ đầu)
    cartItemsContainer.innerHTML = ''; 

    // Duyệt qua từng sản phẩm trong giỏ và tạo row
    cart.forEach(item => {
        // Tạo row HTML cho item này
        const row = createCartItemRow(item);
        
        // Thêm row vào container
        cartItemsContainer.appendChild(row);
    });

    // Tính tổng tiền của giỏ hàng
    const total = calculateCartTotal();
    
    // Cập nhật hiển thị tổng tiền
    cartTotalEl.textContent = formatCurrency(total);
}

// Hàm: Mở modal giỏ hàng
// Được gọi khi user click vào icon giỏ hàng
function openCartModal() {
    // Khởi tạo DOM nếu chưa có
    if (!cartOverlay) initializeCartDom();
    
    // Render lại giỏ hàng để đảm bảo dữ liệu mới nhất
    renderCart();
    
    // Thêm class 'open' để hiển thị modal (CSS sẽ xử lý animation)
    cartOverlay.classList.add('open');
    
    // Ẩn thanh scroll của body khi modal mở (để user không scroll trang chính)
    document.body.style.overflow = 'hidden'; 
}

// Hàm: Đóng modal giỏ hàng
// Được gọi khi user click nút đóng hoặc click bên ngoài modal
function closeCartModal() {
    // Khởi tạo DOM nếu chưa có
    if (!cartOverlay) initializeCartDom();
    
    // Xóa class 'open' để ẩn modal (CSS sẽ xử lý animation)
    cartOverlay.classList.remove('open');
    
    // Khôi phục lại thanh scroll của body
    document.body.style.overflow = 'auto'; 
}

// Gán các hàm vào window để có thể gọi từ file khác
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;

// Event Listener: Chờ DOM load xong mới khởi tạo các sự kiện
// Đảm bảo tất cả HTML elements đã tồn tại trước khi gắn event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo DOM elements nếu chưa có
    if (!closeBtn) initializeCartDom(); 

    // Event: Click nút đóng modal giỏ hàng
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartModal);
    }

    // Event: Click nút "Xóa toàn bộ giỏ hàng"
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            // Hiển thị confirm dialog để xác nhận
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
                // Xóa toàn bộ giỏ hàng từ localStorage
                clearCart();
                
                // Re-render giỏ hàng (sẽ hiển thị trạng thái trống)
                renderCart();
                
                // Cập nhật badge số lượng trên icon giỏ hàng về 0
                updateCartCount();
                
                // Hiển thị thông báo thành công
                alert("Đã xóa toàn bộ giỏ hàng.");
            }
        });
    }

    // Event: Click vào icon giỏ hàng ở header
    const cartIconLink = document.querySelector('.nav-icons a[href="#cart"]');
    if (cartIconLink) {
        cartIconLink.addEventListener('click', function(e) {
            // Ngăn chặn hành động mặc định (navigate đến #cart)
            e.preventDefault();
            
            // Kiểm tra đăng nhập trước khi mở giỏ hàng
            // kiemTraDangNhap(true) = hiển thị modal login nếu chưa đăng nhập
            if (window.kiemTraDangNhap && window.kiemTraDangNhap(true)) {
                // Nếu đã đăng nhập, mở modal giỏ hàng
                openCartModal();
            }
        });
    }

    // Event: Click vào overlay (vùng tối bên ngoài modal) để đóng
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            // Chỉ đóng nếu click đúng vào overlay, không phải modal content
            if (e.target === cartOverlay) {
                closeCartModal();
            }
        });
    }

    // Event: Click nút "Tiến hành thanh toán"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Kiểm tra 1: Giỏ hàng có trống không?
            if (getCart && getCart().length === 0) {
                alert("Giỏ hàng của bạn đang trống! Vui lòng thêm sản phẩm.");
                return;
            }
            
            // Kiểm tra 2: Validate giỏ hàng (size đã chọn chưa, tồn kho...)
            if (checkCartBeforeCheckout && !checkCartBeforeCheckout()) {
                return;  // Nếu không pass validation, dừng lại
            }

            // Mở modal checkout nếu có hàm openCheckoutModal
            if (window.openCheckoutModal) {
                window.openCheckoutModal();  // Mở modal thanh toán
                closeCartModal();             // Đóng modal giỏ hàng
            } else {
                // Fallback: Nếu hàm chưa được load
                console.error("Lỗi: Hàm window.openCheckoutModal chưa được định nghĩa.");
                alert("Chức năng Thanh toán đang được phát triển.");
            }
        });
    }
});