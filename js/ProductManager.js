// Import class Product để tạo và quản lý các đối tượng sản phẩm
import { Product } from './Product.js';

// Import dữ liệu sản phẩm mẫu ban đầu từ file productData.js
import { productDataList } from './productData.js'; 

// Import categoryManager để lấy tên danh mục từ ID
import { categoryManager } from './category.js'; 

// Class ProductManager: Quản lý toàn bộ danh sách sản phẩm
export class ProductManager {
    // Constructor: Khởi tạo ProductManager
    constructor() {
        // Key để lưu/đọc dữ liệu sản phẩm từ localStorage
        this.STORAGE_KEY = 'shoestore_products';
        
        // Tải danh sách sản phẩm từ localStorage hoặc dữ liệu mẫu
        this.products = this.loadProducts();
    }
    
    // Phương thức: Lấy tên danh mục từ categoryId
    getCategoryName(categoryId) {
        // Gọi hàm từ categoryManager để convert ID thành tên
        return categoryManager.getCategoryNameById(categoryId);
    }

    // Phương thức: Tải danh sách sản phẩm từ localStorage
    loadProducts() {
        try {
            // Đọc dữ liệu từ localStorage
            const data = localStorage.getItem(this.STORAGE_KEY);
            
            // Nếu có dữ liệu đã lưu
            if (data) {
                // Parse JSON string thành array
                const productsData = JSON.parse(data);
                
                // Chuyển đổi mỗi object thành instance của class Product
                return productsData.map(p => Product.fromJSON(p));
            }
        } catch (error) {
            // Log lỗi nếu có vấn đề khi đọc/parse dữ liệu
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        }
        
        // Nếu không có dữ liệu trong localStorage, dùng dữ liệu mẫu
        // Tạo instance Product cho mỗi item trong productDataList
        return productDataList.map((data, index) => new Product({
            id: data.id || index + 1,  // Tạo ID nếu chưa có
            ...data,  // Spread toàn bộ thuộc tính từ data
            variants: data.variants || [],  // Đảm bảo có mảng variants
            costPrice: data.costPrice || data.price * 0.7  // Ước tính giá vốn = 70% giá bán
        }));
    }

    // Phương thức: Lưu danh sách sản phẩm vào localStorage
    saveProducts() {
        try {
            // Chuyển đổi tất cả Product instances thành plain objects
            const productsData = this.products.map(p => p.toJSON());
            
            // Lưu vào localStorage dưới dạng JSON string
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
            
            // Trả về true nếu lưu thành công
            return true;
        } catch (error) {
            // Log lỗi nếu có vấn đề (VD: localStorage đầy)
            console.error('Lỗi khi lưu danh sách sản phẩm:', error);
            return false;
        }
    }

    // Phương thức: Tìm sản phẩm theo ID
    getProductById(id) {
        // Dùng find() để tìm sản phẩm có id khớp (chuyển về Number để so sánh)
        return this.products.find(p => p.id === Number(id));
    }

    // Phương thức: Lấy tất cả sản phẩm (có thể bao gồm sản phẩm bị ẩn)
    getAllProducts(includeHidden = false) {
        // Nếu includeHidden = true, trả về tất cả
        if (includeHidden) {
            return this.products;
        }
        // Ngược lại, chỉ trả về sản phẩm chưa bị ẩn (isHidden = false)
        return this.products.filter(p => !p.isHidden);
    }
    
    // Phương thức: Lấy danh sách sản phẩm hiển thị (không bị ẩn)
    getVisibleProducts() {
        // Lọc và chỉ trả về các sản phẩm có isHidden = false
        return this.products.filter(p => !p.isHidden);
    }

    updateProduct(id, updatedData) {
        const productIndex = this.products.findIndex(p => p.id === Number(id));
        if (productIndex === -1) return false;

        const currentProduct = this.products[productIndex];
        

        const newProductData = { ...currentProduct.toJSON(), ...updatedData };
        this.products[productIndex] = new Product(newProductData);

        this.saveProducts();
        return true;
    }

    addProduct(productData) {
        const newId = this.products.length > 0 
            ? Math.max(...this.products.map(p => p.id)) + 1 
            : 1;

        const newProduct = new Product({
            ...productData,
            id: newId,
            sales: [],
            imports: [],
            initialStock: productData.initialStock || (productData.variants ? 0 : 0), 
            isHidden: false,
            variants: productData.variants || []
        });

        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    toggleHideStatus(id) {
        const product = this.getProductById(id);
        if (product) {
            product.isHidden = !product.isHidden;
            this.saveProducts();
            return true;
        }
        return false;
    }

    deleteProduct(id) {

        const productIdNum = Number(id); 
        const initialLength = this.products.length;
        

        this.products = this.products.filter(p => p.id !== productIdNum); 
        
        if (this.products.length < initialLength) {
            this.saveProducts();
            return true;
        }
        return false;
    }

    
    processProductImport(productId, quantity, importPrice, size = null, note = "") {
        const product = this.getProductById(productId);

        if (product && quantity > 0 && importPrice > 0) {
            if (product.variants.length > 0 && size !== null) {

                const variant = product.variants.find(v => Number(v.size) === Number(size));
                if (variant) {
                    variant.stock = (variant.stock || 0) + quantity;
                } else {

                    product.variants.push({ size: size, stock: quantity });
                }
            } else {

                if (product.variants.length === 0) {
                    product.initialStock = (product.initialStock || 0) + quantity;
                }
            }
            

            product.costPrice = importPrice; 
            

            product.imports.push({ 
                date: new Date().toISOString(), 
                qty: quantity, 
                costPrice: importPrice, 
                note: note || "Nhập hàng thủ công" + (size ? ` (Size: ${size})` : ""), 
                type: "IMPORT",
                variantSize: size 
            });

            this.saveProducts();
            return true;
        }
        return false;
    }
    

    
    decreaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {

            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant && variant.stock >= quantity) {
                variant.stock -= quantity;
                success = true;
            }
        } else {

            if (product.initialStock >= quantity) {
                product.initialStock -= quantity;
                success = true;
            }
        }

        if (success) {

            product.sales.push({ 
                date: new Date().toISOString(), 
                qty: quantity, 
                type: "SALE",
                variantSize: size 
            });
            this.saveProducts();
        }
        return success;
    }

    
    increaseStock(productId, quantity, size = null) {
        const product = this.getProductById(productId);
        if (!product || quantity <= 0) return false;

        let success = false;

        if (product.variants && product.variants.length > 0) {

            const variant = product.variants.find(v => Number(v.size) === Number(size));
            if (variant) {
                variant.stock += quantity;
                success = true;
            }
        } else {

            product.initialStock += quantity;
            success = true;
        }

        if (success) {

            this.saveProducts();
        }
        return success;
    }

    
    updateProductPriceByMargin(id, newMarginPercent) {
        const product = this.getProductById(id);
        if (!product) return false;
        
        const margin = Number(newMarginPercent);
        if (isNaN(margin) || margin <= 0 || margin >= 100) {
             console.error('Tỉ lệ lợi nhuận không hợp lệ. Phải là số > 0 và < 100.');
             return false;
        }

        if (product.costPrice <= 0) {
            console.error('Không thể cập nhật giá khi Giá vốn = 0');
            return false;
        }
        

        const newSalePrice = product.costPrice / (1 - (margin / 100));
        

        const roundedPrice = Math.round(newSalePrice / 1000) * 1000;

        product.price = roundedPrice;
        product.targetProfitMargin = margin;

        this.saveProducts();
        return true;
    }

    
    advancedSearch(name = '', category = 'All', minPrice = 0, maxPrice = Infinity) {
        let results = this.getVisibleProducts();
        const searchName = name.toLowerCase().trim();
        const minP = Number(minPrice);
        const maxP = Number(maxPrice);

        results = results.filter(product => {
            const nameMatch = searchName === '' || product.name.toLowerCase().includes(searchName);

            const categoryMatch = category === 'All' || this.getCategoryName(product.categoryId) === category; 
            const priceMatch = product.price >= minP && product.price <= maxP;
            return nameMatch && categoryMatch && priceMatch;
        });

        return results;
    }
}

export const productManager = new ProductManager();