# 🏛️ Kiến trúc Hệ thống ShoeStore

## Tổng quan Kiến trúc

ShoeStore được xây dựng theo mô hình **Client-side MVC-like** với các layer rõ ràng:

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (View)             │
│  - HTML Templates                               │
│  - CSS Styling                                  │
│  - UI Rendering Functions                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│        Business Logic Layer (Controller)        │
│  - Event Handlers                               │
│  - Form Validation                              │
│  - State Management                             │
│  - API-like Functions                           │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            Data Layer (Model)                   │
│  - Product Model                                │
│  - User Model                                   │
│  - Order Model                                  │
│  - Category Model                               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            Storage Layer                        │
│  - LocalStorage API                             │
│  - Data Persistence                             │
└─────────────────────────────────────────────────┘
```

---

## Chi tiết các Layer

### 1. Presentation Layer (View)

Chịu trách nhiệm hiển thị giao diện người dùng và nhận input.

#### Các file chính:
- `index.html` - Trang chủ khách hàng
- `admin-index.html` - Trang quản trị
- `product-detail.html` - Chi tiết sản phẩm
- `profile.html` - Trang thông tin cá nhân

#### Rendering Functions:
```javascript
// renderProducts.js
export function renderProducts(products, container) {
    const html = products.map(product => createProductCard(product)).join('');
    container.innerHTML = html;
}

// cart-ui.js
export function renderCartItems(cart) {
    const html = cart.map(item => createCartItemHTML(item)).join('');
    cartContainer.innerHTML = html;
}

// order-history-ui.js
export function renderOrderHistory(orders) {
    const html = orders.map(order => createOrderCard(order)).join('');
    orderContainer.innerHTML = html;
}
```

**Patterns sử dụng:**
- Template Literals cho dynamic HTML
- Array.map() để transform data sang HTML
- Event Delegation cho performance
- CSS Modules cho styling isolation

---

### 2. Business Logic Layer (Controller)

Xử lý logic nghiệp vụ và điều phối giữa View và Model.

#### Product Management Flow

```javascript
// ProductManager.js
class ProductManager {
    constructor() {
        this.STORAGE_KEY = 'products_shoestore';
        this.products = this.loadProducts();
    }
    
    // CRUD Operations
    addProduct(product) { ... }
    updateProduct(id, updates) { ... }
    deleteProduct(id) { ... }
    getProductById(id) { ... }
    getAllProducts() { ... }
    
    // Business Logic
    searchProducts(keyword) { ... }
    filterByCategory(categoryId) { ... }
    sortProducts(sortBy) { ... }
    
    // Persistence
    saveProducts() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
    }
    
    loadProducts() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultProducts();
    }
}
```

#### Cart Management Flow

```javascript
// cart.js
export function addToCart(productId, name, price, img, size, quantity) {
    // 1. Validation
    if (!validateCartItem(productId, size, quantity)) {
        return false;
    }
    
    // 2. Check authentication
    const username = getCurrentUsername();
    if (!username) {
        showLoginModal();
        return false;
    }
    
    // 3. Load current cart
    let cart = getCart();
    
    // 4. Check for duplicates
    const itemIdentifier = `${productId}-${size}`;
    const existingIndex = cart.findIndex(
        item => item.itemIdentifier === itemIdentifier
    );
    
    // 5. Update or add
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ productId, name, price, img, size, quantity, itemIdentifier });
    }
    
    // 6. Validate stock
    if (!checkStock(productId, size, cart[existingIndex || cart.length - 1].quantity)) {
        alert('Không đủ hàng trong kho');
        return false;
    }
    
    // 7. Save and update UI
    saveCart(cart);
    updateCartUI();
    showNotification('Đã thêm vào giỏ hàng');
    
    return true;
}
```

#### Order Management Flow

```javascript
// order-manager.js
class OrderManager {
    constructor() {
        this.STORAGE_KEY_PREFIX = 'orders_';
    }
    
    createOrder(orderData) {
        // 1. Generate order ID
        const orderId = this.generateOrderId();
        
        // 2. Create order object
        const order = {
            id: orderId,
            date: new Date().toISOString(),
            status: 'new',
            items: orderData.items,
            total: orderData.total,
            deliveryInfo: orderData.deliveryInfo,
            username: getCurrentUsername()
        };
        
        // 3. Save order
        const orders = this.getUserOrders();
        orders.push(order);
        this.saveOrders(orders);
        
        // 4. Update inventory
        this.reduceInventory(order.items);
        
        // 5. Clear cart
        clearCart();
        
        return order;
    }
    
    updateOrderStatus(orderId, newStatus) {
        const orders = this.getUserOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            order.status = newStatus;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: newStatus,
                date: new Date().toISOString()
            });
            
            this.saveOrders(orders);
            return true;
        }
        
        return false;
    }
}
```

---

### 3. Data Layer (Model)

Định nghĩa cấu trúc dữ liệu và business rules.

#### Product Model

```javascript
// Product.js
export class Product {
    constructor({
        id,
        name,
        categoryId,
        price,
        oldPrice = null,
        img,
        images = [],
        description = '',
        variants = [],
        costPrice = 0,
        lowStockThreshold = 5,
        imports = [],
        sales = [],
        isHidden = false,
        rating = 0,
        ratingCount = 0,
        badge = null
    }) {
        // Basic Info
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        
        // Pricing
        this.price = price;
        this.oldPrice = oldPrice;
        this.costPrice = costPrice;
        
        // Media
        this.img = img;
        this.images = images.length > 0 ? images : [img];
        
        // Details
        this.description = description;
        this.badge = badge; // 'hot', 'sale', 'new'
        
        // Inventory
        this.variants = variants; // [{ size, stock, price? }]
        this.lowStockThreshold = lowStockThreshold;
        this.imports = imports;
        this.sales = sales;
        this.isHidden = isHidden;
        
        // Reviews
        this.rating = rating;
        this.ratingCount = ratingCount;
    }
    
    // Methods
    calculateTotalStock() {
        return this.variants.reduce((total, v) => total + v.stock, 0);
    }
    
    getStockBySize(size) {
        const variant = this.variants.find(
            v => v.size.toString() === size.toString()
        );
        return variant ? variant.stock : 0;
    }
    
    hasLowStock() {
        const totalStock = this.calculateTotalStock();
        return totalStock <= this.lowStockThreshold;
    }
    
    isAvailable() {
        return !this.isHidden && this.calculateTotalStock() > 0;
    }
    
    getPriceBySize(size) {
        const variant = this.variants.find(
            v => v.size.toString() === size.toString()
        );
        return variant?.price || this.price;
    }
    
    addImport(importData) {
        this.imports.push({
            date: new Date().toISOString(),
            ...importData
        });
        
        // Update stock
        const variant = this.variants.find(
            v => v.size.toString() === importData.size.toString()
        );
        if (variant) {
            variant.stock += importData.quantity;
        }
    }
    
    recordSale(saleData) {
        this.sales.push({
            date: new Date().toISOString(),
            ...saleData
        });
        
        // Reduce stock
        const variant = this.variants.find(
            v => v.size.toString() === saleData.size.toString()
        );
        if (variant && variant.stock >= saleData.quantity) {
            variant.stock -= saleData.quantity;
        }
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            categoryId: this.categoryId,
            price: this.price,
            oldPrice: this.oldPrice,
            img: this.img,
            images: this.images,
            description: this.description,
            variants: this.variants,
            costPrice: this.costPrice,
            lowStockThreshold: this.lowStockThreshold,
            imports: this.imports,
            sales: this.sales,
            isHidden: this.isHidden,
            rating: this.rating,
            ratingCount: this.ratingCount,
            badge: this.badge
        };
    }
}
```

#### User Model

```javascript
// user.js
class User {
    constructor(hoTen, tenDangNhap, email, matKhau, orders = [], isLocked = false) {
        this.hoTen = hoTen;
        this.tenDangNhap = tenDangNhap;
        this.email = email;
        this.matKhau = matKhau;
        this.orders = orders;
        this.isLocked = isLocked;
        this.createdAt = new Date().toISOString();
    }
    
    // Authentication
    kiemTraMatKhau(matKhauNhap) {
        return this.matKhau === matKhauNhap;
    }
    
    // Order Management
    addOrder(order) {
        this.orders.push(order);
    }
    
    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    }
    
    getTotalSpent() {
        return this.orders.reduce((total, order) => total + order.total, 0);
    }
    
    // Account Status
    lock() {
        this.isLocked = true;
    }
    
    unlock() {
        this.isLocked = false;
    }
    
    isActive() {
        return !this.isLocked;
    }
}
```

#### Category Model

```javascript
// category.js
class Category {
    constructor(id, name, description = '', icon = '', isActive = true) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.isActive = isActive;
    }
    
    getProductCount() {
        const productManager = new ProductManager();
        const products = productManager.getAllProducts();
        return products.filter(p => p.categoryId === this.id).length;
    }
}
```

---

### 4. Storage Layer

Quản lý persistence với LocalStorage.

#### Storage Keys Structure

```javascript
// User-related
'users_shoestore'           // Array<User>
'nguoiDungHienTai'         // Current logged-in User (end user)
'nguoiDungAdmin'           // Current logged-in Admin

// Product-related
'products_shoestore'       // Array<Product>
'categories_shoestore'     // Array<Category>

// Cart (per user)
'cart_{username}'          // Array<CartItem>

// Orders (per user)
'orders_{username}'        // Array<Order>

// Other
'import_slips'            // Array<ImportSlip>
'price_history'           // Array<PriceChange>
```

#### Storage Utils

```javascript
// storage-utils.js
export const StorageUtils = {
    // Generic get/set
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error getting ${key}:`, e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error setting ${key}:`, e);
            
            if (e.name === 'QuotaExceededError') {
                alert('Bộ nhớ đã đầy. Vui lòng xóa dữ liệu cũ.');
            }
            
            return false;
        }
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    clear() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu?')) {
            localStorage.clear();
            window.location.reload();
        }
    },
    
    // Size monitoring
    getSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    },
    
    getSizeInKB() {
        return (this.getSize() / 1024).toFixed(2);
    },
    
    // Backup/Restore
    backup() {
        const data = {};
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                data[key] = localStorage[key];
            }
        }
        return JSON.stringify(data);
    },
    
    restore(backupString) {
        try {
            const data = JSON.parse(backupString);
            for (let key in data) {
                localStorage.setItem(key, data[key]);
            }
            return true;
        } catch (e) {
            console.error('Error restoring backup:', e);
            return false;
        }
    }
};
```

---

## Data Flow Diagrams

### 1. User Login Flow

```
User Input (username, password)
    ↓
handleLogin() [login-modal.js]
    ↓
UserManager.dangNhap() [user.js]
    ├── Load users from localStorage
    ├── Find user by username
    ├── Check if locked
    └── Verify password
    ↓
Return User object or null
    ↓
If successful:
    ├── Save to localStorage['nguoiDungHienTai']
    ├── Update UI (show username, menu)
    ├── Load user's cart
    └── Close login modal
If failed:
    └── Show error message
```

### 2. Add to Cart Flow

```
User clicks "Add to Cart"
    ↓
handleAddToCartClick() [main.js]
    ├── Get product ID from button
    ├── Get product details from ProductManager
    └── Prepare cart item data
    ↓
addToCart() [cart.js]
    ├── Check if user logged in
    ├── Load current cart from localStorage
    ├── Check for duplicate (same product + size)
    ├── Update quantity or add new item
    ├── Validate stock availability
    ├── Save cart to localStorage['cart_{username}']
    └── Update UI
    ↓
updateCartUI() [cart-ui.js]
    ├── Update cart badge count
    ├── Render cart items
    └── Calculate and display total
```

### 3. Checkout Flow

```
User clicks "Checkout"
    ↓
handleCheckoutClick() [checkout-ui.js]
    ├── Validate cart (not empty, sizes selected)
    ├── Check stock for all items
    └── Open checkout modal
    ↓
User fills delivery info and confirms
    ↓
submitOrder() [checkout-ui.js]
    ├── Create order object with:
    │   ├── Generated order ID
    │   ├── Cart items
    │   ├── Delivery info
    │   ├── Total amount
    │   └── Timestamp
    ↓
OrderManager.createOrder() [order-manager.js]
    ├── Save order to localStorage['orders_{username}']
    ├── Update product inventory (reduce stock)
    ├── Record sales in product history
    └── Return order confirmation
    ↓
Post-order actions:
    ├── Clear cart
    ├── Show success message
    └── Redirect to order history
```

### 4. Admin Product Management Flow

```
Admin adds/edits product
    ↓
Product form submission
    ↓
validateProductForm() [product-admin.js]
    ├── Validate required fields
    ├── Validate price > 0
    ├── Validate cost price < selling price
    └── Validate variants (size, stock)
    ↓
If valid:
ProductManager.addProduct() or updateProduct()
    ├── Create Product instance
    ├── Add to products array
    ├── Save to localStorage['products_shoestore']
    └── Trigger re-render
    ↓
renderProductsTable() [product-admin.js]
    ├── Get all products
    ├── Generate table HTML
    └── Update DOM
```

---

## State Management

### Global State
```javascript
// Được quản lý trong window object hoặc modules
window.currentUser = null;
window.cart = [];
window.productManager = new ProductManager();
window.userManager = new UserManager();
```

### Local State
```javascript
// Mỗi module quản lý state riêng
// cart.js
let cartCache = null;

function getCart() {
    if (!cartCache) {
        cartCache = loadCartFromStorage();
    }
    return cartCache;
}

function invalidateCartCache() {
    cartCache = null;
}
```

### Reactive Updates
```javascript
// Event-based updates
window.addEventListener('cartUpdated', function(e) {
    updateCartBadge();
    renderCartSidebar();
});

// Trigger from cart.js
function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cart }
    }));
}
```

---

## Security Considerations

### 1. Input Validation
```javascript
// Validate email (simplified example)
// Note: For production, use a more robust validation library or comprehensive regex
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Sanitize HTML
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Validate price
function isValidPrice(price) {
    const num = Number(price);
    return !isNaN(num) && num > 0;
}
```

### 2. Authentication Check
```javascript
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const admin = getAdminUser();
    if (!admin || admin.tenDangNhap !== 'admin') {
        alert('Bạn không có quyền truy cập');
        window.location.href = '/index.html';
        return false;
    }
    return true;
}
```

### 3. Data Integrity
```javascript
// Validate cart items before checkout
function validateCart(cart) {
    const errors = [];
    
    cart.forEach(item => {
        // Check product exists
        const product = productManager.getProductById(item.id);
        if (!product) {
            errors.push(`Sản phẩm ${item.name} không tồn tại`);
            return;
        }
        
        // Check stock
        const stock = product.getStockBySize(item.size);
        if (stock < item.quantity) {
            errors.push(`${item.name} size ${item.size} chỉ còn ${stock} sản phẩm`);
        }
        
        // Validate price
        if (item.price !== product.price) {
            errors.push(`Giá ${item.name} đã thay đổi`);
        }
    });
    
    return errors;
}
```

---

## Performance Optimization

### 1. Event Delegation
```javascript
// ❌ Kém hiệu quả - Nhiều listeners
products.forEach(product => {
    document.querySelector(`#product-${product.id} .add-cart`)
        .addEventListener('click', handleClick);
});

// ✅ Tốt hơn - 1 listener cho tất cả
document.addEventListener('click', function(e) {
    if (e.target.matches('.add-cart')) {
        handleClick(e);
    }
});
```

### 2. Debouncing Search
```javascript
let searchTimeout;

function handleSearchInput(e) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const keyword = e.target.value;
        const results = searchProducts(keyword);
        renderSearchResults(results);
    }, 300); // Wait 300ms after user stops typing
}
```

### 3. Caching
```javascript
class ProductManager {
    constructor() {
        this.products = null; // Cache
        this.lastLoadTime = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }
    
    getAllProducts() {
        const now = Date.now();
        
        // Return cached if still valid
        if (this.products && (now - this.lastLoadTime) < this.CACHE_DURATION) {
            return this.products;
        }
        
        // Reload from storage
        this.products = this.loadProducts();
        this.lastLoadTime = now;
        
        return this.products;
    }
    
    invalidateCache() {
        this.products = null;
    }
}
```

### 4. Lazy Loading Images
```javascript
// HTML
<img data-src="./img/product.jpg" class="lazy-load" alt="Product">

// JavaScript
const lazyImages = document.querySelectorAll('.lazy-load');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy-load');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

---

## Testing Strategies

### 1. Manual Testing Checklist

**User Flow:**
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập với tài khoản đã có
- [ ] Xem danh sách sản phẩm
- [ ] Tìm kiếm sản phẩm
- [ ] Lọc theo danh mục
- [ ] Xem chi tiết sản phẩm
- [ ] Thêm vào giỏ hàng
- [ ] Cập nhật số lượng trong giỏ
- [ ] Xóa item khỏi giỏ
- [ ] Đặt hàng
- [ ] Xem lịch sử đơn hàng
- [ ] Đăng xuất

**Admin Flow:**
- [ ] Đăng nhập admin
- [ ] Thêm sản phẩm mới
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Quản lý tồn kho
- [ ] Nhập hàng
- [ ] Quản lý đơn hàng
- [ ] Cập nhật trạng thái đơn hàng

### 2. Unit Testing (Example)

```javascript
// test-product.js
function testProductModel() {
    console.log('Testing Product Model...');
    
    // Test 1: Create product
    const product = new Product({
        id: 1,
        name: 'Test Shoe',
        price: 1000000,
        variants: [
            { size: 39, stock: 10 },
            { size: 40, stock: 15 }
        ]
    });
    
    console.assert(product.name === 'Test Shoe', 'Product name should match');
    console.assert(product.price === 1000000, 'Product price should match');
    
    // Test 2: Calculate total stock
    const totalStock = product.calculateTotalStock();
    console.assert(totalStock === 25, `Total stock should be 25, got ${totalStock}`);
    
    // Test 3: Get stock by size
    const stock39 = product.getStockBySize(39);
    console.assert(stock39 === 10, `Stock for size 39 should be 10, got ${stock39}`);
    
    // Test 4: Record sale
    product.recordSale({ size: 39, quantity: 3 });
    const newStock39 = product.getStockBySize(39);
    console.assert(newStock39 === 7, `Stock after sale should be 7, got ${newStock39}`);
    
    console.log('✅ All Product tests passed!');
}

// Run tests
testProductModel();
```

---

## Deployment

### Static Hosting Options

1. **GitHub Pages** (Free)
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push origin gh-pages

# Access at: https://username.github.io/repo-name
```

2. **Netlify** (Free)
- Drag & drop folder
- Or connect GitHub repo
- Auto deploy on push

3. **Vercel** (Free)
```bash
npm i -g vercel
vercel login
vercel
```

4. **Firebase Hosting** (Free tier)
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Pre-deployment Checklist
- [ ] Test all features
- [ ] Check console for errors
- [ ] Validate all links
- [ ] Test on multiple browsers
- [ ] Test responsive design
- [ ] Optimize images
- [ ] Minify CSS/JS (optional)
- [ ] Check localStorage limits
- [ ] Test with empty/full localStorage

---

**Tài liệu này sẽ được cập nhật khi có thay đổi về kiến trúc.** 📝
