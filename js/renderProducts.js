// Import ProductManager để lấy và quản lý danh sách sản phẩm
import { ProductManager } from "./ProductManager.js";

// Import categoryManager để lấy thông tin danh mục
import { categoryManager } from "./category.js";

// Chờ DOM load xong mới chạy code
document.addEventListener("DOMContentLoaded", () => {
    // Tạo instance của ProductManager
    const productManager = new ProductManager();

    // Lấy tất cả sản phẩm hiển thị (không bị ẩn)
    const allProducts = productManager.getVisibleProducts();

    // Helper function: Tìm một phần tử trong DOM (shorthand cho querySelector)
    const $ = (sel) => document.querySelector(sel);
    
    // Helper function: Tìm nhiều phần tử trong DOM và convert thành Array
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // Hàm: Escape HTML để tránh XSS (Cross-Site Scripting)
    // Chuyển các ký tự đặc biệt thành HTML entities
    function escapeHtml(str = "") {
        return String(str)
            .replace(/&/g, "&amp;")    // & thành &amp;
            .replace(/</g, "&lt;")     // < thành &lt;
            .replace(/>/g, "&gt;")     // > thành &gt;
            .replace(/"/g, "&quot;")   // " thành &quot;
            .replace(/'/g, "&#039;");  // ' thành &#039;
    }

    // Lấy các phần tử DOM cần thiết
    const productGrid = $(".product-grid");              // Container chứa danh sách sản phẩm
    const filterGroup = $(".filter-group");              // Nhóm nút lọc danh mục
    const sortSelect = $(".sort-select");                // Dropdown sắp xếp
    const paginationContainer = $("#pagination-controls"); // Container phân trang

    // Các phần tử của Quick View Modal
    const modal = $("#quick-view-modal");                // Modal popup
    const modalImg = $("#modal-img");                    // Ảnh sản phẩm trong modal
    const modalName = $("#modal-name");                  // Tên sản phẩm trong modal
    const modalRating = $("#modal-rating");              // Rating trong modal
    const modalPrice = $("#modal-price");                // Giá trong modal
    const modalAddBtn = $("#modal-add-to-cart");         // Nút thêm vào giỏ trong modal
    const modalViewDetail = $("#modal-view-detail");     // Link xem chi tiết trong modal

    const modalOptionsContainer = $("#modal-options-container"); // Container cho options

    // Nếu không tìm thấy productGrid, dừng execution (trang không có grid)
    if (!productGrid) {
        return;
    }

    // Biến state: Lưu trạng thái lọc và sắp xếp hiện tại
    let currentCategory = "all";  // Danh mục hiện tại ("all" = tất cả)
    let currentSort = "";          // Kiểu sắp xếp hiện tại (rỗng = không sắp xếp)
    
    // Cấu hình phân trang
    const ITEMS_PER_PAGE = 6;      // Số sản phẩm hiển thị mỗi trang (constant)
    let productsPerPage = ITEMS_PER_PAGE; // Số sản phẩm mỗi trang (có thể thay đổi)
    
    // Biến state phân trang
    let currentPage = 1;           // Trang hiện tại
    let filtered = allProducts.slice(); // Mảng sản phẩm sau khi lọc (copy từ allProducts)
    let totalPages = 0;            // Tổng số trang

    // Hàm: Tạo HTML card cho một sản phẩm
    function createProductCard(product) {
        // Tạo thẻ div cho card sản phẩm
        const card = document.createElement("div");
        card.className = "product-card";       // Gán class cho styling
        card.dataset.id = product.id;          // Lưu product ID vào data attribute

        // Tạo HTML cho badge (nhãn như "Sale", "New", "Hot")
        const badgeText = product.getBadgeText();
        const badgeHtml = product.badge
            ? `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(
                  badgeText
              )}</div>`
            : "";  // Nếu không có badge, trả về chuỗi rỗng

        // Tạo HTML cho ảnh sản phẩm
        const imgHtml = product.img
            ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(
                  product.name
              )}" class="product-img">`
            : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`; // Icon mặc định nếu không có ảnh

        // Format giá hiện tại theo locale Việt Nam (VD: 1.000.000)
        const currentPrice = (product.price || 0).toLocaleString("vi-VN");
        let priceHtml = `<span class="current-price">${currentPrice} VNĐ</span>`;

        // Nếu có giá cũ và đang sale, hiển thị cả giá cũ bị gạch
        if (product.oldPrice && product.isOnSale()) {
            const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
            priceHtml = `<span class="current-price">${currentPrice} VNĐ</span> <span class="old-price">${oldPrice} VNĐ</span>`;
        }

        // Tạo HTML cho rating (sao đánh giá)
        const ratingHtml = `<div class="product-rating"><div class="stars">${product.renderStars()}</div><span class="rating-text">(${
            product.ratingCount || 0  // Số lượng đánh giá
        })</span></div>`;

        // Gán nội dung HTML cho card
        card.innerHTML = `
            ${badgeHtml}
            <div class="product-image">
                ${imgHtml}
                <div class="product-overlay">
                    <button type="button" class="quick-view" data-id="${
                        product.id
                    }">Xem nhanh</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-category">${escapeHtml(product.category)}</p>
                ${ratingHtml}
                <div class="product-price">
                    ${priceHtml} 
                </div>
                <button type="button" class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus" aria-hidden="true"></i> Thêm vào giỏ
                </button>
            </div>
        `;
        return card;
    }

    function renderPaginationControls() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Trước';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => goToPage(currentPage - 1));
        paginationContainer.appendChild(prevButton);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) endPage = Math.min(totalPages, 5);
            if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.toggle('active', i === currentPage);
            pageButton.addEventListener('click', () => goToPage(i));
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Sau';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => goToPage(currentPage + 1));
        paginationContainer.appendChild(nextButton);
    }

    function renderList() {
        productGrid.innerHTML = "";
        
        const start = productsPerPage * (currentPage - 1);
        const end = start + productsPerPage;
        const slice = filtered.slice(start, end);

        if (slice.length === 0) {
            productGrid.innerHTML =
                '<p class="no-products">Không có sản phẩm phù hợp.</p>';
            if (paginationContainer) paginationContainer.innerHTML = "";
            return;
        }

        const frag = document.createDocumentFragment();
        slice.forEach((p) => frag.appendChild(createProductCard(p)));
        productGrid.appendChild(frag);

        renderPaginationControls();
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderList();
            if (productGrid.scrollIntoView) {
                productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function applyFilters() {
        if (!allProducts || !Array.isArray(allProducts)) {
            filtered = [];
        } else if (currentCategory === "all") {
            filtered = allProducts.slice();
        } else {
            const normalized = (currentCategory || "").toLowerCase().trim();
            filtered = allProducts.filter((p) => {
                const name = (
                    productManager.getCategoryName?.(p.categoryId) ??
                    p.category ??
                    ""
                )
                    .toString()
                    .toLowerCase()
                    .trim();
                return name === normalized;
            });
        }

        if (currentSort === "price-asc") {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (currentSort === "price-desc") {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (currentSort === "newest") {
            filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        } else if (currentSort === "best-seller") {
            filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        }

        totalPages = Math.ceil(filtered.length / productsPerPage);
        currentPage = 1;
        renderList();
    }

    function openQuickView(productId) {
        const id = Number(productId);
        const product = productManager.getProductById(id);
        if (!product || !modal) return;

        if (modalImg) {
            modalImg.src = product.img || "./img/default.avif";
            modalImg.alt = product.name;
        }
        if (modalName) {
            modalName.textContent = product.name;
        }
        if (modalRating) {
            modalRating.innerHTML = `${product.renderStars()} <span class="rating-text">(${
                product.ratingCount || 0
            })</span>`;
        }

        if (modalPrice) {
            const currentPrice = (product.price || 0).toLocaleString("vi-VN");
            let priceHtml = `<strong>${currentPrice} VNĐ</strong>`;

            if (product.oldPrice && product.isOnSale()) {
                const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
                priceHtml += ` <span class="old-price">${oldPrice} VNĐ</span>`;
            }
            modalPrice.innerHTML = priceHtml;
        }

        if (modalOptionsContainer) {
            const sizeOptions = [39, 40, 41, 42, 43]
                .map((size) => `<option value="${size}">EU ${size}</option>`)
                .join("");

            modalOptionsContainer.innerHTML = `
                <div class="form-group size-selector">
                    <label for="modal-shoe-size">Chọn Kích cỡ:</label>
                    <select id="modal-shoe-size" required>
                        <option value="">-- Chọn size --</option>
                        ${sizeOptions}
                    </select>
                </div>
            `;
        }

        if (modalAddBtn) modalAddBtn.dataset.id = id;

        if (modalViewDetail) {
            modalViewDetail.href = `./product-detail.html?id=${id}`;
        }

        modal.classList.add("open");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }

    function closeQuickView() {
        if (!modal) return;
        modal.classList.remove("open");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");

        if (modalOptionsContainer) modalOptionsContainer.innerHTML = "";
    }

    productGrid.addEventListener("click", (e) => {
        const qv = e.target.closest(".quick-view");
        if (qv) {
            const id = qv.dataset.id;
            openQuickView(id);
            return;
        }
    });

    function renderFilterButtons() {
        if (!filterGroup) return;

        try {
            filterGroup.innerHTML = "";

            const allBtn = document.createElement("button");
            allBtn.className = "filter-btn active";
            allBtn.dataset.filter = "all";
            allBtn.textContent = "Tất cả";
            filterGroup.appendChild(allBtn);

            const categories = categoryManager.getAllCategories();
            if (Array.isArray(categories)) {
                categories.forEach((category) => {
                    if (category && category.name) {
                        const btn = document.createElement("button");
                        btn.className = "filter-btn";
                        btn.dataset.filter = category.name;
                        btn.textContent = category.name;
                        filterGroup.appendChild(btn);
                    }
                });
            }
        } catch (error) {
            console.error("Error rendering filter buttons:", error);
        }
    }

    if (filterGroup) {
        filterGroup.addEventListener("click", (e) => {
            const btn = e.target.closest(".filter-btn");
            if (btn) {
                const filterBtns = $$(".filter-btn");
                filterBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                currentCategory = btn.dataset.filter;
                applyFilters();
            }
        });
    }

    renderFilterButtons();

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }

    const closeBtn = modal ? modal.querySelector(".close-btn") : null;
    if (closeBtn) {
        closeBtn.addEventListener("click", closeQuickView);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeQuickView();
        });
    }

    if (modalAddBtn) {
        modalAddBtn.addEventListener("click", function () {
            const id = Number(this.dataset.id);
            const product = productManager.getProductById(id);

            const sizeSelector = document.getElementById("modal-shoe-size");
            const selectedSize = sizeSelector ? sizeSelector.value : null;

            if (!selectedSize || selectedSize === "") {
                alert("Vui lòng chọn kích cỡ giày.");
                return;
            }

            if (product && window.addToCart) {
                window.addToCart(
                    product.id,
                    product.name,
                    product.price,
                    product.img,
                    selectedSize,
                    "N/A",
                    1
                );
                closeQuickView();
            }
        });
    }

    (function init() {
        if (!Array.isArray(allProducts) || allProducts.length === 0) {
            productGrid.innerHTML = '<p class="no-products">Không có sản phẩm.</p>';
            return;
        }

        applyFilters();
    })();
});