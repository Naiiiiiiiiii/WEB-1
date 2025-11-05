# 📚 Hướng dẫn Học tập Chi tiết - ShoeStore Project

## Mục lục
1. [Lộ trình Học tập](#lộ-trình-học-tập)
2. [Kiến thức Nền tảng](#kiến-thức-nền-tảng)
3. [Phân tích Code Chi tiết](#phân-tích-code-chi-tiết)
4. [Bài tập Thực hành](#bài-tập-thực-hành)
5. [Troubleshooting](#troubleshooting)

---

## Lộ trình Học tập

### Giai đoạn 1: Nền tảng (2-3 tuần)
**Mục tiêu**: Hiểu rõ HTML, CSS, JavaScript cơ bản

#### Tuần 1: HTML & CSS
- [ ] Học HTML5 semantic tags
- [ ] Thực hành Flexbox và Grid
- [ ] Làm quen với responsive design
- [ ] Tìm hiểu CSS animations

**Tài nguyên:**
- [FreeCodeCamp - Responsive Web Design](https://www.freecodecamp.org/learn/responsive-web-design/)
- [Flexbox Froggy](https://flexboxfroggy.com/)
- [Grid Garden](https://cssgridgarden.com/)

**Thực hành:**
```html
<!-- Bài tập: Tạo layout cơ bản -->
<div class="container">
    <header>...</header>
    <main>
        <aside>Sidebar</aside>
        <section>Content</section>
    </main>
    <footer>...</footer>
</div>
```

#### Tuần 2-3: JavaScript Cơ bản
- [ ] Variables, Data Types, Operators
- [ ] Functions và Arrow Functions
- [ ] Arrays và Objects
- [ ] DOM Manipulation
- [ ] Event Handling
- [ ] Async/Promises

**Thực hành:**
```javascript
// Bài tập 1: DOM Manipulation
document.querySelector('.btn').addEventListener('click', function() {
    document.querySelector('.result').textContent = 'Clicked!';
});

// Bài tập 2: Array Methods
const products = [
    { name: 'Shoe 1', price: 100 },
    { name: 'Shoe 2', price: 200 }
];

// Filter products > 150
const expensive = products.filter(p => p.price > 150);
```

### Giai đoạn 2: JavaScript Nâng cao (2-3 tuần)

#### Tuần 4-5: ES6+ và OOP
- [ ] ES6 Modules (import/export)
- [ ] Classes và Inheritance
- [ ] Destructuring và Spread Operator
- [ ] Template Literals
- [ ] Array Methods nâng cao

**Thực hành:**
```javascript
// Module Pattern
// file: product.js
export class Product {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    
    getInfo() {
        return `${this.name}: ${this.price}đ`;
    }
}

// file: main.js
import { Product } from './product.js';
const shoe = new Product('Nike Air', 2000000);
console.log(shoe.getInfo());
```

#### Tuần 6: LocalStorage và State Management
- [ ] LocalStorage API
- [ ] JSON parse/stringify
- [ ] State management patterns

**Thực hành:**
```javascript
// Lưu và lấy dữ liệu
const user = { name: 'John', email: 'john@example.com' };
localStorage.setItem('currentUser', JSON.stringify(user));

const savedUser = JSON.parse(localStorage.getItem('currentUser'));
console.log(savedUser.name); // 'John'
```

### Giai đoạn 3: Phân tích Project (2 tuần)

#### Tuần 7-8: Đọc hiểu Code Base
- [ ] Phân tích cấu trúc thư mục
- [ ] Hiểu flow của từng chức năng
- [ ] Debug và test các tính năng
- [ ] Thử sửa đổi và thêm tính năng nhỏ

---

## Kiến thức Nền tảng

### 1. HTML Semantic Tags

```html
<!-- ❌ Không tốt -->
<div class="header">
    <div class="nav">...</div>
</div>

<!-- ✅ Tốt hơn -->
<header>
    <nav>...</nav>
</header>
```

**Các tags quan trọng trong project:**
- `<header>`: Header trang
- `<nav>`: Navigation menu
- `<main>`: Nội dung chính
- `<section>`: Các phần nội dung
- `<article>`: Nội dung độc lập
- `<footer>`: Footer trang

### 2. CSS Flexbox

```css
/* Container */
.product-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
}

/* Items */
.product-card {
    flex: 0 0 calc(33.333% - 14px); /* 3 items per row */
}

/* Mobile responsive */
@media (max-width: 768px) {
    .product-card {
        flex: 0 0 100%; /* 1 item per row */
    }
}
```

### 3. JavaScript Events

```javascript
// Event Delegation (Hiệu quả hơn)
document.addEventListener('click', function(e) {
    // Kiểm tra nếu click vào button add-to-cart
    if (e.target.matches('.add-to-cart-btn')) {
        const productId = e.target.dataset.id;
        addToCart(productId);
    }
    
    // Kiểm tra nếu click vào button delete
    if (e.target.matches('.delete-btn')) {
        const itemId = e.target.closest('.cart-item').dataset.id;
        removeFromCart(itemId);
    }
});
```

### 4. ES6 Modules

```javascript
// ===== product.js =====
export class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

export function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
}

// ===== main.js =====
import { Product, formatPrice } from './product.js';

const shoe = new Product(1, 'Nike', 2000000);
console.log(formatPrice(shoe.price)); // "2.000.000đ"
```

---

## Phân tích Code Chi tiết

### 1. Luồng Đăng nhập User

```javascript
// ===== Bước 1: User nhập thông tin =====
// File: login-modal.js
function handleLogin(username, password) {
    // 1. Tạo instance UserManager
    const userManager = new UserManager();
    
    // 2. Gọi hàm đăng nhập
    const user = userManager.dangNhap(username, password);
    
    // 3. Kiểm tra kết quả
    if (user) {
        // Đăng nhập thành công
        localStorage.setItem('nguoiDungHienTai', JSON.stringify(user));
        updateUIAfterLogin(user);
        closeLoginModal();
    } else {
        // Đăng nhập thất bại
        showError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
}

// ===== Bước 2: UserManager xác thực =====
// File: user.js
class UserManager {
    dangNhap(tenDangNhap, matKhau) {
        // 1. Tìm user trong danh sách
        const user = this.users.find(u => 
            u.tenDangNhap === tenDangNhap
        );
        
        // 2. Kiểm tra user có tồn tại không
        if (!user) return null;
        
        // 3. Kiểm tra tài khoản có bị khóa không
        if (user.isLocked) {
            alert('Tài khoản đã bị khóa!');
            return null;
        }
        
        // 4. Kiểm tra mật khẩu
        if (user.kiemTraMatKhau(matKhau)) {
            return user; // Đăng nhập thành công
        }
        
        return null; // Sai mật khẩu
    }
}

// ===== Bước 3: Cập nhật UI =====
function updateUIAfterLogin(user) {
    // Hiển thị tên user
    document.querySelector('.user-name').textContent = user.hoTen;
    
    // Hiển thị menu user
    document.querySelector('.user-menu').style.display = 'block';
    
    // Ẩn nút đăng nhập
    document.querySelector('.login-btn').style.display = 'none';
    
    // Load giỏ hàng của user
    loadUserCart(user.tenDangNhap);
}
```

**Giải thích từng bước:**
1. User nhập username/password vào form
2. Form submit → gọi `handleLogin()`
3. `UserManager.dangNhap()` tìm và verify user
4. Nếu thành công → lưu vào localStorage
5. Update UI để hiển thị thông tin user

### 2. Luồng Thêm Sản phẩm vào Giỏ hàng

```javascript
// ===== Bước 1: User click button =====
// File: main.js
function handleAddToCartClick(e) {
    // 1. Lấy thông tin sản phẩm từ button
    const productId = e.target.dataset.id;
    const card = e.target.closest('.product-card');
    
    // 2. Lấy chi tiết sản phẩm
    const product = productManager.getProductById(productId);
    
    if (!product) {
        console.error('Không tìm thấy sản phẩm');
        return;
    }
    
    // 3. Thông tin để thêm vào giỏ
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        size: 'Chưa chọn', // User sẽ chọn size trong giỏ
        quantity: 1
    };
    
    // 4. Gọi hàm addToCart
    addToCart(cartItem);
}

// ===== Bước 2: Thêm vào giỏ hàng =====
// File: cart.js
export function addToCart(productId, name, price, img, size, color, quantity) {
    // 1. Kiểm tra user đã đăng nhập chưa
    const username = getCurrentUsername();
    if (!username) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        return false;
    }
    
    // 2. Load giỏ hàng hiện tại
    let cart = getCart(); // Lấy từ localStorage
    
    // 3. Tạo identifier unique cho item (id + size)
    const itemIdentifier = `${productId}-${size}`;
    
    // 4. Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(
        item => item.itemIdentifier === itemIdentifier
    );
    
    if (existingItemIndex > -1) {
        // Đã có → Tăng số lượng
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Chưa có → Thêm mới
        cart.push({
            id: productId,
            name,
            price,
            img,
            size,
            color,
            quantity,
            itemIdentifier
        });
    }
    
    // 5. Lưu giỏ hàng vào localStorage
    saveCart(cart);
    
    // 6. Cập nhật UI
    updateCartUI();
    
    // 7. Hiển thị thông báo
    showNotification('Đã thêm vào giỏ hàng');
    
    return true;
}

// ===== Bước 3: Cập nhật UI Giỏ hàng =====
// File: cart-ui.js
function updateCartUI() {
    const cart = getCart();
    
    // 1. Cập nhật số lượng items trên icon
    document.querySelector('.cart-count').textContent = cart.length;
    
    // 2. Render lại danh sách items
    renderCartItems(cart);
    
    // 3. Tính và hiển thị tổng tiền
    const total = calculateCartTotal(cart);
    document.querySelector('.cart-total').textContent = 
        formatPrice(total);
}

function renderCartItems(cart) {
    const html = cart.map(item => `
        <div class="cart-item" data-id="${item.itemIdentifier}">
            <img src="${item.img}" alt="${item.name}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>Size: ${item.size}</p>
                <p>Giá: ${formatPrice(item.price)}</p>
            </div>
            <div class="quantity-control">
                <button class="decrease-qty">-</button>
                <span>${item.quantity}</span>
                <button class="increase-qty">+</button>
            </div>
            <button class="remove-item">Xóa</button>
        </div>
    `).join('');
    
    document.querySelector('.cart-items').innerHTML = html;
}
```

**Giải thích chi tiết:**
1. User click nút "Thêm vào giỏ" → trigger event
2. Lấy thông tin sản phẩm từ ProductManager
3. Kiểm tra user đã đăng nhập chưa
4. Load giỏ hàng hiện tại từ localStorage
5. Check xem item đã có trong giỏ chưa (theo id + size)
6. Nếu có → tăng quantity, nếu chưa → thêm mới
7. Lưu giỏ hàng mới vào localStorage
8. Update UI: badge count, danh sách items, tổng tiền

### 3. Luồng Đặt hàng (Checkout)

```javascript
// ===== Bước 1: User nhấn Thanh toán =====
// File: checkout-ui.js
function handleCheckoutClick() {
    // 1. Kiểm tra giỏ hàng có item không
    const cart = getCart();
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    
    // 2. Validate size đã được chọn chưa
    const hasInvalidSize = cart.some(item => 
        item.size === 'Chưa chọn' || !item.size
    );
    if (hasInvalidSize) {
        alert('Vui lòng chọn size cho tất cả sản phẩm');
        return;
    }
    
    // 3. Kiểm tra tồn kho
    const stockErrors = checkStock(cart);
    if (stockErrors.length > 0) {
        alert('Một số sản phẩm không đủ hàng: ' + 
              stockErrors.join(', '));
        return;
    }
    
    // 4. Mở modal checkout
    openCheckoutModal();
}

// ===== Bước 2: User điền thông tin giao hàng =====
function submitOrder(deliveryInfo) {
    const cart = getCart();
    
    // 1. Tạo object đơn hàng
    const order = {
        id: generateOrderId(), // VD: ORD-2025-001
        date: new Date().toISOString(),
        status: 'new', // new, confirmed, shipping, delivered
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity
        })),
        total: calculateCartTotal(cart),
        deliveryInfo: {
            fullName: deliveryInfo.fullName,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            note: deliveryInfo.note
        }
    };
    
    // 2. Lưu đơn hàng
    const orderManager = new OrderManager();
    const success = orderManager.createOrder(order);
    
    if (success) {
        // 3. Giảm tồn kho
        reduceStockForOrder(cart);
        
        // 4. Xóa giỏ hàng
        clearCart();
        
        // 5. Hiển thị thông báo thành công
        showSuccessMessage(order.id);
        
        // 6. Redirect về trang lịch sử đơn hàng
        setTimeout(() => {
            window.location.href = '/profile.html#orders';
        }, 2000);
    }
}

// ===== Bước 3: Giảm tồn kho =====
// File: inventory.js
function reduceStockForOrder(cart) {
    cart.forEach(item => {
        const product = productManager.getProductById(item.id);
        
        if (product && product.variants) {
            // Tìm variant theo size
            const variant = product.variants.find(
                v => v.size.toString() === item.size.toString()
            );
            
            if (variant) {
                // Giảm stock
                variant.stock -= item.quantity;
                
                // Record vào sales history
                product.sales = product.sales || [];
                product.sales.push({
                    date: new Date().toISOString(),
                    size: item.size,
                    quantity: item.quantity,
                    orderId: currentOrderId
                });
            }
        }
    });
    
    // Lưu lại products đã update
    productManager.saveProducts();
}
```

**Flow tổng quan:**
```
User click Thanh toán
    ↓
Validate giỏ hàng (có items, đã chọn size, đủ stock)
    ↓
Mở modal nhập thông tin giao hàng
    ↓
User điền thông tin và confirm
    ↓
Tạo object Order mới
    ↓
Lưu Order vào localStorage
    ↓
Giảm tồn kho (stock của từng size variant)
    ↓
Xóa giỏ hàng
    ↓
Hiển thị thông báo thành công
    ↓
Redirect về trang lịch sử đơn hàng
```

### 4. Quản lý Tồn kho theo Size

```javascript
// ===== Cấu trúc dữ liệu Product =====
const product = {
    id: 1,
    name: "Nike Air Max",
    price: 2000000,
    categoryId: "C001",
    
    // Variants: Các phiên bản theo size
    variants: [
        { size: 38, stock: 10, price: 2000000 },
        { size: 39, stock: 15, price: 2000000 },
        { size: 40, stock: 20, price: 2000000 },
        { size: 41, stock: 8, price: 2000000 }
    ],
    
    // Giá vốn (cost price)
    costPrice: 1500000,
    
    // Ngưỡng cảnh báo tồn kho thấp
    lowStockThreshold: 5,
    
    // Lịch sử nhập hàng
    imports: [
        {
            date: "2025-01-15",
            size: 39,
            quantity: 10,
            costPrice: 1500000,
            note: "Nhập đợt 1"
        }
    ],
    
    // Lịch sử bán hàng
    sales: [
        {
            date: "2025-01-20",
            size: 39,
            quantity: 2,
            orderId: "ORD-2025-001"
        }
    ]
};

// ===== Các hàm xử lý Inventory =====
class InventoryManager {
    // Lấy tổng tồn kho của sản phẩm
    getTotalStock(productId) {
        const product = productManager.getProductById(productId);
        if (!product || !product.variants) return 0;
        
        return product.variants.reduce((total, variant) => {
            return total + variant.stock;
        }, 0);
    }
    
    // Lấy tồn kho của size cụ thể
    getStockBySize(productId, size) {
        const product = productManager.getProductById(productId);
        if (!product || !product.variants) return 0;
        
        const variant = product.variants.find(
            v => v.size.toString() === size.toString()
        );
        
        return variant ? variant.stock : 0;
    }
    
    // Kiểm tra tồn kho thấp
    checkLowStock(productId) {
        const product = productManager.getProductById(productId);
        if (!product) return [];
        
        const lowStockVariants = product.variants.filter(
            v => v.stock <= product.lowStockThreshold
        );
        
        return lowStockVariants.map(v => ({
            size: v.size,
            stock: v.stock,
            threshold: product.lowStockThreshold
        }));
    }
    
    // Nhập hàng
    importStock(productId, size, quantity, costPrice, note) {
        const product = productManager.getProductById(productId);
        if (!product) return false;
        
        // Tìm variant theo size
        const variant = product.variants.find(
            v => v.size.toString() === size.toString()
        );
        
        if (variant) {
            // Cộng thêm stock
            variant.stock += quantity;
            
            // Record vào import history
            product.imports = product.imports || [];
            product.imports.push({
                date: new Date().toISOString(),
                size: size,
                quantity: quantity,
                costPrice: costPrice,
                note: note
            });
            
            // Lưu lại
            productManager.saveProducts();
            return true;
        }
        
        return false;
    }
    
    // Render báo cáo tồn kho
    renderInventoryReport() {
        const products = productManager.getAllProducts();
        
        const html = products.map(product => {
            const totalStock = this.getTotalStock(product.id);
            const lowStock = this.checkLowStock(product.id);
            
            return `
                <tr class="${lowStock.length > 0 ? 'low-stock' : ''}">
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${totalStock}</td>
                    <td>
                        ${product.variants.map(v => `
                            <div>Size ${v.size}: ${v.stock}</div>
                        `).join('')}
                    </td>
                    <td>
                        ${lowStock.length > 0 
                            ? '<span class="badge warning">Tồn kho thấp</span>'
                            : '<span class="badge success">OK</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
        
        document.querySelector('#inventory-table tbody').innerHTML = html;
    }
}
```

---

## Bài tập Thực hành

### Bài tập 1: Thêm chức năng Wishlist (Yêu thích)

**Yêu cầu:**
- Thêm icon trái tim vào mỗi product card
- Click vào icon → thêm/xóa khỏi wishlist
- Lưu wishlist vào localStorage theo user
- Tạo trang xem danh sách wishlist

**Gợi ý code:**

```javascript
// wishlist.js
class WishlistManager {
    constructor() {
        this.STORAGE_KEY = 'wishlist_';
    }
    
    getWishlist() {
        const username = getCurrentUsername();
        if (!username) return [];
        
        const key = this.STORAGE_KEY + username;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    
    addToWishlist(productId) {
        const wishlist = this.getWishlist();
        
        // Kiểm tra đã có chưa
        if (wishlist.includes(productId)) {
            return false;
        }
        
        wishlist.push(productId);
        this.saveWishlist(wishlist);
        return true;
    }
    
    removeFromWishlist(productId) {
        let wishlist = this.getWishlist();
        wishlist = wishlist.filter(id => id !== productId);
        this.saveWishlist(wishlist);
    }
    
    isInWishlist(productId) {
        const wishlist = this.getWishlist();
        return wishlist.includes(productId);
    }
    
    saveWishlist(wishlist) {
        const username = getCurrentUsername();
        if (!username) return;
        
        const key = this.STORAGE_KEY + username;
        localStorage.setItem(key, JSON.stringify(wishlist));
    }
}

// Thêm vào product card
function renderProductCard(product) {
    const wishlistManager = new WishlistManager();
    const isLiked = wishlistManager.isInWishlist(product.id);
    
    return `
        <div class="product-card" data-id="${product.id}">
            <button class="wishlist-btn ${isLiked ? 'active' : ''}"
                    data-id="${product.id}">
                <i class="fas fa-heart"></i>
            </button>
            <!-- ... rest of card ... -->
        </div>
    `;
}

// Event handler
document.addEventListener('click', function(e) {
    if (e.target.closest('.wishlist-btn')) {
        const btn = e.target.closest('.wishlist-btn');
        const productId = btn.dataset.id;
        const wishlistManager = new WishlistManager();
        
        if (btn.classList.contains('active')) {
            wishlistManager.removeFromWishlist(productId);
            btn.classList.remove('active');
        } else {
            wishlistManager.addToWishlist(productId);
            btn.classList.add('active');
        }
    }
});
```

### Bài tập 2: Thêm Rating và Review

**Yêu cầu:**
- User có thể đánh giá sản phẩm (1-5 sao)
- User có thể viết review
- Hiển thị rating trung bình
- Hiển thị danh sách reviews

**Gợi ý code:**

```javascript
// review.js
class ReviewManager {
    constructor() {
        this.STORAGE_KEY = 'reviews';
    }
    
    getReviews(productId) {
        const allReviews = this.getAllReviews();
        return allReviews.filter(r => r.productId === productId);
    }
    
    getAllReviews() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    addReview(productId, rating, comment) {
        const username = getCurrentUsername();
        if (!username) {
            alert('Vui lòng đăng nhập để đánh giá');
            return false;
        }
        
        const reviews = this.getAllReviews();
        
        // Kiểm tra user đã review chưa
        const existingIndex = reviews.findIndex(
            r => r.productId === productId && r.username === username
        );
        
        const review = {
            id: Date.now(),
            productId: productId,
            username: username,
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        };
        
        if (existingIndex > -1) {
            // Update existing review
            reviews[existingIndex] = review;
        } else {
            // Add new review
            reviews.push(review);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
        
        // Update product rating
        this.updateProductRating(productId);
        
        return true;
    }
    
    getAverageRating(productId) {
        const reviews = this.getReviews(productId);
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((total, r) => total + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }
    
    updateProductRating(productId) {
        const product = productManager.getProductById(productId);
        if (!product) return;
        
        const avgRating = this.getAverageRating(productId);
        const reviewCount = this.getReviews(productId).length;
        
        product.rating = parseFloat(avgRating);
        product.ratingCount = reviewCount;
        
        productManager.saveProducts();
    }
}
```

### Bài tập 3: Thêm bộ lọc nâng cao

**Yêu cầu:**
- Lọc theo khoảng giá
- Lọc theo rating
- Lọc theo size available
- Sắp xếp theo giá, tên, rating

**Gợi ý code:**

```javascript
// filter.js
class ProductFilter {
    constructor() {
        this.filters = {
            category: null,
            priceMin: 0,
            priceMax: Infinity,
            rating: 0,
            size: null,
            inStock: false
        };
        
        this.sortBy = 'default'; // default, price-asc, price-desc, name, rating
    }
    
    applyFilters(products) {
        let filtered = products;
        
        // Filter by category
        if (this.filters.category) {
            filtered = filtered.filter(
                p => p.categoryId === this.filters.category
            );
        }
        
        // Filter by price range
        filtered = filtered.filter(
            p => p.price >= this.filters.priceMin && 
                 p.price <= this.filters.priceMax
        );
        
        // Filter by rating
        if (this.filters.rating > 0) {
            filtered = filtered.filter(
                p => p.rating >= this.filters.rating
            );
        }
        
        // Filter by size availability
        if (this.filters.size) {
            filtered = filtered.filter(p => {
                if (!p.variants) return false;
                const variant = p.variants.find(
                    v => v.size.toString() === this.filters.size.toString()
                );
                return variant && variant.stock > 0;
            });
        }
        
        // Filter in stock only
        if (this.filters.inStock) {
            filtered = filtered.filter(p => {
                const totalStock = p.variants?.reduce(
                    (sum, v) => sum + v.stock, 0
                ) || 0;
                return totalStock > 0;
            });
        }
        
        // Apply sorting
        return this.sortProducts(filtered);
    }
    
    sortProducts(products) {
        const sorted = [...products];
        
        switch (this.sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            
            case 'name':
                return sorted.sort((a, b) => 
                    a.name.localeCompare(b.name, 'vi')
                );
            
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            
            default:
                return sorted;
        }
    }
    
    setFilter(filterName, value) {
        this.filters[filterName] = value;
    }
    
    setSortBy(sortBy) {
        this.sortBy = sortBy;
    }
    
    resetFilters() {
        this.filters = {
            category: null,
            priceMin: 0,
            priceMax: Infinity,
            rating: 0,
            size: null,
            inStock: false
        };
        this.sortBy = 'default';
    }
}

// Usage
const filter = new ProductFilter();

// Set filters
filter.setFilter('priceMin', 1000000);
filter.setFilter('priceMax', 3000000);
filter.setFilter('rating', 4);
filter.setSortBy('price-asc');

// Apply filters
const allProducts = productManager.getAllProducts();
const filteredProducts = filter.applyFilters(allProducts);

// Render
renderProducts(filteredProducts);
```

---

## Troubleshooting

### Vấn đề 1: Module Import Error

**Lỗi:**
```
Uncaught SyntaxError: Cannot use import statement outside a module
```

**Nguyên nhân:**
- Quên thêm `type="module"` vào script tag
- Đang mở file HTML trực tiếp (file://) thay vì qua web server

**Giải pháp:**
```html
<!-- ✅ Đúng -->
<script type="module" src="./js/main.js"></script>

<!-- ❌ Sai -->
<script src="./js/main.js"></script>
```

Và phải chạy qua web server:
```bash
# Dùng Python
python -m http.server 8000

# Hoặc dùng Live Server trong VS Code
```

### Vấn đề 2: LocalStorage không lưu được

**Lỗi:**
```
QuotaExceededError: DOM Exception 22
```

**Nguyên nhân:**
- LocalStorage đầy (giới hạn ~5-10MB)
- Lưu quá nhiều dữ liệu không cần thiết

**Giải pháp:**
```javascript
// Kiểm tra dung lượng
function checkLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    console.log(`LocalStorage size: ${(total / 1024).toFixed(2)} KB`);
}

// Xóa dữ liệu cũ
function cleanOldData() {
    const keysToRemove = [];
    
    for (let key in localStorage) {
        if (key.startsWith('old_') || key.startsWith('temp_')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}
```

### Vấn đề 3: Cart không sync giữa các tabs

**Nguyên nhân:**
- Mỗi tab load LocalStorage độc lập
- Không có communication giữa tabs

**Giải pháp:**
```javascript
// Lắng nghe storage event để sync giữa tabs
window.addEventListener('storage', function(e) {
    if (e.key && e.key.startsWith('cart_')) {
        // Cart của user bị thay đổi ở tab khác
        updateCartUI();
    }
});

// Broadcast cart changes
function saveCart(cart) {
    const username = getCurrentUsername();
    if (!username) return;
    
    const cartKey = `cart_${username}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Trigger storage event manually cho current tab
    window.dispatchEvent(new StorageEvent('storage', {
        key: cartKey,
        newValue: JSON.stringify(cart)
    }));
}
```

### Vấn đề 4: Giá sản phẩm bị lỗi format

**Lỗi:**
```
// Hiển thị: NaN đ
// Hoặc: 2000000 đ (không có dấu phẩy)
```

**Giải pháp:**
```javascript
// Hàm format giá đúng cách
function formatPrice(price) {
    // Đảm bảo price là number
    const numPrice = Number(price) || 0;
    
    // Format với locale Vietnam
    return numPrice.toLocaleString('vi-VN') + 'đ';
}

// Sử dụng
console.log(formatPrice(2000000)); // "2.000.000đ"
console.log(formatPrice("2000000")); // "2.000.000đ"
console.log(formatPrice(null)); // "0đ"
```

### Vấn đề 5: Event listener bị duplicate

**Nguyên nhân:**
- Thêm event listener nhiều lần
- Không remove listener cũ khi re-render

**Giải pháp:**
```javascript
// ❌ Sai - Mỗi lần render thêm 1 listener mới
function renderProduct(product) {
    const html = `<button class="add-cart">Add</button>`;
    container.innerHTML = html;
    
    // Listener bị duplicate!
    document.querySelector('.add-cart').addEventListener('click', handleClick);
}

// ✅ Đúng - Dùng event delegation
document.addEventListener('click', function(e) {
    if (e.target.matches('.add-cart')) {
        handleClick(e);
    }
});

// Hoặc remove listener cũ trước khi thêm mới
function renderProduct(product) {
    const html = `<button class="add-cart">Add</button>`;
    container.innerHTML = html;
    
    const btn = document.querySelector('.add-cart');
    // Remove old listener (nếu có)
    btn.removeEventListener('click', handleClick);
    // Add new listener
    btn.addEventListener('click', handleClick);
}
```

---

## Tài nguyên Bổ sung

### Video Tutorials (Tiếng Việt)
- [Học JavaScript căn bản - Evondev](https://www.youtube.com/playlist?list=PLd8OdiciAE_JWDkl5BPUrw8eHIk0Wuqrm)
- [HTML CSS từ Zero đến Hero - F8](https://fullstack.edu.vn/courses/html-css)
- [JavaScript Nâng cao - Hau Nguyen](https://www.youtube.com/@haunt)

### Tools Hữu ích
- [JSON Formatter](https://jsonformatter.org/) - Format và validate JSON
- [Can I Use](https://caniuse.com/) - Check browser compatibility
- [RegExr](https://regexr.com/) - Test Regular Expressions
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/) - Generate CSS Grid layouts

### Chrome DevTools Tips
```javascript
// 1. Xem tất cả keys trong localStorage
console.table(Object.entries(localStorage));

// 2. Clear localStorage
localStorage.clear();

// 3. Debug breakpoint
debugger; // Code sẽ pause tại dòng này

// 4. Log với style
console.log('%c Success!', 'color: green; font-size: 20px');

// 5. Time một function
console.time('renderProducts');
renderProducts(products);
console.timeEnd('renderProducts'); // Hiển thị thời gian thực thi
```

---

**Chúc bạn học tập hiệu quả! Hãy kiên nhẫn và thực hành nhiều!** 💪🚀
