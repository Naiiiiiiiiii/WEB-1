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

function khoiTaoSuKienGioHang() {
    

    document.body.addEventListener('click', function(e) {
        

        const nutThemVaoGio = e.target.closest('.add-to-cart');
        
        if (nutThemVaoGio) {
            e.preventDefault();
            
            if (!window.kiemTraDangNhap(true)) {
                return; 
            }
            

            handleAddToCartClick.call(nutThemVaoGio, e);
        }
    });

    const wishlistLink = document.querySelector('a[href="#wishlist"], a[href="./wishlist.html"]');
    const cartLink = document.querySelector('a[href="#cart"], a[href="./cart.html"]');
    const userProfileLink = document.querySelector('a[href="#profile"], a[href="./profile.html"]'); 
    const logoutBtn = document.querySelector('#logout-btn'); 

    [wishlistLink, cartLink, userProfileLink].forEach(link => {
        if (link) {

            link.removeEventListener('click', kiemTraLinkNav); 
            link.addEventListener('click', kiemTraLinkNav);
        }
    });
    

    function kiemTraLinkNav(e) {
        if (!window.kiemTraDangNhap(true)) {
            return e.preventDefault();
        }
        
        if (this.href.includes('#cart') && window.openCartModal) {
            window.openCartModal();
            return e.preventDefault();
        }
    }
    

    if (logoutBtn) {

        logoutBtn.removeEventListener('click', xuLyDangXuat);
        logoutBtn.addEventListener('click', xuLyDangXuat);
    }
}

function khoiTaoSuKienOrderHistory() {
    const viewOrdersLink = document.getElementById('view-orders-link');
    if (viewOrdersLink) {

        viewOrdersLink.removeEventListener('click', handleViewOrdersClick);
        viewOrdersLink.addEventListener('click', handleViewOrdersClick);
    }
    
    function handleViewOrdersClick(e) {
        e.preventDefault();
        const user = kiemTraDangNhap(true);
        
        if (user) {
            renderOrderHistory();
        }
    }
}

function khoiTaoModalEvents() {

    const cartModalElement = document.getElementById('cartModal'); 

    if (cartModalElement) {

        cartModalElement.addEventListener('hidden.bs.modal', function () {
            

            if (window.updateProductStockUI) {
                console.log("🔥 Đã đóng Modal Giỏ hàng. Cập nhật lại tồn kho trên trang chi tiết.");

                window.updateProductStockUI();
            }
        });
    }
}

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

const styleCSS = `

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

if (!document.querySelector('#user-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'user-styles';
    styleElement.textContent = styleCSS;
    document.head.appendChild(styleElement);
}

document.addEventListener('DOMContentLoaded', function() {

    if (window.updateCartCount) {
        window.updateCartCount();
    }
    

    khoiTaoSuKienGioHang();
    khoiTaoSlider(); 
    khoiTaoSuKienOrderHistory(); 
    

    khoiTaoModalEvents();
    

    if (window.capNhatUIUser) {
        window.capNhatUIUser(window.kiemTraDangNhap());
    }
});