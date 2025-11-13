# 📚 GIẢI THÍCH CHI TIẾT CODE DỰ ÁN SHOESTORE

## 🎯 Mục Lục
1. [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
2. [Giải thích từng dòng code quan trọng](#giải-thích-từng-dòng-code-quan-trọng)
3. [Luồng hoạt động](#luồng-hoạt-động)
4. [Các Pattern được sử dụng](#các-pattern-được-sử-dụng)
5. [Tips và Best Practices](#tips-và-best-practices)

---

## 🏗️ Kiến Trúc Tổng Quan

### Mô hình MVC (Model-View-Controller)

```
┌─────────────────────────────────────────┐
│           VIEW (HTML/CSS)               │
│  - index.html                           │
│  - admin-index.html                     │
│  - product-detail.html                  │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│         CONTROLLER (JS)                 │
│  - main.js                              │
│  - admin.js                             │
│  - cart-ui.js                           │
│  - renderProducts.js                    │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│          MODEL (JS Classes)             │
│  - Product.js                           │
│  - ProductManager.js                    │
│  - User.js (UserManager)                │
│  - cart.js                              │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│      DATA STORAGE (LocalStorage)        │
│  - shoestore_products                   │
│  - users_shoestore                      │
│  - cart_username                        │
│  - orders_username                      │
└─────────────────────────────────────────┘
```

---

## 💡 Giải Thích Từng Dòng Code Quan Trọng

### 1. Product.js - Class định nghĩa Sản phẩm

#### Constructor
```javascript
class Product {
    constructor(data) {
        // ID duy nhất của sản phẩm (kiểu Number)
        this.id = data.id;
        
        // Tên sản phẩm (kiểu String)
        // VD: "Giày Nike Air Max"
        this.name = data.name;
        
        // ID danh mục (kiểu Number)
        // 1 = Thể thao, 2 = Công sở, 3 = Casual...
        this.categoryId = data.categoryId;
        
        // Giá bán hiện tại (kiểu Number, đơn vị VNĐ)
        this.price = data.price;
        
        // Giá cũ trước khi giảm (kiểu Number hoặc null)
        // Nếu null = không giảm giá
        this.oldPrice = data.oldPrice || null;
        
        // URL hoặc path đến ảnh sản phẩm
        this.img = data.img || data.imageUrl;
        
        // Mảng chứa nhiều ảnh (cho gallery)
        // VD: ["img1.jpg", "img2.jpg", "img3.jpg"]
        this.images = data.images || [];
        
        // Mảng variants (biến thể) theo size và màu
        // VD: [{size: 39, color: 'Đen', stock: 10}, ...]
        this.variants = data.variants || [];
        
        // Rating từ 0-5 (kiểu Number)
        this.rating = data.rating || 0;
        
        // Số người đã đánh giá (kiểu Number)
        this.ratingCount = data.ratingCount || 0;
        
        // Badge/nhãn: "sale", "new", "hot" (kiểu String hoặc null)
        this.badge = data.badge || null;
        
        // Mô tả chi tiết sản phẩm (kiểu String)
        this.description = data.description || '';
        
        // Giá vốn - dùng để tính lợi nhuận (kiểu Number)
        this.costPrice = data.costPrice || 0;
        
        // Tồn kho ban đầu (nếu không có variants)
        this.initialStock = data.initialStock || 0;
        
        // Ngưỡng cảnh báo sắp hết hàng (kiểu Number)
        // VD: 5 = cảnh báo khi còn ≤5 sản phẩm
        this.lowStockThreshold = data.lowStockThreshold || 5;
        
        // Lịch sử nhập hàng (kiểu Array)
        // [{date, qty, costPrice, note}, ...]
        this.imports = data.imports || [];
        
        // Lịch sử bán hàng (kiểu Array)
        // [{date, qty}, ...]
        this.sales = data.sales || [];
        
        // Trạng thái ẩn (kiểu Boolean)
        // true = không hiển thị cho khách hàng
        this.isHidden = data.isHidden || false;
        
        // Tỷ lệ lợi nhuận mục tiêu (% - kiểu Number hoặc null)
        this.targetProfitMargin = data.targetProfitMargin || null;
    }
}
```

#### Phương thức getCurrentStock()
```javascript
getCurrentStock() {
    // Kiểm tra xem sản phẩm có variants không
    if (this.variants && this.variants.length > 0) {
        // Nếu có variants, cộng tổng stock của tất cả variants
        // reduce() là hàm tích lũy: duyệt qua từng phần tử và cộng dồn
        // sum: giá trị tích lũy (bắt đầu từ 0)
        // v: mỗi variant trong mảng
        return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        //                            ↑         ↑
        //                        tích lũy  variant hiện tại
    }
    // Nếu không có variants, trả về tồn kho ban đầu
    return this.initialStock || 0;
}
```

**Ví dụ cụ thể**:
```javascript
const product = {
    variants: [
        {size: 39, stock: 5},
        {size: 40, stock: 10},
        {size: 41, stock: 3}
    ]
};

// Cách hoạt động của reduce():
// Vòng 1: sum = 0, v = {size: 39, stock: 5}  → sum = 0 + 5 = 5
// Vòng 2: sum = 5, v = {size: 40, stock: 10} → sum = 5 + 10 = 15
// Vòng 3: sum = 15, v = {size: 41, stock: 3} → sum = 15 + 3 = 18
// Kết quả: 18
```

#### Phương thức getAvailableSizes()
```javascript
getAvailableSizes() {
    // Nếu không có variants, trả về mảng rỗng
    if (this.variants.length === 0) return [];
    
    // Xử lý chuỗi các bước:
    const sizes = this.variants
        // Bước 1: Lọc chỉ lấy variants còn hàng (stock > 0)
        .filter(v => (v.stock || 0) > 0)
        
        // Bước 2: Lấy giá trị size từ mỗi variant
        .map(v => v.size)
        
        // Bước 3: Loại bỏ size null hoặc undefined
        .filter(s => s !== undefined && s !== null);
    
    // Bước 4: Loại bỏ trùng lặp bằng Set
    // Set = tập hợp không trùng lặp
    // [...new Set(arr)] = convert Set về Array
    return [...new Set(sizes)]
        .map(s => Number(s))        // Chuyển sang kiểu số
        .sort((a, b) => a - b);     // Sắp xếp tăng dần
}
```

**Ví dụ**:
```javascript
const variants = [
    {size: 39, stock: 5},
    {size: 40, stock: 0},   // Hết hàng
    {size: 39, stock: 3},   // Trùng size 39
    {size: 41, stock: 2}
];

// Bước 1: filter → [{size: 39, stock: 5}, {size: 39, stock: 3}, {size: 41, stock: 2}]
// Bước 2: map → [39, 39, 41]
// Bước 3: Set → {39, 41}
// Bước 4: Array → [39, 41]
// Kết quả: [39, 41]
```

---

### 2. ProductManager.js - Quản lý Sản phẩm

#### Constructor
```javascript
class ProductManager {
    constructor() {
        // Key để lưu/đọc sản phẩm từ localStorage
        // Giống như tên bảng trong database
        this.STORAGE_KEY = 'shoestore_products';
        
        // Tải sản phẩm khi khởi tạo
        // this.products là mảng chứa tất cả Product objects
        this.products = this.loadProducts();
    }
}
```

#### loadProducts()
```javascript
loadProducts() {
    try {
        // Bước 1: Đọc dữ liệu từ localStorage
        // localStorage.getItem() trả về string hoặc null
        const data = localStorage.getItem(this.STORAGE_KEY);
        
        // Bước 2: Nếu có dữ liệu
        if (data) {
            // Parse JSON string thành JavaScript object
            const productsData = JSON.parse(data);
            
            // Chuyển mỗi plain object thành Product instance
            // Để có thể gọi các methods như getCurrentStock()
            return productsData.map(p => Product.fromJSON(p));
            //                   ↑
            //            duyệt qua từng product data
        }
    } catch (error) {
        // Nếu có lỗi (data bị corrupt, JSON invalid...)
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
    
    // Bước 3: Nếu không có dữ liệu, dùng dữ liệu mẫu
    return productDataList.map((data, index) => new Product({
        id: data.id || index + 1,  // Tạo ID nếu chưa có
        ...data,                   // Spread toàn bộ properties
        variants: data.variants || [],
        costPrice: data.costPrice || data.price * 0.7  // Ước tính giá vốn
    }));
}
```

**Giải thích spread operator (...)**:
```javascript
const data = {name: 'Nike', price: 1000000};

// Không dùng spread:
const product1 = {
    id: 1,
    name: data.name,
    price: data.price,
    // ... phải ghi từng property
};

// Dùng spread (ngắn gọn hơn):
const product2 = {
    id: 1,
    ...data  // Copy tất cả properties từ data
};

// Kết quả: product2 = {id: 1, name: 'Nike', price: 1000000}
```

#### saveProducts()
```javascript
saveProducts() {
    try {
        // Bước 1: Chuyển tất cả Product instances thành plain objects
        // Vì localStorage chỉ lưu string, không lưu được class instances
        const productsData = this.products.map(p => p.toJSON());
        
        // Bước 2: Convert array thành JSON string
        const jsonString = JSON.stringify(productsData);
        
        // Bước 3: Lưu vào localStorage
        localStorage.setItem(this.STORAGE_KEY, jsonString);
        
        return true;  // Thành công
    } catch (error) {
        console.error('Lỗi khi lưu danh sách sản phẩm:', error);
        return false;  // Thất bại
    }
}
```

---

### 3. cart.js - Xử lý Giỏ hàng

#### getCurrentUsername()
```javascript
function getCurrentUsername() {
    try {
        // Bước 1: Đọc dữ liệu user hiện tại từ localStorage
        const currentUserData = localStorage.getItem(USER_MANAGER_KEY);
        
        // Bước 2: Nếu có dữ liệu
        if (currentUserData) {
            // Parse JSON thành object
            const user = JSON.parse(currentUserData);
            
            // Trả về username (để tạo key giỏ hàng riêng)
            return user.tenDangNhap;
        }
    } catch (e) {
        // Log lỗi nếu có vấn đề
        console.error("Lỗi khi đọc current user:", e);
    }
    
    // Trả về null nếu chưa đăng nhập
    return null;
}
```

#### getCart()
```javascript
export function getCart() {
    // Bước 1: Lấy username của user hiện tại
    const username = getCurrentUsername();
    
    // Bước 2: Nếu chưa đăng nhập, trả về giỏ rỗng
    if (!username) {
        return [];
    }
    
    // Bước 3: Tạo key riêng cho giỏ hàng của user này
    // VD: username = "admin" → cartKey = "cart_admin"
    const cartKey = `cart_${username}`;
    
    try {
        // Bước 4: Đọc giỏ hàng từ localStorage
        const cartString = localStorage.getItem(cartKey);
        
        // Bước 5: Parse JSON, nếu null thì dùng []
        const cart = JSON.parse(cartString) || [];
        
        // Bước 6: Chuẩn hóa dữ liệu từng item
        return cart.map((item) => ({
            ...item,  // Giữ nguyên các properties cũ
            
            // Đảm bảo price là số
            price: Number(item.price) || 0,
            
            // Đảm bảo quantity là số nguyên
            quantity: parseInt(item.quantity) || 0,
            
            // Tạo identifier duy nhất cho item
            // VD: id=1, size=39 → "1-39"
            itemIdentifier: item.itemIdentifier || `${item.id}-${item.size || "N/A"}`,
        }));
    } catch (e) {
        console.error("Lỗi khi tải giỏ hàng:", e);
        return [];
    }
}
```

**Tại sao cần itemIdentifier?**
```javascript
// Trường hợp: Cùng 1 sản phẩm nhưng khác size
const cart = [
    {id: 1, name: 'Nike Air', size: 39, quantity: 2},
    {id: 1, name: 'Nike Air', size: 40, quantity: 1}
];

// Nếu chỉ dùng id, không phân biệt được 2 items
// Dùng itemIdentifier: "1-39" và "1-40" để phân biệt
```

---

### 4. main.js - Khởi tạo Trang chủ

#### DOMContentLoaded
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Code trong này chỉ chạy SAU KHI DOM đã load xong
    // Tránh lỗi: "Cannot read property of null"
    
    // VD: Nếu không chờ DOM load xong:
    // const btn = document.querySelector('#btn');  // null vì DOM chưa có
    // btn.addEventListener('click', ...);  // LỖI!
    
    // Với DOMContentLoaded, đảm bảo tất cả elements đã tồn tại
});
```

#### khoiTaoSlider()
```javascript
function khoiTaoSlider() {
    // Lấy các elements cần thiết
    const wrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    // Nếu không tìm thấy elements, thoát hàm
    // (tránh lỗi khi trang không có slider)
    if (!wrapper || slides.length === 0) {
        return;
    }

    // Biến state
    let currentSlide = 0;              // Slide hiện tại (0, 1, 2...)
    const totalSlides = slides.length; // Tổng số slides
    const slideInterval = 4000;        // 4 giây tự động chuyển slide
    let autoSlideTimer;                // Timer để tự động chuyển

    // Hàm: Cập nhật slide hiển thị
    function updateSlide(index) {
        currentSlide = index;
        
        // Tính offset để dịch chuyển wrapper
        // VD: slide 0 = 0%, slide 1 = -100%, slide 2 = -200%
        const offset = currentSlide * -100;
        
        // Áp dụng transform để dịch chuyển
        wrapper.style.transform = `translateX(${offset}%)`;
        
        // Cập nhật active dot
        dots.forEach((dot, i) => {
            // Nếu i === currentSlide thì thêm class 'active'
            // Ngược lại thì xóa class 'active'
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Hàm: Chuyển sang slide tiếp theo
    function nextSlide() {
        // Tính index slide tiếp theo (wrap around nếu hết)
        // VD: currentSlide = 2, totalSlides = 3
        // → (2 + 1) % 3 = 0 (quay lại slide đầu)
        const nextIndex = (currentSlide + 1) % totalSlides;
        updateSlide(nextIndex);
    }

    // Hàm: Chuyển về slide trước
    function prevSlide() {
        // Tính index slide trước (wrap around nếu ở đầu)
        // VD: currentSlide = 0, totalSlides = 3
        // → (0 - 1 + 3) % 3 = 2 (quay lại slide cuối)
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide(prevIndex);
    }

    // Hàm: Bắt đầu tự động chuyển slide
    function startAutoSlide() {
        clearInterval(autoSlideTimer);  // Xóa timer cũ (nếu có)
        
        // Tạo timer mới: gọi nextSlide() mỗi 4 giây
        autoSlideTimer = setInterval(nextSlide, slideInterval);
    }

    // Event listeners
    prevBtn.addEventListener('click', () => { 
        prevSlide(); 
        startAutoSlide();  // Reset timer sau khi click
    });
    
    nextBtn.addEventListener('click', () => { 
        nextSlide(); 
        startAutoSlide();  // Reset timer sau khi click
    });

    // Lắng nghe click trên từng dot
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);   // Nhảy đến slide tương ứng
            startAutoSlide();     // Reset timer
        });
    });

    // Tạm dừng auto-slide khi hover vào slider
    wrapper.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    
    // Tiếp tục auto-slide khi rời chuột
    wrapper.addEventListener('mouseleave', startAutoSlide);

    // Khởi tạo: Hiển thị slide đầu tiên và bắt đầu auto-slide
    updateSlide(0);
    startAutoSlide();
}
```

---

### 5. renderProducts.js - Render Sản phẩm

#### createProductCard()
```javascript
function createProductCard(product) {
    // Tạo thẻ div cho card
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;  // Lưu ID vào data attribute

    // Escape HTML để tránh XSS attack
    const safeName = escapeHtml(product.name);
    
    // Format giá theo locale Việt Nam
    const currentPrice = (product.price || 0).toLocaleString("vi-VN");
    
    // Tạo HTML cho card
    card.innerHTML = `
        <div class="product-image">
            ${badgeHtml}
            <img src="${escapeHtml(product.img)}" alt="${safeName}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${safeName}</h3>
            ${ratingHtml}
            <div class="product-price">${priceHtml}</div>
            <button class="add-to-cart" data-id="${product.id}">
                Thêm vào giỏ
            </button>
        </div>
    `;
    
    return card;
}
```

**Tại sao cần escapeHtml()?**
```javascript
// Tình huống: Tên sản phẩm do user nhập
const productName = '<script>alert("XSS")</script>';

// Không escape:
card.innerHTML = `<h3>${productName}</h3>`;
// → Script sẽ chạy! (XSS attack)

// Có escape:
card.innerHTML = `<h3>${escapeHtml(productName)}</h3>`;
// → Hiển thị text: "&lt;script&gt;alert("XSS")&lt;/script&gt;"
// → An toàn!
```

---

## 🔄 Luồng Hoạt Động

### Luồng 1: Người dùng xem sản phẩm

```
1. User mở index.html
   ↓
2. DOMContentLoaded event fires
   ↓
3. renderProducts.js chạy:
   - Tạo ProductManager instance
   - Gọi loadProducts() → Đọc từ localStorage
   - Lấy danh sách sản phẩm hiển thị
   ↓
4. Với mỗi sản phẩm:
   - Gọi createProductCard()
   - Tạo HTML cho card
   - Append vào .product-grid
   ↓
5. Sản phẩm hiển thị trên trang
   ↓
6. User click nút lọc/sắp xếp:
   - filterProducts() được gọi
   - Re-render danh sách sản phẩm
```

### Luồng 2: Thêm sản phẩm vào giỏ

```
1. User click "Thêm vào giỏ"
   ↓
2. Kiểm tra đăng nhập (kiemTraDangNhap)
   - Chưa login → Mở modal đăng nhập
   - Đã login → Tiếp tục
   ↓
3. handleAddToCartClick() chạy:
   - Lấy productId từ data-id
   - Lấy thông tin sản phẩm từ ProductManager
   - Gọi window.addToCart()
   ↓
4. addToCart() trong cart.js:
   - Lấy giỏ hàng hiện tại
   - Kiểm tra sản phẩm đã có chưa:
     + Đã có → Tăng quantity
     + Chưa có → Thêm item mới
   - Gọi saveCart()
   ↓
5. saveCart():
   - Convert cart thành JSON
   - localStorage.setItem(cartKey, json)
   ↓
6. Cập nhật UI:
   - updateCartCount() → Cập nhật badge số lượng
   - openCartModal() → Mở modal giỏ hàng
   ↓
7. User thấy sản phẩm trong giỏ
```

### Luồng 3: Đặt hàng

```
1. User click "TIẾN HÀNH THANH TOÁN"
   ↓
2. Mở Checkout Modal
   ↓
3. User điền thông tin:
   - Họ tên, SĐT, Địa chỉ
   - Chọn phương thức thanh toán
   ↓
4. User click "ĐẶT HÀNG"
   ↓
5. Validate dữ liệu:
   - Kiểm tra tên, SĐT, địa chỉ có hợp lệ?
   - Có → Tiếp tục
   - Không → Hiển thị lỗi
   ↓
6. Tạo đơn hàng:
   - Tạo order object với:
     + id: ORD-YYYY-XXX
     + date: ISO string
     + status: 'new'
     + total: tổng tiền
     + items: sản phẩm trong giỏ
     + customerInfo: thông tin khách hàng
   ↓
7. Lưu đơn hàng:
   - Thêm vào mảng orders của user
   - Lưu vào localStorage
   ↓
8. Giảm tồn kho:
   - Với mỗi item trong đơn:
     + Gọi productManager.decreaseStock()
     + Cập nhật stock trong localStorage
   ↓
9. Xóa giỏ hàng:
   - Gọi clearCart()
   ↓
10. Hiển thị thông báo thành công
    ↓
11. Đóng modal
```

---

## 🎨 Các Pattern Được Sử Dụng

### 1. Module Pattern
```javascript
// Mỗi file JS là một module
// Export để chia sẻ
export class Product { ... }
export function getCart() { ... }

// Import để sử dụng
import { Product } from './Product.js';
import { getCart } from './cart.js';
```

### 2. Singleton Pattern
```javascript
// ProductManager chỉ có 1 instance duy nhất
export class ProductManager { ... }
export const productManager = new ProductManager();
//             ↑
//    Instance duy nhất được export
```

### 3. Factory Pattern
```javascript
// Product.fromJSON() là factory method
static fromJSON(data) {
    return new Product(data);
}

// Sử dụng:
const product = Product.fromJSON(jsonData);
```

### 4. Observer Pattern (Event-driven)
```javascript
// Lắng nghe sự kiện
document.addEventListener('click', function(e) {
    if (e.target.matches('.add-to-cart')) {
        handleAddToCart(e);
    }
});
```

### 5. Strategy Pattern (Sorting)
```javascript
function sortProducts(products, sortType) {
    switch(sortType) {
        case 'price-asc':
            return products.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return products.sort((a, b) => b.price - a.price);
        case 'newest':
            return products.sort((a, b) => b.id - a.id);
    }
}
```

---

## 💎 Tips và Best Practices

### 1. Luôn kiểm tra null/undefined
```javascript
// ❌ Không tốt:
const price = product.price.toLocaleString();  // Lỗi nếu price = null

// ✅ Tốt:
const price = (product.price || 0).toLocaleString();
```

### 2. Sử dụng const/let thay vì var
```javascript
// ❌ Tránh:
var count = 0;

// ✅ Nên dùng:
const ITEMS_PER_PAGE = 6;  // Không đổi
let currentPage = 1;       // Có thể đổi
```

### 3. Arrow functions cho code ngắn gọn
```javascript
// ❌ Cũ:
products.filter(function(p) {
    return p.price > 1000000;
});

// ✅ Mới:
products.filter(p => p.price > 1000000);
```

### 4. Template literals cho strings
```javascript
// ❌ Cũ:
const message = 'Giá: ' + price + ' VNĐ';

// ✅ Mới:
const message = `Giá: ${price} VNĐ`;
```

### 5. Destructuring để lấy properties
```javascript
// ❌ Cũ:
const id = product.id;
const name = product.name;
const price = product.price;

// ✅ Mới:
const { id, name, price } = product;
```

### 6. Try-catch cho code an toàn
```javascript
// ❌ Không xử lý lỗi:
const data = JSON.parse(localStorage.getItem('key'));

// ✅ Có xử lý lỗi:
try {
    const data = JSON.parse(localStorage.getItem('key'));
} catch (error) {
    console.error('Parse error:', error);
    return defaultData;
}
```

### 7. Optional chaining (?.)
```javascript
// ❌ Cũ:
const stock = product && product.variants && product.variants[0] && product.variants[0].stock;

// ✅ Mới:
const stock = product?.variants?.[0]?.stock;
```

### 8. Default parameters
```javascript
// ❌ Cũ:
function getCart(username) {
    username = username || 'guest';
    // ...
}

// ✅ Mới:
function getCart(username = 'guest') {
    // ...
}
```

---

## 🔍 Debug Tips

### 1. Console.log để theo dõi giá trị
```javascript
console.log('Product:', product);
console.log('Cart:', cart);
console.table(products);  // Hiển thị dạng bảng
```

### 2. Debugger để dừng execution
```javascript
function addToCart(productId) {
    debugger;  // Dừng tại đây khi DevTools mở
    const product = productManager.getProductById(productId);
    // ...
}
```

### 3. Xem localStorage
```javascript
// Console
localStorage.getItem('shoestore_products');
JSON.parse(localStorage.getItem('cart_admin'));

// DevTools → Application → Local Storage
```

### 4. Network tab để xem requests
```
DevTools → Network → Xem các file JS/CSS load
```

---

**Tài liệu này cung cấp giải thích chi tiết về cách code hoạt động. Hãy đọc kỹ và thực hành để hiểu sâu hơn!**

**Cập nhật lần cuối**: 2025-01-13
