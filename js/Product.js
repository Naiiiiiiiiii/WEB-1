

export class Product {
    constructor(data) {

        this.id = data.id;
        this.name = data.name;
        this.categoryId = data.categoryId; 
        this.description = data.description || '';
        this.img = data.img || data.imageUrl; 
        this.images = data.images || [];

        this.variants = data.variants || []; 

        this.price = data.price; 
        this.oldPrice = data.oldPrice || null; 

        this.costPrice = data.costPrice || 0; 

        this.initialStock = data.initialStock || 0; 
        this.lowStockThreshold = data.lowStockThreshold || 5; 
        this.imports = data.imports || []; 
        this.sales = data.sales || []; 
        this.isHidden = data.isHidden || false; 

        this.targetProfitMargin = data.targetProfitMargin || null;

        this.rating = data.rating || 0;
        this.ratingCount = data.ratingCount || 0;
        this.badge = data.badge || null;
    }

    
    getCurrentStock() {
        if (this.variants && this.variants.length > 0) {

            return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        }

        return this.initialStock || 0; 
    }
    
    isLowStock() {
        if (this.variants.length > 0) {

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

    getAvailableSizes() {
        if (this.variants.length === 0) return [];
        const sizes = this.variants
            .filter(v => (v.stock || 0) > 0)
            .map(v => v.size)
            .filter(s => s !== undefined && s !== null);
            

        return [...new Set(sizes)].map(s => Number(s)).sort((a, b) => a - b); 
    }
    
    getVariant(size) {
        const numericSize = Number(size); 
        return this.variants.find(v => Number(v.size) === numericSize) || null;
    }
    
    getPriceByVariant(size) {
        const variant = this.getVariant(size);

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

                return this.badge.charAt(0).toUpperCase() + this.badge.slice(1);
        }
    }
    renderStars() {
        const rating = Math.round(this.rating) || 0;
        let html = '';
        for (let i = 1; i <= 5; i++) {

            html += `<i class="${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star" aria-hidden="true"></i>`;
        }
        return html;
    }
    

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

            targetProfitMargin: this.targetProfitMargin 
        };
    }

    static fromJSON(data) {
        return new Product(data);
    }
}