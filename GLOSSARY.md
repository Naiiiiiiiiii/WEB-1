# 📖 Từ điển Thuật ngữ - Web Development Glossary

## Mục đích
File này giải thích các thuật ngữ kỹ thuật được sử dụng trong project ShoeStore, giúp người mới học dễ hiểu hơn.

---

## HTML/CSS Terms

### HTML (HyperText Markup Language)
Ngôn ngữ đánh dấu siêu văn bản, dùng để tạo cấu trúc của trang web.

**Ví dụ:**
```html
<h1>Tiêu đề</h1>
<p>Đoạn văn</p>
```

### CSS (Cascading Style Sheets)
Ngôn ngữ tạo kiểu, dùng để trang trí (màu sắc, font chữ, layout) cho HTML.

**Ví dụ:**
```css
h1 {
    color: blue;
    font-size: 24px;
}
```

### Semantic HTML
HTML có nghĩa, dùng các thẻ mô tả đúng nội dung (header, nav, main, footer) thay vì chỉ dùng div.

**Ví dụ:**
```html
<!-- ❌ Không semantic -->
<div class="header">...</div>

<!-- ✅ Semantic -->
<header>...</header>
```

### Flexbox
Layout model của CSS, giúp sắp xếp elements theo hàng hoặc cột một cách linh hoạt.

**Ví dụ:**
```css
.container {
    display: flex;
    justify-content: space-between;
}
```

### Grid Layout
Layout model của CSS, tạo lưới 2 chiều (hàng và cột) để sắp xếp elements.

**Ví dụ:**
```css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr; /* 3 cột bằng nhau */
}
```

### Responsive Design
Thiết kế web tự động điều chỉnh để hiển thị tốt trên mọi kích thước màn hình (mobile, tablet, desktop).

**Ví dụ:**
```css
@media (max-width: 768px) {
    /* CSS cho mobile */
}
```

### CSS Selector
Cách chọn elements trong HTML để apply CSS.

**Các loại:**
```css
/* Tag selector */
p { color: red; }

/* Class selector */
.product-card { border: 1px solid #ccc; }

/* ID selector */
#header { background: blue; }

/* Attribute selector */
[type="text"] { border: 1px solid gray; }
```

---

## JavaScript Terms

### JavaScript (JS)
Ngôn ngữ lập trình chạy trên browser, tạo tính tương tác cho website.

### Variable (Biến)
Nơi lưu trữ dữ liệu trong code.

**Ví dụ:**
```javascript
let name = "John";      // Có thể thay đổi
const price = 100000;   // Không thay đổi
var old = "old way";    // Cách cũ (tránh dùng)
```

### Function (Hàm)
Khối code có thể tái sử dụng, thực hiện một nhiệm vụ cụ thể.

**Ví dụ:**
```javascript
// Function declaration
function greet(name) {
    return "Hello " + name;
}

// Arrow function
const greet = (name) => "Hello " + name;
```

### Array (Mảng)
Danh sách các giá trị.

**Ví dụ:**
```javascript
const fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
```

### Object (Đối tượng)
Tập hợp các cặp key-value (thuộc tính và giá trị).

**Ví dụ:**
```javascript
const product = {
    id: 1,
    name: "Giày thể thao",
    price: 500000
};
console.log(product.name); // "Giày thể thao"
```

### DOM (Document Object Model)
Cây cấu trúc đại diện cho HTML, JavaScript dùng DOM để tương tác với trang web.

**Ví dụ:**
```javascript
// Lấy element
const btn = document.querySelector('.button');

// Thay đổi nội dung
btn.textContent = "Click me";

// Thêm event
btn.addEventListener('click', function() {
    alert('Clicked!');
});
```

### Event (Sự kiện)
Hành động xảy ra trên trang web (click, scroll, input, etc).

**Ví dụ:**
```javascript
button.addEventListener('click', function(e) {
    console.log('Button clicked!');
});
```

### Event Listener
Function lắng nghe và xử lý khi có event xảy ra.

### Event Delegation
Kỹ thuật gán 1 listener cho element cha thay vì nhiều listeners cho các elements con.

**Ví dụ:**
```javascript
// ❌ Nhiều listeners
buttons.forEach(btn => {
    btn.addEventListener('click', handleClick);
});

// ✅ Event delegation
document.addEventListener('click', function(e) {
    if (e.target.matches('.button')) {
        handleClick(e);
    }
});
```

### Callback Function
Function được truyền vào function khác như một argument.

**Ví dụ:**
```javascript
function doSomething(callback) {
    // Do work...
    callback();
}

doSomething(function() {
    console.log('Done!');
});
```

### Promise
Object đại diện cho kết quả của một async operation (thành công hoặc thất bại).

**Ví dụ:**
```javascript
const promise = new Promise((resolve, reject) => {
    // Async work
    if (success) {
        resolve(result);
    } else {
        reject(error);
    }
});

promise.then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
```

### Async/Await
Cú pháp viết async code dễ đọc hơn Promise.

**Ví dụ:**
```javascript
async function fetchData() {
    try {
        const response = await fetch('api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}
```

### JSON (JavaScript Object Notation)
Format dữ liệu dạng text, dùng để lưu trữ và truyền tải dữ liệu.

**Ví dụ:**
```javascript
// JavaScript Object
const user = { name: "John", age: 30 };

// Convert to JSON string
const jsonString = JSON.stringify(user);
// '{"name":"John","age":30}'

// Parse JSON string back to Object
const obj = JSON.parse(jsonString);
```

---

## ES6+ Terms

### ES6 (ECMAScript 2015)
Version mới của JavaScript với nhiều tính năng hiện đại.

### Module (ES6 Module)
Cách chia code thành nhiều files riêng biệt, giúp code dễ quản lý.

**Ví dụ:**
```javascript
// file: math.js
export function add(a, b) {
    return a + b;
}

// file: main.js
import { add } from './math.js';
console.log(add(2, 3)); // 5
```

### Export/Import
Cú pháp để xuất và nhập modules.

```javascript
// Named export
export const PI = 3.14;
export function circle(r) { return PI * r * r; }

// Default export
export default class Calculator { }

// Import
import Calculator from './Calculator.js';
import { PI, circle } from './math.js';
```

### Template Literal
Cách viết string dễ đọc hơn, có thể chứa biến và xuống dòng.

**Ví dụ:**
```javascript
// Cách cũ
const msg = 'Hello ' + name + '!';

// Template literal
const msg = `Hello ${name}!`;

// Multi-line
const html = `
    <div>
        <h1>${title}</h1>
        <p>${content}</p>
    </div>
`;
```

### Arrow Function
Cú pháp viết function ngắn gọn hơn.

**Ví dụ:**
```javascript
// Function declaration
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With block
const add = (a, b) => {
    const result = a + b;
    return result;
};
```

### Destructuring
Cú pháp rút gọn để lấy giá trị từ object/array.

**Ví dụ:**
```javascript
// Object destructuring
const user = { name: 'John', age: 30 };
const { name, age } = user;

// Array destructuring
const arr = [1, 2, 3];
const [first, second] = arr;
```

### Spread Operator (...)
Toán tử "trải" elements của array/object.

**Ví dụ:**
```javascript
// Array
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Object
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }
```

### Class
Cú pháp để tạo object blueprint (khuôn mẫu).

**Ví dụ:**
```javascript
class Product {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    
    getInfo() {
        return `${this.name}: ${this.price}đ`;
    }
}

const shoe = new Product('Nike', 2000000);
```

---

## Architecture Terms

### MVC (Model-View-Controller)
Pattern chia ứng dụng thành 3 phần:
- **Model**: Dữ liệu
- **View**: Giao diện
- **Controller**: Logic xử lý

### Model
Class đại diện cho dữ liệu và business logic.

**Ví dụ trong project:**
```javascript
class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}
```

### View
Phần giao diện người dùng nhìn thấy (HTML + CSS).

### Controller
Logic xử lý tương tác giữa Model và View.

**Ví dụ:**
```javascript
class ProductManager {
    addProduct(product) {
        // Logic thêm sản phẩm
    }
    
    deleteProduct(id) {
        // Logic xóa sản phẩm
    }
}
```

### CRUD
Create, Read, Update, Delete - 4 thao tác cơ bản với dữ liệu.

**Ví dụ:**
```javascript
// Create
productManager.addProduct(newProduct);

// Read
const product = productManager.getProductById(1);

// Update
productManager.updateProduct(1, { price: 300000 });

// Delete
productManager.deleteProduct(1);
```

### State (Trạng thái)
Dữ liệu hiện tại của ứng dụng tại một thời điểm.

**Ví dụ:**
```javascript
// State của giỏ hàng
const cartState = {
    items: [
        { id: 1, name: 'Shoe A', quantity: 2 },
        { id: 2, name: 'Shoe B', quantity: 1 }
    ],
    total: 5000000
};
```

### State Management
Cách quản lý và cập nhật state trong ứng dụng.

### Persistence (Bền vững)
Khả năng lưu trữ dữ liệu lâu dài (không mất khi reload trang).

---

## Storage Terms

### LocalStorage
API của browser để lưu dữ liệu dạng key-value trên client.

**Ví dụ:**
```javascript
// Lưu
localStorage.setItem('username', 'john123');

// Lấy
const username = localStorage.getItem('username');

// Xóa
localStorage.removeItem('username');

// Xóa tất cả
localStorage.clear();
```

### SessionStorage
Tương tự LocalStorage nhưng dữ liệu bị xóa khi đóng tab.

### Cookie
Dữ liệu nhỏ được lưu trên browser, thường dùng cho session và tracking.

### Cache
Bộ nhớ tạm để lưu dữ liệu hay dùng, giúp tăng tốc ứng dụng.

---

## Web Development Terms

### Client-side
Code chạy trên browser của người dùng (HTML, CSS, JavaScript).

### Server-side
Code chạy trên server (Node.js, PHP, Python, etc).

### Frontend
Phần giao diện người dùng tương tác (HTML, CSS, JavaScript).

### Backend
Phần xử lý logic phía server, database, API.

### Full-stack
Developer biết cả frontend và backend.

### API (Application Programming Interface)
Giao diện để các ứng dụng giao tiếp với nhau.

**Ví dụ:**
```javascript
// Gọi API
fetch('https://api.example.com/products')
    .then(res => res.json())
    .then(data => console.log(data));
```

### REST API
Loại API phổ biến, sử dụng HTTP methods (GET, POST, PUT, DELETE).

### HTTP Methods
- **GET**: Lấy dữ liệu
- **POST**: Tạo mới
- **PUT**: Cập nhật
- **DELETE**: Xóa

### AJAX (Asynchronous JavaScript and XML)
Kỹ thuật gọi server mà không cần reload trang.

### SPA (Single Page Application)
Ứng dụng web chỉ load 1 trang HTML, nội dung thay đổi bằng JavaScript.

---

## Development Tools Terms

### IDE (Integrated Development Environment)
Phần mềm để viết code (VS Code, WebStorm).

### Code Editor
Trình soạn thảo code (VS Code, Sublime Text, Atom).

### Browser DevTools
Công cụ debug tích hợp trong browser (F12).

### Console
Tab trong DevTools để xem logs và errors.

### Debugger
Công cụ để pause code và xem giá trị biến từng bước.

**Ví dụ:**
```javascript
function calculate(a, b) {
    debugger; // Code sẽ pause tại đây
    return a + b;
}
```

### Git
Hệ thống quản lý version code (version control).

### GitHub
Platform host code dùng Git.

### Repository (Repo)
Thư mục chứa code project.

### Commit
Lưu lại thay đổi code với một message.

**Ví dụ:**
```bash
git add .
git commit -m "Add login feature"
```

### Branch
Nhánh code riêng để phát triển tính năng mới.

```bash
git checkout -b feature/login
```

### Merge
Gộp code từ branch này sang branch khác.

### Pull Request (PR)
Yêu cầu merge code từ branch của bạn vào branch chính.

### Clone
Copy repository từ GitHub về máy local.

```bash
git clone https://github.com/user/repo.git
```

---

## Performance Terms

### Optimization (Tối ưu hóa)
Cải thiện tốc độ và hiệu suất của ứng dụng.

### Minification
Nén code (xóa khoảng trắng, comment) để giảm kích thước file.

**Ví dụ:**
```javascript
// Original
function add(a, b) {
    return a + b;
}

// Minified
function add(a,b){return a+b}
```

### Lazy Loading
Chỉ load resource khi cần thiết, không load hết từ đầu.

### Debouncing
Trì hoãn việc gọi function cho đến khi user ngừng action.

**Ví dụ:**
```javascript
// Search khi user ngừng gõ 300ms
let timeout;
input.addEventListener('input', function(e) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        search(e.target.value);
    }, 300);
});
```

### Throttling
Giới hạn số lần gọi function trong một khoảng thời gian.

---

## Testing Terms

### Unit Test
Test từng function/component riêng lẻ.

### Integration Test
Test nhiều phần hoạt động cùng nhau.

### E2E Test (End-to-End)
Test toàn bộ flow từ đầu đến cuối.

### Bug
Lỗi trong code.

### Debug
Quá trình tìm và sửa bug.

---

## Security Terms

### XSS (Cross-Site Scripting)
Lỗ hổng bảo mật cho phép inject JavaScript độc hại.

### SQL Injection
Lỗ hổng cho phép inject SQL commands độc hại.

### CORS (Cross-Origin Resource Sharing)
Policy bảo mật của browser về việc gọi resource từ domain khác.

### Authentication (Xác thực)
Xác minh danh tính user (login).

### Authorization (Phân quyền)
Xác định user được phép làm gì.

### Validation (Xác thực dữ liệu)
Kiểm tra dữ liệu input có hợp lệ không.

**Ví dụ:**
```javascript
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
```

### Sanitization
Làm sạch dữ liệu input để tránh XSS.

**Ví dụ:**
```javascript
function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
```

---

## Deployment Terms

### Deployment (Triển khai)
Đưa ứng dụng lên môi trường production (internet).

### Hosting
Dịch vụ lưu trữ website trên server.

### Domain
Tên miền của website (example.com).

### SSL/HTTPS
Giao thức bảo mật cho website (khóa xanh trên browser).

### CDN (Content Delivery Network)
Mạng lưới server phân phối content nhanh hơn.

---

## Common Acronyms

- **HTML** - HyperText Markup Language
- **CSS** - Cascading Style Sheets
- **JS** - JavaScript
- **DOM** - Document Object Model
- **API** - Application Programming Interface
- **AJAX** - Asynchronous JavaScript and XML
- **JSON** - JavaScript Object Notation
- **UI** - User Interface
- **UX** - User Experience
- **CRUD** - Create, Read, Update, Delete
- **MVC** - Model-View-Controller (Pattern chia ứng dụng thành Model, View, Controller)
- **SPA** - Single Page Application
- **PWA** - Progressive Web App
- **SEO** - Search Engine Optimization
- **IDE** - Integrated Development Environment
- **VS Code** - Visual Studio Code
- **URL** - Uniform Resource Locator
- **HTTP** - HyperText Transfer Protocol
- **HTTPS** - HTTP Secure

---

## Project-Specific Terms

### ShoeStore
Tên project - ứng dụng bán giày trực tuyến.

### ProductManager
Class quản lý CRUD operations cho products.

### UserManager
Class quản lý users và authentication.

### Cart (Giỏ hàng)
Danh sách sản phẩm user muốn mua.

### Checkout (Thanh toán)
Quá trình hoàn tất đơn hàng.

### Variant (Biến thể)
Phiên bản khác nhau của cùng một sản phẩm (theo size).

### Stock (Tồn kho)
Số lượng sản phẩm còn lại trong kho.

### Import Slip (Phiếu nhập)
Chứng từ ghi nhận việc nhập hàng vào kho.

### Order Status (Trạng thái đơn hàng)
- **new**: Đơn hàng mới
- **confirmed**: Đã xác nhận
- **shipping**: Đang giao
- **delivered**: Đã giao
- **cancelled**: Đã hủy

---

**Note:** Thuật ngữ này sẽ được cập nhật thường xuyên. Nếu có thuật ngữ nào bạn chưa hiểu, vui lòng search Google hoặc hỏi ChatGPT! 📚
