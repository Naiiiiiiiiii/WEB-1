# 🚀 Hướng dẫn Bắt đầu Nhanh - ShoeStore

## Dành cho người mới bắt đầu

Nếu bạn chưa từng làm web project trước đây, hãy làm theo các bước sau:

---

## Bước 1: Cài đặt Công cụ Cần thiết

### 1.1. Trình duyệt Web
- Cài đặt **Google Chrome** hoặc **Firefox** (khuyến nghị Chrome)
- Download tại: https://www.google.com/chrome/

### 1.2. Code Editor
- Cài đặt **Visual Studio Code** (VS Code)
- Download tại: https://code.visualstudio.com/

### 1.3. Git (Optional nhưng khuyến khích)
- Download tại: https://git-scm.com/
- Sau khi cài, restart máy tính

---

## Bước 2: Tải Project về Máy

### Cách 1: Dùng Git (Khuyến nghị)
```bash
# Mở Terminal (Cmd hoặc PowerShell trên Windows)
# Tạo thư mục để chứa project
mkdir D:\web-projects
cd D:\web-projects

# Clone project
git clone https://github.com/Naiiiiiiiiii/WEB-1.git

# Vào thư mục project
cd WEB-1
```

### Cách 2: Download ZIP
1. Vào https://github.com/Naiiiiiiiiii/WEB-1
2. Click nút **Code** màu xanh
3. Chọn **Download ZIP**
4. Giải nén file ZIP vào thư mục bạn muốn

---

## Bước 3: Mở Project trong VS Code

1. Mở VS Code
2. File → Open Folder
3. Chọn thư mục `WEB-1` vừa tải về
4. Click **Select Folder**

---

## Bước 4: Cài Extensions cho VS Code

### Extensions bắt buộc:

1. **Live Server**
   - Mở Extensions (Ctrl+Shift+X)
   - Tìm "Live Server"
   - Click Install

2. **IntelliSense for CSS class names**
   - Giúp autocomplete CSS classes
   - Tìm và cài "IntelliSense for CSS class names in HTML"

### Extensions khuyến nghị:

3. **Auto Rename Tag**
4. **JavaScript (ES6) code snippets**
5. **Path Intellisense**
6. **Prettier - Code formatter**

---

## Bước 5: Chạy Website

### Cách 1: Dùng Live Server (Đơn giản nhất)

1. Click chuột phải vào file `index.html`
2. Chọn **"Open with Live Server"**
3. Website sẽ tự động mở ở http://localhost:5500

### Cách 2: Dùng Python (Nếu đã cài Python)

```bash
# Trong thư mục WEB-1
python -m http.server 8000

# Mở browser: http://localhost:8000
```

### Cách 3: Dùng Node.js (Nếu đã cài Node)

```bash
# Cài http-server globally
npm install -g http-server

# Chạy server
http-server -p 8000

# Mở browser: http://localhost:8000
```

---

## Bước 6: Khám phá Website

### Trang Khách hàng (index.html)

1. **Xem sản phẩm:**
   - Scroll xuống xem danh sách giày
   - Click vào sản phẩm để xem chi tiết

2. **Tìm kiếm:**
   - Click icon kính lúp ở header
   - Nhập tên sản phẩm muốn tìm

3. **Đăng ký tài khoản:**
   - Click icon người dùng ở header
   - Chọn "Đăng ký"
   - Điền thông tin:
     - Họ tên: Nguyễn Văn A
     - Username: testuser123
     - Email: test@example.com
     - Mật khẩu: 123456

4. **Đăng nhập:**
   - Dùng tài khoản vừa tạo
   - Hoặc dùng tài khoản mẫu:
     - Username: `testuser`
     - Password: `123456`

5. **Mua hàng:**
   - Thêm sản phẩm vào giỏ hàng
   - Click icon giỏ hàng ở header
   - Chọn size cho sản phẩm
   - Click "Thanh toán"
   - Điền thông tin giao hàng
   - Hoàn tất đơn hàng

6. **Xem lịch sử đơn hàng:**
   - Click icon lịch sử ở header
   - Hoặc vào Profile

### Trang Admin (admin-index.html)

1. **Đăng nhập Admin:**
   - Mở: http://localhost:5500/admin-index.html
   - Username: `admin`
   - Password: `Admin123`

2. **Quản lý sản phẩm:**
   - Tab "Quản lý sản phẩm"
   - Click "Thêm sản phẩm" để tạo sản phẩm mới
   - Click "Sửa" để chỉnh sửa
   - Click "Xóa" để xóa sản phẩm

3. **Quản lý tồn kho:**
   - Tab "Quản lý tồn kho"
   - Xem số lượng tồn theo từng size
   - Nhập thêm hàng nếu cần

4. **Quản lý đơn hàng:**
   - Tab "Quản lý đơn đặt hàng"
   - Xem danh sách đơn hàng
   - Cập nhật trạng thái đơn hàng

---

## Bước 7: Bắt đầu Học Code

### 7.1. Đọc Tài liệu

Đọc theo thứ tự:

1. **README.md** (File này)
   - Hiểu tổng quan về project
   - Biết cấu trúc thư mục
   - Biết các tính năng chính

2. **LEARNING-GUIDE.md**
   - Lộ trình học tập từng bước
   - Kiến thức nền tảng cần có
   - Phân tích code chi tiết
   - Bài tập thực hành

3. **ARCHITECTURE.md**
   - Kiến trúc hệ thống
   - Data flow
   - Design patterns
   - Best practices

### 7.2. Phân tích Code

#### Bắt đầu với HTML:

```bash
# Mở file index.html
```

Đọc hiểu từng phần:
- `<header>` - Thanh menu trên cùng
- `<main>` - Nội dung chính
- `<section>` - Các phần như hero, products
- `<footer>` - Chân trang

#### Tiếp tục với CSS:

```bash
# Mở file css/style.css
```

Xem cách styling:
- `.header` - Style cho header
- `.product-card` - Style cho card sản phẩm
- Media queries - Responsive design

#### Cuối cùng là JavaScript:

```bash
# Mở file js/main.js
```

Đọc từ trên xuống:
- Import statements
- Biến global
- Hàm xử lý events
- Hàm khởi tạo

### 7.3. Thử Sửa Code

**Bài tập nhỏ 1: Thay đổi màu header**

File: `css/style.css`
```css
/* Tìm dòng này */
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Đổi thành màu khác, ví dụ: */
.header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

Lưu file → Xem thay đổi trong browser (tự động reload nếu dùng Live Server)

**Bài tập nhỏ 2: Thay đổi text**

File: `index.html`
```html
<!-- Tìm dòng này -->
<div class="logo">
    <i class="fas fa-shoe-prints"></i>
    ShoeStore
</div>

<!-- Đổi thành tên bạn muốn -->
<div class="logo">
    <i class="fas fa-shoe-prints"></i>
    My Shoe Shop
</div>
```

**Bài tập nhỏ 3: Thêm sản phẩm mới**

File: `js/productData.js`

Copy một object sản phẩm có sẵn, đổi id và thông tin:

```javascript
{
    id: 99, // ID mới, không trùng
    name: "Giày của tôi",
    categoryId: "C001",
    price: 500000,
    oldPrice: null,
    img: "./img/giaythethao_CAMatch.avif", // Dùng ảnh có sẵn
    rating: 5,
    ratingCount: 10,
    badge: "new",
    description: "Đây là sản phẩm thử nghiệm của tôi",
    images: ["./img/giaythethao_CAMatch.avif"],
    variants: [
        { size: 39, stock: 10 },
        { size: 40, stock: 15 }
    ],
    costPrice: 300000,
    initialStock: 25,
    lowStockThreshold: 5,
    imports: [],
    sales: [],
    isHidden: false
}
```

---

## Bước 8: Debug và Fix Lỗi

### Mở Chrome DevTools

1. **Cách mở:**
   - Press F12
   - Hoặc Right Click → Inspect
   - Hoặc Ctrl+Shift+I

2. **Các Tab quan trọng:**

   **Console Tab:**
   - Xem errors (màu đỏ)
   - Xem warnings (màu vàng)
   - Xem console.log()

   **Elements Tab:**
   - Xem HTML structure
   - Sửa CSS realtime
   - Xem computed styles

   **Network Tab:**
   - Xem các file được load
   - Check file nào bị lỗi 404

   **Application Tab:**
   - Xem LocalStorage
   - Xóa/sửa dữ liệu trong LocalStorage

### Các lỗi thường gặp:

#### Lỗi 1: "Cannot use import statement outside a module"

**Nguyên nhân:** Quên thêm `type="module"` vào script tag

**Fix:**
```html
<!-- ❌ Sai -->
<script src="./js/main.js"></script>

<!-- ✅ Đúng -->
<script type="module" src="./js/main.js"></script>
```

#### Lỗi 2: "404 Not Found" cho file .js hoặc .css

**Nguyên nhân:** Đường dẫn file sai

**Fix:** Kiểm tra đường dẫn có đúng không
```html
<!-- Nếu file trong thư mục con -->
<link rel="stylesheet" href="./css/style.css">

<!-- Nếu file ngang cấp -->
<link rel="stylesheet" href="style.css">
```

#### Lỗi 3: "Cannot read property 'addEventListener' of null"

**Nguyên nhân:** Element chưa được load khi chạy JavaScript

**Fix:** Đặt script vào cuối body hoặc dùng DOMContentLoaded
```javascript
// Cách 1: Script ở cuối body
<body>
    <!-- HTML content -->
    <script type="module" src="./js/main.js"></script>
</body>

// Cách 2: DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Code here
});
```

---

## Bước 9: Git Basics (Optional)

Nếu muốn quản lý code changes:

```bash
# Xem trạng thái files
git status

# Thêm files vào staging
git add .

# Commit changes
git commit -m "Thêm sản phẩm mới"

# Push lên GitHub (nếu có repo riêng)
git push origin main
```

---

## Bước 10: Tài nguyên Học thêm

### Học HTML/CSS:
- [W3Schools HTML](https://www.w3schools.com/html/)
- [W3Schools CSS](https://www.w3schools.com/css/)
- [FreeCodeCamp - Responsive Web Design](https://www.freecodecamp.org/learn/responsive-web-design/)

### Học JavaScript:
- [JavaScript.info](https://javascript.info/) - Rất chi tiết
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [FreeCodeCamp - JavaScript Algorithms](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/)

### Video Tiếng Việt:
- [F8 - Học HTML CSS](https://fullstack.edu.vn/courses/html-css)
- [F8 - Học JavaScript](https://fullstack.edu.vn/courses/javascript-co-ban)
- [Evondev - JavaScript](https://www.youtube.com/@evondev)

### Thực hành:
- [Codepen.io](https://codepen.io/) - Code HTML/CSS/JS online
- [JSFiddle](https://jsfiddle.net/) - Tương tự Codepen
- [LeetCode](https://leetcode.com/) - Luyện thuật toán

---

## Câu hỏi Thường gặp (FAQ)

### Q: Tôi không biết gì về lập trình, có học được không?
**A:** Có! Nhưng cần kiên nhẫn. Bắt đầu với HTML/CSS cơ bản trước, sau đó mới học JavaScript.

### Q: Mất bao lâu để học xong project này?
**A:** 
- Nếu biết cơ bản: 2-4 tuần
- Nếu mới bắt đầu: 2-3 tháng
- Tùy thời gian học mỗi ngày (1-3 giờ/ngày)

### Q: Cần học những gì trước khi bắt đầu?
**A:**
1. HTML cơ bản (1 tuần)
2. CSS cơ bản + Flexbox (1 tuần)
3. JavaScript cơ bản (2-3 tuần)
4. Sau đó mới đọc code project này

### Q: Project này có backend không?
**A:** Không. Project này chỉ có frontend, dữ liệu lưu trong LocalStorage. Nếu muốn có backend, cần học Node.js, Express, MongoDB sau.

### Q: Có thể deploy project này lên internet không?
**A:** Có! Dùng:
- GitHub Pages (miễn phí)
- Netlify (miễn phí)
- Vercel (miễn phí)

Xem hướng dẫn chi tiết trong file ARCHITECTURE.md phần Deployment.

### Q: Tại sao code có tiếng Việt?
**A:** Để dễ đọc và hiểu với người Việt mới học. Trong thực tế, nên dùng tiếng Anh cho professional projects.

### Q: LocalStorage có hạn chế gì?
**A:**
- Dung lượng: ~5-10MB tùy browser
- Chỉ lưu string (phải JSON.stringify/parse)
- Chỉ client-side, không secure cho data nhạy cảm
- Bị xóa khi clear browser data

### Q: Làm sao để add thêm tính năng?
**A:** 
1. Đọc hiểu code hiện tại
2. Vẽ flow diagram của tính năng mới
3. Tạo branch mới trong Git
4. Code từng bước nhỏ
5. Test kỹ
6. Commit và merge

---

## Lời khuyên Cuối cùng

1. **Đừng vội:** Học từng bước, không cần hiểu hết ngay lập tức
2. **Thực hành nhiều:** Code > đọc
3. **Debug thường xuyên:** Xem Console, test từng function
4. **Đặt câu hỏi:** Google, Stack Overflow, ChatGPT
5. **Làm project riêng:** Clone ideas này và custom theo ý bạn
6. **Tham gia cộng đồng:** Facebook groups, Discord servers về web dev

---

**Chúc bạn học tốt và thành công! 🎉💻**

Nếu gặp khó khăn, hãy tạo Issue trên GitHub hoặc tìm kiếm câu trả lời trên Google/Stack Overflow.
