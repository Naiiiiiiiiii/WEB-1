# HƯỚNG DẪN TRẢ LỜI CÂU HỎI GIẢNG VIÊN VỀ ĐỒ ÁN

## 📚 MỤC LỤC
1. [Câu hỏi về Cấu trúc dự án](#1-câu-hỏi-về-cấu-trúc-dự-án)
2. [Câu hỏi về JavaScript](#2-câu-hỏi-về-javascript)
3. [Câu hỏi về Quản lý State](#3-câu-hỏi-về-quản-lý-state)
4. [Câu hỏi về Tính năng](#4-câu-hỏi-về-tính-năng)
5. [Câu hỏi về LocalStorage](#5-câu-hỏi-về-localstorage)
6. [Câu hỏi về OOP](#6-câu-hỏi-về-oop)
7. [Câu hỏi nâng cao](#7-câu-hỏi-nâng-cao)

---

## 1. CÂU HỎI VỀ CẤU TRÚC DỰ ÁN

### Q1.1: Em có thể giải thích cấu trúc thư mục của dự án không?

**Trả lời:**
Dạ, dự án của em được tổ chức theo cấu trúc phân tầng rõ ràng:

1. **Thư mục gốc**: Chứa các file HTML chính
   - `index.html`: Trang chủ cho người dùng
   - `admin-index.html`: Trang quản trị cho admin
   - `product-detail.html`: Trang chi tiết sản phẩm

2. **Thư mục `css/`**: Chứa các file CSS
   - Mỗi trang/tính năng có file CSS riêng
   - Ví dụ: `style.css` (trang chủ), `admin-base.css` (admin)

3. **Thư mục `js/`**: Chứa các module JavaScript
   - **Model**: `Product.js`, `user.js` (định nghĩa dữ liệu)
   - **Controller**: `ProductManager.js`, `cart.js` (xử lý logic)
   - **View**: `cart-ui.js`, `renderProducts.js` (hiển thị giao diện)

4. **Thư mục `img/`**: Chứa hình ảnh sản phẩm

Em áp dụng nguyên tắc **Separation of Concerns** để tách biệt HTML (cấu trúc), CSS (giao diện), và JavaScript (logic).

---

### Q1.2: Em sử dụng mô hình nào để tổ chức code?

**Trả lời:**
Dạ, em sử dụng mô hình **MVC (Model-View-Controller)**:

**Model (Dữ liệu)**:
- `Product.js`: Định nghĩa cấu trúc sản phẩm
- `user.js`: Định nghĩa cấu trúc người dùng
- Chứa các thuộc tính và phương thức liên quan đến dữ liệu

**View (Giao diện)**:
- Các file HTML và CSS
- Các file `*-ui.js` để render giao diện động

**Controller (Điều khiển)**:
- `ProductManager.js`: Xử lý CRUD sản phẩm
- `cart.js`: Xử lý logic giỏ hàng
- `order-manager.js`: Xử lý đơn hàng

**Ví dụ cụ thể**:
```javascript
// Model (Product.js)
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    // ...
  }
  getCurrentStock() { /* logic tính tồn kho */ }
}

// Controller (ProductManager.js)
class ProductManager {
  addProduct(data) { /* logic thêm sản phẩm */ }
  deleteProduct(id) { /* logic xóa sản phẩm */ }
}

// View (renderProducts.js)
function renderProducts(products) {
  // Render HTML để hiển thị danh sách sản phẩm
}
```

---

## 2. CÂU HỎI VỀ JAVASCRIPT

### Q2.1: Em có sử dụng ES6 Modules không? Tại sao?

**Trả lời:**
Dạ có, em sử dụng **ES6 Modules** để chia nhỏ code thành các module riêng biệt.

**Lý do**:
1. **Dễ bảo trì**: Mỗi module có một trách nhiệm cụ thể
2. **Tái sử dụng**: Có thể import module ở nhiều nơi
3. **Tránh xung đột**: Mỗi module có scope riêng, không ô nhiễm global scope

**Ví dụ**:
```javascript
// Product.js - Export class
export class Product {
  constructor(data) { /* ... */ }
}

// ProductManager.js - Import và sử dụng
import { Product } from './Product.js';

class ProductManager {
  loadProducts() {
    return productsData.map(p => new Product(p));
  }
}
export const productManager = new ProductManager();

// main.js - Import instance
import { productManager } from './ProductManager.js';
productManager.getAllProducts();
```

**Cách khai báo trong HTML**:
```html
<script type="module" src="./js/main.js"></script>
```

---

### Q2.2: Class trong JavaScript là gì? Em sử dụng như thế nào?

**Trả lời:**
Dạ, **Class** là một cú pháp trong ES6 để tạo đối tượng theo hướng lập trình OOP.

**Cấu trúc cơ bản**:
```javascript
class Product {
  // Constructor: Hàm khởi tạo, chạy khi tạo instance mới
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
  }
  
  // Method: Hàm xử lý logic
  getFormattedPrice() {
    return new Intl.NumberFormat('vi-VN').format(this.price);
  }
  
  // Static method: Hàm thuộc class, không thuộc instance
  static fromJSON(data) {
    return new Product(data);
  }
}

// Sử dụng
const product = new Product({
  id: 1,
  name: 'Giày thể thao',
  price: 1500000
});
console.log(product.getFormattedPrice()); // "1.500.000"
```

**Trong dự án của em**:
- `Product`: Class định nghĩa sản phẩm
- `User`: Class định nghĩa người dùng
- `ProductManager`: Class quản lý danh sách sản phẩm
- `UserManager`: Class quản lý danh sách người dùng

---

### Q2.3: Arrow function khác gì với function thông thường?

**Trả lời:**
Dạ, **Arrow function** là cú pháp ngắn gọn của function, có một số điểm khác biệt:

**1. Cú pháp**:
```javascript
// Function thông thường
function getPrice(price) {
  return price * 1000;
}

// Arrow function
const getPrice = (price) => price * 1000;

// Nếu chỉ 1 tham số, bỏ được dấu ngoặc
const getPrice = price => price * 1000;

// Nếu nhiều dòng, cần return
const getPrice = (price) => {
  const tax = price * 0.1;
  return price + tax;
};
```

**2. `this` binding**:
- Function thông thường: `this` phụ thuộc vào cách gọi
- Arrow function: `this` được kế thừa từ scope bên ngoài

**Ví dụ trong dự án**:
```javascript
// Trong cart.js
const cart = getCart();
const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
// Arrow function giúp code ngắn gọn hơn

// Trong renderProducts.js
products.filter(p => p.price > 1000000)
        .map(p => p.name);
// Dễ đọc hơn function thông thường
```

---

## 3. CÂU HỎI VỀ QUẢN LÝ STATE

### Q3.1: Em lưu trữ dữ liệu như thế nào trong dự án?

**Trả lời:**
Dạ, em sử dụng **LocalStorage** để lưu trữ dữ liệu. LocalStorage là một API của trình duyệt cho phép lưu dữ liệu dạng key-value.

**Các loại dữ liệu em lưu**:
1. **Sản phẩm**: Key `shoestore_products`
2. **Người dùng**: Key `users_shoestore`
3. **Đơn hàng**: Key `shoestore_orders`
4. **Giỏ hàng**: Key `cart_[username]` (riêng cho mỗi user)
5. **Danh mục**: Key `product_categories`
6. **Session user**: Key `nguoiDungHienTai`
7. **Session admin**: Key `nguoiDungAdmin`

**Ví dụ cụ thể**:
```javascript
// Lưu dữ liệu
const products = [/* mảng sản phẩm */];
localStorage.setItem('shoestore_products', JSON.stringify(products));

// Đọc dữ liệu
const data = localStorage.getItem('shoestore_products');
const products = JSON.parse(data);

// Xóa dữ liệu
localStorage.removeItem('shoestore_products');

// Xóa toàn bộ
localStorage.clear();
```

**Lưu ý**: LocalStorage chỉ lưu được string, nên phải dùng `JSON.stringify()` khi lưu và `JSON.parse()` khi đọc.

---

### Q3.2: LocalStorage có hạn chế gì không?

**Trả lời:**
Dạ có, LocalStorage có một số hạn chế:

**1. Giới hạn dung lượng**:
- Thường là 5-10MB tùy trình duyệt
- Nếu vượt quá sẽ báo lỗi `QuotaExceededError`

**2. Chỉ lưu string**:
- Phải convert object thành JSON string
- Không lưu được function, Date (phải convert)

**3. Không có bảo mật**:
- Dữ liệu lưu dạng plain text, ai cũng xem được
- Không nên lưu thông tin nhạy cảm (password, token)

**4. Đồng bộ (synchronous)**:
- Chặn thread khi đọc/ghi
- Nếu dữ liệu lớn có thể làm lag UI

**5. Giới hạn theo domain**:
- Mỗi domain có LocalStorage riêng
- Không chia sẻ được giữa các subdomain

**Trong dự án của em**:
- Em chỉ dùng cho demo, không phù hợp production
- Trong thực tế sẽ dùng backend + database

---

## 4. CÂU HỎI VỀ TÍNH NĂNG

### Q4.1: Giải thích luồng xử lý khi user thêm sản phẩm vào giỏ hàng?

**Trả lời:**
Dạ, luồng xử lý như sau:

**Bước 1: User click "Thêm vào giỏ"**
```javascript
// product-detail.js
addToCartBtn.addEventListener('click', () => {
  const productId = getProductIdFromURL();
  const size = document.getElementById('size-select').value;
  const quantity = document.getElementById('quantity-input').value;
  
  addToCart(productId, name, price, img, size, color, quantity);
});
```

**Bước 2: Kiểm tra đăng nhập**
```javascript
// cart.js
export function addToCart(productId, name, price, img, size, color, quantity) {
  // Kiểm tra user đã đăng nhập chưa
  const username = getCurrentUsername();
  if (!username) {
    openLoginModal(); // Mở modal đăng nhập
    return false;
  }
  // ...
}
```

**Bước 3: Kiểm tra tồn kho**
```javascript
const product = productManager.getProductById(productId);
const hasVariants = product.variants && product.variants.length > 0;

if (hasVariants) {
  // Kiểm tra tồn kho của size cụ thể
  const variant = product.variants.find(v => v.size === size);
  const stock = variant ? variant.stock : 0;
  
  if (stock <= 0) {
    alert('Size này đã hết hàng');
    return false;
  }
} else {
  // Kiểm tra tồn kho chung
  if (product.initialStock <= 0) {
    alert('Sản phẩm đã hết hàng');
    return false;
  }
}
```

**Bước 4: Thêm vào giỏ hoặc cập nhật số lượng**
```javascript
let cart = getCart(); // Lấy giỏ hàng hiện tại từ LocalStorage
const itemIdentifier = `${productId}-${size}`;
const existingItem = cart.find(item => item.itemIdentifier === itemIdentifier);

if (existingItem) {
  // Item đã có trong giỏ -> tăng số lượng
  existingItem.quantity += quantity;
} else {
  // Item chưa có -> thêm mới
  cart.push({
    id: productId,
    name, price, img, size, color, quantity,
    itemIdentifier
  });
}
```

**Bước 5: Lưu giỏ hàng và cập nhật UI**
```javascript
saveCart(cart); // Lưu vào LocalStorage
updateCartCount(); // Cập nhật số lượng item trên icon giỏ hàng
alert('Đã thêm vào giỏ hàng!');
```

**Tổng kết luồng**:
```
Click "Thêm vào giỏ"
    ↓
Kiểm tra đăng nhập → Chưa đăng nhập? → Mở modal đăng nhập
    ↓ Đã đăng nhập
Kiểm tra tồn kho → Hết hàng? → Hiển thị lỗi
    ↓ Còn hàng
Thêm/Cập nhật giỏ hàng
    ↓
Lưu vào LocalStorage
    ↓
Cập nhật UI (cart count)
    ↓
Hiển thị thông báo thành công
```

---

### Q4.2: Giải thích luồng xử lý khi user đặt hàng (checkout)?

**Trả lời:**
Dạ, luồng đặt hàng khá phức tạp, em xin trình bày chi tiết:

**Bước 1: User click "Tiến hành thanh toán"**
```javascript
// checkout-ui.js
checkoutBtn.addEventListener('click', () => {
  // Kiểm tra đã chọn size cho tất cả sản phẩm chưa
  const isValid = checkCartBeforeCheckout();
  if (!isValid) return;
  
  // Mở modal checkout
  openCheckoutModal();
});
```

**Bước 2: Kiểm tra giỏ hàng hợp lệ**
```javascript
// cart.js
export function checkCartBeforeCheckout() {
  const cart = getCart();
  
  // Kiểm tra có item "Chưa chọn size" không
  const missingSizeItem = cart.find(item => item.size === 'Chưa chọn');
  if (missingSizeItem) {
    alert(`Vui lòng chọn size cho "${missingSizeItem.name}"`);
    return false;
  }
  
  return true;
}
```

**Bước 3: User nhập thông tin giao hàng**
```html
<!-- checkout-modal-html.js -->
<form id="checkout-form">
  <input name="customerName" placeholder="Họ tên" required>
  <input name="customerPhone" placeholder="Số điện thoại" required>
  <input name="customerEmail" placeholder="Email" required>
  <textarea name="customerAddress" placeholder="Địa chỉ" required></textarea>
  <select name="paymentMethod">
    <option value="COD">Thanh toán khi nhận hàng</option>
    <option value="Banking">Chuyển khoản ngân hàng</option>
  </select>
  <button type="submit">Xác nhận đặt hàng</button>
</form>
```

**Bước 4: Xác nhận đặt hàng**
```javascript
// checkout-ui.js
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const orderData = {
    customerInfo: {
      name: form.customerName.value,
      phone: form.customerPhone.value,
      email: form.customerEmail.value,
      address: form.customerAddress.value
    },
    paymentMethod: form.paymentMethod.value,
    items: getCart(),
    total: calculateCartTotal()
  };
  
  // Gọi order-manager để xử lý đặt hàng
  const order = placeOrder(orderData);
  
  if (order) {
    alert('Đặt hàng thành công!');
    closeCheckoutModal();
  }
});
```

**Bước 5: Xử lý đơn hàng (order-manager.js)**
```javascript
// order-manager.js
export function placeOrder(orderData) {
  const cart = getCart();
  const username = getCurrentUsername();
  
  // 1. Kiểm tra tồn kho lần cuối
  for (const item of cart) {
    const product = productManager.getProductById(item.id);
    const hasVariants = product.variants.length > 0;
    
    if (hasVariants) {
      const variant = product.getVariant(item.size);
      if (!variant || variant.stock < item.quantity) {
        alert(`Size ${item.size} của "${item.name}" không đủ hàng!`);
        return null;
      }
    } else {
      if (product.initialStock < item.quantity) {
        alert(`"${item.name}" không đủ hàng!`);
        return null;
      }
    }
  }
  
  // 2. Trừ tồn kho
  for (const item of cart) {
    productManager.decreaseStock(item.id, item.quantity, item.size);
  }
  
  // 3. Tạo đơn hàng
  const order = {
    id: `ORD-${Date.now()}`,
    username,
    customerInfo: orderData.customerInfo,
    items: cart,
    total: orderData.total,
    date: new Date().toISOString(),
    status: 'new', // Đang chờ xử lý
    paymentMethod: orderData.paymentMethod
  };
  
  // 4. Lưu đơn hàng vào LocalStorage
  const orders = JSON.parse(localStorage.getItem('shoestore_orders') || '[]');
  orders.push(order);
  localStorage.setItem('shoestore_orders', JSON.stringify(orders));
  
  // 5. Lưu vào lịch sử user
  const user = userManager.users.find(u => u.tenDangNhap === username);
  if (user) {
    user.orders.push(order);
    userManager.luuDanhSachUser();
  }
  
  // 6. Xóa giỏ hàng
  clearCart();
  
  return order;
}
```

**Tổng kết luồng**:
```
Click "Thanh toán"
    ↓
Kiểm tra size đã chọn? → Chưa chọn → Hiển thị lỗi
    ↓ Đã chọn
Mở modal checkout
    ↓
User nhập thông tin
    ↓
Click "Xác nhận"
    ↓
Kiểm tra tồn kho lần cuối → Không đủ → Hiển thị lỗi
    ↓ Đủ hàng
Trừ tồn kho (decreaseStock)
    ↓
Tạo order object
    ↓
Lưu vào LocalStorage (shoestore_orders)
    ↓
Lưu vào lịch sử user
    ↓
Xóa giỏ hàng
    ↓
Hiển thị thông báo thành công
```

---

### Q4.3: Sản phẩm có biến thể (variants) là gì? Xử lý như thế nào?

**Trả lời:**
Dạ, **biến thể (variants)** là các phiên bản khác nhau của cùng một sản phẩm. Ví dụ: cùng mẫu giày nhưng khác size.

**Cấu trúc variants**:
```javascript
{
  id: 1,
  name: 'Giày Nike Air Max',
  variants: [
    { size: 39, stock: 10 },
    { size: 40, stock: 5 },
    { size: 41, stock: 0 },  // Hết hàng
    { size: 42, stock: 8 }
  ]
}
```

**Xử lý trong Product.js**:
```javascript
class Product {
  // Lấy danh sách size còn hàng
  getAvailableSizes() {
    if (this.variants.length === 0) return [];
    
    return this.variants
      .filter(v => v.stock > 0)
      .map(v => v.size)
      .sort((a, b) => a - b);
    // Ví dụ: [39, 40, 42] (size 41 hết hàng nên không có)
  }
  
  // Lấy thông tin biến thể theo size
  getVariant(size) {
    return this.variants.find(v => v.size === Number(size)) || null;
  }
  
  // Tính tổng tồn kho
  getCurrentStock() {
    if (this.variants.length > 0) {
      // Sản phẩm có biến thể: Tính tổng stock của tất cả size
      return this.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    // Sản phẩm không có biến thể: Dùng initialStock
    return this.initialStock;
  }
}
```

**Xử lý khi thêm vào giỏ**:
```javascript
// cart.js
function addToCart(productId, ..., size, ...) {
  const product = productManager.getProductById(productId);
  
  if (product.variants.length > 0) {
    // Sản phẩm có biến thể
    if (!size || size === 'Chưa chọn') {
      // Chưa chọn size -> chỉ cho phép 1 dòng trong giỏ
      alert('Vui lòng chọn size');
      return false;
    }
    
    // Kiểm tra tồn kho của size cụ thể
    const variant = product.getVariant(size);
    if (!variant || variant.stock < quantity) {
      alert(`Size ${size} không đủ hàng`);
      return false;
    }
  } else {
    // Sản phẩm không có biến thể (size = 'N/A')
    if (product.initialStock < quantity) {
      alert('Sản phẩm không đủ hàng');
      return false;
    }
  }
  
  // Thêm vào giỏ với itemIdentifier = productId-size
  const itemIdentifier = `${productId}-${size}`;
  // ...
}
```

**Xử lý khi trừ tồn kho**:
```javascript
// ProductManager.js
decreaseStock(productId, quantity, size) {
  const product = this.getProductById(productId);
  
  if (product.variants.length > 0) {
    // Trừ stock của size cụ thể
    const variant = product.variants.find(v => v.size === Number(size));
    if (variant && variant.stock >= quantity) {
      variant.stock -= quantity;
      this.saveProducts();
      return true;
    }
  } else {
    // Trừ initialStock
    if (product.initialStock >= quantity) {
      product.initialStock -= quantity;
      this.saveProducts();
      return true;
    }
  }
  
  return false;
}
```

**Ưu điểm của cách xử lý này**:
1. Linh hoạt: Hỗ trợ cả sản phẩm có/không có biến thể
2. Chính xác: Quản lý tồn kho riêng cho từng size
3. Dễ mở rộng: Có thể thêm thuộc tính khác (màu, giá riêng)

---

## 5. CÂU HỎI VỀ LOCALSTORAGE

### Q5.1: Làm thế nào để debug dữ liệu trong LocalStorage?

**Trả lời:**
Dạ, có nhiều cách để xem và debug LocalStorage:

**Cách 1: Dùng Developer Tools**
```
1. Mở trang web
2. Nhấn F12 (mở DevTools)
3. Tab "Application" (Chrome) hoặc "Storage" (Firefox)
4. Mục "Local Storage" ở sidebar trái
5. Click vào domain của bạn
6. Xem danh sách key-value
```

**Cách 2: Dùng Console**
```javascript
// Xem tất cả key
console.log(Object.keys(localStorage));

// Xem một key cụ thể
console.log(localStorage.getItem('shoestore_products'));

// Xem dạng object
const products = JSON.parse(localStorage.getItem('shoestore_products'));
console.log(products);

// Xem tất cả
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

**Cách 3: Viết helper function**
```javascript
// Trong console
function debugStorage() {
  console.log('=== LOCALSTORAGE DEBUG ===');
  
  console.log('Products:', 
    JSON.parse(localStorage.getItem('shoestore_products')));
    
  console.log('Users:', 
    JSON.parse(localStorage.getItem('users_shoestore')));
    
  console.log('Orders:', 
    JSON.parse(localStorage.getItem('shoestore_orders')));
    
  const currentUser = JSON.parse(localStorage.getItem('nguoiDungHienTai'));
  if (currentUser) {
    console.log(`Cart (${currentUser.tenDangNhap}):`, 
      JSON.parse(localStorage.getItem(`cart_${currentUser.tenDangNhap}`)));
  }
}

// Gọi
debugStorage();
```

**Cách 4: Dùng extension**
- Chrome: "Storage Inspector" extension
- Firefox: Built-in Storage Inspector

---

### Q5.2: Làm thế nào để reset dữ liệu về ban đầu?

**Trả lời:**
Dạ, có 3 cách:

**Cách 1: Xóa toàn bộ LocalStorage (đơn giản nhất)**
```javascript
// Mở Console (F12), gõ:
localStorage.clear();
// Sau đó refresh trang (F5)
```

**Cách 2: Xóa từng key cụ thể**
```javascript
localStorage.removeItem('shoestore_products');
localStorage.removeItem('users_shoestore');
localStorage.removeItem('shoestore_orders');
// ... (xóa các key khác)
// Refresh trang
```

**Cách 3: Viết function reset trong code**
```javascript
// Thêm vào main.js hoặc admin.js
function resetAllData() {
  const confirm = window.confirm('Bạn có chắc muốn reset toàn bộ dữ liệu?');
  if (!confirm) return;
  
  // Xóa tất cả
  localStorage.clear();
  
  // Reload trang để load dữ liệu mẫu
  window.location.reload();
}

// Gắn vào button (trong admin)
document.getElementById('reset-btn')?.addEventListener('click', resetAllData);
```

**Cách 4: Thêm button reset trong admin panel**
```html
<!-- Thêm vào admin-index.html -->
<button onclick="resetData()" class="btn-danger">
  Reset dữ liệu về ban đầu
</button>

<script>
function resetData() {
  if (confirm('Cảnh báo: Toàn bộ dữ liệu sẽ bị xóa!')) {
    localStorage.clear();
    alert('Đã reset! Trang sẽ tải lại.');
    location.reload();
  }
}
</script>
```

---

## 6. CÂU HỎI VỀ OOP

### Q6.1: Em có áp dụng các tính chất OOP không?

**Trả lời:**
Dạ có, em áp dụng 4 tính chất cơ bản của OOP:

**1. Encapsulation (Đóng gói)**
- Gom dữ liệu và phương thức vào class
- Ví dụ: Class `Product` chứa thuộc tính (id, name, price) và phương thức (getCurrentStock, getFormattedPrice)

```javascript
class Product {
  constructor(data) {
    // Thuộc tính (data)
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
  }
  
  // Phương thức (behavior)
  getFormattedPrice() {
    return new Intl.NumberFormat('vi-VN').format(this.price);
  }
}
```

**2. Abstraction (Trừu tượng)**
- Ẩn chi tiết cài đặt, chỉ hiện interface cần thiết
- User không cần biết cách tính tồn kho, chỉ cần gọi `getCurrentStock()`

```javascript
// User không cần biết logic bên trong
const stock = product.getCurrentStock();

// Logic phức tạp được ẩn đi
getCurrentStock() {
  if (this.variants.length > 0) {
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return this.initialStock;
}
```

**3. Inheritance (Kế thừa)**
- Em chưa áp dụng nhiều do dự án đơn giản
- Có thể mở rộng: `SpecialProduct extends Product`

```javascript
// Ví dụ mở rộng
class DiscountProduct extends Product {
  constructor(data) {
    super(data); // Gọi constructor của Product
    this.discountPercent = data.discountPercent;
  }
  
  getDiscountedPrice() {
    return this.price * (1 - this.discountPercent / 100);
  }
}
```

**4. Polymorphism (Đa hình)**
- Cùng phương thức nhưng hành vi khác nhau
- Ví dụ: `getCurrentStock()` xử lý khác nhau cho sản phẩm có/không có variants

```javascript
getCurrentStock() {
  // Đa hình: Hành vi phụ thuộc vào variants
  if (this.variants.length > 0) {
    // Xử lý cho sản phẩm có biến thể
    return this.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  // Xử lý cho sản phẩm không có biến thể
  return this.initialStock;
}
```

---

### Q6.2: Tại sao dùng Class thay vì Object literal?

**Trả lời:**
Dạ, Class có nhiều ưu điểm hơn Object literal:

**Object Literal** (cách cũ):
```javascript
const product1 = {
  id: 1,
  name: 'Giày A',
  price: 1000000,
  getFormattedPrice: function() {
    return this.price.toLocaleString('vi-VN');
  }
};

const product2 = {
  id: 2,
  name: 'Giày B',
  price: 2000000,
  getFormattedPrice: function() {
    return this.price.toLocaleString('vi-VN');
  }
};
// Phải copy-paste code, dễ sai sót
```

**Class** (cách mới):
```javascript
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
  
  getFormattedPrice() {
    return this.price.toLocaleString('vi-VN');
  }
}

const product1 = new Product(1, 'Giày A', 1000000);
const product2 = new Product(2, 'Giày B', 2000000);
// Dễ tạo nhiều instance, code gọn
```

**Ưu điểm của Class**:
1. **Tái sử dụng**: Tạo nhiều instance từ một blueprint
2. **Dễ bảo trì**: Sửa một chỗ, tất cả instance đều cập nhật
3. **Tổ chức tốt**: Dễ đọc, dễ hiểu cấu trúc
4. **Hỗ trợ inheritance**: Có thể extends
5. **Performance tốt hơn**: Method được share, tiết kiệm bộ nhớ

---

## 7. CÂU HỎI NÂNG CAO

### Q7.1: Nếu 2 user cùng mua sản phẩm cuối cùng, xử lý thế nào?

**Trả lời:**
Dạ, đây là vấn đề **race condition**. Trong dự án của em:

**Cách xử lý hiện tại**:
- LocalStorage không hỗ trợ transaction
- Ai submit đơn hàng trước sẽ mua được
- Người sau sẽ báo lỗi "Không đủ hàng"

**Luồng xử lý**:
```javascript
// order-manager.js
function placeOrder(orderData) {
  // 1. Kiểm tra tồn kho NGAY TRƯỚC KHI TRỪ
  for (const item of cart) {
    const product = productManager.getProductById(item.id);
    const currentStock = product.getCurrentStock();
    
    if (currentStock < item.quantity) {
      alert(`"${item.name}" không đủ hàng! Chỉ còn ${currentStock} sản phẩm.`);
      return null; // Hủy đơn hàng
    }
  }
  
  // 2. Trừ tồn kho
  for (const item of cart) {
    productManager.decreaseStock(item.id, item.quantity, item.size);
  }
  
  // 3. Tạo đơn hàng
  // ...
}
```

**Hạn chế**:
- Không đảm bảo 100% do LocalStorage không có lock
- User B có thể kiểm tra tồn kho NGAY SAU khi User A kiểm tra nhưng TRƯỚC KHI User A trừ

**Giải pháp trong production** (với backend):
```javascript
// Backend (Node.js + Database)
app.post('/api/orders', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Lock product record
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { session, new: true }
    );
    
    // 2. Kiểm tra tồn kho
    if (product.stock < 0) {
      throw new Error('Không đủ hàng');
    }
    
    // 3. Tạo order
    const order = await Order.create([orderData], { session });
    
    await session.commitTransaction();
    res.json({ success: true, order });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});
```

**Kết luận**:
- Dự án demo của em chấp nhận hạn chế này
- Trong thực tế cần backend + database với transaction

---

### Q7.2: Nếu muốn thêm tính năng đánh giá sản phẩm, làm thế nào?

**Trả lời:**
Dạ, em sẽ thiết kế như sau:

**Bước 1: Cập nhật cấu trúc Product**
```javascript
// Product.js
class Product {
  constructor(data) {
    // ... các thuộc tính cũ
    this.rating = data.rating || 0; // Đã có
    this.ratingCount = data.ratingCount || 0; // Đã có
    this.reviews = data.reviews || []; // THÊM MỚI: Mảng đánh giá
  }
  
  // Phương thức thêm đánh giá
  addReview(username, rating, comment) {
    this.reviews.push({
      id: Date.now(),
      username,
      rating, // 1-5 sao
      comment,
      date: new Date().toISOString()
    });
    
    // Cập nhật rating trung bình
    this.updateAverageRating();
  }
  
  // Cập nhật rating trung bình
  updateAverageRating() {
    if (this.reviews.length === 0) {
      this.rating = 0;
      this.ratingCount = 0;
      return;
    }
    
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = total / this.reviews.length;
    this.ratingCount = this.reviews.length;
  }
  
  // Lấy danh sách đánh giá (mới nhất trước)
  getReviews() {
    return this.reviews.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }
}
```

**Bước 2: Thêm UI trong product-detail.html**
```html
<!-- Phần hiển thị rating -->
<div class="product-rating">
  <div class="stars" id="product-stars">
    <!-- Render từ JS -->
  </div>
  <span id="rating-text">4.5/5 (100 đánh giá)</span>
</div>

<!-- Form thêm đánh giá -->
<div class="review-section">
  <h3>Đánh giá sản phẩm</h3>
  
  <form id="review-form">
    <div class="star-rating-input">
      <label>Chọn số sao:</label>
      <div class="stars-input">
        <i class="far fa-star" data-star="1"></i>
        <i class="far fa-star" data-star="2"></i>
        <i class="far fa-star" data-star="3"></i>
        <i class="far fa-star" data-star="4"></i>
        <i class="far fa-star" data-star="5"></i>
      </div>
    </div>
    
    <textarea name="comment" placeholder="Nhận xét của bạn..." required></textarea>
    <button type="submit">Gửi đánh giá</button>
  </form>
  
  <!-- Danh sách đánh giá -->
  <div id="reviews-list">
    <!-- Render từ JS -->
  </div>
</div>
```

**Bước 3: Xử lý logic trong JS**
```javascript
// product-detail.js

// Render danh sách đánh giá
function renderReviews(product) {
  const reviewsList = document.getElementById('reviews-list');
  const reviews = product.getReviews();
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p>Chưa có đánh giá nào.</p>';
    return;
  }
  
  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-item">
      <div class="review-header">
        <strong>${review.username}</strong>
        <span class="review-date">${formatDate(review.date)}</span>
      </div>
      <div class="review-rating">
        ${renderStars(review.rating)}
      </div>
      <div class="review-comment">${review.comment}</div>
    </div>
  `).join('');
}

// Xử lý chọn sao
const starsInput = document.querySelectorAll('.stars-input i');
let selectedRating = 0;

starsInput.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = star.dataset.star;
    
    // Highlight các sao đã chọn
    starsInput.forEach((s, index) => {
      if (index < selectedRating) {
        s.classList.remove('far');
        s.classList.add('fas');
      } else {
        s.classList.remove('fas');
        s.classList.add('far');
      }
    });
  });
});

// Xử lý submit đánh giá
document.getElementById('review-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Kiểm tra đăng nhập
  const user = kiemTraDangNhap();
  if (!user) {
    alert('Vui lòng đăng nhập để đánh giá');
    return;
  }
  
  // Kiểm tra đã chọn sao chưa
  if (selectedRating === 0) {
    alert('Vui lòng chọn số sao');
    return;
  }
  
  const comment = e.target.comment.value;
  
  // Thêm đánh giá
  const productId = getProductIdFromURL();
  const product = productManager.getProductById(productId);
  product.addReview(user.tenDangNhap, selectedRating, comment);
  
  // Lưu vào LocalStorage
  productManager.saveProducts();
  
  // Re-render
  renderReviews(product);
  updateProductRating(product);
  
  // Reset form
  e.target.reset();
  selectedRating = 0;
  starsInput.forEach(s => {
    s.classList.remove('fas');
    s.classList.add('far');
  });
  
  alert('Cảm ơn bạn đã đánh giá!');
});
```

**Bước 4: Thêm validation**
- User chỉ đánh giá được sau khi mua hàng
- Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm

```javascript
// Kiểm tra user đã mua sản phẩm này chưa
function hasUserPurchasedProduct(username, productId) {
  const user = userManager.users.find(u => u.tenDangNhap === username);
  if (!user) return false;
  
  return user.orders.some(order => 
    order.items.some(item => item.id === productId)
  );
}

// Kiểm tra user đã đánh giá chưa
function hasUserReviewed(product, username) {
  return product.reviews.some(r => r.username === username);
}

// Trong submit handler
if (!hasUserPurchasedProduct(user.tenDangNhap, productId)) {
  alert('Bạn cần mua sản phẩm này trước khi đánh giá');
  return;
}

if (hasUserReviewed(product, user.tenDangNhap)) {
  alert('Bạn đã đánh giá sản phẩm này rồi');
  return;
}
```

**Kết luận**:
- Tính năng đánh giá hoàn chỉnh với UI/UX tốt
- Có validation chặt chẽ
- Dễ mở rộng: thêm like/dislike review, reply, report spam

---

### Q7.3: Làm thế nào để tối ưu performance khi có nhiều sản phẩm?

**Trả lời:**
Dạ, em có thể áp dụng nhiều kỹ thuật:

**1. Lazy Loading (Tải lười)**
- Chỉ tải sản phẩm khi cần (scroll)

```javascript
// renderProducts.js
let currentPage = 1;
const itemsPerPage = 12;

function renderProductsPage(products, page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = products.slice(start, end);
  
  pageProducts.forEach(product => {
    // Render product card
  });
}

// Infinite scroll
window.addEventListener('scroll', () => {
  if (isBottomReached()) {
    currentPage++;
    renderProductsPage(allProducts, currentPage);
  }
});
```

**2. Pagination (Phân trang)**
```javascript
function renderPagination(totalProducts, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginationHTML = [];
  
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML.push(`
      <button class="page-btn ${i === currentPage ? 'active' : ''}" 
              data-page="${i}">
        ${i}
      </button>
    `);
  }
  
  document.getElementById('pagination').innerHTML = paginationHTML.join('');
}
```

**3. Debounce cho Search**
- Tránh tìm kiếm quá nhiều lần

```javascript
// search-overlay.js
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const searchInput = document.getElementById('search-input');
const debouncedSearch = debounce((query) => {
  const results = productManager.advancedSearch(query);
  renderSearchResults(results);
}, 300); // Chỉ search sau 300ms user ngừng gõ

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

**4. Virtual Scrolling**
- Chỉ render sản phẩm trong viewport

```javascript
// Chỉ ý tưởng, cần library như react-window
function renderVisibleProducts() {
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;
  
  // Tính index sản phẩm đang hiển thị
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight);
  
  // Chỉ render sản phẩm trong viewport
  const visibleProducts = allProducts.slice(startIndex, endIndex);
  renderProducts(visibleProducts);
}
```

**5. Caching**
- Lưu cache kết quả tìm kiếm

```javascript
const searchCache = new Map();

function search(query) {
  // Kiểm tra cache
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }
  
  // Thực hiện tìm kiếm
  const results = productManager.advancedSearch(query);
  
  // Lưu vào cache
  searchCache.set(query, results);
  
  return results;
}
```

**6. Minify và Bundle**
- Gộp các file JS thành 1 file
- Minify để giảm kích thước

```bash
# Dùng tool như webpack, rollup
npm install -g webpack
webpack --mode production
```

**7. Image Optimization**
- Dùng lazy loading cho hình ảnh
- Dùng WebP thay vì PNG/JPG

```html
<img src="placeholder.jpg" 
     data-src="real-image.jpg" 
     loading="lazy"
     class="lazy-image">
```

```javascript
// Lazy load images
const lazyImages = document.querySelectorAll('.lazy-image');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

**Kết luận**:
- Áp dụng kỹ thuật phù hợp với quy mô dự án
- Luôn đo lường performance trước khi tối ưu
- Dùng Chrome DevTools Lighthouse để kiểm tra

---

## 8. CÂU HỎI VỀ BẢO MẬT

### Q8.1: Dự án có vấn đề bảo mật nào không?

**Trả lời:**
Dạ có, dự án của em có một số vấn đề bảo mật do chỉ là demo:

**1. Mật khẩu không mã hóa**
- Lưu plain text trong LocalStorage
- Ai cũng có thể xem được

**Giải pháp**: Dùng bcrypt.js để hash password
```javascript
// Khi đăng ký
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
user.matKhau = hashedPassword;

// Khi đăng nhập
const isMatch = await bcrypt.compare(inputPassword, user.matKhau);
```

**2. Không có JWT/Token**
- Session lưu trong LocalStorage, dễ giả mạo
- Không có expiration time

**Giải pháp**: Dùng JWT
```javascript
// Backend tạo token
const token = jwt.sign({ username: user.tenDangNhap }, SECRET_KEY, {
  expiresIn: '24h'
});

// Frontend lưu token
localStorage.setItem('authToken', token);

// Mỗi request gửi token
fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**3. Không có HTTPS**
- Dữ liệu truyền plain text, dễ bị sniff

**Giải pháp**: Deploy với HTTPS (Let's Encrypt free SSL)

**4. XSS (Cross-Site Scripting)**
- Nếu user nhập `<script>alert('hack')</script>` vào comment

**Giải pháp**: Sanitize input
```javascript
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Khi render comment
reviewComment.innerHTML = escapeHTML(review.comment);
```

**5. SQL Injection (nếu có backend)**
- Không validate input

**Giải pháp**: Dùng parameterized query hoặc ORM
```javascript
// BAD
db.query(`SELECT * FROM users WHERE username = '${username}'`);

// GOOD
db.query('SELECT * FROM users WHERE username = ?', [username]);
```

**Kết luận**:
- Dự án em chỉ demo, không phù hợp production
- Nếu deploy thực tế cần backend + các biện pháp bảo mật

---

## 9. LỜI KẾT

Trên đây là tổng hợp các câu hỏi thường gặp và cách trả lời khi giảng viên hỏi về đồ án. Em hy vọng tài liệu này giúp ích cho bạn trong việc:

1. **Hiểu rõ cấu trúc dự án**: Biết file nào làm gì, liên kết ra sao
2. **Giải thích được code**: Không chỉ "làm được" mà còn "hiểu tại sao"
3. **Trả lời tự tin**: Chuẩn bị sẵn câu trả lời cho các câu hỏi thường gặp
4. **Phân tích sâu**: Hiểu được ưu/nhược điểm của giải pháp
5. **Mở rộng tư duy**: Biết cách cải tiến và phát triển thêm

**Lời khuyên khi trình bày**:
- Nói chậm rãi, rõ ràng
- Dùng ví dụ cụ thể để minh họa
- Chuẩn bị demo trực tiếp trên trình duyệt
- Thành thật khi không biết, không bịa chuyện
- Ghi nhớ các con số (số file, số dòng code, số tính năng)

**Chúc bạn bảo vệ đồ án thành công! 🎓✨**
