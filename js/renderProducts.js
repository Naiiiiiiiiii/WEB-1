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

    // Hàm: Render các nút điều khiển phân trang (Previous, 1, 2, 3..., Next)
    // Hiển thị tối đa 5 nút số trang xung quanh trang hiện tại
    function renderPaginationControls() {
        // Nếu không tìm thấy container, dừng
        if (!paginationContainer) return;
        
        // Xóa nội dung cũ
        paginationContainer.innerHTML = '';
        
        // Nếu chỉ có 1 trang hoặc ít hơn, không cần phân trang
        if (totalPages <= 1) return;

        // Tạo nút "Trước" (Previous)
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Trước';
        
        // Disable nút nếu đang ở trang đầu tiên
        prevButton.disabled = currentPage === 1;
        
        // Click để chuyển về trang trước
        prevButton.addEventListener('click', () => goToPage(currentPage - 1));
        paginationContainer.appendChild(prevButton);

        // Tính toán range của các số trang cần hiển thị
        // Hiển thị 5 trang: currentPage -2, -1, current, +1, +2
        let startPage = Math.max(1, currentPage - 2);           // Không nhỏ hơn 1
        let endPage = Math.min(totalPages, currentPage + 2);    // Không lớn hơn totalPages

        // Đảm bảo luôn hiển thị đủ 5 nút (nếu có đủ trang)
        if (endPage - startPage < 4) {
            // Nếu ở đầu, mở rộng về cuối
            if (startPage === 1) endPage = Math.min(totalPages, 5);
            
            // Nếu ở cuối, mở rộng về đầu
            if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
        }

        // Tạo các nút số trang từ startPage đến endPage
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;  // Số trang
            
            // Thêm class 'active' cho trang hiện tại
            pageButton.classList.toggle('active', i === currentPage);
            
            // Click để chuyển đến trang i
            pageButton.addEventListener('click', () => goToPage(i));
            paginationContainer.appendChild(pageButton);
        }

        // Tạo nút "Sau" (Next)
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Sau';
        
        // Disable nút nếu đang ở trang cuối
        nextButton.disabled = currentPage === totalPages;
        
        // Click để chuyển sang trang sau
        nextButton.addEventListener('click', () => goToPage(currentPage + 1));
        paginationContainer.appendChild(nextButton);
    }

    // Hàm: Render danh sách sản phẩm cho trang hiện tại
    // Chỉ hiển thị slice sản phẩm theo pagination
    function renderList() {
        // Xóa nội dung grid cũ
        productGrid.innerHTML = "";
        
        // Tính toán chỉ số bắt đầu và kết thúc
        // VD: Trang 1 (0-5), Trang 2 (6-11)...
        const start = productsPerPage * (currentPage - 1);
        const end = start + productsPerPage;
        
        // Lấy slice sản phẩm từ mảng filtered
        const slice = filtered.slice(start, end);

        // Nếu không có sản phẩm nào, hiển thị thông báo
        if (slice.length === 0) {
            productGrid.innerHTML =
                '<p class="no-products">Không có sản phẩm phù hợp.</p>';
            
            // Xóa pagination nếu không có sản phẩm
            if (paginationContainer) paginationContainer.innerHTML = "";
            return;
        }

        // Sử dụng DocumentFragment để tối ưu performance
        // DocumentFragment không gây reflow khi append multiple elements
        const frag = document.createDocumentFragment();
        
        // Tạo card cho từng sản phẩm và thêm vào fragment
        slice.forEach((p) => frag.appendChild(createProductCard(p)));
        
        // Append tất cả cards vào grid một lần (chỉ 1 reflow)
        productGrid.appendChild(frag);

        // Render pagination controls
        renderPaginationControls();
    }

    // Hàm: Chuyển đến trang cụ thể
    // @param page: Số trang cần chuyển đến
    function goToPage(page) {
        // Validate page number trong range hợp lệ
        if (page >= 1 && page <= totalPages) {
            // Cập nhật trang hiện tại
            currentPage = page;
            
            // Re-render danh sách sản phẩm
            renderList();
            
            // Scroll smooth lên đầu product grid
            // Để user nhìn thấy sản phẩm ngay sau khi chuyển trang
            if (productGrid.scrollIntoView) {
                productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // Hàm: Áp dụng filter và sort cho danh sách sản phẩm
    // Thực hiện cả 2 operations: lọc theo category và sắp xếp
    function applyFilters() {
        // Step 1: FILTER - Lọc theo danh mục
        
        // Kiểm tra dữ liệu hợp lệ
        if (!allProducts || !Array.isArray(allProducts)) {
            filtered = [];
        } 
        // Nếu chọn "Tất cả", lấy toàn bộ sản phẩm
        else if (currentCategory === "all") {
            filtered = allProducts.slice();  // Clone array
        } 
        // Lọc theo category cụ thể
        else {
            // Normalize category name: lowercase + trim để so sánh chính xác
            const normalized = (currentCategory || "").toLowerCase().trim();
            
            // Filter products có category khớp
            filtered = allProducts.filter((p) => {
                // Lấy category name từ categoryId hoặc trực tiếp từ p.category
                // Sử dụng optional chaining (?.) và nullish coalescing (??)
                const name = (
                    productManager.getCategoryName?.(p.categoryId) ??
                    p.category ??
                    ""
                )
                    .toString()
                    .toLowerCase()
                    .trim();
                
                // So sánh category name với filter
                return name === normalized;
            });
        }

        // Step 2: SORT - Sắp xếp theo tiêu chí
        
        // Sort option 1: Giá tăng dần (Price: Low to High)
        if (currentSort === "price-asc") {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } 
        // Sort option 2: Giá giảm dần (Price: High to Low)
        else if (currentSort === "price-desc") {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        } 
        // Sort option 3: Sản phẩm mới nhất (ID lớn nhất = mới nhất)
        else if (currentSort === "newest") {
            filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        } 
        // Sort option 4: Bán chạy nhất (ratingCount cao nhất)
        else if (currentSort === "best-seller") {
            filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        }

        // Step 3: PAGINATION - Tính toán số trang
        // Math.ceil() để làm tròn lên (VD: 7 items / 6 per page = 1.16 → 2 pages)
        totalPages = Math.ceil(filtered.length / productsPerPage);
        
        // Reset về trang 1 sau khi filter/sort
        currentPage = 1;
        
        // Re-render danh sách
        renderList();
    }

    // Hàm: Mở modal Quick View để xem nhanh sản phẩm
    // @param productId: ID của sản phẩm cần xem
    function openQuickView(productId) {
        // Convert sang Number (từ string dataset)
        const id = Number(productId);
        
        // Lấy thông tin sản phẩm từ ProductManager
        const product = productManager.getProductById(id);
        
        // Nếu không tìm thấy product hoặc modal, dừng
        if (!product || !modal) return;

        // Cập nhật ảnh sản phẩm trong modal
        if (modalImg) {
            modalImg.src = product.img || "./img/default.avif";  // Fallback image
            modalImg.alt = product.name;  // Alt text cho accessibility
        }
        
        // Cập nhật tên sản phẩm
        if (modalName) {
            modalName.textContent = product.name;
        }
        
        // Cập nhật rating (sao + số lượng đánh giá)
        if (modalRating) {
            modalRating.innerHTML = `${product.renderStars()} <span class="rating-text">(${
                product.ratingCount || 0
            })</span>`;
        }

        // Cập nhật giá sản phẩm
        if (modalPrice) {
            // Format giá hiện tại
            const currentPrice = (product.price || 0).toLocaleString("vi-VN");
            let priceHtml = `<strong>${currentPrice} VNĐ</strong>`;

            // Nếu đang sale, hiển thị cả giá cũ bị gạch
            if (product.oldPrice && product.isOnSale()) {
                const oldPrice = (product.oldPrice || 0).toLocaleString("vi-VN");
                priceHtml += ` <span class="old-price">${oldPrice} VNĐ</span>`;
            }
            modalPrice.innerHTML = priceHtml;
        }

        // Tạo size selector (dropdown chọn kích cỡ giày)
        if (modalOptionsContainer) {
            // Các size giày phổ biến: EU 39-43
            const sizeOptions = [39, 40, 41, 42, 43]
                .map((size) => `<option value="${size}">EU ${size}</option>`)
                .join("");

            // Inject HTML cho size selector
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

        // Lưu product ID vào nút "Thêm vào giỏ" để xử lý sau
        if (modalAddBtn) modalAddBtn.dataset.id = id;

        // Cập nhật link "Xem chi tiết" để navigate đến product detail page
        if (modalViewDetail) {
            modalViewDetail.href = `./product-detail.html?id=${id}`;
        }

        // Hiển thị modal với animation
        modal.classList.add("open");
        modal.style.display = "flex";
        
        // Update ARIA attribute cho screen readers
        modal.setAttribute("aria-hidden", "false");
    }

    // Hàm: Đóng modal Quick View
    function closeQuickView() {
        // Kiểm tra modal tồn tại
        if (!modal) return;
        
        // Remove class 'open' để trigger CSS transition (fade out)
        modal.classList.remove("open");
        
        // Ẩn modal
        modal.style.display = "none";
        
        // Update ARIA attribute cho screen readers
        modal.setAttribute("aria-hidden", "true");

        // Xóa nội dung options container (cleanup)
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