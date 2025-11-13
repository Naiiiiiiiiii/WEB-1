# 📖 HƯỚNG DẪN SỬ DỤNG WEBSITE SHOESTORE

## 🎯 Mục Lục
1. [Giới thiệu](#giới-thiệu)
2. [Cách chạy dự án](#cách-chạy-dự-án)
3. [Hướng dẫn cho Khách hàng](#hướng-dẫn-cho-khách-hàng)
4. [Hướng dẫn cho Admin](#hướng-dẫn-cho-admin)
5. [Giải thích Code chi tiết](#giải-thích-code-chi-tiết)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## 🎉 Giới thiệu

ShoeStore là website bán giày trực tuyến được xây dựng hoàn toàn bằng HTML, CSS và JavaScript thuần (không sử dụng framework). Website có hai phần chính:

### 🛍️ Phần Khách hàng (Customer)
- Xem và tìm kiếm sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Đặt hàng và thanh toán
- Xem lịch sử đơn hàng

### 👨‍💼 Phần Quản trị (Admin)
- Quản lý sản phẩm (thêm/sửa/xóa)
- Quản lý đơn hàng
- Quản lý tồn kho
- Quản lý người dùng

---

## 🚀 Cách Chạy Dự Án

### Phương pháp 1: Sử dụng Live Server (Khuyến nghị)

1. Mở VS Code
2. Cài đặt extension "Live Server" (by Ritwick Dey)
3. Mở thư mục dự án trong VS Code
4. Click chuột phải vào file `index.html`
5. Chọn "Open with Live Server"
6. Website sẽ tự động mở trên trình duyệt tại `http://127.0.0.1:5500`

### Phương pháp 2: Mở trực tiếp

1. Mở thư mục dự án
2. Double click vào file `index.html`
3. File sẽ mở bằng trình duyệt mặc định

**Lưu ý**: Một số tính năng có thể không hoạt động khi mở trực tiếp do CORS policy. Khuyến nghị dùng Live Server.

---

## 🛍️ Hướng Dẫn cho Khách hàng

### 1. Đăng ký tài khoản

**Bước 1**: Click vào icon 👤 (User) ở góc phải header

**Bước 2**: Trong modal đăng nhập, click "Đăng ký ngay"

**Bước 3**: Điền thông tin:
- Họ tên: VD: "Nguyễn Văn A"
- Username: VD: "nguyenvana" (không trùng với user khác)
- Email: VD: "nguyenvana@gmail.com"
- Mật khẩu: VD: "123456"

**Bước 4**: Click "Đăng ký"

✅ **Kết quả**: Tài khoản được tạo và tự động đăng nhập

### 2. Đăng nhập

**Cách 1 - Sử dụng tài khoản demo**:
- Username: `testuser`
- Password: `123456`

**Cách 2 - Đăng nhập bằng tài khoản mới tạo**:
- Nhập username hoặc email
- Nhập password
- Click "Đăng nhập"

### 3. Duyệt sản phẩm

#### Xem tất cả sản phẩm
- Kéo xuống phần "Sản phẩm nổi bật"
- Sản phẩm hiển thị dưới dạng grid (lưới)

#### Lọc theo danh mục
- Click vào các nút: "Tất cả", "Thể thao", "Công sở", "Casual"
- Sản phẩm sẽ được lọc theo danh mục đã chọn

#### Sắp xếp sản phẩm
- Click vào dropdown "Sắp xếp theo"
- Chọn:
  - **Giá tăng dần**: Sản phẩm rẻ hiển thị trước
  - **Giá giảm dần**: Sản phẩm đắt hiển thị trước
  - **Mới nhất**: Sản phẩm mới thêm vào hiển thị trước
  - **Bán chạy**: Sản phẩm bán chạy hiển thị trước

#### Tìm kiếm sản phẩm
- Click vào icon 🔍 (Search) ở header
- Nhập tên sản phẩm cần tìm (VD: "Nike", "Adidas")
- Kết quả tìm kiếm hiển thị ngay lập tức

### 4. Xem chi tiết sản phẩm

**Bước 1**: Click vào card sản phẩm hoặc nút "Xem nhanh"

**Bước 2**: Modal Quick View hiển thị:
- Ảnh sản phẩm
- Tên sản phẩm
- Giá (có thể có giá cũ nếu đang sale)
- Rating (đánh giá sao)
- Nút "Thêm vào giỏ"

**Bước 3**: Click "Xem chi tiết" để đến trang chi tiết đầy đủ

### 5. Thêm sản phẩm vào giỏ hàng

#### Cách 1: Thêm nhanh từ trang chủ
- Click nút "Thêm vào giỏ" trên card sản phẩm
- Size mặc định: "Chưa chọn"
- Số lượng: 1

#### Cách 2: Thêm từ trang chi tiết (Product Detail)
- Vào trang chi tiết sản phẩm
- Chọn size (VD: 39, 40, 41, 42)
- Chọn màu (nếu có)
- Chọn số lượng
- Click "THÊM VÀO GIỎ HÀNG"

✅ **Kết quả**: 
- Hiển thị thông báo "Đã thêm vào giỏ hàng"
- Modal giỏ hàng tự động mở
- Badge số lượng trên icon giỏ hàng tăng lên

### 6. Quản lý giỏ hàng

#### Mở giỏ hàng
- Click vào icon 🛒 (Shopping Cart) ở header

#### Trong giỏ hàng, bạn có thể:

**Tăng/giảm số lượng**:
- Click nút "-" để giảm
- Click nút "+" để tăng
- Giá tự động cập nhật

**Xóa sản phẩm**:
- Click nút "Xóa" bên cạnh sản phẩm

**Xóa toàn bộ giỏ hàng**:
- Click "XÓA TOÀN BỘ GIỎ HÀNG"
- Confirm trong popup

**Xem tổng tiền**:
- Tổng tiền hiển thị ở cuối giỏ hàng
- Format: 1.000.000₫

### 7. Đặt hàng

**Bước 1**: Trong giỏ hàng, click "TIẾN HÀNH THANH TOÁN"

**Bước 2**: Modal Checkout hiển thị, điền thông tin:
- **Họ tên**: Tên người nhận hàng
- **Số điện thoại**: Số liên hệ (10 số)
- **Địa chỉ**: Địa chỉ giao hàng đầy đủ
- **Ghi chú**: Lưu ý cho người giao hàng (không bắt buộc)

**Bước 3**: Chọn phương thức thanh toán:
- ☑️ COD (Thanh toán khi nhận hàng)
- ☑️ Chuyển khoản
- ☑️ Ví điện tử

**Bước 4**: Click "ĐẶT HÀNG"

✅ **Kết quả**:
- Hiển thị thông báo "Đơn hàng đã được tạo thành công!"
- Giỏ hàng được xóa sạch
- Đơn hàng được lưu vào lịch sử

### 8. Xem lịch sử đơn hàng

**Bước 1**: Click icon 📜 (History) ở header

**Bước 2**: Modal lịch sử đơn hàng hiển thị danh sách đơn:

**Thông tin mỗi đơn hàng**:
- Mã đơn hàng (VD: ORD-2025-001)
- Ngày đặt hàng
- Trạng thái:
  - 🆕 **Mới**: Đơn hàng vừa tạo
  - ⏳ **Đang xử lý**: Đang chuẩn bị hàng
  - 🚚 **Đang giao**: Đang trên đường giao
  - ✅ **Đã giao**: Giao hàng thành công
  - ❌ **Đã hủy**: Đơn hàng bị hủy
- Danh sách sản phẩm
- Tổng tiền

### 9. Đăng xuất

**Cách 1**: Click nút "Đăng xuất" ở header

**Cách 2**: Click vào tên user → Chọn "Đăng xuất"

---

## 👨‍💼 Hướng Dẫn cho Admin

### 1. Đăng nhập Admin

**Bước 1**: Mở file `admin-index.html` trong trình duyệt

**Bước 2**: Đăng nhập với tài khoản admin:
- Username: `admin`
- Password: `Admin123`

### 2. Trang chủ Admin (Dashboard)

Sau khi đăng nhập, bạn sẽ thấy:
- **Tổng quan**: Số lượng sản phẩm, đơn hàng, người dùng
- **Menu bên trái**: Các chức năng quản lý
- **Biểu đồ**: Thống kê doanh thu

### 3. Quản lý Sản phẩm

#### Xem danh sách sản phẩm
- Click "Quản lý sản phẩm" trong menu
- Bảng hiển thị: ID, Ảnh, Tên, Danh mục, Giá, Tồn kho, Trạng thái

#### Thêm sản phẩm mới
**Bước 1**: Click nút "Thêm sản phẩm mới"

**Bước 2**: Điền thông tin:
- Tên sản phẩm
- Danh mục
- Giá bán
- Giá vốn
- URL ảnh
- Mô tả
- Thêm variants (size + số lượng)

**Bước 3**: Click "Lưu sản phẩm"

#### Sửa sản phẩm
**Bước 1**: Click nút "Sửa" trên dòng sản phẩm

**Bước 2**: Cập nhật thông tin trong form

**Bước 3**: Click "Lưu"

#### Xóa sản phẩm
**Bước 1**: Click nút "Xóa" trên dòng sản phẩm

**Bước 2**: Confirm trong popup

⚠️ **Cảnh báo**: Sản phẩm sẽ bị xóa vĩnh viễn!

#### Ẩn/Hiện sản phẩm
- Click toggle switch "Ẩn/Hiện"
- Sản phẩm bị ẩn sẽ không hiển thị cho khách hàng

### 4. Quản lý Đơn hàng

#### Xem danh sách đơn hàng
- Click "Quản lý đơn hàng" trong menu
- Bảng hiển thị: Mã đơn, Khách hàng, Ngày đặt, Tổng tiền, Trạng thái

#### Xem chi tiết đơn hàng
- Click vào mã đơn hàng
- Hiển thị: Thông tin khách hàng, danh sách sản phẩm, địa chỉ giao hàng

#### Cập nhật trạng thái đơn hàng
**Bước 1**: Click dropdown "Trạng thái"

**Bước 2**: Chọn trạng thái mới:
- Đang xử lý
- Đang giao hàng
- Đã giao hàng
- Đã hủy

**Bước 3**: Trạng thái tự động lưu và cập nhật cho khách hàng

### 5. Quản lý Tồn kho

#### Xem báo cáo tồn kho
- Click "Quản lý tồn kho" trong menu
- Bảng hiển thị: Tên sản phẩm, Tồn kho hiện tại, Đã bán, Cảnh báo

#### Nhập hàng
**Bước 1**: Click nút "Nhập hàng" trên dòng sản phẩm

**Bước 2**: Điền thông tin:
- Số lượng nhập
- Giá nhập
- Size (nếu có variants)
- Ghi chú

**Bước 3**: Click "Nhập hàng"

✅ **Kết quả**: Tồn kho được cập nhật

#### Cảnh báo hết hàng
- Sản phẩm có tồn kho ≤ 5 sẽ hiển thị cảnh báo màu đỏ
- Admin cần nhập hàng kịp thời

### 6. Quản lý Người dùng

#### Xem danh sách người dùng
- Click "Quản lý người dùng" trong menu
- Bảng hiển thị: Username, Họ tên, Email, Số đơn hàng, Trạng thái

#### Khóa/Mở khóa tài khoản
**Bước 1**: Click nút "Khóa" hoặc "Mở khóa"

**Bước 2**: Confirm trong popup

✅ **Kết quả**: Người dùng bị khóa không thể đăng nhập

### 7. Quản lý Danh mục

#### Xem danh sách danh mục
- Click "Quản lý danh mục" trong menu

#### Thêm danh mục mới
**Bước 1**: Click "Thêm danh mục"

**Bước 2**: Nhập tên danh mục

**Bước 3**: Click "Lưu"

#### Sửa/Xóa danh mục
- Click nút "Sửa" hoặc "Xóa" tương ứng

### 8. Thiết lập Giá theo Lợi nhuận

#### Tính giá bán tự động
**Bước 1**: Vào "Quản lý giá"

**Bước 2**: Nhập:
- Giá vốn
- Tỷ lệ lợi nhuận mong muốn (VD: 30%)

**Bước 3**: Click "Tính giá bán"

✅ **Công thức**: Giá bán = Giá vốn / (1 - Tỷ lệ lợi nhuận)

---

## 💻 Giải Thích Code Chi Tiết

### 1. Cấu trúc File JavaScript

#### Product.js
```javascript
class Product {
  constructor(data) {
    this.id = data.id;           // ID sản phẩm
    this.name = data.name;       // Tên sản phẩm
    this.price = data.price;     // Giá bán
    this.variants = data.variants; // Biến thể (size, màu)
    // ...
  }
  
  // Phương thức: Lấy tồn kho hiện tại
  getCurrentStock() {
    // Nếu có variants, tính tổng stock của tất cả variants
    if (this.variants && this.variants.length > 0) {
      return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return this.initialStock || 0;
  }
}
```

**Giải thích**:
- `class Product`: Định nghĩa class sản phẩm
- `constructor`: Khởi tạo object với dữ liệu
- `getCurrentStock()`: Tính tổng tồn kho từ các variants

#### ProductManager.js
```javascript
class ProductManager {
  constructor() {
    this.STORAGE_KEY = 'shoestore_products';
    this.products = this.loadProducts();
  }
  
  // Tải sản phẩm từ localStorage
  loadProducts() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      return JSON.parse(data).map(p => Product.fromJSON(p));
    }
    return productDataList.map(data => new Product(data));
  }
  
  // Lưu sản phẩm vào localStorage
  saveProducts() {
    const productsData = this.products.map(p => p.toJSON());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
  }
}
```

**Giải thích**:
- `loadProducts()`: Đọc dữ liệu từ localStorage, nếu không có thì dùng dữ liệu mẫu
- `saveProducts()`: Convert objects thành JSON và lưu vào localStorage

### 2. Cách hoạt động của LocalStorage

```javascript
// Lưu dữ liệu
localStorage.setItem('key', 'value');

// Đọc dữ liệu
const value = localStorage.getItem('key');

// Xóa dữ liệu
localStorage.removeItem('key');

// Xóa tất cả
localStorage.clear();
```

**Lưu Object vào localStorage**:
```javascript
const user = { name: 'John', age: 25 };

// Lưu: Convert object → JSON string
localStorage.setItem('user', JSON.stringify(user));

// Đọc: Parse JSON string → object
const savedUser = JSON.parse(localStorage.getItem('user'));
```

### 3. Cách hoạt động của Giỏ hàng

```javascript
// 1. Lấy username người dùng hiện tại
const username = getCurrentUsername();

// 2. Tạo key riêng cho giỏ hàng của user
const cartKey = `cart_${username}`; // VD: "cart_admin"

// 3. Đọc giỏ hàng từ localStorage
const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

// 4. Thêm sản phẩm vào giỏ
cart.push({
  id: productId,
  name: productName,
  price: price,
  quantity: 1,
  size: 'Chưa chọn'
});

// 5. Lưu lại vào localStorage
localStorage.setItem(cartKey, JSON.stringify(cart));
```

### 4. Luồng đặt hàng

```
1. Khách hàng thêm sản phẩm vào giỏ
   ↓
2. Giỏ hàng lưu vào localStorage với key: cart_username
   ↓
3. Click "Thanh toán" → Mở Checkout Modal
   ↓
4. Điền thông tin giao hàng
   ↓
5. Click "Đặt hàng"
   ↓
6. Tạo đơn hàng với status = "new"
   ↓
7. Lưu vào localStorage với key: orders_username
   ↓
8. Giảm tồn kho sản phẩm (decreaseStock)
   ↓
9. Xóa giỏ hàng
   ↓
10. Hiển thị thông báo thành công
```

### 5. Cách Admin cập nhật trạng thái đơn hàng

```javascript
// 1. Admin chọn trạng thái mới
const newStatus = 'processing'; // hoặc 'shipping', 'delivered'

// 2. Tìm đơn hàng theo ID
const order = orders.find(o => o.id === orderId);

// 3. Cập nhật trạng thái
order.status = newStatus;

// 4. Lưu lại vào localStorage
localStorage.setItem(`orders_${username}`, JSON.stringify(orders));

// 5. Customer có thể xem trạng thái mới khi vào "Lịch sử đơn hàng"
```

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

### 1. Tại sao tôi không thể đăng nhập?

**Trả lời**: 
- Kiểm tra username/password có đúng không
- Username phân biệt hoa thường
- Nếu quên password, không có chức năng "Quên mật khẩu", bạn cần tạo tài khoản mới hoặc xóa localStorage

**Cách xóa localStorage**:
```
1. Mở DevTools (F12)
2. Vào tab "Application" (Chrome) hoặc "Storage" (Firefox)
3. Click "Local Storage" → Chọn domain
4. Click "Clear All"
```

### 2. Giỏ hàng của tôi bị mất sau khi tắt trình duyệt?

**Trả lời**: 
- Giỏ hàng được lưu trong localStorage nên không bị mất
- Nếu bị mất, có thể do:
  - Bạn đã clear cache/cookies
  - Trình duyệt ở chế độ Incognito/Private
  - Bạn đã đăng xuất và đăng nhập bằng tài khoản khác

### 3. Làm sao để xem dữ liệu trong localStorage?

**Cách 1 - Qua DevTools**:
```
1. F12 → Tab "Application" → "Local Storage"
2. Xem tất cả key-value pairs
```

**Cách 2 - Qua Console**:
```javascript
// Xem tất cả sản phẩm
console.log(JSON.parse(localStorage.getItem('shoestore_products')));

// Xem giỏ hàng của admin
console.log(JSON.parse(localStorage.getItem('cart_admin')));

// Xem tất cả users
console.log(JSON.parse(localStorage.getItem('users_shoestore')));
```

### 4. Tại sao tôi không thể thêm sản phẩm vào giỏ?

**Nguyên nhân có thể là**:
- Bạn chưa đăng nhập → Đăng nhập trước
- Sản phẩm hết hàng → Chọn sản phẩm khác
- Lỗi JavaScript → Mở Console (F12) xem lỗi

### 5. Admin có thể xem đơn hàng của tất cả khách hàng không?

**Trả lời**: 
- Hiện tại, admin xem được đơn hàng của riêng mình
- Để xem tất cả đơn hàng, cần:
  1. Vào Console (F12)
  2. Chạy code:
```javascript
// Lấy tất cả users
const users = JSON.parse(localStorage.getItem('users_shoestore'));

// Duyệt qua từng user và xem đơn hàng
users.forEach(user => {
  console.log(`Orders of ${user.tenDangNhap}:`, user.orders);
});
```

### 6. Làm sao để reset toàn bộ dữ liệu về mặc định?

**Cách 1 - Xóa localStorage**:
```
F12 → Application → Local Storage → Clear All
```

**Cách 2 - Chạy code trong Console**:
```javascript
localStorage.clear();
location.reload();
```

### 7. Tại sao giá sản phẩm hiển thị sai format?

**Trả lời**: 
- JavaScript sử dụng `toLocaleString('vi-VN')` để format giá
- Format: 1.000.000 (dấu chấm ngăn cách hàng nghìn)
- Nếu hiển thị sai, kiểm tra locale của trình duyệt

### 8. Làm sao để thay đổi số sản phẩm hiển thị mỗi trang?

**Trả lời**: 
- Mở file `renderProducts.js`
- Tìm dòng: `const ITEMS_PER_PAGE = 6;`
- Đổi 6 thành số bạn muốn (VD: 12)
- Save và reload trang

### 9. Tôi có thể sử dụng database thật thay vì localStorage không?

**Trả lời**: 
- Có, bạn cần:
  1. Tạo Backend API (Node.js, PHP, Python...)
  2. Tạo Database (MySQL, MongoDB...)
  3. Thay đổi các hàm `loadProducts`, `saveProducts` để gọi API thay vì localStorage

### 10. Source code có thể deploy lên hosting không?

**Trả lời**: 
- Có! Vì chỉ dùng HTML/CSS/JS thuần
- Deploy lên:
  - GitHub Pages (free)
  - Netlify (free)
  - Vercel (free)
  - Firebase Hosting (free)

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu bạn có thêm câu hỏi hoặc gặp vấn đề, vui lòng:
- Mở Issue trên GitHub
- Email: support@shoestore.com
- Facebook: facebook.com/shoestore

---

**Cập nhật lần cuối**: 2025-01-13
**Phiên bản**: 1.0
