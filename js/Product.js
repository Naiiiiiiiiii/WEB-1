// File: js/Product.js
// Class định nghĩa cấu trúc, phương thức hiển thị (End-user) 
// và các logic tồn kho/giá vốn (Admin).

export class Product {
    constructor(data) {
        // === Thuộc tính cơ bản (Hiển thị & Quản lý) ===
        this.id = data.id;
        this.name = data.name;
        this.categoryId = data.categoryId; 
        this.description = data.description || '';
        this.img = data.img || data.imageUrl; 
        this.images = data.images || [];

        // === Thuộc tính Biến thể (CHỈ SIZE) ===
        this.variants = data.variants || []; 

        // === Thuộc tính giá (Cơ sở) ===
        this.price = data.price; 
        this.oldPrice = data.oldPrice || null; 

        // === Thuộc tính tồn kho & giá vốn (Admin) ===
        this.costPrice = data.costPrice || 0; 
        // initialStock là tồn kho chung, được cập nhật bởi ProductManager
        this.initialStock = data.initialStock || 0; 
        this.lowStockThreshold = data.lowStockThreshold || 5; 
        this.imports = data.imports || []; 
        this.sales = data.sales || []; 
        this.isHidden = data.isHidden || false; 

        // THUỘC TÍNH MỚI: Lưu % lợi nhuận  mong muốn
        this.targetProfitMargin = data.targetProfitMargin || null;

        // === Thuộc tính đánh giá ===
        this.rating = data.rating || 0;
        this.ratingCount = data.ratingCount || 0;
        this.badge = data.badge || null;
    }

    // --------------------------------------------------------------------
    // I. PHƯƠNG THỨC ADMIN (Tồn kho, Giá vốn, Lợi nhuận)
    // --------------------------------------------------------------------

    /**
      Tính tổng tồn kho hiện tại của sản phẩm.
      Nếu có variants, tính tổng từ variants.stock. Ngược lại, dùng initialStock.
     */
    getCurrentStock() {
        if (this.variants && this.variants.length > 0) {
            // Tồn kho theo biến thể: Tính tổng của tất cả size
            return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }

        // Tồn kho chung (Sản phẩm không có biến thể): Chỉ cần trả về initialStock
        // vì ProductManager đã cập nhật trường này sau mỗi giao dịch (import/sale).
        return this.initialStock || 0; 
    }
    
    isLowStock() {
        if (this.variants.length > 0) {
            // Nếu bất kỳ size nào có tồn kho nhỏ hơn ngưỡng là cảnh báo
            return this.variants.some(v => (v.stock || 0) <= this.lowStockThreshold);
        }
        return this.getCurrentStock() <= this.lowStockThreshold;
    }
    
    getProfitMarginPercent() {
        if (this.costPrice <= 0) return 'N/A';
        const margin = this.price - this.costPrice;
        return `${Math.round((margin / this.costPrice) * 100)}%`;
    }

    getStockInOutHistory(startDate, endDate) {
        const start = new Date(startDate);
        // Thiết lập end date đến cuối ngày
        const end = new Date(new Date(endDate).getTime() + 86399999); 
    
        const importQty = this.imports.reduce((sum, item) => {
            const itemDate = new Date(item.date);
            if (itemDate >= start && itemDate <= end) return sum + item.qty;
            return sum;
        }, 0);
    
        const saleQty = this.sales.reduce((sum, item) => {
            const itemDate = new Date(item.date);
            if (itemDate >= start && itemDate <= end) return sum + item.qty;
            return sum;
        }, 0);
    
        return {
            importQty: importQty,
            saleQty: saleQty,
            currentStock: this.getCurrentStock() 
        };
    }

    // --------------------------------------------------------------------
    // II. PHƯƠNG THỨC END-USER (Hiển thị, Giá & Biến thể)
    // --------------------------------------------------------------------

    getAvailableSizes() {
        if (this.variants.length === 0) return [];
        const sizes = this.variants
            .filter(v => (v.stock || 0) > 0)
            .map(v => v.size)
            .filter(s => s !== undefined && s !== null);
            
        // Đảm bảo size là số và sắp xếp
        return [...new Set(sizes)].map(s => Number(s)).sort((a, b) => a - b); 
    }
    
    getVariant(size) {
        const numericSize = Number(size); 
        return this.variants.find(v => Number(v.size) === numericSize) || null;
    }
    
    getPriceByVariant(size) {
        const variant = this.getVariant(size);
        // Hiện tại không có giá riêng cho từng biến thể, chỉ trả về giá chung
        return this.price; 
    }

    
    getFormattedPrice(size = null) {
        const finalPrice = this.getPriceByVariant(size);
        return new Intl.NumberFormat('vi-VN').format(finalPrice); 
    }

    getDiscountPercent() {
        if (!this.oldPrice || this.oldPrice <= this.price) return 0;
        return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
    }
    isOnSale() {
        return this.oldPrice && this.oldPrice > this.price;
    }
    
    
    getFormattedOldPrice() {
        if (!this.oldPrice) return '';
        return new Intl.NumberFormat('vi-VN').format(this.oldPrice); 
    }
    
    getBadgeText() {
        if (!this.badge) return '';
        switch(this.badge.toLowerCase()) {
            case 'sale':
                return this.isOnSale() ? `-${this.getDiscountPercent()}%` : 'Sale';
            default:
                // Trả về chuỗi badge với ký tự đầu tiên viết hoa
                return this.badge.charAt(0).toUpperCase() + this.badge.slice(1);
        }
    }
    renderStars() {
        const rating = Math.round(this.rating) || 0;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            // Sử dụng font awesome 6 (hoặc 5)
            html += `<i class="${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star" aria-hidden="true"></i>`;
        }
        return html;
    }
    
    // --------------------------------------------------------------------
    // III. PHƯƠNG THỨC HỆ THỐNG 
    // --------------------------------------------------------------------

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            categoryId: this.categoryId, 
            price: this.price,
            oldPrice: this.oldPrice,
            img: this.img,
            images: this.images,
            rating: this.rating,
            ratingCount: this.ratingCount,
            badge: this.badge,
            description: this.description,
            costPrice: this.costPrice,
            initialStock: this.initialStock,
            lowStockThreshold: this.lowStockThreshold,
            imports: this.imports,
            sales: this.sales,
            isHidden: this.isHidden,
            variants: this.variants,
            // THÊM THUỘC TÍNH MỚI VÀO JSON ĐỂ LƯU
            targetProfitMargin: this.targetProfitMargin 
        };
    }

    static fromJSON(data) {
        return new Product(data);
    }
}