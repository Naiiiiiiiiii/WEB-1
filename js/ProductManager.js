
import { Product } from './Product.js';
import { productDataList } from './productData.js'; 
import { categoryManager } from './category.js'; 

export class ProductManager {
    constructor() {
        this.STORAGE_KEY = 'shoestore_products';
        this.products = this.loadProducts();
    }
    

    getCategoryName(categoryId) {
        return categoryManager.getCategoryNameById(categoryId);
    }

    /**
     * Lấy tất cả danh mục từ categoryManager
     * @returns {Array} Danh sách categories
     */
    getAllCategories() {
        return categoryManager.getAllCategories();
    }

    /**
     * Alias của saveProducts() để tương thích
     */
    saveAllProducts() {
        return this.saveProducts();
    }

    loadProducts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const productsData = JSON.parse(data);
                return productsData.map(p => Product.fromJSON(p));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
        }
        

        return productDataList.map((data, index) => new Product({
            id: data.id || index + 1, 
            ...data,
            variants: data.variants || [], 
            costPrice: data.costPrice || data.price * 0.7 
        }));
    }

    saveProducts() {
        try {
            const productsData = this.products.map(p => p.toJSON());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productsData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách sản phẩm:', error);
            return false;
        }
    }

    getProductById(id) {

        return this.products.find(p => p.id === Number(id));
    }

    getAllProducts(includeHidden = false) {
        if (includeHidden) {
            return this.products;
        }
        return this.products.filter(p => !p.isHidden);
    }
    
    getVisibleProducts() {
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