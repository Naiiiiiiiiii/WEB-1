# ShoeStore - Website Bán Giày Trực Tuyến

## 📋 Mô Tả Dự Án

ShoeStore là một website bán giày nam trực tuyến được xây dựng bằng HTML, CSS và JavaScript thuần (Vanilla JS). Dự án bao gồm hai phần chính:

1. **Giao diện Khách hàng**: Duyệt sản phẩm, thêm vào giỏ hàng, đặt hàng
2. **Trang Quản Trị (Admin)**: Quản lý sản phẩm, đơn hàng, tồn kho, người dùng

## 🗂️ Cấu Trúc Dự Án

```
WEB-1/
├── index.html              # Trang chủ (giao diện khách hàng)
├── admin-index.html        # Trang quản trị (admin)
├── product-detail.html     # Trang chi tiết sản phẩm
├── profile.html            # Trang thông tin cá nhân
├── css/                    # Thư mục chứa file CSS
│   ├── style.css          # CSS chính cho trang chủ
│   ├── admin-*.css        # CSS cho các trang admin
│   ├── modal.css          # CSS cho modal popup
│   ├── cart-and-user-ui.css # CSS cho giỏ hàng và user UI
│   └── ...
├── js/                     # Thư mục chứa file JavaScript
│   ├── Product.js         # Class định nghĩa sản phẩm
│   ├── ProductManager.js  # Quản lý danh sách sản phẩm
│   ├── cart.js            # Logic giỏ hàng
│   ├── user.js            # Quản lý người dùng
│   ├── main.js            # File chính khởi tạo ứng dụng
│   ├── admin.js           # Logic trang admin
│   └── ...
└── img/                    # Thư mục chứa hình ảnh

```

## 🎯 Các Tính Năng Chính

### Giao Diện Khách Hàng
- ✅ Hiển thị danh sách sản phẩm với phân trang
- ✅ Lọc sản phẩm theo danh mục (Thể thao, Công sở, Casual)
- ✅ Sắp xếp sản phẩm theo giá, mới nhất, bán chạy
- ✅ Tìm kiếm sản phẩm theo tên
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng (với size và màu)
- ✅ Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
- ✅ Đặt hàng và thanh toán
- ✅ Xem lịch sử đơn hàng
- ✅ Đăng ký / Đăng nhập tài khoản

### Trang Quản Trị (Admin)
- ✅ Quản lý sản phẩm (thêm, sửa, xóa, ẩn/hiện)
- ✅ Quản lý đơn hàng (xem, cập nhật trạng thái)
- ✅ Quản lý tồn kho (nhập hàng, xem báo cáo)
- ✅ Quản lý người dùng (khóa/mở khóa tài khoản)
- ✅ Quản lý danh mục sản phẩm
- ✅ Thiết lập giá theo tỷ lệ lợi nhuận
- ✅ Xem thống kê doanh thu

## 📦 Các Class và Module Chính

### 1. Product.js
**Mục đích**: Định nghĩa cấu trúc của một sản phẩm

**Các thuộc tính chính**:
- `id`: ID duy nhất của sản phẩm
- `name`: Tên sản phẩm
- `categoryId`: ID danh mục
- `price`: Giá bán
- `oldPrice`: Giá cũ (để hiển thị giảm giá)
- `img`: Đường dẫn ảnh đại diện
- `variants`: Mảng các biến thể (size, màu, tồn kho)
- `rating`: Điểm đánh giá (0-5 sao)
- `description`: Mô tả chi tiết

**Các phương thức quan trọng**:
- `getCurrentStock()`: Lấy tổng tồn kho
- `isLowStock()`: Kiểm tra sắp hết hàng
- `getAvailableSizes()`: Lấy danh sách size còn hàng
- `getDiscountPercent()`: Tính % giảm giá
- `renderStars()`: Render HTML cho rating sao

### 2. ProductManager.js
**Mục đích**: Quản lý toàn bộ danh sách sản phẩm

**Các phương thức quan trọng**:
- `loadProducts()`: Tải sản phẩm từ localStorage
- `saveProducts()`: Lưu sản phẩm vào localStorage
- `getProductById(id)`: Lấy sản phẩm theo ID
- `getAllProducts()`: Lấy tất cả sản phẩm
- `addProduct(data)`: Thêm sản phẩm mới
- `updateProduct(id, data)`: Cập nhật sản phẩm
- `deleteProduct(id)`: Xóa sản phẩm
- `processProductImport()`: Xử lý nhập hàng
- `decreaseStock()`: Giảm tồn kho (khi bán)
- `advancedSearch()`: Tìm kiếm sản phẩm nâng cao

### 3. cart.js
**Mục đích**: Xử lý logic giỏ hàng

**Các hàm chính**:
- `getCart()`: Lấy giỏ hàng của user hiện tại
- `saveCart(cart)`: Lưu giỏ hàng vào localStorage
- `addToCart()`: Thêm sản phẩm vào giỏ
- `removeFromCart()`: Xóa sản phẩm khỏi giỏ
- `updateCartQuantity()`: Cập nhật số lượng
- `calculateCartTotal()`: Tính tổng tiền giỏ hàng
- `clearCart()`: Xóa toàn bộ giỏ hàng

**Lưu ý**: Mỗi user có giỏ hàng riêng, được lưu với key `cart_${username}`

### 4. user.js
**Mục đích**: Quản lý người dùng và xác thực

**Class User**:
- Lưu thông tin: Họ tên, username, email, mật khẩu
- Lưu lịch sử đơn hàng (`orders`)
- Trạng thái khóa tài khoản (`isLocked`)

**Class UserManager**:
- `taiDanhSachUser()`: Tải danh sách user từ localStorage
- `luuDanhSachUser()`: Lưu danh sách user
- `timTaiKhoan()`: Tìm và xác thực tài khoản
- `dangKy()`: Đăng ký tài khoản mới
- `capNhatUser()`: Cập nhật thông tin user
- `toggleLockUser()`: Khóa/mở khóa tài khoản

**Tài khoản mặc định**:
- Admin: username `admin`, password `Admin123`
- Test User: username `testuser`, password `123456`

### 5. main.js
**Mục đích**: File chính khởi tạo ứng dụng trang chủ

**Các chức năng**:
- Khởi tạo slider banner
- Xử lý sự kiện "Thêm vào giỏ"
- Kiểm tra đăng nhập (`kiemTraDangNhap()`)
- Xử lý đăng xuất (`xuLyDangXuat()`)
- Khởi tạo UI cho giỏ hàng và lịch sử đơn hàng
- Inject CSS động cho user section

## 💾 Lưu Trữ Dữ Liệu

Dự án sử dụng **localStorage** để lưu trữ dữ liệu:

| Key | Mô tả |
|-----|-------|
| `shoestore_products` | Danh sách tất cả sản phẩm |
| `users_shoestore` | Danh sách người dùng |
| `nguoiDungHienTai` | Thông tin user đang đăng nhập |
| `nguoiDungAdmin` | Thông tin admin đang đăng nhập |
| `cart_${username}` | Giỏ hàng của từng user |
| `orders_${username}` | Đơn hàng của từng user |
| `categories_shoestore` | Danh sách danh mục |

## 🚀 Cách Chạy Dự Án

1. **Clone repository**:
```bash
git clone https://github.com/Naiiiiiiiiii/WEB-1.git
cd WEB-1
```

2. **Mở bằng Live Server** (khuyến nghị):
   - Cài đặt extension "Live Server" trong VS Code
   - Click chuột phải vào `index.html` → "Open with Live Server"

3. **Hoặc mở trực tiếp**:
   - Mở file `index.html` trong trình duyệt

4. **Truy cập trang admin**:
   - Mở file `admin-index.html`
   - Đăng nhập với: username `admin`, password `Admin123`

## 🔐 Đăng Nhập

### Tài Khoản Admin
- **Username**: `admin`
- **Password**: `Admin123`

### Tài Khoản Test User
- **Username**: `testuser`
- **Password**: `123456`

## 📱 Responsive Design

Website được thiết kế responsive, hỗ trợ hiển thị tốt trên:
- 💻 Desktop (> 1024px)
- 📱 Tablet (768px - 1024px)
- 📱 Mobile (< 768px)

## 🛠️ Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và responsive design
- **Vanilla JavaScript (ES6+)**: Logic xử lý
- **LocalStorage API**: Lưu trữ dữ liệu
- **Font Awesome 6**: Icons
- **Google Fonts**: Typography

## 📝 Lưu Ý Khi Phát Triển

1. **Module ES6**: Các file JS sử dụng `type="module"` để import/export
2. **LocalStorage**: Dữ liệu chỉ lưu trên client, mất khi clear cache
3. **Security**: Mật khẩu lưu plain text (không hash), chỉ dùng cho demo
4. **Images**: Sử dụng Unsplash API cho ảnh sản phẩm mẫu

## 🐛 Debug và Console

Mở Developer Tools (F12) để xem:
- `console.log()`: Các thông báo debug
- `localStorage`: Xem dữ liệu đã lưu
- Network tab: Kiểm tra load resources

## 📚 Tài Liệu Tham Khảo

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript ES6 Guide](https://javascript.info/)
- [CSS Grid & Flexbox](https://css-tricks.com/)

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập.

---

**Phát triển bởi**: Nhóm ShoeStore
**Năm**: 2025