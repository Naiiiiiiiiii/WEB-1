

import { renderOrderHistory } from './order-history-ui.js'; 

import { ProductManager } from './ProductManager.js'; 
const productManager = new ProductManager(); 

function kiemTraDangNhap(moModal = false) {
    if (window.kiemTraDangNhap_core) { 

        return window.kiemTraDangNhap_core(moModal);
    }
    const USER_KEY = 'nguoiDungHienTai'; 
    const nguoiDungHienTai = localStorage.getItem(USER_KEY);
    
    if (nguoiDungHienTai) {
        try {
            return JSON.parse(nguoiDungHienTai);
        } catch (e) {

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

            if (window.capNhatUIHeader) {
                window.capNhatUIHeader();
            }
            window.location.reload();
        }
    }
}

function handleAddToCartClick(e) { 
    
    const card = this.closest('.product-card') || this.closest('.modal-content');
            
    if (!card) {
        console.error("Lỗi: Nút 'Thêm vào giỏ' không nằm trong thẻ cha hợp lệ.");
        return;
    }

    const productId = this.dataset.id || card.dataset.id; 
    
    if (!productId) {
        console.error("Không tìm thấy Product ID. Bỏ qua Quick Add.");
        return;
    }
    

    const product = productManager.getProductById(productId);
    
    if (!product) {
        console.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        return;
    }
    

    const name = product.name;
    const price = product.price;
    const img = product.img || 'default.jpg';
    

    const size = 'Chưa chọn'; 
    const color = null;
    const quantity = 1;
    
    if (window.addToCart) {
        const success = window.addToCart(productId, name, price, img, size, color, quantity); 
        
        if(success !== false) {
            alert(`🛒 Đã thêm ${name} vào giỏ hàng!`);

            if (window.openCartModal) {
                window.openCartModal();
            }
        }
    } else {
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