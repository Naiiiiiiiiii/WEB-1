# Tài Liệu Chi Tiết: Các Phương Thức Kiểm Tra và Định Dạng

## Mục Lục
1. [Các Hàm Định Dạng (Formatting Functions)](#1-các-hàm-định-dạng-formatting-functions)
2. [Các Hàm Kiểm Tra và Xác Thực (Validation Functions)](#2-các-hàm-kiểm-tra-và-xác-thực-validation-functions)
3. [Các Pattern và Regex Validation](#3-các-pattern-và-regex-validation)
4. [Các Hàm Tiện Ích (Utility Functions)](#4-các-hàm-tiện-ích-utility-functions)

---

## 1. Các Hàm Định Dạng (Formatting Functions)

### 1.1. `formatCurrency(amount)` - Định dạng tiền tệ

**Vị trí**: `js/cart-ui.js`, `js/checkout-ui.js`

**Mục đích**: Định dạng số tiền thành chuỗi tiền tệ Việt Nam (VND)

**Cú pháp**:
```javascript
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}
```

**Tham số**:
- `amount` (Number): Số tiền cần định dạng

**Giá trị trả về**: 
- String: Chuỗi tiền tệ đã được định dạng (ví dụ: "1.500.000 ₫")

**Cách hoạt động**:
1. Sử dụng `Intl.NumberFormat` - API chuẩn quốc tế của JavaScript
2. Tham số `'vi-VN'` chỉ định định dạng theo chuẩn Việt Nam
3. Options object `{ style: 'currency', currency: 'VND' }` xác định:
   - `style: 'currency'`: Định dạng theo kiểu tiền tệ
   - `currency: 'VND'`: Sử dụng đơn vị tiền Việt Nam Đồng

**Ví dụ sử dụng**:
```javascript
formatCurrency(1500000);  // Kết quả: "1.500.000 ₫"
formatCurrency(250000);   // Kết quả: "250.000 ₫"
formatCurrency(0);        // Kết quả: "0 ₫"
```

**Ứng dụng trong dự án**:
- Hiển thị giá sản phẩm trong giỏ hàng
- Hiển thị tổng tiền thanh toán
- Hiển thị giá trong trang chi tiết sản phẩm

---

### 1.2. `formatTien(amount)` - Định dạng tiền tệ đơn giản

**Vị trí**: `js/profile.js`

**Mục đích**: Định dạng số tiền với dấu phân cách hàng nghìn và ký hiệu ₫

**Cú pháp**:
```javascript
function formatTien(amount) {
    return amount.toLocaleString('vi-VN') + '₫';
}
```

**Tham số**:
- `amount` (Number): Số tiền cần định dạng

**Giá trị trả về**: 
- String: Chuỗi số tiền với dấu phân cách hàng nghìn (ví dụ: "1.500.000₫")

**Cách hoạt động**:
1. Sử dụng phương thức `toLocaleString('vi-VN')` để thêm dấu phân cách hàng nghìn
2. Nối thêm ký hiệu "₫" vào cuối chuỗi

**Ví dụ sử dụng**:
```javascript
formatTien(1500000);  // Kết quả: "1.500.000₫"
formatTien(99000);    // Kết quả: "99.000₫"
```

**So sánh với `formatCurrency`**:
- `formatCurrency`: Sử dụng `Intl.NumberFormat` (chuẩn hơn), có khoảng trắng trước ₫
- `formatTien`: Sử dụng `toLocaleString` (đơn giản hơn), không có khoảng trắng trước ₫

---

### 1.3. `formatThoiGian(date)` - Định dạng ngày giờ

**Vị trí**: `js/profile.js`

**Mục đích**: Định dạng đối tượng Date thành chuỗi ngày giờ theo định dạng Việt Nam

**Cú pháp**:
```javascript
function formatThoiGian(date) {
    const ngay = date.getDate().toString().padStart(2, '0');
    const thang = (date.getMonth() + 1).toString().padStart(2, '0');
    const nam = date.getFullYear();
    const gio = date.getHours().toString().padStart(2, '0');
    const phut = date.getMinutes().toString().padStart(2, '0');
    
    return `${ngay}/${thang}/${nam} lúc ${gio}:${phut}`;
}
```

**Tham số**:
- `date` (Date): Đối tượng Date cần định dạng

**Giá trị trả về**: 
- String: Chuỗi ngày giờ đã định dạng (ví dụ: "07/11/2025 lúc 14:30")

**Cách hoạt động từng bước**:

1. **Lấy ngày**: 
   - `date.getDate()` trả về ngày trong tháng (1-31)
   - `toString()` chuyển thành chuỗi
   - `padStart(2, '0')` đảm bảo luôn có 2 chữ số (ví dụ: "01", "15")

2. **Lấy tháng**:
   - `date.getMonth()` trả về tháng từ 0-11
   - Cộng thêm 1 để có tháng từ 1-12
   - `padStart(2, '0')` đảm bảo 2 chữ số

3. **Lấy năm**:
   - `date.getFullYear()` trả về năm đầy đủ (ví dụ: 2025)

4. **Lấy giờ và phút**:
   - Tương tự với ngày, tháng
   - `padStart(2, '0')` đảm bảo định dạng 2 chữ số

5. **Ghép chuỗi**:
   - Sử dụng template literal để tạo định dạng: `dd/mm/yyyy lúc hh:mm`

**Ví dụ sử dụng**:
```javascript
const now = new Date('2025-11-07T14:30:00');
formatThoiGian(now);  // Kết quả: "07/11/2025 lúc 14:30"

const midnight = new Date('2025-01-01T00:05:00');
formatThoiGian(midnight);  // Kết quả: "01/01/2025 lúc 00:05"
```

---

### 1.4. `formatDate(isoString)` - Định dạng chuỗi ISO date

**Vị trí**: `js/order-history-ui.js`

**Mục đích**: Chuyển đổi chuỗi ISO date thành định dạng dễ đọc

**Cú pháp**:
```javascript
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN');
}
```

**Tham số**:
- `isoString` (String): Chuỗi ngày theo định dạng ISO 8601

**Giá trị trả về**: 
- String: Chuỗi ngày đã định dạng theo locale Việt Nam

**Ví dụ sử dụng**:
```javascript
formatDate('2025-11-07T14:30:00.000Z');  // Kết quả: "07/11/2025"
```

---

### 1.5. `formatTrangThai(status)` - Định dạng trạng thái đơn hàng

**Vị trí**: `js/profile.js`

**Mục đích**: Chuyển đổi mã trạng thái đơn hàng sang tiếng Việt

**Cú pháp**:
```javascript
function formatTrangThai(status) {
    switch (status) {
        case 'new': return 'Mới đặt';
        case 'processing': return 'Đang xử lý';
        case 'shipped': return 'Đang vận chuyển';
        case 'delivered': return 'Đã giao';
        case 'canceled': return 'Đã hủy';
        default: return 'Không rõ';
    }
}
```

**Tham số**:
- `status` (String): Mã trạng thái đơn hàng

**Giá trị trả về**: 
- String: Tên trạng thái bằng tiếng Việt

**Các trạng thái được hỗ trợ**:
1. `'new'` → "Mới đặt" - Đơn hàng vừa được tạo
2. `'processing'` → "Đang xử lý" - Đang chuẩn bị hàng
3. `'shipped'` → "Đang vận chuyển" - Đã giao cho đơn vị vận chuyển
4. `'delivered'` → "Đã giao" - Đã giao thành công
5. `'canceled'` → "Đã hủy" - Đơn hàng bị hủy
6. Giá trị khác → "Không rõ" - Trạng thái không xác định

**Ví dụ sử dụng**:
```javascript
formatTrangThai('new');        // Kết quả: "Mới đặt"
formatTrangThai('delivered');  // Kết quả: "Đã giao"
formatTrangThai('unknown');    // Kết quả: "Không rõ"
```

---

### 1.6. Định dạng giá sản phẩm với `Intl.NumberFormat`

**Vị trí**: `js/product-detail-logic.js`

**Mục đích**: Định dạng giá sản phẩm trong trang chi tiết

**Cú pháp**:
```javascript
priceEl.textContent = new Intl.NumberFormat('vi-VN').format(finalPrice) + '₫';
```

**Cách hoạt động**:
1. `new Intl.NumberFormat('vi-VN')` tạo formatter cho locale Việt Nam
2. `.format(finalPrice)` định dạng số với dấu phân cách hàng nghìn
3. Nối thêm ký hiệu "₫"

**Ví dụ**:
```javascript
new Intl.NumberFormat('vi-VN').format(1500000) + '₫';  // "1.500.000₫"
```

---

## 2. Các Hàm Kiểm Tra và Xác Thực (Validation Functions)

### 2.1. `validateProductData(data)` - Kiểm tra dữ liệu sản phẩm

**Vị trí**: `js/product-admin.js`

**Mục đích**: Xác thực tính hợp lệ của dữ liệu sản phẩm trước khi thêm/cập nhật

**Cú pháp**:
```javascript
function validateProductData(data) {
    // Kiểm tra tên sản phẩm
    if (!data.name) {
        showNotification('⚠️ Vui lòng nhập tên sản phẩm!', 'error');
        document.getElementById('modalProductName')?.focus();
        return false;
    }
    
    if (data.name.length < 3) {
        showNotification('⚠️ Tên sản phẩm phải có ít nhất 3 ký tự!', 'error');
        document.getElementById('modalProductName')?.focus();
        return false;
    }
    
    // Kiểm tra danh mục
    if (!data.categoryId) {
        showNotification('⚠️ Vui lòng chọn danh mục!', 'error');
        document.getElementById('modalProductCategory')?.focus();
        return false;
    }
    
    // Kiểm tra giá
    if (isNaN(data.price) || data.price <= 0) {
        showNotification('⚠️ Giá sản phẩm phải lớn hơn 0!', 'error');
        document.getElementById('modalProductPrice')?.focus();
        return false;
    }
    
    // Kiểm tra mô tả
    if (!data.description) {
        showNotification('⚠️ Vui lòng nhập mô tả sản phẩm!', 'error');
        document.getElementById('modalProductDescription')?.focus();
        return false;
    }
    
    // Kiểm tra hình ảnh
    if (!data.img) { 
        showNotification('⚠️ Vui lòng nhập URL hình ảnh!', 'error');
        document.getElementById('modalProductImage')?.focus();
        return false;
    }
    
    return true;
}
```

**Tham số**:
- `data` (Object): Đối tượng chứa thông tin sản phẩm
  - `name`: Tên sản phẩm
  - `categoryId`: ID danh mục
  - `price`: Giá sản phẩm
  - `description`: Mô tả sản phẩm
  - `img`: URL hình ảnh

**Giá trị trả về**: 
- `true`: Nếu tất cả dữ liệu hợp lệ
- `false`: Nếu có dữ liệu không hợp lệ

**Các điều kiện kiểm tra**:

1. **Kiểm tra tên sản phẩm (name)**:
   - Không được để trống
   - Phải có ít nhất 3 ký tự
   - Focus vào trường input nếu lỗi

2. **Kiểm tra danh mục (categoryId)**:
   - Phải được chọn (không được null/undefined)

3. **Kiểm tra giá (price)**:
   - Phải là số hợp lệ (`!isNaN(data.price)`)
   - Phải lớn hơn 0 (`data.price > 0`)

4. **Kiểm tra mô tả (description)**:
   - Không được để trống

5. **Kiểm tra hình ảnh (img)**:
   - Phải có URL hình ảnh

**Tính năng bổ sung**:
- Hiển thị thông báo lỗi cụ thể cho từng trường
- Tự động focus vào trường có lỗi
- Sử dụng Optional Chaining (`?.`) để tránh lỗi khi element không tồn tại

**Ví dụ sử dụng**:
```javascript
const productData = {
    name: 'Giày Thể Thao',
    categoryId: 1,
    price: 500000,
    description: 'Giày thể thao cao cấp',
    img: 'https://example.com/shoe.jpg'
};

if (validateProductData(productData)) {
    // Thêm sản phẩm
    console.log('Dữ liệu hợp lệ!');
} else {
    console.log('Dữ liệu không hợp lệ!');
}
```

---

### 2.2. Kiểm tra đăng ký người dùng - `xuLyDangKy(e)`

**Vị trí**: `js/login-modal.js`

**Mục đích**: Xác thực thông tin đăng ký người dùng mới

**Các kiểm tra được thực hiện**:

#### 2.2.1. Kiểm tra họ tên
```javascript
if (!hoTen) {
    hienLoi('loiHoTenDangKy', 'Vui lòng nhập họ tên');
    hopLe = false;
}
```
- **Điều kiện**: Không được để trống
- **Lỗi hiển thị**: "Vui lòng nhập họ tên"

#### 2.2.2. Kiểm tra tên đăng nhập
```javascript
if (!tenDangKy || tenDangKy.length < 3) {
    hienLoi('loiTenDangKy', 'Tên đăng nhập phải có ít nhất 3 ký tự');
    hopLe = false;
}
```
- **Điều kiện**: 
  - Không được để trống
  - Phải có ít nhất 3 ký tự
- **Lỗi hiển thị**: "Tên đăng nhập phải có ít nhất 3 ký tự"

#### 2.2.3. Kiểm tra tên đăng nhập đã tồn tại
```javascript
if (userManager.tonTaiTenDangNhap(tenDangKy)) {
    hienLoi('loiTenDangKy', 'Tên đăng nhập đã được sử dụng');
    hopLe = false;
}
```
- **Điều kiện**: Tên đăng nhập chưa được sử dụng trong hệ thống
- **Phương thức sử dụng**: `userManager.tonTaiTenDangNhap()`
- **Lỗi hiển thị**: "Tên đăng nhập đã được sử dụng"

#### 2.2.4. Kiểm tra email với Regex
```javascript
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!email || !regexEmail.test(email)) {
    hienLoi('loiEmailDangKy', 'Vui lòng nhập email hợp lệ');
    hopLe = false;
}
```
- **Regex pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Giải thích pattern**:
  - `^` - Bắt đầu chuỗi
  - `[^\s@]+` - Một hoặc nhiều ký tự không phải khoảng trắng hoặc @
  - `@` - Ký tự @
  - `[^\s@]+` - Một hoặc nhiều ký tự không phải khoảng trắng hoặc @
  - `\.` - Ký tự dấu chấm (escaped)
  - `[^\s@]+` - Một hoặc nhiều ký tự không phải khoảng trắng hoặc @
  - `$` - Kết thúc chuỗi

**Ví dụ email hợp lệ**:
- `user@example.com` ✓
- `test.user@domain.co.vn` ✓
- `admin@shoestore.com` ✓

**Ví dụ email không hợp lệ**:
- `user@` ✗ (thiếu domain)
- `@example.com` ✗ (thiếu username)
- `user @example.com` ✗ (có khoảng trắng)
- `user.example.com` ✗ (thiếu @)

#### 2.2.5. Kiểm tra email đã tồn tại
```javascript
if (userManager.tonTaiEmail(email)) {
    hienLoi('loiEmailDangKy', 'Email đã được sử dụng');
    hopLe = false;
}
```
- **Điều kiện**: Email chưa được đăng ký trong hệ thống
- **Phương thức sử dụng**: `userManager.tonTaiEmail()`

#### 2.2.6. Kiểm tra mật khẩu
```javascript
if (!matKhau || matKhau.length < 6) {
    hienLoi('loiMatKhauDangKy', 'Mật khẩu phải có ít nhất 6 ký tự');
    hopLe = false;
}
```
- **Điều kiện**: 
  - Không được để trống
  - Phải có ít nhất 6 ký tự
- **Lý do chọn 6 ký tự**: Cân bằng giữa bảo mật và trải nghiệm người dùng

#### 2.2.7. Kiểm tra xác nhận mật khẩu
```javascript
if (matKhau && matKhau !== xacNhan) {
    hienLoi('loiXacNhanMatKhau', 'Mật khẩu xác nhận không khớp');
    hopLe = false;
}
```
- **Điều kiện**: Mật khẩu xác nhận phải giống mật khẩu đã nhập
- **So sánh**: Sử dụng toán tử `!==` (strict inequality)

---

### 2.3. Kiểm tra đăng nhập - `xuLyDangNhap(e)`

**Vị trí**: `js/login-modal.js`

**Mục đích**: Xác thực thông tin đăng nhập

**Các kiểm tra cơ bản**:

```javascript
function xuLyDangNhap(e) {
    e.preventDefault();
    
    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const matKhau = document.getElementById('matKhau').value;
    
    let hopLe = true;
    
    // Kiểm tra tên đăng nhập
    if (!tenDangNhap) {
        hienLoi('loiTenDangNhap', 'Vui lòng nhập tên đăng nhập hoặc email');
        hopLe = false;
    }
    
    // Kiểm tra mật khẩu
    if (!matKhau) {
        hienLoi('loiMatKhau', 'Vui lòng nhập mật khẩu');
        hopLe = false;
    }
    
    if (hopLe) {
        // Xác thực với database
        const user = userManager.timTaiKhoan(tenDangNhap, matKhau);
        
        if (user) {
            // Đăng nhập thành công
        } else {
            hienLoi('loiMatKhau', 'Tên đăng nhập, email hoặc mật khẩu không chính xác.');
        }
    }
}
```

**Điểm đặc biệt**:
- Cho phép đăng nhập bằng cả tên đăng nhập hoặc email
- Sử dụng `.trim()` để loại bỏ khoảng trắng thừa
- Kiểm tra tài khoản bị khóa trong `userManager.timTaiKhoan()`

---

### 2.4. `checkCartBeforeCheckout()` - Kiểm tra giỏ hàng trước thanh toán

**Vị trí**: `js/cart.js`

**Mục đích**: Đảm bảo tất cả sản phẩm trong giỏ hàng đã chọn đầy đủ thuộc tính (size, color)

**Cú pháp**:
```javascript
export function checkCartBeforeCheckout() {
    const cart = getCart();
    
    // Kiểm tra sản phẩm chưa chọn size
    const missingSizeItem = cart.find((item) => item.size === "Chưa chọn");
    if (missingSizeItem) {
        alert(
            `Vui lòng chọn Kích cỡ cho sản phẩm: "${missingSizeItem.name}" trước khi thanh toán.`
        );
        return false;
    }
    
    // Kiểm tra sản phẩm chưa chọn màu
    const missingColorItem = cart.find((item) => {
        const product = productManager.getProductById(item.id);
        
        return (
            product &&
            product.colors &&
            product.colors.length > 0 &&
            (item.color === "Chưa chọn" || item.color === "N/A" || !item.color)
        );
    });
    
    if (missingColorItem) {
        alert(
            `Vui lòng chọn Màu sắc cho sản phẩm: "${missingColorItem.name}" trước khi thanh toán.`
        );
        return false;
    }
    
    return true;
}
```

**Giá trị trả về**:
- `true`: Giỏ hàng hợp lệ, có thể thanh toán
- `false`: Giỏ hàng chưa hợp lệ, cần chọn thêm thuộc tính

**Các kiểm tra được thực hiện**:

#### 2.4.1. Kiểm tra Size
- Tìm sản phẩm có `size === "Chưa chọn"`
- Hiển thị alert với tên sản phẩm cụ thể
- Ngăn không cho tiếp tục thanh toán

#### 2.4.2. Kiểm tra Color
- Chỉ kiểm tra với sản phẩm có danh sách màu sắc
- Kiểm tra các trường hợp:
  - `item.color === "Chưa chọn"`
  - `item.color === "N/A"`
  - `!item.color` (null/undefined)
- Truy vấn thông tin sản phẩm từ `productManager` để xác định có colors không

**Điểm mạnh**:
- Kiểm tra thông minh: Chỉ yêu cầu chọn màu khi sản phẩm có danh sách màu
- Thông báo lỗi cụ thể: Hiển thị tên sản phẩm để người dùng dễ tìm
- Ngăn chặn sớm: Không cho phép vào bước thanh toán nếu chưa hợp lệ

---

### 2.5. Kiểm tra form thanh toán - HTML5 Validation

**Vị trí**: `js/checkout-modal-html.js`, `js/checkout-ui.js`

**Mục đích**: Sử dụng HTML5 validation attributes để kiểm tra form

#### 2.5.1. Kiểm tra số điện thoại
```html
<input 
    type="tel" 
    id="phone" 
    required 
    pattern="0[0-9]{9}" 
    title="Số điện thoại phải bắt đầu bằng 0 và có tổng cộng 10 chữ số. (Ví dụ: 0912345678)"
    maxlength="10" 
>
```

**Các thuộc tính validation**:

1. **`type="tel"`**: 
   - Định nghĩa input là số điện thoại
   - Trên mobile sẽ hiển thị bàn phím số

2. **`required`**: 
   - Trường bắt buộc, không được để trống

3. **`pattern="0[0-9]{9}"`**:
   - **Regex pattern** cho số điện thoại Việt Nam
   - **Giải thích**:
     - `0` - Bắt đầu bằng số 0
     - `[0-9]{9}` - Theo sau là 9 chữ số từ 0-9
     - **Tổng**: 10 chữ số, bắt đầu bằng 0
   
   **Ví dụ số điện thoại hợp lệ**:
   - `0912345678` ✓
   - `0987654321` ✓
   - `0123456789` ✓
   
   **Ví dụ số điện thoại không hợp lệ**:
   - `912345678` ✗ (không bắt đầu bằng 0)
   - `09123456789` ✗ (11 chữ số)
   - `091234567` ✗ (9 chữ số)
   - `abc1234567` ✗ (chứa chữ cái)

4. **`title="..."`**: 
   - Hiển thị thông báo hướng dẫn khi validation lỗi
   - Giúp người dùng biết định dạng đúng

5. **`maxlength="10"`**: 
   - Giới hạn tối đa 10 ký tự
   - Ngăn người dùng nhập quá số ký tự cho phép

#### 2.5.2. Kiểm tra form bằng JavaScript
```javascript
if (form && form.checkValidity()) {
    // Form hợp lệ, tiếp tục xử lý
} else {
    // Form không hợp lệ, hiển thị lỗi
}
```

**Phương thức `checkValidity()`**:
- Kiểm tra tất cả các trường trong form
- Trả về `true` nếu tất cả hợp lệ
- Trả về `false` nếu có trường không hợp lệ
- Tự động hiển thị thông báo lỗi của browser

---

### 2.6. Kiểm tra tài khoản trong UserManager

**Vị trí**: `js/user.js`

#### 2.6.1. `tonTaiTenDangNhap(tenDangNhap)` - Kiểm tra tên đăng nhập tồn tại
```javascript
tonTaiTenDangNhap(tenDangNhap) {
    return this.users.some(user => 
        user.tenDangNhap.toLowerCase() === tenDangNhap.toLowerCase()
    );
}
```

**Tham số**:
- `tenDangNhap` (String): Tên đăng nhập cần kiểm tra

**Giá trị trả về**:
- `true`: Tên đăng nhập đã tồn tại
- `false`: Tên đăng nhập chưa được sử dụng

**Cách hoạt động**:
1. Sử dụng `Array.some()` để duyệt qua danh sách users
2. So sánh không phân biệt hoa thường với `.toLowerCase()`
3. Trả về `true` ngay khi tìm thấy match đầu tiên

**Lợi ích của không phân biệt hoa thường**:
- Tránh trường hợp tạo nhiều tài khoản tương tự: "Admin", "admin", "ADMIN"
- Cải thiện trải nghiệm người dùng

#### 2.6.2. `tonTaiEmail(email)` - Kiểm tra email tồn tại
```javascript
tonTaiEmail(email) {
    return this.users.some(user => 
        user.email.toLowerCase() === email.toLowerCase()
    );
}
```

**Tương tự như `tonTaiTenDangNhap`**, nhưng kiểm tra với trường email

#### 2.6.3. `timTaiKhoan(tenDangNhap, matKhau)` - Tìm và xác thực tài khoản
```javascript
timTaiKhoan(tenDangNhap, matKhau) {
    const user = this.users.find(
        u =>
            (u.tenDangNhap === tenDangNhap || u.email === tenDangNhap) &&
            u.kiemTraMatKhau(matKhau)
    );
    
    if (user && user.isLocked) {
        console.warn(`Tài khoản ${user.tenDangNhap} đã bị khóa.`);
        return null;
    }
    
    return user;
}
```

**Tham số**:
- `tenDangNhap` (String): Tên đăng nhập hoặc email
- `matKhau` (String): Mật khẩu

**Giá trị trả về**:
- User object nếu tìm thấy và hợp lệ
- `null` nếu không tìm thấy hoặc tài khoản bị khóa

**Các kiểm tra được thực hiện**:
1. **Linh hoạt đăng nhập**: Cho phép dùng cả username hoặc email
2. **Xác thực mật khẩu**: Sử dụng method `kiemTraMatKhau()` của User class
3. **Kiểm tra khóa tài khoản**: Từ chối đăng nhập nếu `isLocked === true`

#### 2.6.4. `kiemTraMatKhau(matKhauNhap)` - Xác thực mật khẩu (User class)
```javascript
kiemTraMatKhau(matKhauNhap) {
    return this.matKhau === matKhauNhap;
}
```

**Phương thức đơn giản**: So sánh trực tiếp mật khẩu
**Lưu ý bảo mật**: Trong production nên hash mật khẩu (bcrypt, scrypt, etc.)

---

### 2.7. `validateEditCategoryInput()` - Kiểm tra danh mục

**Vị trí**: `js/category-admin.js`

**Mục đích**: Kiểm tra tên danh mục khi chỉnh sửa (real-time validation)

```javascript
const validateEditCategoryInput = debounce(() => {
    // Validation logic
    helperText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tên hợp lệ';
}, 300);

editCategoryInput.addEventListener("input", validateEditCategoryInput);
```

**Đặc điểm**:
- Sử dụng `debounce` để giảm số lần kiểm tra
- Kiểm tra real-time khi người dùng nhập
- Hiển thị icon và thông báo khi hợp lệ

---

## 3. Các Pattern và Regex Validation

### 3.1. Email Regex Pattern

**Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Vị trí**: `js/login-modal.js`

**Chi tiết pattern**:

```
^              Bắt đầu chuỗi
[^\s@]+        Một hoặc nhiều ký tự KHÔNG phải:
               - \s (khoảng trắng)
               - @ (ký tự @)
@              Ký tự @ bắt buộc
[^\s@]+        Một hoặc nhiều ký tự KHÔNG phải khoảng trắng hoặc @
\.             Dấu chấm (.) - escaped vì . là ký tự đặc biệt trong regex
[^\s@]+        Một hoặc nhiều ký tự KHÔNG phải khoảng trắng hoặc @
$              Kết thúc chuỗi
```

**Ví dụ test**:
```javascript
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(regexEmail.test('user@example.com'));      // true ✓
console.log(regexEmail.test('test.user@domain.co'));   // true ✓
console.log(regexEmail.test('admin@localhost.local')); // true ✓

console.log(regexEmail.test('userexample.com'));       // false ✗ (thiếu @)
console.log(regexEmail.test('@example.com'));          // false ✗ (thiếu username)
console.log(regexEmail.test('user@example'));          // false ✗ (thiếu TLD)
console.log(regexEmail.test('user @example.com'));     // false ✗ (có khoảng trắng)
```

**Ưu điểm**:
- Đơn giản, dễ hiểu
- Cover được hầu hết các trường hợp email phổ biến
- Không quá strict (vẫn cho phép subdomain, TLD dài)

**Hạn chế**:
- Không kiểm tra RFC 5322 đầy đủ (nhưng thực tế không cần thiết)
- Không kiểm tra email có tồn tại thật hay không

---

### 3.2. Phone Number Pattern

**Pattern**: `0[0-9]{9}`

**Vị trí**: `js/checkout-modal-html.js` (HTML pattern attribute)

**Chi tiết pattern**:

```
0              Bắt đầu bằng số 0 (chuẩn SĐT Việt Nam)
[0-9]{9}       Đúng 9 chữ số từ 0-9
               
Tổng: 10 chữ số (0 + 9 chữ số)
```

**Ví dụ test**:
```javascript
const phonePattern = /^0[0-9]{9}$/;

console.log(phonePattern.test('0912345678'));   // true ✓
console.log(phonePattern.test('0987654321'));   // true ✓
console.log(phonePattern.test('0123456789'));   // true ✓

console.log(phonePattern.test('912345678'));    // false ✗ (thiếu 0 đầu)
console.log(phonePattern.test('09123456789'));  // false ✗ (11 chữ số)
console.log(phonePattern.test('091234567'));    // false ✗ (9 chữ số)
console.log(phonePattern.test('01234567ab'));   // false ✗ (có chữ cái)
```

**Đặc điểm số điện thoại Việt Nam**:
- Bắt đầu bằng 0
- Tổng 10 chữ số
- Các đầu số phổ biến:
  - `09x` - Mobifone
  - `08x` - Vinaphone  
  - `07x` - Viettel
  - `03x` - Viettel (mới)
  - `05x` - Vietnamobile
  - `02x` - Điện thoại cố định

---

## 4. Các Hàm Tiện Ích (Utility Functions)

### 4.1. `escapeHtml(text)` - Escape HTML để tránh XSS

**Vị trí**: `js/category-admin.js`

**Mục đích**: Chuyển đổi text thành HTML-safe string, tránh XSS attacks

**Cú pháp**:
```javascript
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
```

**Tham số**:
- `text` (String): Chuỗi cần escape

**Giá trị trả về**:
- String: Chuỗi đã được escape HTML entities

**Cách hoạt động**:
1. Tạo một div element tạm thời
2. Set `textContent` = text (browser tự động escape)
3. Lấy `innerHTML` (đã được escape)

**Ví dụ**:
```javascript
escapeHtml('<script>alert("XSS")</script>');
// Kết quả: "&lt;script&gt;alert(\"XSS\")&lt;/script&gt;"

escapeHtml('Tom & Jerry');
// Kết quả: "Tom &amp; Jerry"

escapeHtml('<b>Bold</b>');
// Kết quả: "&lt;b&gt;Bold&lt;/b&gt;"
```

**Các ký tự được escape**:
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#39;`

**Tại sao cần escape HTML?**
- **Bảo mật**: Ngăn chặn XSS (Cross-Site Scripting) attacks
- **Hiển thị đúng**: Hiển thị text như người dùng nhập, không thực thi code

---

### 4.2. `debounce(func, wait)` - Giảm tần suất gọi hàm

**Vị trí**: `js/category-admin.js`

**Mục đích**: Trì hoãn thực thi hàm cho đến khi người dùng ngừng thao tác

**Cú pháp**:
```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

**Tham số**:
- `func` (Function): Hàm cần debounce
- `wait` (Number): Thời gian chờ (milliseconds)

**Giá trị trả về**:
- Function: Hàm đã được debounced

**Cách hoạt động**:
1. Mỗi lần gọi hàm, clear timeout cũ
2. Tạo timeout mới
3. Chỉ thực thi hàm khi timeout hoàn tất (không bị clear)

**Sơ đồ hoạt động**:
```
User input:  a   b   c   d   [pause 300ms]
Timeouts:    |---X
                 |---X
                     |---X
                         |------- EXECUTE
```

**Ví dụ sử dụng**:
```javascript
// Không có debounce - gọi mỗi lần nhập
input.addEventListener('input', validateInput);

// Có debounce - chỉ gọi sau 300ms không nhập
const debouncedValidate = debounce(validateInput, 300);
input.addEventListener('input', debouncedValidate);
```

**Ứng dụng**:
- **Search**: Chỉ search khi người dùng ngừng gõ
- **Validation**: Kiểm tra sau khi người dùng ngừng nhập
- **Auto-save**: Lưu sau khi người dùng ngừng chỉnh sửa
- **Resize**: Xử lý sau khi người dùng ngừng resize window

**Lợi ích**:
- Giảm số lần gọi API
- Tiết kiệm tài nguyên
- Cải thiện performance
- Tốt hơn cho UX (không lag)

---

### 4.3. `hienLoi(id, msg)` và `anLoi(id)` - Hiển thị/ẩn lỗi

**Vị trí**: `js/login-modal.js`, `js/profile.js`

**Mục đích**: Quản lý hiển thị thông báo lỗi validation

#### 4.3.1. `hienLoi(id, msg)` - Hiển thị lỗi
```javascript
function hienLoi(id, msg) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}
```

**Tham số**:
- `id` (String): ID của element hiển thị lỗi
- `msg` (String): Nội dung thông báo lỗi

**Ví dụ**:
```javascript
hienLoi('loiEmail', 'Email không hợp lệ');
// Element #loiEmail sẽ hiển thị "Email không hợp lệ"
```

#### 4.3.2. `anLoi(id)` - Ẩn lỗi
```javascript
function anLoi(id) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = '';
        el.style.display = 'none';
    }
}
```

**Tham số**:
- `id` (String): ID của element cần ẩn

**Ví dụ**:
```javascript
anLoi('loiEmail');
// Element #loiEmail sẽ được ẩn và xóa nội dung
```

**Pattern sử dụng**:
```javascript
// Ẩn tất cả lỗi trước khi validate
anLoi('loiEmail');
anLoi('loiMatKhau');

// Validate và hiển thị lỗi cụ thể
if (!email) {
    hienLoi('loiEmail', 'Vui lòng nhập email');
}
```

---

### 4.4. `hienLoading(id)` và `anLoading(id)` - Loading indicator

**Vị trí**: `js/login-modal.js`

**Mục đích**: Hiển thị/ẩn loading spinner khi xử lý async

#### 4.4.1. `hienLoading(id)`
```javascript
function hienLoading(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}
```

#### 4.4.2. `anLoading(id)`
```javascript
function anLoading(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
```

**Ví dụ flow**:
```javascript
function xuLyDangNhap(e) {
    e.preventDefault();
    
    // Hiển thị loading
    hienLoading('loadingDangNhap');
    
    // Simulate async operation
    setTimeout(() => {
        // Xử lý xong
        anLoading('loadingDangNhap');
        
        // Hiển thị kết quả
        hienThongBao('Đăng nhập thành công!');
    }, 1000);
}
```

---

## 5. Best Practices và Patterns

### 5.1. Validation Strategy

**Layers of Validation** trong dự án:

1. **Client-side HTML5 Validation**:
   - `required`, `pattern`, `maxlength`
   - Phản hồi tức thì cho người dùng
   - Không thể tin tưởng 100%

2. **Client-side JavaScript Validation**:
   - Validation phức tạp hơn
   - Custom messages
   - Business logic validation

3. **User Experience Validation**:
   - Real-time feedback (debounced)
   - Clear error messages
   - Auto-focus on error field

---

### 5.2. Error Handling Pattern

**Consistent Error Display**:
```javascript
// 1. Clear tất cả errors trước
anLoi('loi1');
anLoi('loi2');

// 2. Validate từng trường
let hopLe = true;

if (!field1) {
    hienLoi('loi1', 'Message');
    hopLe = false;
}

// 3. Check flag và proceed
if (hopLe) {
    // Process...
}
```

---

### 5.3. Security Considerations

**Các biện pháp bảo mật**:

1. **Escape HTML**: Sử dụng `escapeHtml()` cho user input
2. **Email Validation**: Regex để filter input cơ bản
3. **Password Minimum Length**: 6 ký tự tối thiểu
4. **No SQL Injection**: Sử dụng localStorage (không có SQL)
5. **Account Locking**: Kiểm tra `isLocked` flag

**Lưu ý**:
- Mật khẩu lưu plain text (không nên trong production)
- Nên hash mật khẩu với bcrypt/scrypt
- Nên validate server-side trong production

---

### 5.4. Performance Optimization

**Các kỹ thuật được sử dụng**:

1. **Debouncing**: 
   - Giảm số lần validate real-time
   - Cải thiện performance

2. **Early Return**: 
   - Return false ngay khi tìm thấy lỗi đầu tiên
   - Không cần kiểm tra hết

3. **Optional Chaining (`?.`)**:
   - Tránh lỗi khi element không tồn tại
   - Code ngắn gọn hơn

4. **Caching với `Intl.NumberFormat`**:
   - Có thể cache formatter để tái sử dụng

---

## 6. Tổng Kết

### 6.1. Danh Sách Tất Cả Các Hàm

**Formatting Functions**:
1. `formatCurrency(amount)` - Định dạng VND với Intl
2. `formatTien(amount)` - Định dạng VND đơn giản
3. `formatThoiGian(date)` - Định dạng dd/mm/yyyy hh:mm
4. `formatDate(isoString)` - Định dạng ngày từ ISO
5. `formatTrangThai(status)` - Convert status code sang text

**Validation Functions**:
1. `validateProductData(data)` - Validate thông tin sản phẩm
2. `xuLyDangKy(e)` - Validate form đăng ký
3. `xuLyDangNhap(e)` - Validate form đăng nhập
4. `checkCartBeforeCheckout()` - Validate giỏ hàng
5. `validateEditCategoryInput()` - Validate tên danh mục
6. `tonTaiTenDangNhap(tenDangNhap)` - Kiểm tra username tồn tại
7. `tonTaiEmail(email)` - Kiểm tra email tồn tại
8. `timTaiKhoan(tenDangNhap, matKhau)` - Xác thực login
9. `kiemTraMatKhau(matKhauNhap)` - So sánh password

**Utility Functions**:
1. `escapeHtml(text)` - Escape HTML entities
2. `debounce(func, wait)` - Debounce function calls
3. `hienLoi(id, msg)` - Hiển thị lỗi
4. `anLoi(id)` - Ẩn lỗi
5. `hienLoading(id)` - Hiển thị loading
6. `anLoading(id)` - Ẩn loading

**Regex Patterns**:
1. Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. Phone: `0[0-9]{9}`

---

### 6.2. Flowchart Tổng Quan

```
User Input
    ↓
HTML5 Validation (required, pattern)
    ↓
JavaScript Validation
    ↓
├─ Empty check
├─ Length check  
├─ Format check (regex)
├─ Business logic check
└─ Duplicate check
    ↓
Error Display / Success
    ↓
Process Data
```

---

### 6.3. Recommendations

**Cải thiện có thể thực hiện**:

1. **Bảo mật**:
   - Hash passwords (bcrypt)
   - Add CSRF protection
   - Rate limiting cho login

2. **Validation**:
   - Thêm password strength checker
   - Email verification
   - Phone number verification (OTP)

3. **UX**:
   - Inline validation feedback
   - Progress indicators
   - Accessibility improvements (ARIA labels)

4. **Code Quality**:
   - Extract validation rules to constants
   - Create validation utility library
   - Add unit tests

---

## Kết Luận

Tài liệu này đã giải thích chi tiết tất cả các phương thức và hàm kiểm tra định dạng trong dự án WEB-1. Mỗi hàm đều được mô tả với:

- **Mục đích**: Tại sao cần hàm này
- **Cú pháp**: Cách viết và sử dụng
- **Tham số**: Input và output
- **Cách hoạt động**: Logic bên trong
- **Ví dụ**: Các trường hợp sử dụng cụ thể
- **Best practices**: Cách sử dụng tốt nhất

Các validation và formatting functions được thiết kế để:
- Đảm bảo dữ liệu hợp lệ
- Cải thiện trải nghiệm người dùng
- Tăng tính bảo mật
- Dễ bảo trì và mở rộng
