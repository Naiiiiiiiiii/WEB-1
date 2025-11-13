// Class Product: Định nghĩa cấu trúc và phương thức cho một sản phẩm giày
export class Product {
    // Constructor: Khởi tạo đối tượng Product với dữ liệu từ tham số data
    constructor(data) {
        // Gán ID duy nhất cho sản phẩm
        this.id = data.id;
        
        // Tên sản phẩm (VD: "Giày Nike Air Max")
        this.name = data.name;
        
        // ID của danh mục sản phẩm (VD: 1 = Giày thể thao, 2 = Giày công sở)
        this.categoryId = data.categoryId; 
        
        // Mô tả chi tiết về sản phẩm, nếu không có thì để chuỗi rỗng
        this.description = data.description || '';
        
        // Đường dẫn ảnh đại diện chính của sản phẩm
        this.img = data.img || data.imageUrl; 
        
        // Mảng chứa các ảnh phụ của sản phẩm để hiển thị nhiều góc nhìn
        this.images = data.images || [];

        // Các biến thể của sản phẩm (theo size, màu sắc)
        // Mỗi variant có: size, color, stock (số lượng tồn kho)
        this.variants = data.variants || []; 

        // Giá bán hiện tại của sản phẩm (VND)
        this.price = data.price; 
        
        // Giá cũ trước khi giảm giá (để hiển thị % giảm giá)
        this.oldPrice = data.oldPrice || null; 

        // Giá vốn của sản phẩm (dùng để tính lợi nhuận)
        this.costPrice = data.costPrice || 0; 

        // Số lượng tồn kho ban đầu khi nhập hàng
        this.initialStock = data.initialStock || 0; 
        
        // Ngưỡng cảnh báo hết hàng (VD: 5 = cảnh báo khi còn ≤5 sản phẩm)
        this.lowStockThreshold = data.lowStockThreshold || 5; 
        
        // Mảng lưu lịch sử nhập hàng [{date, qty, costPrice}, ...]
        this.imports = data.imports || []; 
        
        // Mảng lưu lịch sử bán hàng [{date, qty, price}, ...]
        this.sales = data.sales || []; 
        
        // Trạng thái ẩn sản phẩm (true = không hiển thị cho khách hàng)
        this.isHidden = data.isHidden || false; 

        // Tỷ lệ lợi nhuận mục tiêu (%) mà admin muốn đạt được
        this.targetProfitMargin = data.targetProfitMargin || null;

        // Điểm đánh giá trung bình của sản phẩm (từ 0-5 sao)
        this.rating = data.rating || 0;
        
        // Số lượng người đã đánh giá sản phẩm
        this.ratingCount = data.ratingCount || 0;
        
        // Nhãn hiệu sản phẩm (VD: "sale", "new", "hot")
        this.badge = data.badge || null;
    }

    // Phương thức: Lấy tổng số lượng tồn kho hiện tại của sản phẩm
    getCurrentStock() {
        // Nếu sản phẩm có nhiều biến thể (variants)
        if (this.variants && this.variants.length > 0) {
            // Tính tổng tồn kho của tất cả các biến thể
            // reduce() cộng dồn stock của từng variant
            return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }
        // Nếu không có variants, trả về tồn kho ban đầu
        return this.initialStock || 0; 
    }
    
    // Phương thức: Kiểm tra xem sản phẩm có sắp hết hàng không
    isLowStock() {
        // Nếu có variants, kiểm tra xem có variant nào sắp hết hàng không
        if (this.variants.length > 0) {
            // some() trả về true nếu ít nhất 1 variant có stock <= ngưỡng
            return this.variants.some(v => (v.stock || 0) <= this.lowStockThreshold);
        }
        // Nếu không có variants, so sánh tồn kho tổng với ngưỡng
        return this.getCurrentStock() <= this.lowStockThreshold;
    }
    
    // Phương thức: Tính % lợi nhuận dựa trên giá bán và giá vốn
    getProfitMarginPercent() {
        // Nếu không có giá vốn hoặc giá vốn = 0 thì không tính được
        if (this.costPrice <= 0) return 'N/A';
        
        // Tính khoản lãi = giá bán - giá vốn
        const margin = this.price - this.costPrice;
        
        // Công thức: % lợi nhuận = (lãi / giá vốn) × 100
        return `${Math.round((margin / this.costPrice) * 100)}%`;
    }

    // Phương thức: Lấy lịch sử nhập/xuất hàng trong khoảng thời gian
    getStockInOutHistory(startDate, endDate) {
        // Chuyển đổi ngày bắt đầu thành đối tượng Date
        const start = new Date(startDate);

        // Chuyển đổi ngày kết thúc và thêm 86399999ms (gần 24h) để bao gồm cả ngày cuối
        // 86399999ms = 23h 59m 59s 999ms
        const end = new Date(new Date(endDate).getTime() + 86399999); 
    
        // Tính tổng số lượng nhập trong khoảng thời gian
        const importQty = this.imports.reduce((sum, item) => {
            const itemDate = new Date(item.date);
            // Chỉ cộng số lượng nếu ngày nhập nằm trong khoảng start-end
            if (itemDate >= start && itemDate <= end) return sum + item.qty;
            return sum;
        }, 0);
    
        // Tính tổng số lượng bán trong khoảng thời gian
        const saleQty = this.sales.reduce((sum, item) => {
            const itemDate = new Date(item.date);
            // Chỉ cộng số lượng nếu ngày bán nằm trong khoảng start-end
            if (itemDate >= start && itemDate <= end) return sum + item.qty;
            return sum;
        }, 0);
    
        // Trả về object chứa số lượng nhập, xuất và tồn kho hiện tại
        return {
            importQty: importQty,    // Tổng số lượng nhập
            saleQty: saleQty,        // Tổng số lượng bán
            currentStock: this.getCurrentStock()  // Tồn kho hiện tại
        };
    }

    // Phương thức: Lấy danh sách các size còn hàng
    getAvailableSizes() {
        // Nếu không có variants, trả về mảng rỗng
        if (this.variants.length === 0) return [];
        
        // Lọc và xử lý danh sách sizes
        const sizes = this.variants
            .filter(v => (v.stock || 0) > 0)  // Chỉ lấy variants còn hàng (stock > 0)
            .map(v => v.size)                 // Lấy giá trị size từ mỗi variant
            .filter(s => s !== undefined && s !== null);  // Loại bỏ size null/undefined
            
        // Sử dụng Set để loại bỏ size trùng lặp, chuyển sang số và sắp xếp tăng dần
        return [...new Set(sizes)].map(s => Number(s)).sort((a, b) => a - b); 
    }
    
    // Phương thức: Tìm variant theo size cụ thể
    getVariant(size) {
        // Chuyển size sang dạng số để so sánh chính xác
        const numericSize = Number(size); 
        // Tìm variant có size khớp, trả về null nếu không tìm thấy
        return this.variants.find(v => Number(v.size) === numericSize) || null;
    }
    
    // Phương thức: Lấy giá theo variant (hiện tại giá thống nhất cho tất cả size)
    getPriceByVariant(size) {
        // Tìm variant theo size (có thể mở rộng để có giá khác nhau theo size)
        const variant = this.getVariant(size);
        // Hiện tại trả về giá chung của sản phẩm
        return this.price; 
    }

    // Phương thức: Định dạng giá tiền theo chuẩn Việt Nam (VD: 1.000.000)
    getFormattedPrice(size = null) {
        // Lấy giá cuối cùng theo size (nếu có)
        const finalPrice = this.getPriceByVariant(size);
        // Sử dụng Intl.NumberFormat để format số theo locale vi-VN (dấu chấm ngăn cách)
        return new Intl.NumberFormat('vi-VN').format(finalPrice); 
    }

    // Phương thức: Tính % giảm giá so với giá cũ
    getDiscountPercent() {
        // Nếu không có giá cũ hoặc giá cũ <= giá hiện tại thì không giảm giá
        if (!this.oldPrice || this.oldPrice <= this.price) return 0;
        // Công thức: % giảm = (giá cũ - giá mới) / giá cũ × 100
        return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
    }
    
    // Phương thức: Kiểm tra xem sản phẩm có đang sale không
    isOnSale() {
        // Trả về true nếu có giá cũ và giá cũ > giá hiện tại
        return this.oldPrice && this.oldPrice > this.price;
    }
    
    // Phương thức: Định dạng giá cũ theo chuẩn VN
    getFormattedOldPrice() {
        // Nếu không có giá cũ, trả về chuỗi rỗng
        if (!this.oldPrice) return '';
        // Format giá cũ theo locale vi-VN
        return new Intl.NumberFormat('vi-VN').format(this.oldPrice); 
    }
    
    // Phương thức: Lấy text hiển thị cho badge (nhãn sản phẩm)
    getBadgeText() {
        // Nếu không có badge, trả về chuỗi rỗng
        if (!this.badge) return '';
        
        // Xử lý theo loại badge
        switch(this.badge.toLowerCase()) {
            case 'sale':
                // Nếu badge là "sale", hiển thị % giảm giá hoặc text "Sale"
                return this.isOnSale() ? `-${this.getDiscountPercent()}%` : 'Sale';
            default:
                // Các badge khác: viết hoa chữ cái đầu (VD: "new" -> "New")
                return this.badge.charAt(0).toUpperCase() + this.badge.slice(1);
        }
    }
    
    // Phương thức: Render HTML hiển thị rating dạng sao (★★★★☆)
    renderStars() {
        // Làm tròn điểm rating, nếu không có thì = 0
        const rating = Math.round(this.rating) || 0;
        let html = '';
        
        // Vòng lặp từ 1 đến 5 để tạo 5 ngôi sao
        for (let i = 1; i <= 5; i++) {
            // Nếu i <= rating thì dùng sao đầy (fa-solid), không thì dùng sao rỗng (fa-regular)
            html += `<i class="${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star" aria-hidden="true"></i>`;
        }
        return html;
    }
    // Phương thức: Chuyển đổi object Product thành JSON để lưu vào localStorage
    toJSON() {
        // Trả về object chứa tất cả thuộc tính của Product
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
            targetProfitMargin: this.targetProfitMargin 
        };
    }

    // Phương thức static: Tạo Product object từ dữ liệu JSON
    // Static method nên gọi qua class: Product.fromJSON(data)
    static fromJSON(data) {
        // Tạo và trả về instance mới của Product từ data
        return new Product(data);
    }
}