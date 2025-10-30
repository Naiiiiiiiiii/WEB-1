
// =========================================================================
// 0. IMPORTS: PHẢI LUÔN ĐƯỢC ĐẶT Ở ĐẦU FILE MODULE
// =========================================================================

// Import hàm render lịch sử đơn hàng từ module order-history-ui
import { renderOrderHistory } from './order-history-ui.js'; 
// THÊM IMPORT VÀ KHỞI TẠO ProductManager
import { ProductManager } from './ProductManager.js'; 
const productManager = new ProductManager(); 


// =========================================================================
// 1. BIẾN GLOBAL VÀ HÀM TIỆN ÍCH
// =========================================================================

// Hàm kiểm tra đăng nhập (được gán global)
function kiemTraDangNhap(moModal = false) {
    if (window.kiemTraDangNhap_core) { 
        // Ưu tiên dùng core function nếu được định nghĩa ở user.js
        return window.kiemTraDangNhap_core(moModal);
    }
    const USER_KEY = 'nguoiDungHienTai'; 
    const nguoiDungHienTai = localStorage.getItem(USER_KEY);
    
    if (nguoiDungHienTai) {
        try {
            return JSON.parse(nguoiDungHienTai);
        } catch (e) {
            // Xóa key bị lỗi nếu parse thất bại
            localStorage.removeItem(USER_KEY);
            return null;
        }
    }
    
    if (moModal && window.openLoginModal) {
        window.openLoginModal();
    } else if (moModal) {
        alert('Vui lòng đăng nhập để sử dụng chức năng này!');
    }
    return null;
}
window.kiemTraDangNhap = kiemTraDangNhap; 

function xuLyDangXuat() {
    if (window.dangXuat) {
        window.dangXuat();
    } else {
        const USER_KEY = 'nguoiDungHienTai';
        
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem(USER_KEY);
            // Sau khi đăng xuất, reset UI header
            if (window.capNhatUIHeader) {
                window.capNhatUIHeader();
            }
            window.location.reload();
        }
    }
}

// HÀM XỬ LÝ LOGIC THÊM VÀO GIỎ HÀNG 
function handleAddToCartClick(e) { 
    
    const card = this.closest('.product-card') || this.closest('.modal-content');
            
    if (!card) {
        console.error("Lỗi: Nút 'Thêm vào giỏ' không nằm trong thẻ cha hợp lệ.");
        return;
    }

    // Lấy ID sản phẩm 
    const productId = this.dataset.id || card.dataset.id; 
    
    if (!productId) {
        console.error("Không tìm thấy Product ID. Bỏ qua Quick Add.");
        return;
    }
    
    // Lấy đối tượng sản phẩm từ ProductManager
    const product = productManager.getProductById(productId);
    
    if (!product) {
        console.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        return;
    }
    
    // Lấy dữ liệu an toàn từ đối tượng product
    const name = product.name;
    const price = product.price; // SỬ DỤNG GIÁ TRỊ SỐ NGUYÊN GỐC 
    const img = product.img || 'default.jpg';
    
    // Thiết lập size mặc định là 'Chưa chọn' để người dùng có thể cập nhật trong giỏ hàng
    const size = 'Chưa chọn'; 
    const color = null; // Mặc định là null/N/A
    const quantity = 1;
    
    if (window.addToCart) {
        const success = window.addToCart(productId, name, price, img, size, color, quantity); 
        
        if(success !== false) {
            alert(`🛒 Đã thêm ${name} vào giỏ hàng!`);
            // Sau khi Quick Add thành công, mở Modal Giỏ hàng
            if (window.openCartModal) {
                window.openCartModal();
            }
        }
    } else {
        console.error("Lỗi: window.addToCart chưa được load.");
    }
}

// =========================================================================
// 2. KHỞI TẠO SỰ KIỆN GIỎ HÀNG VÀ NAV (DÙNG EVENT DELEGATION)
// =========================================================================

function khoiTaoSuKienGioHang() {
    
    // 1. Gắn sự kiện cho các nút "Thêm vào giỏ" trên trang chủ (Event Delegation)
    // LẮNG NGHE CLICK TRÊN TOÀN BỘ BODY (chỉ gắn 1 lần)
    document.body.addEventListener('click', function(e) {
        
        // Kiểm tra xem phần tử được click có phải là nút .add-to-cart không
        const nutThemVaoGio = e.target.closest('.add-to-cart');
        
        if (nutThemVaoGio) {
            e.preventDefault();
            
            if (!window.kiemTraDangNhap(true)) {
                return; 
            }
            
            // Gọi hàm xử lý, gán 'this' là nút được click
            handleAddToCartClick.call(nutThemVaoGio, e);
        }
    });

    // 2. Gắn sự kiện cho các icon Giỏ hàng và Wishlist (Giữ nguyên)
    const wishlistLink = document.querySelector('a[href="#wishlist"], a[href="./wishlist.html"]');
    const cartLink = document.querySelector('a[href="#cart"], a[href="./cart.html"]');
    const userProfileLink = document.querySelector('a[href="#profile"], a[href="./profile.html"]'); 
    const logoutBtn = document.querySelector('#logout-btn'); 

    [wishlistLink, cartLink, userProfileLink].forEach(link => {
        if (link) {
            // TẠM THỜI GỠ BỎ event listener CŨ để tránh lặp nếu hàm khoiTaoSuKienGioHang bị gọi lặp ở đâu đó
            link.removeEventListener('click', kiemTraLinkNav); 
            link.addEventListener('click', kiemTraLinkNav);
        }
    });
    
    // Hàm xử lý link nav (tách riêng để dùng removeEventListener)
    function kiemTraLinkNav(e) {
        if (!window.kiemTraDangNhap(true)) {
            return e.preventDefault();
        }
        
        if (this.href.includes('#cart') && window.openCartModal) {
            window.openCartModal();
            return e.preventDefault();
        }
    }
    
    // 3. Gắn sự kiện Đăng xuất
    if (logoutBtn) {
        // Tương tự, gỡ bỏ trước khi gắn để an toàn tuyệt đối
        logoutBtn.removeEventListener('click', xuLyDangXuat);
        logoutBtn.addEventListener('click', xuLyDangXuat);
    }
}

/**
 * Gắn sự kiện cho nút Xem lịch sử đơn hàng
 */
function khoiTaoSuKienOrderHistory() {
    const viewOrdersLink = document.getElementById('view-orders-link');
    if (viewOrdersLink) {
        // Tương tự, gỡ bỏ trước khi gắn
        viewOrdersLink.removeEventListener('click', handleViewOrdersClick);
        viewOrdersLink.addEventListener('click', handleViewOrdersClick);
    }
    
    function handleViewOrdersClick(e) {
        e.preventDefault();
        const user = kiemTraDangNhap(true); // Kiểm tra và mở modal đăng nhập nếu cần
        
        if (user) {
            renderOrderHistory(); // Gọi hàm đã import
        }
    }
}

// =========================================================================
// 3. LOGIC XỬ LÝ MODAL (FIX QUAN TRỌNG CHO VIỆC CẬP NHẬT TỒN KHO)
// =========================================================================

function khoiTaoModalEvents() {
    // Thay 'cartModal' bằng ID thực tế của modal giỏ hàng của bạn (thường là cartModal)
    const cartModalElement = document.getElementById('cartModal'); 

    if (cartModalElement) {
        // Lắng nghe sự kiện khi Modal GIỎ HÀNG ĐÃ ĐÓNG HOÀN TOÀN (Sự kiện chuẩn của Bootstrap)
        cartModalElement.addEventListener('hidden.bs.modal', function () {
            
            // NẾU ĐANG Ở TRANG CHI TIẾT SẢN PHẨM: GỌI HÀM CẬP NHẬT TỒN KHO
            if (window.updateProductStockUI) {
                console.log("🔥 Đã đóng Modal Giỏ hàng. Cập nhật lại tồn kho trên trang chi tiết.");
                // Hàm này sẽ tự động lấy dữ liệu mới nhất từ ProductManager
                window.updateProductStockUI();
            }
        });
    }
}


// =========================================================================
// 4. LOGIC SLIDER (Giữ nguyên)
// =========================================================================

function khoiTaoSlider() {
    const wrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    if (!wrapper || slides.length === 0 || !prevBtn || !nextBtn || dots.length === 0) {
        return; 
    }

    let currentSlide = 0;
    const totalSlides = slides.length;
    const slideInterval = 4000;
    let autoSlideTimer;

    function updateSlide(index) {
        currentSlide = index;
        const offset = currentSlide * -100;
        wrapper.style.transform = `translateX(${offset}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        updateSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide(prevIndex);
    }

    function startAutoSlide() {
        clearInterval(autoSlideTimer); 
        autoSlideTimer = setInterval(nextSlide, slideInterval);
    }

    prevBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
    nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);
            startAutoSlide();
        });
    });

    wrapper.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    wrapper.addEventListener('mouseleave', startAutoSlide);

    updateSlide(0);
    startAutoSlide();
}


// =========================================================================
// 5. CSS VÀ AUTO INIT
// =========================================================================

const styleCSS = `
/* CSS UI LOGIN/LOGOUT TỪ BẠN - ĐẢM BẢO UI ĐỒNG BỘ */
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

// Tự động thêm CSS vào head
if (!document.querySelector('#user-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'user-styles';
    styleElement.textContent = styleCSS;
    document.head.appendChild(styleElement);
}

// Hàm khởi tạo chính
document.addEventListener('DOMContentLoaded', function() {
    // 1. Cập nhật số lượng giỏ hàng ban đầu 
    if (window.updateCartCount) {
        window.updateCartCount();
    }
    
    // 2. Khởi tạo các sự kiện
    khoiTaoSuKienGioHang();
    khoiTaoSlider(); 
    khoiTaoSuKienOrderHistory(); 
    
    //  Khởi tạo sự kiện Modal 
    khoiTaoModalEvents();
    
    // 3. Cập nhật UI Header
    if (window.capNhatUIUser) {
        window.capNhatUIUser(window.kiemTraDangNhap());
    }
});