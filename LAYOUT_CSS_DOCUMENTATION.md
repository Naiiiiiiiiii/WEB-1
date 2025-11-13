# Tài Liệu Về Layout Web, Bố Cục, Cách Trình Bày và CSS

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc HTML Tổng Thể](#cấu-trúc-html-tổng-thể)
3. [Bố Cục Layout](#bố-cục-layout)
4. [Hệ Thống CSS](#hệ-thống-css)
5. [Responsive Design](#responsive-design)
6. [Các Thành Phần Chính](#các-thành-phần-chính)

---

## Tổng Quan

Website ShoeStore là một trang web thương mại điện tử bán giày nam cao cấp, được xây dựng với HTML5, CSS3 và JavaScript hiện đại. Website sử dụng kiến trúc semantic HTML và CSS modular để đảm bảo code dễ bảo trì và mở rộng.

### Công Nghệ Sử Dụng
- **HTML5**: Cấu trúc trang web với các thẻ semantic
- **CSS3**: Styling với Flexbox, Grid, và các hiệu ứng hiện đại
- **JavaScript (ES6 Modules)**: Tương tác động và quản lý dữ liệu
- **Font Awesome**: Icon library cho các biểu tượng UI

---

## Cấu Trúc HTML Tổng Thể

Website được tổ chức theo mô hình semantic HTML với cấu trúc rõ ràng:

```
<!DOCTYPE html>
<html lang="vi">
├── <head>
│   ├── Meta tags (charset, viewport)
│   ├── Title
│   └── CSS Files (style.css, modal.css, etc.)
├── <body>
│   ├── <header> - Header với navigation
│   ├── <main>
│   │   ├── <section id="home"> - Hero section
│   │   ├── <section class="categories"> - Danh mục sản phẩm
│   │   ├── <section id="products"> - Sản phẩm nổi bật
│   │   ├── <section id="brands"> - Thương hiệu đối tác
│   │   └── <section class="newsletter"> - Đăng ký nhận tin
│   ├── <footer> - Footer với thông tin liên hệ
│   └── Modals & Overlays
│       ├── Order History Overlay
│       ├── Cart Overlay
│       └── Search Overlay
└── JavaScript Modules
```

### Nguyên Tắc Semantic HTML
Website tuân theo các nguyên tắc semantic HTML5:
- **`<header>`**: Chứa logo, navigation và các icon chức năng
- **`<main>`**: Nội dung chính của trang
- **`<section>`**: Các phần nội dung riêng biệt, có ý nghĩa
- **`<footer>`**: Thông tin footer, liên kết và thông tin liên hệ
- **`<nav>`**: Menu điều hướng chính

---

## Bố Cục Layout

### 1. Header Layout (Fixed Navigation)

Header được thiết kế theo kiểu **sticky/fixed** với bố cục Flexbox:

```css
.header {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}
```

**Cấu trúc Header:**
```
┌─────────────────────────────────────────────────┐
│  Logo    Navigation Menu       Icons (Search,   │
│                                Cart, User)       │
└─────────────────────────────────────────────────┘
```

**Đặc điểm:**
- Position fixed: Header luôn hiển thị ở top khi scroll
- z-index: 1000 để đảm bảo header luôn nằm trên các element khác
- Flexbox layout: Phân bổ không gian đều giữa logo, menu, và icons
- Gradient background: Tạo hiệu ứng màu gradient từ tối đến sáng

### 2. Hero Section (Landing Area)

Hero section sử dụng **CSS Grid** với layout 2 cột:

```css
.hero {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 80px 0 60px;
    min-height: 70vh;
    display: flex;
    align-items: center;
}

.hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}
```

**Bố cục Hero:**
```
┌─────────────────────┬────────────────────┐
│  Tiêu đề chính     │   Image Slider     │
│  Mô tả sản phẩm    │   (Carousel)       │
│  CTA Button        │                    │
└─────────────────────┴────────────────────┘
```

**Thành phần chính:**
- **Content Column**: Chứa heading, description, và CTA button
- **Slider Column**: Image carousel với controls và dots navigation
- **Gradient Background**: Tạo background màu gradient thu hút
- **Min-height 70vh**: Đảm bảo hero section chiếm đủ không gian viewport

### 3. Categories Section (Danh Mục)

Section này sử dụng **CSS Grid với auto-fit**:

```css
.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}
```

**Bố cục Categories:**
```
┌────────┬────────┬────────┬────────┐
│  Icon  │  Icon  │  Icon  │  Icon  │
│  Thể   │  Công  │ Outdoor│  Cao   │
│  thao  │  sở    │        │  cấp   │
└────────┴────────┴────────┴────────┘
```

**Đặc điểm:**
- **Auto-fit**: Tự động điều chỉnh số cột dựa trên không gian
- **Minmax(250px, 1fr)**: Mỗi card tối thiểu 250px, max là 1 fraction
- **Gap 2rem**: Khoảng cách đều giữa các card
- **Hover effects**: Transform translateY và box-shadow khi hover

### 4. Products Section (Sản Phẩm)

Products section bao gồm filter bar và product grid:

```css
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}
```

**Bố cục Products:**
```
Filter Buttons                    Sort Dropdown
├──────────────────────────────────────────────┤

┌──────┬──────┬──────┬──────┐
│Product│Product│Product│Product│
│ Card │ Card │ Card │ Card │
│      │      │      │      │
└──────┴──────┴──────┴──────┘
┌──────┬──────┬──────┬──────┐
│Product│Product│Product│Product│
│ Card │ Card │ Card │ Card │
└──────┴──────┴──────┴──────┘

      [Pagination Controls]
```

**Cấu trúc Product Card:**
```css
.product-card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
```

**Thành phần Product Card:**
- **Product Image**: Hình ảnh sản phẩm với hover zoom effect
- **Product Info**: Tên, rating (stars), giá
- **Action Buttons**: "Xem nhanh" và "Thêm vào giỏ"

### 5. Footer Layout

Footer sử dụng **CSS Grid 4 cột**:

```css
.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
}
```

**Bố cục Footer:**
```
┌───────────┬──────────┬──────────┬──────────┐
│  Logo &   │ Sản phẩm │  Hỗ trợ  │ Liên hệ  │
│  Social   │  Links   │  Links   │   Info   │
│  Links    │          │          │          │
└───────────┴──────────┴──────────┴──────────┘
        Copyright © 2025 ShoeStore
```

---

## Hệ Thống CSS

### Cấu Trúc File CSS

Website sử dụng kiến trúc CSS modular với nhiều file chuyên biệt:

```
css/
├── style.css              (722 dòng) - Main styles, layout chính
├── admin-base.css         (1241 dòng) - Admin panel base
├── profile.css            (766 dòng) - User profile styles
├── admin-product.css      (738 dòng) - Admin product management
├── admin-import.css       (718 dòng) - Import slip management
├── product-detail.css     (633 dòng) - Product detail page
├── search-overlay.css     (623 dòng) - Search functionality
├── search.css             (541 dòng) - Search UI
├── category-admin.css     (504 dòng) - Category management
├── admin-inventory.css    (336 dòng) - Inventory management
├── dangnhap.css          (319 dòng) - Login/register forms
├── cart-and-user-ui.css  (276 dòng) - Cart and user UI
├── admin-order.css       (204 dòng) - Order management
├── checkout-modal.css    (199 dòng) - Checkout modal
├── admin-price.css       (121 dòng) - Price management
└── modal.css             (52 dòng) - Modal components
```

**Tổng số dòng CSS**: ~7,993 dòng

### CSS Reset và Base Styles

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
}
```

**Đặc điểm:**
- **Universal selector (*)**: Reset margin, padding cho tất cả elements
- **box-sizing: border-box**: Padding và border được tính trong width/height
- **Font family**: Segoe UI - font sans-serif hiện đại, dễ đọc
- **Line-height 1.6**: Tăng khoảng cách dòng để dễ đọc hơn

### Container System

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}
```

**Mục đích:**
- Giới hạn chiều rộng tối đa: 1200px
- Center content: `margin: 0 auto`
- Responsive padding: 20px hai bên

### Color Palette

Website sử dụng bảng màu nhất quán:

| Màu          | Hex Code  | Sử dụng                           |
|--------------|-----------|-----------------------------------|
| Primary      | #ff6b35   | CTA buttons, accents, links       |
| Secondary    | #f7931e   | Gradient end, highlights          |
| Dark         | #1a1a1a   | Header, footer background         |
| Light        | #f8f9fa   | Background sections               |
| Text Primary | #333      | Main text color                   |
| Text Secondary| #666     | Secondary text, descriptions      |
| Success      | #155724   | Success messages, delivered status|
| Warning      | #ff8c00   | Warning, pending status           |

### Gradient Styles

Website sử dụng nhiều gradient để tạo depth và visual interest:

```css
/* Header Gradient */
background: linear-gradient(135deg, #1a1a1a, #2d2d2d);

/* Hero Gradient */
background: linear-gradient(135deg, #667eea, #764ba2);

/* CTA Button Gradient */
background: linear-gradient(45deg, #ff6b35, #f7931e);

/* Pagination Active Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Typography System

```css
/* Headings */
h1 { font-size: 3.5rem; font-weight: 700; }
h2 { font-size: 2.5rem; font-weight: 700; }
h3 { font-size: 1.3rem; font-weight: 600; }

/* Section Titles */
.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
}

/* Section Title Underline */
.section-title::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(45deg, #ff6b35, #f7931e);
    border-radius: 2px;
}
```

### Spacing System

Website sử dụng spacing nhất quán:

- **Section Padding**: 80px (top/bottom), 0 (left/right)
- **Card Gap**: 2rem (~32px)
- **Element Gap**: 1rem (~16px) cho các element nhỏ
- **Large Gap**: 4rem (~64px) cho hero content

---

## Responsive Design

### Breakpoint Strategy

Website sử dụng mobile-first approach với 2 breakpoints chính:

```css
/* Tablet và Mobile lớn */
@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
    }
}

/* Mobile nhỏ */
@media (max-width: 480px) {
    .hero h1 {
        font-size: 2rem;
    }
    
    .section-title {
        font-size: 1.8rem;
    }
}
```

### Responsive Layout Changes

| Viewport     | Layout Changes                              |
|--------------|---------------------------------------------|
| Desktop      | Multi-column grids, horizontal navigation   |
| 768px        | Single column grids, stacked navigation     |
| 480px        | Smaller fonts, compact spacing              |

### CSS Grid Auto-fit

Sử dụng `auto-fit` và `minmax()` cho responsive grid tự động:

```css
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}
```

**Cách hoạt động:**
- **auto-fit**: Tự động điều chỉnh số cột dựa trên container width
- **minmax(280px, 1fr)**: Card tối thiểu 280px, tối đa 1 fraction
- **Kết quả**: 
  - Desktop (1200px): 4 cột
  - Tablet (768px): 2 cột
  - Mobile (480px): 1 cột

---

## Các Thành Phần Chính

### 1. Navigation Bar

**HTML Structure:**
```html
<header class="header">
    <div class="nav-container">
        <div class="logo">Logo</div>
        <nav class="nav-menu">
            <ul>
                <li><a href="#home">Trang chủ</a></li>
                ...
            </ul>
        </nav>
        <div class="nav-icons">
            Icons (Search, Cart, User)
        </div>
    </div>
</header>
```

**CSS Styling:**
```css
.header {
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
}
```

**Features:**
- Fixed positioning: Luôn hiển thị khi scroll
- Flexbox layout: Phân bố đều các phần tử
- Hover effects: Màu accent (#ff6b35) khi hover
- Cart badge: Hiển thị số lượng sản phẩm trong giỏ

### 2. Hero Slider

**Slider Structure:**
```html
<div class="slider-container">
    <div class="slides-wrapper">
        <div class="slide">
            <img src="..." alt="...">
        </div>
        ...
    </div>
    <div class="slider-controls">
        <button class="slider-btn prev-btn">‹</button>
        <button class="slider-btn next-btn">›</button>
    </div>
    <div class="slider-dots">
        <span class="dot active"></span>
        ...
    </div>
</div>
```

**CSS Implementation:**
```css
.slider-container {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 10px;
}

.slides-wrapper {
    display: flex;
    height: 100%;
    transition: transform 0.6s ease-in-out;
}

.slide {
    min-width: 100%;
    flex-shrink: 0;
}
```

**Cơ chế hoạt động:**
- **Flexbox container**: Các slides nằm ngang bên cạnh nhau
- **Transform**: Dịch chuyển slides-wrapper để chuyển slide
- **Transition**: Hiệu ứng smooth khi chuyển slide
- **Overflow hidden**: Chỉ hiển thị 1 slide tại 1 thời điểm

### 3. Product Card

**Card Structure:**
```html
<div class="product-card">
    <div class="product-image">
        <img src="..." alt="...">
        <button class="quick-view">Xem nhanh</button>
    </div>
    <div class="product-info">
        <h3 class="product-name">Tên sản phẩm</h3>
        <div class="product-rating">
            <div class="stars">★★★★★</div>
        </div>
        <div class="product-price">
            <span class="current-price">1,000,000₫</span>
        </div>
        <button class="add-to-cart">Thêm vào giỏ</button>
    </div>
</div>
```

**CSS Styling:**
```css
.product-card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: all 0.3s;
}

.product-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
```

**Interactive Features:**
- **Hover lift**: Card nâng lên khi hover
- **Image zoom**: Ảnh sản phẩm zoom in nhẹ khi hover
- **Quick view button**: Hiện button khi hover vào ảnh
- **Add to cart button**: Gradient background với hover effect

### 4. Modal và Overlay

**Modal Pattern:**
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.open {
    display: flex;
    opacity: 1;
}
```

**Đặc điểm:**
- **Fixed positioning**: Cover toàn màn hình
- **Dark backdrop**: rgba(0, 0, 0, 0.7) cho background
- **Centered content**: Flexbox với center alignment
- **Fade animation**: Opacity transition khi mở/đóng
- **High z-index**: 1000 để nằm trên các elements khác

### 5. Cart Overlay

**Cart UI:**
```css
.cart-overlay {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    transition: right 0.3s ease;
}

.cart-overlay.active {
    right: 0;
}

.cart-modal {
    position: absolute;
    right: 0;
    width: 400px;
    height: 100%;
    background: white;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
}
```

**Slide-in Animation:**
- Cart slide từ bên phải vào
- Smooth transition 0.3s
- Dark backdrop khi mở

### 6. Pagination Controls

**Pagination Design:**
```css
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 30px;
}

.pagination-controls button {
    padding: 8px 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    min-width: 40px;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-controls button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
```

**Features:**
- **Centered layout**: Flexbox với center alignment
- **Active state**: Gradient background cho trang hiện tại
- **Disabled state**: Reduced opacity cho nút không khả dụng
- **Hover effects**: Background change khi hover

---

## Animation và Transitions

### Hover Animations

Website sử dụng nhiều hover effects để tăng interactivity:

```css
/* Card Hover */
.product-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

/* Button Hover */
.add-to-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

/* Icon Hover */
.nav-icons a:hover {
    color: #ff6b35;
    background: rgba(255, 107, 53, 0.1);
}
```

### Transition Timing

```css
/* Standard transition */
transition: all 0.3s;

/* Slider transition */
transition: transform 0.6s ease-in-out;

/* Modal fade */
transition: opacity 0.3s ease;

/* Quick interaction */
transition: all 0.2s;
```

### Transform Effects

```css
/* Lift effect */
transform: translateY(-10px);

/* Scale effect */
transform: scale(1.2);

/* Center positioning */
transform: translateX(-50%);

/* Combined transforms */
transform: translateY(-2px) scale(1.05);
```

---

## Best Practices Được Áp Dụng

### 1. Semantic HTML
- Sử dụng đúng thẻ HTML5 semantic (`<header>`, `<main>`, `<section>`, `<footer>`)
- Cấu trúc document outline rõ ràng
- Accessibility tốt với aria labels

### 2. CSS Organization
- Tách file CSS theo chức năng (modular CSS)
- Naming convention nhất quán
- Reusable classes

### 3. Performance
- CSS minification (trong production)
- Lazy loading cho images
- Efficient selectors

### 4. Responsive Design
- Mobile-first approach
- Flexible grids với auto-fit
- Responsive images

### 5. User Experience
- Smooth animations và transitions
- Clear visual feedback
- Consistent spacing và typography

### 6. Maintainability
- CSS comments cho sections quan trọng
- Consistent code formatting
- Clear file structure

---

## Kết Luận

Website ShoeStore được xây dựng với:

✅ **Layout hiện đại**: Sử dụng CSS Grid và Flexbox  
✅ **Responsive design**: Tối ưu cho mọi thiết bị  
✅ **UI/UX chất lượng**: Animations mượt mà, hover effects hấp dẫn  
✅ **Code structure tốt**: Modular CSS, semantic HTML  
✅ **Performance**: Optimized cho loading nhanh  

Website thể hiện sự kết hợp hài hòa giữa thiết kế đẹp mắt và code chất lượng, tạo nên trải nghiệm người dùng tốt và dễ dàng bảo trì, mở rộng trong tương lai.
