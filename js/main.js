// Import hàm render lịch sử đơn hàng từ module order-history-ui
import { renderOrderHistory } from './order-history-ui.js'; 

// Import class ProductManager để quản lý sản phẩm
import { ProductManager } from './ProductManager.js'; 

// Tạo instance của ProductManager để sử dụng trong file này
const productManager = new ProductManager(); 

// Hàm: Kiểm tra người dùng đã đăng nhập chưa
// moModal: nếu true thì hiển thị modal đăng nhập khi chưa login
function kiemTraDangNhap(moModal = false) {
    // Nếu có hàm kiemTraDangNhap_core từ module khác, ưu tiên dùng hàm đó
    if (window.kiemTraDangNhap_core) { 
        return window.kiemTraDangNhap_core(moModal);
    }
    
    // Key để lưu thông tin người dùng hiện tại trong localStorage
    const USER_KEY = 'nguoiDungHienTai'; 
    
    // Đọc thông tin người dùng từ localStorage
    const nguoiDungHienTai = localStorage.getItem(USER_KEY);
    
    // Nếu có dữ liệu người dùng
    if (nguoiDungHienTai) {
        try {
            // Parse JSON và trả về object người dùng
            return JSON.parse(nguoiDungHienTai);
        } catch (e) {
            // Nếu parse lỗi (dữ liệu bị hỏng), xóa khỏi localStorage
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }
    
    // Nếu chưa đăng nhập và moModal = true
    if (moModal && window.openLoginModal) {
        // Mở modal đăng nhập
        window.openLoginModal();
    } else if (moModal) {
        // Hoặc hiển thị alert nếu không có modal
        alert('Vui lòng đăng nhập để sử dụng chức năng này!');
    }
    
    // Trả về null nếu chưa đăng nhập
    return null;
}

// Gán hàm vào window để các file khác có thể gọi
window.kiemTraDangNhap = kiemTraDangNhap; 

// Hàm: Xử lý khi người dùng nhấn nút đăng xuất
function xuLyDangXuat() {
    // Nếu có hàm dangXuat từ module khác, ưu tiên dùng hàm đó
    if (window.dangXuat) {
        window.dangXuat();
    } else {
        // Fallback: tự xử lý đăng xuất
        const USER_KEY = 'nguoiDungHienTai';
        
        // Hiển thị hộp thoại xác nhận
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            // Xóa thông tin người dùng khỏi localStorage
            localStorage.removeItem(USER_KEY);

            // Cập nhật lại giao diện header nếu có hàm capNhatUIHeader
            if (window.capNhatUIHeader) {
                window.capNhatUIHeader();
            }
            
            // Reload trang để reset toàn bộ trạng thái
            window.location.reload();
        }
    }
}

// Hàm: Xử lý khi nhấn nút "Thêm vào giỏ" trên card sản phẩm
function handleAddToCartClick(e) { 
    // this = nút "Thêm vào giỏ" được click
    // Tìm thẻ cha là .product-card hoặc .modal-content
    const card = this.closest('.product-card') || this.closest('.modal-content');
            
    // Nếu không tìm thấy thẻ cha hợp lệ
    if (!card) {
        console.error("Lỗi: Nút 'Thêm vào giỏ' không nằm trong thẻ cha hợp lệ.");
        return;
    }

    // Lấy product ID từ data-id attribute của button hoặc card
    const productId = this.dataset.id || card.dataset.id; 
    
    // Nếu không có productId thì không thể thêm vào giỏ
    if (!productId) {
        console.error("Không tìm thấy Product ID. Bỏ qua Quick Add.");
        return;
    }
    
    // Lấy thông tin sản phẩm từ ProductManager theo ID
    const product = productManager.getProductById(productId);
    
    // Nếu không tìm thấy sản phẩm trong database
    if (!product) {
        console.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        return;
    }
    
    // Lấy các thông tin cần thiết từ product object
    const name = product.name;
    const price = product.price;
    const img = product.img || 'default.jpg';  // Dùng ảnh mặc định nếu không có
    
    // Thiết lập các giá trị mặc định cho quick add
    const size = 'Chưa chọn';  // Chưa chọn size cụ thể
    const color = null;        // Chưa chọn màu
    const quantity = 1;        // Thêm 1 sản phẩm
    
    // Gọi hàm addToCart (được định nghĩa trong cart.js)
    if (window.addToCart) {
        const success = window.addToCart(productId, name, price, img, size, color, quantity); 
        
        // Nếu thêm thành công
        if(success !== false) {
            // Hiển thị thông báo
            alert(`🛒 Đã thêm ${name} vào giỏ hàng!`);

            // Mở modal giỏ hàng để xem
            if (window.openCartModal) {
                window.openCartModal();
            }
        }
    } else {
        // Lỗi: hàm addToCart chưa được load
        console.error("Lỗi: window.addToCart chưa được load.");
    }
}

// Hàm: Khởi tạo các sự kiện liên quan đến giỏ hàng và authentication
// Được gọi trong DOMContentLoaded để setup event listeners
function khoiTaoSuKienGioHang() {
    // Event Delegation: Gắn 1 listener lên body thay vì từng nút
    // Lợi ích: Hoạt động với elements được tạo động sau này
    document.body.addEventListener('click', function(e) {
        // Tìm nút "Thêm vào giỏ" gần nhất với element được click
        // closest() tìm lên phía cha cho đến khi gặp selector khớp
        const nutThemVaoGio = e.target.closest('.add-to-cart');
        
        // Nếu click vào nút "Thêm vào giỏ" (hoặc child của nó)
        if (nutThemVaoGio) {
            // Ngăn hành động mặc định (VD: submit form, navigate link)
            e.preventDefault();
            
            // Kiểm tra đăng nhập trước khi cho phép thêm vào giỏ
            // kiemTraDangNhap(true) = hiển thị modal login nếu chưa đăng nhập
            if (!window.kiemTraDangNhap(true)) {
                return;  // Dừng lại nếu chưa đăng nhập
            }
            
            // Gọi hàm xử lý thêm vào giỏ với context là nút được click
            // .call() để set `this` = nutThemVaoGio trong hàm
            handleAddToCartClick.call(nutThemVaoGio, e);
        }
    });

    // Lấy các links cần bảo vệ (yêu cầu đăng nhập)
    const wishlistLink = document.querySelector('a[href="#wishlist"], a[href="./wishlist.html"]');
    const cartLink = document.querySelector('a[href="#cart"], a[href="./cart.html"]');
    const userProfileLink = document.querySelector('a[href="#profile"], a[href="./profile.html"]'); 
    
    // Lấy nút đăng xuất
    const logoutBtn = document.querySelector('#logout-btn'); 

    // Lặp qua từng link và gắn event listener
    [wishlistLink, cartLink, userProfileLink].forEach(link => {
        if (link) {
            // Remove listener cũ để tránh duplicate (defensive programming)
            link.removeEventListener('click', kiemTraLinkNav); 
            // Thêm listener mới để kiểm tra đăng nhập
            link.addEventListener('click', kiemTraLinkNav);
        }
    });
    
    // Hàm nested: Kiểm tra navigation đến các trang cần đăng nhập
    // @param {Event} e - Click event object
    function kiemTraLinkNav(e) {
        // Kiểm tra đăng nhập, hiển thị modal nếu chưa login
        if (!window.kiemTraDangNhap(true)) {
            // Ngăn navigation nếu chưa đăng nhập
            return e.preventDefault();
        }
        
        // Xử lý đặc biệt cho link giỏ hàng: mở modal thay vì navigate
        if (this.href.includes('#cart') && window.openCartModal) {
            window.openCartModal();
            return e.preventDefault(); // Ngăn navigation mặc định
        }
    }
    
    // Gắn event listener cho nút đăng xuất
    if (logoutBtn) {
        // Remove listener cũ để tránh duplicate
        logoutBtn.removeEventListener('click', xuLyDangXuat);
        // Thêm listener mới
        logoutBtn.addEventListener('click', xuLyDangXuat);
    }
}

// Hàm: Khởi tạo sự kiện xem lịch sử đơn hàng
function khoiTaoSuKienOrderHistory() {
    // Lấy link "Xem đơn hàng" từ DOM
    const viewOrdersLink = document.getElementById('view-orders-link');
    if (viewOrdersLink) {
        // Remove listener cũ trước khi thêm mới
        viewOrdersLink.removeEventListener('click', handleViewOrdersClick);
        // Gắn event listener
        viewOrdersLink.addEventListener('click', handleViewOrdersClick);
    }
    
    // Hàm nested: Xử lý khi click "Xem đơn hàng"
    // @param {Event} e - Click event
    function handleViewOrdersClick(e) {
        e.preventDefault(); // Ngăn navigation mặc định
        // Kiểm tra đăng nhập, hiển thị modal nếu chưa login
        const user = kiemTraDangNhap(true);
        
        // Nếu đã đăng nhập, render lịch sử đơn hàng
        if (user) {
            renderOrderHistory();
        }
    }
}

// Hàm: Khởi tạo events cho Bootstrap modals
function khoiTaoModalEvents() {
    // Lấy element của Bootstrap cart modal
    const cartModalElement = document.getElementById('cartModal'); 

    if (cartModalElement) {
        // Listen event 'hidden.bs.modal' của Bootstrap
        // Event này fire khi modal đã đóng hoàn toàn
        cartModalElement.addEventListener('hidden.bs.modal', function () {
            // Cập nhật lại UI tồn kho trên trang chi tiết sản phẩm
            // (nếu user vừa thay đổi quantity trong giỏ hàng)
            if (window.updateProductStockUI) {
                console.log("🔥 Đã đóng Modal Giỏ hàng. Cập nhật lại tồn kho trên trang chi tiết.");
                // Gọi hàm cập nhật (định nghĩa trong product-detail.js)
                window.updateProductStockUI();
            }
        });
    }
}

// Hàm: Khởi tạo image slider/carousel cho hero section
function khoiTaoSlider() {
    // Lấy các elements cần thiết cho slider
    const wrapper = document.querySelector('.slides-wrapper');  // Container chứa các slides
    const slides = document.querySelectorAll('.slide');         // Tất cả các slides
    const prevBtn = document.querySelector('.prev-btn');        // Nút Previous
    const nextBtn = document.querySelector('.next-btn');        // Nút Next
    const dots = document.querySelectorAll('.dot');             // Các dots indicator
    
    // Kiểm tra tất cả elements có tồn tại không
    // Nếu thiếu element nào thì return (trang không có slider)
    if (!wrapper || slides.length === 0 || !prevBtn || !nextBtn || dots.length === 0) {
        return; 
    }

    // Biến state cho slider
    let currentSlide = 0;                  // Index của slide hiện tại
    const totalSlides = slides.length;     // Tổng số slides
    const slideInterval = 4000;            // 4 giây mỗi slide
    let autoSlideTimer;                    // Reference đến setInterval timer

    // Hàm nested: Cập nhật slide hiện tại
    // @param {number} index - Index của slide cần hiển thị
    function updateSlide(index) {
        currentSlide = index;
        // Tính offset để translateX: mỗi slide = 100% width
        // VD: slide 0 = 0%, slide 1 = -100%, slide 2 = -200%
        const offset = currentSlide * -100;
        wrapper.style.transform = `translateX(${offset}%)`;
        
        // Cập nhật dots indicator: chỉ dot hiện tại có class 'active'
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Hàm nested: Chuyển sang slide tiếp theo
    function nextSlide() {
        // Sử dụng modulo để loop: sau slide cuối quay về slide đầu
        // VD: (2 + 1) % 3 = 0 (quay về đầu)
        const nextIndex = (currentSlide + 1) % totalSlides;
        updateSlide(nextIndex);
    }

    // Hàm nested: Quay lại slide trước
    function prevSlide() {
        // Cộng totalSlides trước khi modulo để tránh số âm
        // VD: (0 - 1 + 3) % 3 = 2 (quay về cuối)
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide(prevIndex);
    }

    // Hàm nested: Bắt đầu auto slide
    function startAutoSlide() {
        clearInterval(autoSlideTimer); // Clear timer cũ trước (nếu có)
        // Tạo timer mới: gọi nextSlide() mỗi 4 giây
        autoSlideTimer = setInterval(nextSlide, slideInterval);
    }

    // Gắn events cho nút Prev và Next
    // Khi click: chuyển slide và restart auto timer
    prevBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
    nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });

    // Gắn events cho từng dot
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);   // Nhảy đến slide tương ứng
            startAutoSlide();     // Restart auto timer
        });
    });

    // Pause auto slide khi hover vào slider
    wrapper.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    // Resume auto slide khi mouse leave
    wrapper.addEventListener('mouseleave', startAutoSlide);

    // Khởi tạo: hiển thị slide đầu tiên
    updateSlide(0);
    // Bắt đầu auto slide
    startAutoSlide();
}

// CSS styles cho user section trong header
// Định nghĩa trong string để inject vào <style> tag dynamically
const styleCSS = `
/* User section container */
.user-section {
    display: flex;
    align-items: center;
    gap: 15px;
}
.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}
.user-info i {
    font-size: 1.5rem;
    color: #ff6b35;
}
.user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; 
    text-decoration: none;
    color: white; 
}
.logout-btn {
    background: linear-gradient(45deg, #dc3545, #c82333);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}
.logout-btn:hover {
    background: linear-gradient(45deg, #c82333, #bd2130);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}
.logout-btn:active {
    transform: translateY(0);
}
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

@media (max-width: 768px) {
    .user-section { flex-direction: column; gap: 8px; }
    .user-name { max-width: 80px; }
    .logout-btn { padding: 6px 12px; font-size: 0.8rem; }
}
@media (max-width: 480px) {
    .user-name { display: none; }
    .logout-btn span { display: none; }
    .logout-btn { width: 35px; height: 35px; border-radius: 50%; padding: 0; justify-content: center; }
}
`;

// Inject CSS vào document nếu chưa có
// Kiểm tra xem đã có <style id="user-styles"> chưa
if (!document.querySelector('#user-styles')) {
    // Tạo <style> element mới
    const styleElement = document.createElement('style');
    styleElement.id = 'user-styles';
    // Gán CSS content
    styleElement.textContent = styleCSS;
    // Append vào <head>
    document.head.appendChild(styleElement);
}

// Event listener: Chờ DOM load xong mới chạy initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật badge số lượng sản phẩm trong giỏ hàng
    // (hiển thị trên icon giỏ hàng ở header)
    if (window.updateCartCount) {
        window.updateCartCount();
    }
    
    // Khởi tạo các event listeners liên quan đến giỏ hàng và auth
    khoiTaoSuKienGioHang();
    
    // Khởi tạo image slider cho hero section
    khoiTaoSlider(); 
    
    // Khởi tạo event cho link "Xem đơn hàng"
    khoiTaoSuKienOrderHistory(); 
    
    // Khởi tạo events cho Bootstrap modals
    khoiTaoModalEvents();
    
    // Cập nhật UI user section trong header (hiển thị tên user, nút logout)
    // capNhatUIUser() được định nghĩa trong user.js hoặc login-modal.js
    if (window.capNhatUIUser) {
        window.capNhatUIUser(window.kiemTraDangNhap());
    }
});