# ShoeStore - Hệ thống Quản lý Bán Giày Trực tuyến

## 📋 Giới thiệu Dự án

ShoeStore là một ứng dụng web bán giày trực tuyến được xây dựng hoàn toàn bằng HTML, CSS và JavaScript thuần túy (Vanilla JavaScript). Dự án này phù hợp cho việc học tập và hiểu rõ các khái niệm cơ bản về phát triển web front-end.

### 🎯 Mục đích Dự án
- Xây dựng một trang thương mại điện tử hoàn chỉnh cho việc bán giày
- Quản lý sản phẩm, đơn hàng, tồn kho và người dùng
- Tích hợp giỏ hàng và thanh toán
- Hệ thống đăng nhập/đăng ký người dùng
- Trang quản trị admin với đầy đủ chức năng CRUD

## 🚀 Các Tính năng Chính

### Cho Khách hàng:
- ✅ Xem danh sách sản phẩm với bộ lọc theo danh mục
- ✅ Tìm kiếm sản phẩm với overlay tìm kiếm nâng cao
- ✅ Xem chi tiết sản phẩm với nhiều hình ảnh
- ✅ Thêm sản phẩm vào giỏ hàng (theo size)
- ✅ Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
- ✅ Đặt hàng và thanh toán
- ✅ Xem lịch sử đơn hàng
- ✅ Đăng ký/đăng nhập tài khoản
- ✅ Quản lý thông tin cá nhân

### Cho Admin:
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý tồn kho theo size
- ✅ Quản lý phiếu nhập hàng
- ✅ Quản lý giá bán
- ✅ Quản lý đơn hàng (cập nhật trạng thái)
- ✅ Quản lý người dùng (khóa/mở khóa tài khoản)

## 🛠️ Công nghệ Sử dụng

### Front-end
- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và responsive design
- **JavaScript (ES6+)**: Logic xử lý và tương tác
- **Font Awesome 6.0**: Icons
- **LocalStorage**: Lưu trữ dữ liệu local

### Kiến trúc Code
- **Module Pattern**: Sử dụng ES6 Modules
- **OOP**: Class-based programming
- **MVC-like**: Tách biệt Model, View, Controller logic

## 📁 Cấu trúc Thư mục

```
WEB-1/
├── index.html              # Trang chủ khách hàng
├── admin-index.html        # Trang quản trị admin
├── product-detail.html     # Trang chi tiết sản phẩm
├── profile.html            # Trang thông tin cá nhân
├── README.md               # File tài liệu chính
│
├── css/                    # Thư mục CSS
│   ├── style.css          # CSS chính cho trang khách hàng
│   ├── admin-base.css     # CSS cơ sở cho admin
│   ├── admin-product.css  # CSS quản lý sản phẩm
│   ├── admin-inventory.css # CSS quản lý tồn kho
│   ├── cart-and-user-ui.css # CSS giỏ hàng và user
│   ├── checkout-modal.css  # CSS modal thanh toán
│   ├── dangnhap.css       # CSS form đăng nhập
│   ├── modal.css          # CSS modal chung
│   ├── product-detail.css # CSS chi tiết sản phẩm
│   ├── profile.css        # CSS trang profile
│   └── search-overlay.css # CSS overlay tìm kiếm
│
├── js/                     # Thư mục JavaScript
│   ├── main.js            # Entry point chính
│   ├── productData.js     # Dữ liệu sản phẩm mẫu
│   ├── Product.js         # Class Product Model
│   ├── ProductManager.js  # Quản lý sản phẩm
│   ├── cart.js            # Logic giỏ hàng
│   ├── cart-ui.js         # UI giỏ hàng
│   ├── user.js            # User Model & Manager
│   ├── login-modal.js     # Modal đăng nhập/đăng ký
│   ├── order-manager.js   # Quản lý đơn hàng
│   ├── order-history-ui.js # UI lịch sử đơn hàng
│   ├── checkout-ui.js     # UI thanh toán
│   ├── inventory.js       # Quản lý tồn kho
│   ├── category.js        # Quản lý danh mục
│   ├── renderProducts.js  # Render danh sách sản phẩm
│   ├── search-overlay.js  # Chức năng tìm kiếm
│   ├── product-detail.js  # Logic chi tiết sản phẩm
│   └── admin-*.js         # Các module admin
│
└── img/                    # Thư mục hình ảnh sản phẩm
```

## 🎓 Kiến thức Cần thiết

### 1. HTML/CSS Cơ bản
- Semantic HTML5
- CSS Flexbox và Grid Layout
- Responsive Design
- CSS Animations và Transitions

### 2. JavaScript Cơ bản
- Variables, Data Types, Operators
- Functions và Arrow Functions
- Arrays và Objects
- DOM Manipulation
- Event Handling
- Async/Await và Promises

### 3. JavaScript Nâng cao
- ES6+ Modules (import/export)
- Classes và OOP
- LocalStorage API
- JSON manipulation
- Array methods (map, filter, reduce, find)

### 4. Kiến trúc Ứng dụng
- Module Pattern
- Separation of Concerns
- State Management
- Event-Driven Programming

## 🏗️ Kiến trúc Hệ thống

### 1. Data Layer (Model)
```javascript
// Product.js - Định nghĩa model sản phẩm
class Product {
    constructor(id, name, price, categoryId, variants, ...)
    // Methods: calculateTotalStock, addImport, recordSale
}

// User.js - Định nghĩa model người dùng
class User {
    constructor(hoTen, tenDangNhap, email, matKhau, orders)
    // Methods: kiemTraMatKhau
}
```

### 2. Business Logic Layer (Controller)
```javascript
// ProductManager.js - Quản lý CRUD sản phẩm
class ProductManager {
    // Methods: addProduct, updateProduct, deleteProduct, getProductById
}

// UserManager.js - Quản lý CRUD người dùng
class UserManager {
    // Methods: dangKy, dangNhap, getAllUsers, lockUser
}

// OrderManager - Quản lý đơn hàng
class OrderManager {
    // Methods: createOrder, updateOrderStatus, getOrderHistory
}
```

### 3. Presentation Layer (View)
```javascript
// renderProducts.js - Render giao diện sản phẩm
// cart-ui.js - Render giao diện giỏ hàng
// checkout-ui.js - Render giao diện thanh toán
```

### 4. Data Storage
- **LocalStorage**: Lưu trữ tất cả dữ liệu local
  - `products_shoestore`: Danh sách sản phẩm
  - `users_shoestore`: Danh sách người dùng
  - `nguoiDungHienTai`: User hiện tại
  - `cart_[username]`: Giỏ hàng theo user
  - `orders_[username]`: Đơn hàng theo user

## 💻 Hướng dẫn Cài đặt và Chạy

### Yêu cầu
- Web browser hiện đại (Chrome, Firefox, Edge, Safari)
- Text editor/IDE (VS Code khuyến nghị)
- Live Server extension (hoặc web server đơn giản)

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/Naiiiiiiiiii/WEB-1.git
cd WEB-1
```

2. **Mở với Live Server**
   - Cài đặt extension "Live Server" trong VS Code
   - Click chuột phải vào `index.html`
   - Chọn "Open with Live Server"

3. **Hoặc sử dụng Python HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Truy cập: http://localhost:8000
```

4. **Hoặc sử dụng Node.js HTTP Server**
```bash
npx http-server -p 8000
```

### Tài khoản mặc định

**Admin:**
- Username: `admin`
- Password: `Admin123`
- URL: `/admin-index.html`

**User thử nghiệm:**
- Username: `testuser`
- Password: `123456`

## 📖 Hướng dẫn Sử dụng

### Cho Người dùng

1. **Đăng ký tài khoản**
   - Click icon user ở header
   - Chọn "Đăng ký"
   - Điền thông tin và submit

2. **Duyệt và tìm kiếm sản phẩm**
   - Xem danh sách sản phẩm ở trang chủ
   - Sử dụng thanh tìm kiếm hoặc bộ lọc danh mục
   - Click vào sản phẩm để xem chi tiết

3. **Thêm vào giỏ hàng**
   - Chọn size sản phẩm
   - Click "Thêm vào giỏ"
   - Xem giỏ hàng bằng cách click icon giỏ hàng

4. **Đặt hàng**
   - Trong giỏ hàng, click "Thanh toán"
   - Điền thông tin giao hàng
   - Xác nhận đơn hàng

5. **Xem lịch sử đơn hàng**
   - Click icon lịch sử ở header
   - Hoặc vào trang Profile

### Cho Admin

1. **Đăng nhập admin**
   - Truy cập `/admin-index.html`
   - Đăng nhập với tài khoản admin

2. **Quản lý sản phẩm**
   - Tab "Quản lý sản phẩm"
   - Thêm/Sửa/Xóa/Ẩn sản phẩm
   - Upload hình ảnh (base64)

3. **Quản lý tồn kho**
   - Tab "Quản lý tồn kho"
   - Xem số lượng tồn theo size
   - Cập nhật tồn kho

4. **Quản lý đơn hàng**
   - Tab "Quản lý đơn đặt hàng"
   - Xem danh sách đơn hàng
   - Cập nhật trạng thái đơn

## 🔍 Chi tiết Kỹ thuật

### 1. Quản lý State với LocalStorage

```javascript
// Lưu dữ liệu
localStorage.setItem('key', JSON.stringify(data));

// Lấy dữ liệu
const data = JSON.parse(localStorage.getItem('key'));

// Xóa dữ liệu
localStorage.removeItem('key');
```

### 2. Module System với ES6

```javascript
// Export
export class ProductManager { ... }
export function addToCart() { ... }

// Import
import { ProductManager } from './ProductManager.js';
import { addToCart } from './cart.js';
```

### 3. Event Handling

```javascript
// Event delegation
document.addEventListener('click', (e) => {
    if (e.target.matches('.add-to-cart-btn')) {
        handleAddToCart(e);
    }
});
```

### 4. Render Dynamic Content

```javascript
function renderProducts(products) {
    const html = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price.toLocaleString('vi-VN')}đ</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
}
```

### 5. Quản lý Tồn kho theo Size

```javascript
// Mỗi sản phẩm có variants theo size
product.variants = [
    { size: 38, stock: 10 },
    { size: 39, stock: 15 },
    { size: 40, stock: 20 }
];

// Khi đặt hàng, trừ stock của size cụ thể
function reduceStock(productId, size, quantity) {
    const variant = product.variants.find(v => v.size === size);
    if (variant && variant.stock >= quantity) {
        variant.stock -= quantity;
        return true;
    }
    return false;
}
```

## 🎨 Responsive Design

Website được thiết kế responsive với các breakpoints:

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

```css
/* Mobile First Approach */
.container { width: 100%; }

@media (min-width: 768px) {
    .container { width: 750px; }
}

@media (min-width: 1024px) {
    .container { width: 970px; }
}
```

## 🐛 Debugging và Testing

### Console Logging
```javascript
console.log('Product:', product);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### LocalStorage Inspection
- Mở Developer Tools (F12)
- Tab "Application" > "Local Storage"
- Xem và edit trực tiếp dữ liệu

### Common Issues

1. **Module not found**
   - Đảm bảo đường dẫn import đúng
   - Sử dụng Live Server, không mở file:// trực tiếp

2. **LocalStorage bị đầy**
   - Xóa dữ liệu không cần thiết
   - Giới hạn: ~5-10MB tùy browser

3. **CORS Error**
   - Phải chạy qua web server
   - Không mở file HTML trực tiếp

## 📚 Tài liệu Tham khảo

### HTML/CSS
- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)

### JavaScript
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [JavaScript.info](https://javascript.info/)
- [ES6 Features](http://es6-features.org/)

### LocalStorage
- [MDN - Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

### Best Practices
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

## 🚧 Hướng phát triển

### Tính năng có thể mở rộng:
- [ ] Tích hợp payment gateway thực (VNPay, Momo)
- [ ] Backend API với Node.js/Express
- [ ] Database thật (MongoDB, MySQL)
- [ ] Authentication với JWT
- [ ] Upload ảnh lên cloud (Cloudinary)
- [ ] Real-time notification
- [ ] PWA (Progressive Web App)
- [ ] SEO optimization

## 👥 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được tạo ra cho mục đích học tập và nghiên cứu.

## 📞 Liên hệ

- Repository: [https://github.com/Naiiiiiiiiii/WEB-1](https://github.com/Naiiiiiiiiii/WEB-1)
- Issues: [https://github.com/Naiiiiiiiiii/WEB-1/issues](https://github.com/Naiiiiiiiiii/WEB-1/issues)

---

**Chúc bạn học tập vui vẻ! 🎉**