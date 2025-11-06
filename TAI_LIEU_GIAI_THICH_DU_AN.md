# TÀI LIỆU GIẢI THÍCH ĐỒ ÁN WEB - SHOESTORE

## 📋 MỤC LỤC
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Chi tiết các trang web](#4-chi-tiết-các-trang-web)
5. [Chi tiết các Module JavaScript](#5-chi-tiết-các-module-javascript)
6. [Chi tiết các tính năng](#6-chi-tiết-các-tính-năng)
7. [Luồng hoạt động của hệ thống](#7-luồng-hoạt-động-của-hệ-thống)
8. [Công nghệ sử dụng](#8-công-nghệ-sử-dụng)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mô tả
**ShoeStore** là một website bán giày nam trực tuyến được xây dựng với HTML, CSS, và JavaScript thuần (Vanilla JavaScript). Dự án bao gồm:
- **Giao diện người dùng (End User)**: Duyệt sản phẩm, thêm vào giỏ hàng, đặt hàng
- **Giao diện quản trị (Admin)**: Quản lý sản phẩm, đơn hàng, người dùng, tồn kho, giá bán

### 1.2. Mục tiêu
- Tạo trải nghiệm mua sắm trực tuyến hoàn chỉnh
- Quản lý nghiệp vụ bán hàng (sản phẩm, đơn hàng, tồn kho, giá vốn, lợi nhuận)
- Sử dụng LocalStorage để lưu trữ dữ liệu (không cần backend)

### 1.3. Đặc điểm nổi bật
- **Không sử dụng framework**: Sử dụng JavaScript thuần, dễ hiểu cho người mới học
- **Module hóa code**: Chia nhỏ code thành các file riêng biệt, dễ bảo trì
- **Quản lý tồn kho thông minh**: Hỗ trợ sản phẩm có/không có biến thể (size)
- **Tính toán lợi nhuận tự động**: Tự động tính giá bán dựa trên giá vốn và % lợi nhuận mong muốn

---

## 2. CẤU TRÚC THƯ MỤC

```
WEB-1/
├── index.html                  # Trang chủ (End User)
├── admin-index.html            # Trang quản trị (Admin)
├── product-detail.html         # Trang chi tiết sản phẩm
├── profile.html                # Trang thông tin cá nhân
├── README.md                   # Tài liệu dự án
│
├── css/                        # Thư mục chứa các file CSS
│   ├── style.css               # CSS cho trang chủ
│   ├── admin-base.css          # CSS cơ bản cho admin
│   ├── admin-product.css       # CSS quản lý sản phẩm
│   ├── admin-order.css         # CSS quản lý đơn hàng
│   ├── admin-inventory.css     # CSS quản lý tồn kho
│   ├── admin-price.css         # CSS quản lý giá bán
│   ├── category-admin.css      # CSS quản lý danh mục
│   ├── cart-and-user-ui.css    # CSS giỏ hàng và user
│   ├── checkout-modal.css      # CSS modal thanh toán
│   ├── product-detail.css      # CSS trang chi tiết sản phẩm
│   ├── profile.css             # CSS trang profile
│   ├── search-overlay.css      # CSS overlay tìm kiếm
│   └── dangnhap.css            # CSS form đăng nhập
│
├── js/                         # Thư mục chứa các file JavaScript
│   ├── Product.js              # Class định nghĩa sản phẩm
│   ├── ProductManager.js       # Quản lý danh sách sản phẩm
│   ├── productData.js          # Dữ liệu sản phẩm mẫu
│   ├── cart.js                 # Logic giỏ hàng
│   ├── cart-ui.js              # Giao diện giỏ hàng
│   ├── user.js                 # Quản lý người dùng
│   ├── userManagement.js       # Xử lý đăng nhập/đăng ký
│   ├── category.js             # Quản lý danh mục
│   ├── order-manager.js        # Quản lý đơn hàng
│   ├── inventory.js            # Quản lý tồn kho
│   ├── ImportSlip.js           # Phiếu nhập hàng
│   ├── main.js                 # File chính khởi tạo
│   ├── renderProducts.js       # Hiển thị danh sách sản phẩm
│   ├── product-detail.js       # Logic trang chi tiết
│   ├── product-detail-logic.js # Xử lý chi tiết sản phẩm
│   ├── search-overlay.js       # Tìm kiếm sản phẩm
│   ├── checkout-modal-html.js  # HTML modal thanh toán
│   ├── checkout-ui.js          # Giao diện thanh toán
│   ├── login-modal.js          # Modal đăng nhập
│   ├── order-history-ui.js     # Giao diện lịch sử đơn hàng
│   ├── profile.js              # Logic trang profile
│   ├── profile-order-history.js# Lịch sử đơn hàng trong profile
│   │
│   ├── admin.js                # Logic chính trang admin
│   ├── product-admin.js        # Quản lý sản phẩm (admin)
│   ├── category-admin.js       # Quản lý danh mục (admin)
│   ├── order-admin.js          # Quản lý đơn hàng (admin)
│   ├── import-admin.js         # Quản lý phiếu nhập (admin)
│   ├── price-admin.js          # Quản lý giá bán (admin)
│   └── user-admin.js           # Quản lý user (admin)
│
└── img/                        # Thư mục chứa hình ảnh sản phẩm
```

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1. Mô hình MVC (Model-View-Controller)

Dự án áp dụng mô hình MVC đơn giản:

**MODEL (Dữ liệu)**
- `Product.js`: Class định nghĩa cấu trúc sản phẩm
- `user.js`: Class User và UserManager
- `category.js`: Quản lý danh mục
- `order-manager.js`: Quản lý đơn hàng
- `ImportSlip.js`: Quản lý phiếu nhập

**VIEW (Giao diện)**
- `index.html`, `admin-index.html`, `product-detail.html`: Các trang HTML
- Các file CSS trong thư mục `css/`
- Các file `*-ui.js`: Xử lý hiển thị giao diện

**CONTROLLER (Điều khiển)**
- `ProductManager.js`: Xử lý logic sản phẩm
- `cart.js`: Xử lý logic giỏ hàng
- `userManagement.js`: Xử lý đăng nhập/đăng ký
- Các file `*-admin.js`: Xử lý logic admin

### 3.2. Lưu trữ dữ liệu (LocalStorage)

Dự án sử dụng LocalStorage để lưu trữ:

| Key | Mô tả | Ví dụ dữ liệu |
|-----|-------|---------------|
| `shoestore_products` | Danh sách sản phẩm | Array of Product objects |
| `users_shoestore` | Danh sách người dùng | Array of User objects |
| `nguoiDungHienTai` | User đang đăng nhập (End User) | User object |
| `nguoiDungAdmin` | Admin đang đăng nhập | User object |
| `cart_[username]` | Giỏ hàng của user | Array of cart items |
| `shoestore_orders` | Danh sách đơn hàng | Array of Order objects |
| `product_categories` | Danh sách danh mục | Array of Category objects |
| `import_slips` | Danh sách phiếu nhập | Array of ImportSlip objects |

### 3.3. Sơ đồ quan hệ giữa các Module

```
                     +-------------------+
                     |   index.html      |
                     |  (Trang chủ)      |
                     +-------------------+
                              |
                              v
        +------------------------------------------+
        |              main.js (Entry Point)       |
        +------------------------------------------+
                     |        |        |
         +-----------+        |        +-----------+
         |                    |                    |
         v                    v                    v
+----------------+   +------------------+   +---------------+
| ProductManager |   |   cart.js        |   | user.js       |
| (Quản lý SP)   |   |  (Giỏ hàng)      |   | (User)        |
+----------------+   +------------------+   +---------------+
         |                    |                    |
         v                    v                    v
+----------------+   +------------------+   +---------------+
| Product.js     |   | order-manager.js |   | category.js   |
| (Model SP)     |   | (Đơn hàng)       |   | (Danh mục)    |
+----------------+   +------------------+   +---------------+
```

---

## 4. CHI TIẾT CÁC TRANG WEB

### 4.1. Trang chủ (index.html)

**Mục đích**: Hiển thị sản phẩm, cho phép người dùng duyệt và thêm vào giỏ hàng

**Cấu trúc HTML**:
1. **Header**: Logo, menu điều hướng, icon giỏ hàng/user
2. **Hero Section**: Banner slideshow với CTA (Call-to-Action)
3. **Categories Section**: Hiển thị danh mục nổi bật
4. **Products Section**: 
   - Bộ lọc sản phẩm (Tất cả, Thể thao, Công sở, Casual)
   - Sắp xếp (Giá tăng/giảm, Mới nhất, Bán chạy)
   - Lưới hiển thị sản phẩm (product-grid)
5. **Brands Section**: Hiển thị các thương hiệu
6. **Footer**: Thông tin liên hệ, social links

**JavaScript liên quan**:
- `main.js`: Khởi tạo slider, xử lý sự kiện
- `renderProducts.js`: Hiển thị danh sách sản phẩm
- `cart-ui.js`: Hiển thị giỏ hàng khi click icon
- `search-overlay.js`: Xử lý tìm kiếm sản phẩm

### 4.2. Trang quản trị (admin-index.html)

**Mục đích**: Quản lý toàn bộ hệ thống (sản phẩm, đơn hàng, user, tồn kho, giá bán)

**Cấu trúc HTML**:
1. **Login Page**: Form đăng nhập admin (username: admin, password: Admin123)
2. **Admin Panel** (sau khi đăng nhập):
   - **Menu bên trái**: Điều hướng giữa các trang quản lý
   - **Header**: Chào admin, nút đăng xuất
   - **Các Section**:
     - `#index`: Dashboard (thống kê tổng quan)
     - `#user`: Quản lý người dùng
     - `#products`: Quản lý sản phẩm (CRUD)
     - `#categories`: Quản lý danh mục
     - `#orders`: Quản lý đơn hàng
     - `#inventory`: Quản lý tồn kho & nhập hàng
     - `#price`: Quản lý giá bán & lợi nhuận
     - `#import-slips`: Quản lý phiếu nhập hàng

**JavaScript liên quan**:
- `admin.js`: Xử lý đăng nhập admin, điều hướng menu
- `product-admin.js`: CRUD sản phẩm
- `category-admin.js`: CRUD danh mục
- `order-admin.js`: Xem và cập nhật trạng thái đơn hàng
- `import-admin.js`: Quản lý phiếu nhập
- `price-admin.js`: Cập nhật giá bán dựa trên % lợi nhuận
- `user-admin.js`: Quản lý user (khóa/mở khóa, reset mật khẩu)

### 4.3. Trang chi tiết sản phẩm (product-detail.html)

**Mục đích**: Hiển thị thông tin chi tiết sản phẩm, cho phép chọn size/màu và thêm vào giỏ

**Cấu trúc HTML**:
1. **Header**: Giống trang chủ
2. **Product Detail Section**:
   - Hình ảnh sản phẩm (lớn)
   - Thông tin: Tên, giá, đánh giá, mô tả
   - Chọn size/màu
   - Nút "Thêm vào giỏ hàng"
3. **Footer**: Giống trang chủ

**JavaScript liên quan**:
- `product-detail.js`: Lấy ID sản phẩm từ URL, hiển thị thông tin
- `product-detail-logic.js`: Xử lý logic chọn size/màu, thêm vào giỏ

---

## 5. CHI TIẾT CÁC MODULE JAVASCRIPT

### 5.1. Product.js (Class sản phẩm)

**Vai trò**: Định nghĩa cấu trúc và phương thức của một sản phẩm

**Thuộc tính chính**:
```javascript
{
  id: Number,              // ID sản phẩm
  name: String,            // Tên sản phẩm
  categoryId: Number,      // ID danh mục
  price: Number,           // Giá bán
  oldPrice: Number,        // Giá cũ (nếu có)
  img: String,             // URL hình ảnh chính
  images: Array,           // Mảng các hình ảnh
  description: String,     // Mô tả sản phẩm
  variants: Array,         // Biến thể (size + stock)
  costPrice: Number,       // Giá vốn
  initialStock: Number,    // Tồn kho (cho SP không có biến thể)
  lowStockThreshold: Number, // Ngưỡng cảnh báo tồn kho thấp
  imports: Array,          // Lịch sử nhập hàng
  sales: Array,            // Lịch sử bán hàng
  isHidden: Boolean,       // Ẩn/Hiện sản phẩm
  targetProfitMargin: Number, // % lợi nhuận mong muốn
  rating: Number,          // Đánh giá (0-5)
  badge: String            // Nhãn (new, sale, hot)
}
```

**Phương thức quan trọng**:
1. **getCurrentStock()**: Tính tổng tồn kho hiện tại
   - Nếu có biến thể (variants): Tính tổng stock của tất cả size
   - Nếu không có biến thể: Trả về initialStock

2. **isLowStock()**: Kiểm tra tồn kho thấp
   - So sánh với lowStockThreshold

3. **getAvailableSizes()**: Lấy danh sách size còn hàng
   - Lọc variants có stock > 0
   - Trả về mảng size đã sắp xếp

4. **getVariant(size)**: Lấy thông tin biến thể theo size

5. **getFormattedPrice()**: Format giá theo định dạng VND (1.000.000₫)

6. **getDiscountPercent()**: Tính % giảm giá

7. **renderStars()**: Render HTML sao đánh giá

### 5.2. ProductManager.js (Quản lý sản phẩm)

**Vai trò**: Quản lý danh sách sản phẩm, CRUD, tồn kho, giá bán

**Phương thức chính**:

**1. Load/Save**
- `loadProducts()`: Tải sản phẩm từ LocalStorage
- `saveProducts()`: Lưu sản phẩm vào LocalStorage

**2. CRUD**
- `getProductById(id)`: Lấy sản phẩm theo ID
- `getAllProducts(includeHidden)`: Lấy tất cả sản phẩm
- `getVisibleProducts()`: Lấy sản phẩm không bị ẩn
- `addProduct(data)`: Thêm sản phẩm mới
- `updateProduct(id, data)`: Cập nhật sản phẩm
- `deleteProduct(id)`: Xóa sản phẩm
- `toggleHideStatus(id)`: Ẩn/hiện sản phẩm

**3. Quản lý tồn kho**
- `processProductImport(productId, quantity, importPrice, size, note)`: 
  - Nhập hàng vào kho
  - Cập nhật tồn kho (variants.stock hoặc initialStock)
  - Lưu lịch sử nhập (imports array)

- `decreaseStock(productId, quantity, size)`:
  - Giảm tồn kho khi bán hàng
  - Lưu lịch sử bán (sales array)

- `increaseStock(productId, quantity, size)`:
  - Tăng tồn kho khi hoàn hàng/hủy đơn

**4. Quản lý giá bán**
- `updateProductPriceByMargin(id, marginPercent)`:
  - Tính giá bán dựa trên công thức: `Giá Bán = Giá Vốn / (1 - (% Lợi nhuận / 100))`
  - Làm tròn đến 1000đ gần nhất
  - Lưu % lợi nhuận vào targetProfitMargin

**5. Tìm kiếm/Lọc**
- `advancedSearch(name, category, minPrice, maxPrice)`:
  - Tìm kiếm sản phẩm theo tên, danh mục, khoảng giá

### 5.3. cart.js (Giỏ hàng)

**Vai trò**: Quản lý giỏ hàng của người dùng

**Cấu trúc giỏ hàng**:
Mỗi user có giỏ hàng riêng, lưu trong LocalStorage với key `cart_[username]`

```javascript
[
  {
    id: Number,              // ID sản phẩm
    name: String,            // Tên sản phẩm
    price: Number,           // Giá
    img: String,             // Hình ảnh
    size: String,            // Size đã chọn (hoặc "N/A", "Chưa chọn")
    color: String,           // Màu đã chọn
    quantity: Number,        // Số lượng
    itemIdentifier: String   // ID duy nhất: "productId-size"
  }
]
```

**Phương thức chính**:

1. **getCart()**: Lấy giỏ hàng của user hiện tại
2. **addToCart(productId, name, price, img, size, color, quantity)**:
   - Kiểm tra đăng nhập
   - Kiểm tra tồn kho
   - Thêm hoặc cập nhật số lượng
   - Xử lý 3 trường hợp:
     a. Sản phẩm có biến thể + đã chọn size: Kẹp theo tồn kho của size đó
     b. Sản phẩm có biến thể + chưa chọn size: Cho phép 1 dòng "Chưa chọn" (qty=1)
     c. Sản phẩm không có biến thể: Kẹp theo initialStock

3. **updateCartItemSize(oldItemIdentifier, newSize)**:
   - Cập nhật size của item trong giỏ
   - Merge với item khác nếu đã tồn tại cùng size

4. **updateCartItemQuantity(itemIdentifier, newQuantity)**:
   - Cập nhật số lượng
   - Kiểm tra không vượt quá tồn kho

5. **removeCartItem(itemIdentifier)**: Xóa item khỏi giỏ

6. **clearCart()**: Xóa toàn bộ giỏ hàng

7. **calculateCartTotal()**: Tính tổng tiền giỏ hàng

8. **checkCartBeforeCheckout()**: 
   - Kiểm tra tất cả item đã chọn size chưa
   - Chặn thanh toán nếu còn item "Chưa chọn"

### 5.4. user.js (Quản lý người dùng)

**Vai trò**: Quản lý người dùng và phiên đăng nhập

**Class User**:
```javascript
{
  hoTen: String,           // Họ tên
  tenDangNhap: String,     // Username
  email: String,           // Email
  matKhau: String,         // Password (không mã hóa - chỉ demo)
  orders: Array,           // Lịch sử đơn hàng
  isLocked: Boolean        // Trạng thái khóa/mở
}
```

**Class UserManager**:
- Quản lý danh sách user
- Lưu trong LocalStorage với key `users_shoestore`

**Phương thức chính**:

**1. Session Management**
- `luuUserHienTai(user)`: Lưu user đang đăng nhập (End User) với key `nguoiDungHienTai`
- `layUserHienTai()`: Lấy user đang đăng nhập (End User)
- `luuAdminHienTai(user)`: Lưu admin đang đăng nhập với key `nguoiDungAdmin`
- `layAdminHienTai()`: Lấy admin đang đăng nhập
- `xoaAdminHienTai()`: Đăng xuất admin

**2. CRUD User**
- `themTaiKhoan(hoTen, tenDangNhap, email, matKhau)`: Đăng ký tài khoản mới
- `timTaiKhoan(tenDangNhap, matKhau)`: Xác thực đăng nhập
- `capNhatUser(updatedUser)`: Cập nhật thông tin user
- `tonTaiTenDangNhap(tenDangNhap)`: Kiểm tra tên đăng nhập đã tồn tại
- `tonTaiEmail(email)`: Kiểm tra email đã tồn tại

**3. Admin Functions**
- `getAllUsers()`: Lấy danh sách user (trừ admin)
- `resetPassword(username)`: Reset mật khẩu về "123456"
- `updateUserStatus(username, isLocked)`: Khóa/mở khóa tài khoản

### 5.5. order-manager.js (Quản lý đơn hàng)

**Vai trò**: Xử lý đặt hàng, lưu trữ và quản lý đơn hàng

**Cấu trúc Order**:
```javascript
{
  id: String,              // Mã đơn hàng (ORD-timestamp)
  username: String,        // Username người đặt
  customerInfo: {          // Thông tin khách hàng
    name: String,
    phone: String,
    email: String,
    address: String
  },
  items: Array,            // Danh sách sản phẩm [{id, name, price, quantity, size}]
  total: Number,           // Tổng tiền
  date: String,            // Ngày đặt (ISO string)
  status: String,          // Trạng thái (new, processed, delivered, canceled)
  paymentMethod: String    // Phương thức thanh toán
}
```

**Phương thức chính**:

1. **placeOrder(orderData)**:
   - Kiểm tra giỏ hàng hợp lệ (đã chọn size)
   - Kiểm tra tồn kho cho từng item
   - Trừ tồn kho (gọi `productManager.decreaseStock()`)
   - Lưu đơn hàng vào LocalStorage
   - Lưu vào lịch sử đơn hàng của user
   - Xóa giỏ hàng
   - Trả về đối tượng order đã tạo

2. **getOrdersByUsername(username)**: Lấy đơn hàng của một user

3. **getAllOrders()**: Lấy tất cả đơn hàng (cho admin)

4. **updateOrderStatus(orderId, newStatus)**:
   - Cập nhật trạng thái đơn hàng
   - Nếu chuyển sang "Đã hủy": Hoàn tồn kho (gọi `productManager.increaseStock()`)

5. **filterOrders(fromDate, toDate, status)**: Lọc đơn hàng theo ngày và trạng thái

### 5.6. category.js (Quản lý danh mục)

**Vai trò**: Quản lý danh mục sản phẩm

**Cấu trúc Category**:
```javascript
{
  id: Number,              // ID danh mục
  name: String,            // Tên danh mục
  isActive: Boolean        // Trạng thái hoạt động
}
```

**Phương thức chính**:
- `addCategory(name)`: Thêm danh mục mới
- `updateCategory(id, newName)`: Cập nhật tên danh mục
- `deleteCategory(id)`: Xóa danh mục (kiểm tra có sản phẩm nào dùng không)
- `toggleCategoryStatus(id)`: Bật/tắt trạng thái danh mục
- `getCategoryNameById(id)`: Lấy tên danh mục theo ID
- `getAllCategories()`: Lấy tất cả danh mục

### 5.7. ImportSlip.js (Phiếu nhập hàng)

**Vai trò**: Quản lý phiếu nhập hàng

**Cấu trúc ImportSlip**:
```javascript
{
  id: String,              // Số phiếu (IMP-timestamp)
  productId: Number,       // ID sản phẩm
  productName: String,     // Tên sản phẩm
  quantity: Number,        // Số lượng nhập
  importPrice: Number,     // Giá nhập (giá vốn)
  size: Number|null,       // Size (nếu có biến thể)
  supplier: String,        // Nhà cung cấp
  note: String,            // Ghi chú
  createdDate: String,     // Ngày tạo
  status: String,          // Trạng thái (DRAFT, COMPLETED)
  completedDate: String    // Ngày hoàn thành
}
```

**Phương thức chính**:
- `createDraft(data)`: Tạo phiếu nháp
- `completeSlip(slipId)`: Hoàn thành phiếu (nhập kho thực tế)
- `deleteSlip(slipId)`: Xóa phiếu nháp
- `updateSlip(slipId, updatedData)`: Cập nhật thông tin phiếu

---

## 6. CHI TIẾT CÁC TÍNH NĂNG

### 6.1. Tính năng End User

#### 6.1.1. Duyệt sản phẩm
- Hiển thị danh sách sản phẩm trên trang chủ
- Lọc theo danh mục (Tất cả, Thể thao, Công sở, Casual)
- Sắp xếp (Giá tăng/giảm, Mới nhất, Bán chạy)
- Quick View: Xem nhanh thông tin sản phẩm

**File liên quan**: `renderProducts.js`, `main.js`

#### 6.1.2. Tìm kiếm sản phẩm
- Click icon search mở overlay tìm kiếm
- Tìm kiếm theo tên sản phẩm
- Lọc theo danh mục và khoảng giá
- Hiển thị kết quả real-time

**File liên quan**: `search-overlay.js`

#### 6.1.3. Xem chi tiết sản phẩm
- Click vào sản phẩm chuyển sang trang `product-detail.html`
- Hiển thị thông tin chi tiết: hình ảnh, giá, mô tả, đánh giá
- Chọn size (nếu sản phẩm có biến thể)
- Chọn màu (nếu có)
- Chọn số lượng (giới hạn theo tồn kho)
- Thêm vào giỏ hàng

**File liên quan**: `product-detail.js`, `product-detail-logic.js`

#### 6.1.4. Giỏ hàng
- Click icon giỏ hàng mở modal giỏ hàng
- Hiển thị danh sách sản phẩm trong giỏ
- Chỉnh sửa size/màu/số lượng
- Xóa sản phẩm khỏi giỏ
- Xóa toàn bộ giỏ hàng
- Hiển thị tổng tiền
- Nút "Tiến hành thanh toán"

**File liên quan**: `cart.js`, `cart-ui.js`

**Xử lý đặc biệt**:
- Mỗi user có giỏ hàng riêng
- Giỏ hàng lưu trong LocalStorage với key `cart_[username]`
- Item trong giỏ có `itemIdentifier` = `productId-size` để phân biệt

#### 6.1.5. Thanh toán (Checkout)
- Kiểm tra đã đăng nhập chưa
- Kiểm tra đã chọn size cho tất cả sản phẩm chưa
- Hiển thị form nhập thông tin giao hàng
- Chọn phương thức thanh toán
- Xác nhận đặt hàng
- Kiểm tra tồn kho lần cuối
- Trừ tồn kho
- Tạo đơn hàng
- Xóa giỏ hàng
- Hiển thị thông báo thành công

**File liên quan**: `checkout-ui.js`, `checkout-modal-html.js`, `order-manager.js`

**Luồng xử lý**:
```
1. User click "Thanh toán"
2. Kiểm tra đăng nhập -> Nếu chưa, mở modal đăng nhập
3. Kiểm tra size đã chọn -> Nếu chưa, hiển thị lỗi
4. Mở modal checkout
5. User nhập thông tin (tên, SĐT, email, địa chỉ)
6. User chọn phương thức thanh toán
7. User click "Xác nhận đặt hàng"
8. Kiểm tra tồn kho cho từng item
9. Nếu đủ hàng:
   - Trừ tồn kho (productManager.decreaseStock)
   - Tạo order (lưu vào LocalStorage)
   - Lưu vào lịch sử user
   - Xóa giỏ hàng
   - Hiển thị thông báo thành công
10. Nếu không đủ hàng:
    - Hiển thị thông báo lỗi
    - Không tạo đơn hàng
```

#### 6.1.6. Lịch sử đơn hàng
- Click icon lịch sử (history) mở modal lịch sử đơn hàng
- Hiển thị danh sách đơn hàng của user
- Xem chi tiết từng đơn hàng
- Hiển thị trạng thái đơn hàng

**File liên quan**: `order-history-ui.js`, `profile-order-history.js`

#### 6.1.7. Đăng nhập/Đăng ký
- Click icon user mở modal đăng nhập
- Tab "Đăng nhập" và "Đăng ký"
- Đăng nhập: Nhập username/email và password
- Đăng ký: Nhập họ tên, username, email, password
- Kiểm tra tài khoản tồn tại
- Lưu session vào LocalStorage

**File liên quan**: `login-modal.js`, `userManagement.js`

### 6.2. Tính năng Admin

#### 6.2.1. Đăng nhập Admin
- Trang `admin-index.html` hiển thị form đăng nhập
- Username: `admin`, Password: `Admin123`
- Sau khi đăng nhập, lưu session admin riêng với key `nguoiDungAdmin`
- Hiển thị admin panel

**File liên quan**: `admin.js`

#### 6.2.2. Dashboard
- Hiển thị số liệu thống kê:
  - Số tài khoản hiện có
  - Số sản phẩm hiện có
  - Số đơn đặt hàng hiện có

**File liên quan**: `admin.js`

#### 6.2.3. Quản lý Sản phẩm
**Chức năng**:
- Xem danh sách sản phẩm (bảng)
- Thêm sản phẩm mới (modal)
- Sửa sản phẩm (modal)
- Xóa sản phẩm
- Ẩn/Hiện sản phẩm

**Form thêm/sửa sản phẩm**:
- Tên sản phẩm (required)
- Danh mục (required)
- Giá bán (required)
- URL hình ảnh (required)
- Mô tả (required)

**File liên quan**: `product-admin.js`

**Lưu ý**:
- Khi thêm sản phẩm mới, tồn kho mặc định = 0
- Cần nhập hàng qua tính năng "Quản lý Tồn kho" để có stock

#### 6.2.4. Quản lý Danh mục
**Chức năng**:
- Xem danh sách danh mục
- Thêm danh mục mới
- Sửa tên danh mục
- Xóa danh mục (nếu không có sản phẩm nào dùng)
- Bật/tắt trạng thái danh mục

**File liên quan**: `category-admin.js`

#### 6.2.5. Quản lý Đơn hàng
**Chức năng**:
- Xem danh sách đơn hàng
- Lọc theo ngày và trạng thái
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng:
  - Đang chờ xử lý
  - Đã xử lý
  - Đã giao
  - Đã hủy (hoàn tồn kho)

**File liên quan**: `order-admin.js`

**Xử lý đặc biệt**:
- Khi chuyển trạng thái sang "Đã hủy", hệ thống tự động hoàn tồn kho
- Gọi `productManager.increaseStock()` cho từng item trong đơn hàng

#### 6.2.6. Quản lý Tồn kho & Nhập hàng
**Chức năng**:
- Xem bảng tổng hợp tồn kho
- Thêm phiếu nhập hàng:
  - Chọn sản phẩm
  - Nhập số lượng
  - Nhập giá vốn (cost price)
  - Nhập size (nếu sản phẩm có biến thể)
  - Nhập ghi chú
- Xem lịch sử nhập/xuất/tồn của sản phẩm (modal)
- Lọc sản phẩm theo danh mục và tên

**File liên quan**: `inventory.js`, `import-admin.js` (phần trong admin-index.html section #inventory)

**Luồng nhập hàng**:
```
1. Admin chọn sản phẩm từ dropdown
2. Nếu sản phẩm có biến thể (variants), hiển thị ô nhập size
3. Admin nhập số lượng và giá vốn
4. Admin nhập ghi chú (tùy chọn)
5. Click "Hoàn thành Phiếu Nhập"
6. Hệ thống gọi productManager.processProductImport():
   - Cập nhật tồn kho (variants.stock hoặc initialStock)
   - Cập nhật giá vốn (costPrice)
   - Lưu lịch sử nhập (imports array)
7. Hiển thị thông báo thành công
8. Cập nhật bảng tồn kho
```

#### 6.2.7. Quản lý Giá bán & Lợi nhuận
**Chức năng**:
- Xem bảng giá bán hiện tại và giá vốn
- Tính % lợi nhuận thực tế: `(Giá Bán - Giá Vốn) / Giá Vốn * 100`
- Thiết lập % lợi nhuận mong muốn
- Tự động tính giá bán mới dựa trên công thức:
  ```
  Giá Bán = Giá Vốn / (1 - (% Lợi nhuận / 100))
  ```
- Làm tròn giá bán đến 1000đ gần nhất
- Lọc sản phẩm theo danh mục và tên

**File liên quan**: `price-admin.js`

**Ví dụ tính giá**:
- Giá vốn: 1.000.000đ
- Lợi nhuận mong muốn: 20%
- Giá bán = 1.000.000 / (1 - 0.2) = 1.250.000đ

#### 6.2.8. Quản lý Phiếu nhập hàng
**Chức năng**:
- Xem danh sách phiếu nhập
- Tạo phiếu nhập mới (trạng thái DRAFT)
- Sửa phiếu nhập (chỉ DRAFT)
- Xóa phiếu nhập (chỉ DRAFT)
- Hoàn thành phiếu nhập (chuyển sang COMPLETED, nhập kho thực tế)
- Lọc theo trạng thái, ngày, sản phẩm

**File liên quan**: `import-admin.js`, `ImportSlip.js`

**Luồng hoàn thành phiếu**:
```
1. Admin tạo phiếu nháp (DRAFT)
2. Phiếu được lưu nhưng CHƯA nhập kho
3. Admin xem lại và sửa (nếu cần)
4. Admin click "Hoàn thành"
5. Hệ thống:
   - Gọi productManager.processProductImport()
   - Cập nhật tồn kho thực tế
   - Chuyển trạng thái phiếu sang COMPLETED
   - Lưu ngày hoàn thành
6. Phiếu COMPLETED không thể sửa/xóa
```

#### 6.2.9. Quản lý Người dùng
**Chức năng**:
- Xem danh sách người dùng (trừ admin)
- Khóa/Mở khóa tài khoản
- Reset mật khẩu về "123456"
- Xem lịch sử đơn hàng của user

**File liên quan**: `user-admin.js`

---

## 7. LUỒNG HOẠT ĐỘNG CỦA HỆ THỐNG

### 7.1. Luồng mua hàng (End User)

```
1. USER VÀO TRANG CHỦ (index.html)
   |
   v
2. DUYỆT SẢN PHẨM
   - Xem danh sách sản phẩm
   - Lọc theo danh mục
   - Sắp xếp theo giá/mới nhất
   |
   v
3. CHỌN SẢN PHẨM
   - Click vào sản phẩm
   - Chuyển sang product-detail.html?id=xxx
   |
   v
4. XEM CHI TIẾT SẢN PHẨM
   - Xem hình ảnh, mô tả, giá
   - Chọn size (nếu có)
   - Chọn số lượng
   |
   v
5. THÊM VÀO GIỎ HÀNG
   - Kiểm tra đăng nhập -> Nếu chưa, mở modal đăng nhập
   - Kiểm tra tồn kho
   - Thêm vào giỏ (localStorage: cart_[username])
   - Hiển thị thông báo thành công
   |
   v
6. XEM GIỎ HÀNG
   - Click icon giỏ hàng
   - Mở modal giỏ hàng
   - Xem danh sách sản phẩm
   - Chỉnh sửa size/số lượng (nếu cần)
   |
   v
7. THANH TOÁN
   - Click "Tiến hành thanh toán"
   - Kiểm tra đã chọn size cho tất cả sản phẩm
   - Mở modal checkout
   - Nhập thông tin giao hàng (tên, SĐT, địa chỉ)
   - Chọn phương thức thanh toán
   |
   v
8. XÁC NHẬN ĐẶT HÀNG
   - Kiểm tra tồn kho lần cuối
   - Nếu đủ hàng:
     * Trừ tồn kho (productManager.decreaseStock)
     * Tạo đơn hàng (orderManager.placeOrder)
     * Lưu vào lịch sử user
     * Xóa giỏ hàng
     * Hiển thị thông báo thành công
   - Nếu không đủ hàng:
     * Hiển thị thông báo lỗi
     * Không tạo đơn hàng
   |
   v
9. XEM LỊCH SỬ ĐƠN HÀNG
   - Click icon lịch sử
   - Xem danh sách đơn hàng đã đặt
   - Xem chi tiết đơn hàng
```

### 7.2. Luồng quản lý (Admin)

```
1. ADMIN ĐĂNG NHẬP (admin-index.html)
   - Username: admin
   - Password: Admin123
   - Lưu session admin (localStorage: nguoiDungAdmin)
   |
   v
2. XEM DASHBOARD
   - Số tài khoản
   - Số sản phẩm
   - Số đơn hàng
   |
   v
3. QUẢN LÝ SẢN PHẨM
   - Thêm sản phẩm mới (tồn kho mặc định = 0)
   - Sửa thông tin sản phẩm
   - Xóa/Ẩn sản phẩm
   |
   v
4. NHẬP HÀNG VÀO KHO
   - Chọn sản phẩm
   - Nhập số lượng và giá vốn
   - Nhập size (nếu có biến thể)
   - Hoàn thành phiếu nhập
   - Hệ thống cập nhật tồn kho và giá vốn
   |
   v
5. CẬP NHẬT GIÁ BÁN
   - Xem bảng giá vốn và giá bán hiện tại
   - Nhập % lợi nhuận mong muốn
   - Hệ thống tự động tính giá bán mới
   - Lưu giá bán mới
   |
   v
6. QUẢN LÝ ĐƠN HÀNG
   - Xem danh sách đơn hàng
   - Lọc theo ngày và trạng thái
   - Xem chi tiết đơn hàng
   - Cập nhật trạng thái:
     * Đang chờ xử lý
     * Đã xử lý
     * Đã giao
     * Đã hủy (hoàn tồn kho tự động)
   |
   v
7. QUẢN LÝ NGƯỜI DÙNG
   - Xem danh sách user
   - Khóa/Mở khóa tài khoản
   - Reset mật khẩu
   - Xem lịch sử đơn hàng của user
```

### 7.3. Luồng xử lý tồn kho

```
NHẬP KHO (Import):
- Admin tạo phiếu nhập
- Nhập số lượng, giá vốn, size (nếu có)
- Hoàn thành phiếu
- productManager.processProductImport():
  * Nếu có biến thể: Cập nhật variants[i].stock
  * Nếu không: Cập nhật initialStock
  * Cập nhật costPrice
  * Lưu vào imports array
- Lưu products vào LocalStorage

XUẤT KHO (Sale):
- User đặt hàng
- orderManager.placeOrder():
  * Kiểm tra tồn kho đủ không
  * Gọi productManager.decreaseStock() cho từng item
    - Nếu có biến thể: Giảm variants[i].stock
    - Nếu không: Giảm initialStock
    - Lưu vào sales array
  * Tạo order
  * Xóa giỏ hàng
- Lưu products và orders vào LocalStorage

HOÀN KHO (Cancel):
- Admin hủy đơn hàng
- orderAdmin.updateOrderStatus(orderId, "Đã hủy"):
  * Gọi productManager.increaseStock() cho từng item
    - Nếu có biến thể: Tăng variants[i].stock
    - Nếu không: Tăng initialStock
  * Cập nhật trạng thái order
- Lưu products và orders vào LocalStorage
```

---

## 8. CÔNG NGHỆ SỬ DỤNG

### 8.1. Frontend
- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling, responsive design
- **JavaScript ES6+**: Logic xử lý, ES6 Modules

### 8.2. Thư viện bên ngoài
- **Font Awesome 6.0.0**: Icons
- **Google Fonts** (nếu có): Typography

### 8.3. Lưu trữ dữ liệu
- **LocalStorage**: Lưu trữ toàn bộ dữ liệu (sản phẩm, user, đơn hàng, giỏ hàng)

### 8.4. Kiến trúc
- **ES6 Modules**: Import/Export modules
- **Class-based OOP**: Class Product, User, ProductManager, etc.
- **MVC Pattern**: Tách biệt Model, View, Controller

### 8.5. Responsive Design
- **Mobile-first approach**: Thiết kế ưu tiên mobile
- **Flexbox & Grid**: Layout linh hoạt
- **Media Queries**: Responsive cho các kích thước màn hình

---

## 9. ĐIỂM MẠNH VÀ HẠN CHẾ

### 9.1. Điểm mạnh
1. **Không cần backend**: Dễ deploy, chạy offline
2. **Code rõ ràng**: Dễ đọc, dễ hiểu cho người mới
3. **Module hóa**: Dễ bảo trì, mở rộng
4. **Quản lý tồn kho thông minh**: Hỗ trợ cả sản phẩm có/không có biến thể
5. **Tính toán lợi nhuận tự động**: Tiện lợi cho việc định giá

### 9.2. Hạn chế
1. **LocalStorage giới hạn**: 5-10MB tùy trình duyệt
2. **Không mã hóa mật khẩu**: Chỉ phù hợp demo, không dùng production
3. **Không có backend**: Không thể chia sẻ dữ liệu giữa các máy
4. **Không có authentication thực sự**: Session dễ bị giả mạo
5. **Không có validation phía server**: Dễ bị bypass validation

---

## 10. HƯỚNG PHÁT TRIỂN

### 10.1. Ngắn hạn
- Thêm validation mạnh hơn
- Mã hóa mật khẩu (bcrypt.js)
- Thêm tính năng đánh giá sản phẩm
- Thêm tính năng yêu thích (wishlist)

### 10.2. Dài hạn
- Tích hợp backend (Node.js + Express + MongoDB)
- Tích hợp thanh toán online (VNPay, MoMo)
- Thêm tính năng chat với admin
- Thêm tính năng báo cáo doanh thu chi tiết
- PWA (Progressive Web App)

---

## 11. CÂU HỎI THƯỜNG GẶP

### Q1: Tại sao không sử dụng framework như React, Vue?
**A**: Dự án này nhằm mục đích học tập JavaScript thuần, hiểu rõ cơ bản trước khi học framework.

### Q2: Làm sao để reset dữ liệu về ban đầu?
**A**: Mở Developer Tools (F12) -> Console -> gõ `localStorage.clear()` -> Refresh trang.

### Q3: Tại sao giá vốn và giá bán lại quan trọng?
**A**: Giá vốn (cost price) là giá mua vào, giá bán (sale price) là giá bán ra. Chênh lệch giữa chúng là lợi nhuận. Quản lý tốt giá vốn và giá bán giúp kinh doanh có lãi.

### Q4: Biến thể (variants) là gì?
**A**: Biến thể là các phiên bản khác nhau của cùng một sản phẩm (ví dụ: cùng mẫu giày nhưng khác size). Mỗi biến thể có tồn kho riêng.

### Q5: Tại sao cần phân biệt session End User và Admin?
**A**: Để tránh conflict khi cùng một người vừa mua hàng vừa quản trị. End User dùng key `nguoiDungHienTai`, Admin dùng key `nguoiDungAdmin`.

---

## 12. KẾT LUẬN

Dự án ShoeStore là một ví dụ hoàn chỉnh về website bán hàng trực tuyến được xây dựng với JavaScript thuần. Dự án bao gồm đầy đủ các tính năng cần thiết cho cả người dùng và quản trị viên, từ duyệt sản phẩm, đặt hàng, đến quản lý tồn kho, giá bán, và đơn hàng.

Mặc dù còn một số hạn chế do không sử dụng backend, nhưng dự án vẫn đủ mạnh để làm đồ án học tập và demo. Cấu trúc code rõ ràng, module hóa, và áp dụng các best practices giúp người học dễ dàng hiểu và mở rộng.

**Chúc bạn học tốt và trình bày đồ án thành công! 🎉**
