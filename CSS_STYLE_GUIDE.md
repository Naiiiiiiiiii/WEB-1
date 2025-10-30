# CSS Style Guide - ShoeStore Project

## Tổng Quan (Overview)

Tài liệu này cung cấp hướng dẫn về các chuẩn CSS được sử dụng trong dự án ShoeStore. Tất cả các nhà phát triển nên tuân theo các quy tắc này để đảm bảo tính nhất quán và khả năng bảo trì của mã.

---

## 1. Cấu Trúc Tệp CSS (CSS File Structure)

### Thứ Tự Import
```css
/* 1. CSS Variables */
@import url('variables.css');

/* 2. Reset/Base styles */
/* 3. Layout components */
/* 4. UI components */
/* 5. Utilities */
```

### Tổ Chức Nội Dung
Mỗi tệp CSS nên được tổ chức theo thứ tự:
1. **Import statements** (nếu có)
2. **Reset & Base styles**
3. **Layout components** (header, footer, sidebar)
4. **Content components** (cards, buttons, forms)
5. **Utilities & helpers**
6. **Media queries**

---

## 2. CSS Variables (Custom Properties)

### Sử Dụng CSS Variables
Luôn sử dụng CSS variables thay vì hardcode giá trị:

✅ **TỐT:**
```css
.button {
    background: var(--color-primary);
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
}
```

❌ **KHÔNG TỐT:**
```css
.button {
    background: #ff6b35;
    padding: 16px;
    border-radius: 12px;
}
```

### Các Loại Variables Có Sẵn

#### Colors
- `--color-primary`, `--color-primary-light`, `--color-primary-dark`
- `--color-secondary`, `--color-secondary-dark`
- `--color-white`, `--color-black`, `--color-text`
- `--color-success`, `--color-error`, `--color-warning`, `--color-info`

#### Spacing
- `--spacing-xs` (4px) → `--spacing-4xl` (80px)

#### Typography
- `--font-primary` (font family)
- `--font-size-xs` (12px) → `--font-size-5xl` (56px)
- `--font-weight-normal` (400) → `--font-weight-bold` (700)

#### Border Radius
- `--radius-sm` (4px) → `--radius-2xl` (20px)
- `--radius-round` (50px), `--radius-circle` (50%)

#### Shadows
- `--shadow-sm` → `--shadow-2xl`

#### Transitions
- `--transition-fast` (0.15s)
- `--transition-base` (0.3s)
- `--transition-slow` (0.5s)

#### Z-Index
- `--z-dropdown` (1000)
- `--z-modal` (1050)
- `--z-tooltip` (1070)

---

## 3. Quy Tắc Đặt Tên (Naming Conventions)

### BEM-like Methodology
Sử dụng cách đặt tên rõ ràng, mô tả:

```css
/* Block */
.product-card { }

/* Element */
.product-card__image { }
.product-card__title { }
.product-card__price { }

/* Modifier */
.product-card--featured { }
.product-card--sale { }
```

### Quy Tắc Đặt Tên Class
- Sử dụng **kebab-case** (dấu gạch ngang)
- Tên phải mô tả rõ ràng mục đích
- Tránh tên viết tắt không rõ nghĩa

✅ **TỐT:**
```css
.navigation-menu { }
.product-grid { }
.user-profile-card { }
```

❌ **KHÔNG TỐT:**
```css
.navMnu { }
.prod-gr { }
.usrCard { }
```

---

## 4. Thứ Tự Thuộc Tính (Property Order)

Sắp xếp các thuộc tính CSS theo nhóm logic:

```css
.example {
    /* 1. Positioning */
    position: relative;
    top: 0;
    left: 0;
    z-index: var(--z-dropdown);
    
    /* 2. Display & Box Model */
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
    
    /* 3. Background & Borders */
    background: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    
    /* 4. Typography */
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
    line-height: var(--line-height-relaxed);
    text-align: center;
    
    /* 5. Visual Effects */
    opacity: 1;
    transform: translateY(0);
    
    /* 6. Animations & Transitions */
    transition: var(--transition-all);
    
    /* 7. Other */
    cursor: pointer;
}
```

---

## 5. Responsive Design

### Breakpoints
Sử dụng các breakpoint chuẩn:

```css
/* Mobile First Approach */

/* Base styles (mobile) */
.element { }

/* Tablet - 768px */
@media (min-width: 768px) { }

/* Desktop - 1024px */
@media (min-width: 1024px) { }

/* Large Desktop - 1280px */
@media (min-width: 1280px) { }
```

### Max-Width Approach (hiện tại đang dùng)
```css
/* Desktop First */
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

---

## 6. Accessibility (Khả Năng Truy Cập)

### Focus States
Luôn thêm focus state cho các phần tử tương tác:

```css
.button {
    background: var(--color-primary);
    transition: var(--transition-base);
}

.button:hover {
    background: var(--color-primary-dark);
}

.button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

### Color Contrast
Đảm bảo tỷ lệ tương phản màu đạt WCAG AA (4.5:1 cho text thông thường):
- Text màu tối trên nền sáng
- Text màu sáng trên nền tối

---

## 7. Performance Best Practices

### Tránh Expensive Properties
```css
/* ❌ Tránh sử dụng */
.element {
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
    filter: blur(10px);
}

/* ✅ Tốt hơn */
.element {
    box-shadow: var(--shadow-md);
    /* Sử dụng transform thay vì thay đổi layout properties */
    transform: translateY(-2px);
}
```

### Use Transform & Opacity for Animations
```css
/* ✅ Hiệu suất tốt */
.card {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    opacity: 0.9;
}

/* ❌ Hiệu suất kém */
.card {
    transition: margin-top 0.3s ease;
}

.card:hover {
    margin-top: -5px;
}
```

---

## 8. Comments (Chú Thích)

### Section Headers
```css
/* ===================================================================
   SECTION NAME
   =================================================================== */
```

### Subsections
```css
/* Component Name or Description */
.component { }
```

### Inline Comments
```css
.element {
    /* Explanation for non-obvious property */
    flex: 0 0 250px;  /* Prevent image area from stretching */
}
```

---

## 9. Common Patterns

### Card Component
```css
.card {
    background: var(--color-white);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: var(--transition-all);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
}
```

### Button Component
```css
.btn {
    display: inline-block;
    padding: 12px 24px;
    background: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition: var(--transition-all);
}

.btn:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

---

## 10. Dos and Don'ts

### ✅ DOs
- Sử dụng CSS variables cho tất cả values có thể tái sử dụng
- Thêm focus states cho tất cả interactive elements
- Viết CSS theo thứ tự logic và nhất quán
- Sử dụng semantic class names
- Tối ưu hóa cho performance
- Test trên nhiều trình duyệt
- Comment cho các phần code phức tạp

### ❌ DON'Ts
- Hardcode colors, spacing, hoặc font sizes
- Sử dụng `!important` (trừ khi thực sự cần thiết)
- Inline styles trong HTML
- Over-nesting selectors (> 3 levels)
- Generic class names như `.container`, `.wrapper` không có context
- Sử dụng IDs cho styling (dành cho JavaScript)

---

## 11. Browser Support

### Target Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Vendor Prefixes
Sử dụng autoprefixer hoặc PostCSS để tự động thêm vendor prefixes.

Manual prefixing khi cần:
```css
.element {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

---

## 12. Tools & Resources

### Recommended Tools
- **VS Code Extensions:**
  - CSS Peek
  - IntelliSense for CSS class names
  - Prettier (code formatting)
  
- **Testing:**
  - Chrome DevTools
  - Firefox Developer Tools
  
- **Validation:**
  - W3C CSS Validator
  - Lighthouse (for accessibility)

### Useful Resources
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)

---

## 13. Checklist cho Code Review

Trước khi commit CSS code, kiểm tra:

- [ ] Đã sử dụng CSS variables thay vì hardcode values
- [ ] Đã thêm focus states cho interactive elements
- [ ] Đã test responsive design (mobile, tablet, desktop)
- [ ] Code được format nhất quán
- [ ] Không có CSS không sử dụng
- [ ] Comment cho các phần code phức tạp
- [ ] Đã test trên các trình duyệt chính
- [ ] Performance tốt (không có expensive properties)
- [ ] Accessibility được đảm bảo (contrast, focus states)

---

## Version History

- **v1.0** (2025-01-30): Initial CSS style guide
  - Created CSS variables system
  - Updated style.css, modal.css, admin-base.css
  - Established naming conventions and best practices

---

*Tài liệu này sẽ được cập nhật khi có thay đổi về standards hoặc best practices.*
