// File: js/category.js - Quản lý Danh mục/Loại Sản phẩm (ĐÃ SỬA: Thay Ẩn bằng Xóa)

// Định nghĩa Category Model
class Category {
    constructor(id, name) { 
        this.id = id; // Ví dụ: C001
        this.name = name; // Ví dụ: Giày Thể Thao
    }
}

// Quản lý danh sách Category
class CategoryManager {
    constructor() {
        this.STORAGE_KEY = 'categories_shoestore';
        this.categories = this.taiDanhSachCategory();
        
        // Tạo dữ liệu mẫu nếu chưa có
        if (this.categories.length === 0) {
            this.categories = [
                // ⚠️ Dữ liệu mẫu không còn isHidden
                new Category('C001', 'Giày Thể Thao'),
                new Category('C002', 'Giày Công Sở'),
                new Category('C003', 'Giày Casual'), 
            ];
            this.luuDanhSachCategory();
        }
    }

    // Tải danh sách từ Local Storage
    taiDanhSachCategory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const categoriesData = JSON.parse(data);
                return categoriesData.map(c => new Category(c.id, c.name)); 
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách Category:', error);
        }
        return [];
    }

    // Lưu danh sách vào Local Storage
    luuDanhSachCategory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách Category:', error);
            return false;
        }
    }

    // Tạo ID mới tự động
    taoNewId() {
        const maxIdNum = this.categories.reduce((max, c) => {
            const num = parseInt(c.id.slice(1));
            return num > max ? num : max;
        }, 0);

        return 'C' + String(maxIdNum + 1).padStart(3, '0');
    }

    // CRUD CƠ BẢN

    // 1. Lấy tất cả (Không còn tham số includeHidden)
    getAllCategories() {
        return this.categories;
    }

    /**
     * @description BỔ SUNG: Tra cứu Đối tượng Category bằng ID
     * @param {string} id - ID của danh mục (ví dụ: 'C001').
     * @returns {Category | undefined} Đối tượng Category hoặc undefined
     */
    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }
    
    /**
     Tra cứu Tên danh mục bằng ID
     ID của danh mục (ví dụ: 'C001').
     Tên danh mục hoặc 'Không rõ'
     */
    getCategoryNameById(id) {
        const category = this.categories.find(c => c.id === id);
        return category ? category.name : 'Không rõ';
    }

    // 2. Thêm mới
    addCategory(name) {
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return false; // Tên đã tồn tại
        }
        const newCategory = new Category(this.taoNewId(), name);
        this.categories.push(newCategory);
        this.luuDanhSachCategory();
        return true;
    }

    // 3. Cập nhật (Sửa)
    updateCategory(id, newName) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
             // Kiểm tra trùng tên (loại trừ chính nó)
             if (this.categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== id)) {
                 return false; // Tên đã tồn tại
             }
            category.name = newName;
            this.luuDanhSachCategory();
            return true;
        }
        return false;
    }

    /**
     PHƯƠNG THỨC MỚI: Xóa hẳn danh mục khỏi danh sách.
      - ID của danh mục cần xóa.
     */
    deleteCategory(id) {
        const initialLength = this.categories.length;
        this.categories = this.categories.filter(c => c.id !== id);
        
        if (this.categories.length < initialLength) {
            this.luuDanhSachCategory();
            return true;
        }
        return false;
    }
}

// KHAI BÁO INSTANCE & EXPORT
const categoryManager = new CategoryManager();
export { Category, CategoryManager, categoryManager };