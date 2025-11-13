// File: category.js
// Mục đích: Quản lý danh mục sản phẩm (Category Management)
// Bao gồm: Class Category, CategoryManager với CRUD operations

// Class Category: Định nghĩa cấu trúc một danh mục
class Category {
    // Constructor: Khởi tạo danh mục với ID và tên
    // @param id: ID danh mục (format: C001, C002...)
    // @param name: Tên danh mục (VD: "Giày Thể Thao")
    constructor(id, name) { 
        this.id = id;      // ID duy nhất của danh mục
        this.name = name;  // Tên hiển thị của danh mục
    }
}

// Class CategoryManager: Quản lý toàn bộ danh sách danh mục
class CategoryManager {
    // Constructor: Khởi tạo manager và load dữ liệu
    constructor() {
        // Key để lưu danh mục trong localStorage
        this.STORAGE_KEY = 'categories_shoestore';
        
        // Tải danh sách danh mục từ localStorage
        this.categories = this.taiDanhSachCategory();
        
        // Nếu chưa có danh mục nào (lần đầu chạy app)
        if (this.categories.length === 0) {
            // Tạo các danh mục mặc định
            this.categories = [
                new Category('C001', 'Giày Thể Thao'),  // Danh mục 1
                new Category('C002', 'Giày Công Sở'),   // Danh mục 2
                new Category('C003', 'Giày Casual'),    // Danh mục 3
            ];
            
            // Lưu danh mục mặc định vào localStorage
            this.luuDanhSachCategory();
        }
    }

    // Phương thức: Tải danh sách danh mục từ localStorage
    // @return: Mảng Category objects hoặc mảng rỗng nếu lỗi
    taiDanhSachCategory() {
        try {
            // Đọc dữ liệu từ localStorage
            const data = localStorage.getItem(this.STORAGE_KEY);
            
            if (data) {
                // Parse JSON thành array
                const categoriesData = JSON.parse(data);
                
                // Convert mỗi plain object thành Category instance
                return categoriesData.map(c => new Category(c.id, c.name)); 
            }
        } catch (error) {
            // Log lỗi nếu có vấn đề parse
            console.error('Lỗi khi tải danh sách Category:', error);
        }
        
        // Trả về mảng rỗng nếu không có data hoặc lỗi
        return [];
    }

    // Phương thức: Lưu danh sách danh mục vào localStorage
    // @return: true nếu thành công, false nếu lỗi
    luuDanhSachCategory() {
        try {
            // Convert array thành JSON và lưu vào localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories));
            return true;
        } catch (error) {
            // Log lỗi nếu localStorage đầy hoặc lỗi khác
            console.error('Lỗi khi lưu danh sách Category:', error);
            return false;
        }
    }

    // Phương thức: Tạo ID mới cho danh mục
    // Format: C001, C002, C003... (C + số 3 chữ số)
    // @return: ID mới (String)
    taoNewId() {
        // Tìm số lớn nhất trong các ID hiện có
        // VD: C001 → 1, C002 → 2, C010 → 10
        const maxIdNum = this.categories.reduce((max, c) => {
            // Lấy phần số từ ID (slice(1) bỏ chữ C đầu)
            const num = parseInt(c.id.slice(1));
            
            // So sánh và giữ số lớn nhất
            return num > max ? num : max;
        }, 0);  // Bắt đầu từ 0

        // Tạo ID mới: C + (số lớn nhất + 1) với padding 3 chữ số
        // VD: maxIdNum=10 → 11 → "011" → "C011"
        return 'C' + String(maxIdNum + 1).padStart(3, '0');
    }

    // Phương thức: Lấy tất cả danh mục
    // @return: Mảng tất cả Category objects
    getAllCategories() {
        return this.categories;
    }

    // Phương thức: Lấy danh mục theo ID
    // @param id: ID của danh mục cần tìm
    // @return: Category object hoặc undefined nếu không tìm thấy
    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }
    
    // Phương thức: Lấy tên danh mục theo ID
    // @param id: ID của danh mục
    // @return: Tên danh mục (String) hoặc "Không rõ" nếu không tìm thấy
    getCategoryNameById(id) {
        // Tìm danh mục theo ID
        const category = this.categories.find(c => c.id === id);
        
        // Trả về tên nếu tìm thấy, ngược lại trả về "Không rõ"
        return category ? category.name : 'Không rõ';
    }

    // Phương thức: Thêm danh mục mới
    // @param name: Tên danh mục mới
    // @return: true nếu thành công, false nếu tên đã tồn tại
    addCategory(name) {
        // Kiểm tra xem tên danh mục đã tồn tại chưa (case-insensitive)
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return false;  // Tên đã tồn tại, không cho phép trùng
        }
        
        // Tạo danh mục mới với ID tự động generate
        const newCategory = new Category(this.taoNewId(), name);
        
        // Thêm vào mảng
        this.categories.push(newCategory);
        
        // Lưu vào localStorage
        this.luuDanhSachCategory();
        
        return true;  // Thêm thành công
    }

    // Phương thức: Cập nhật tên danh mục
    // @param id: ID của danh mục cần update
    // @param newName: Tên mới
    // @return: true nếu thành công, false nếu không tìm thấy hoặc tên trùng
    updateCategory(id, newName) {
        // Tìm danh mục theo ID
        const category = this.categories.find(c => c.id === id);
        
        if (category) {
            // Kiểm tra tên mới có trùng với danh mục khác không
            // (không tính danh mục hiện tại - c.id !== id)
            if (this.categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== id)) {
                return false;  // Tên trùng với danh mục khác
            }
            
            // Cập nhật tên mới
            category.name = newName;
            
            // Lưu vào localStorage
            this.luuDanhSachCategory();
            
            return true;  // Cập nhật thành công
        }
        
        return false;  // Không tìm thấy danh mục
    }

    // Phương thức: Xóa danh mục
    // @param id: ID của danh mục cần xóa
    // @return: true nếu xóa thành công, false nếu không tìm thấy
    deleteCategory(id) {
        // Lưu độ dài ban đầu để kiểm tra xem có xóa được không
        const initialLength = this.categories.length;
        
        // Lọc bỏ danh mục có ID khớp
        this.categories = this.categories.filter(c => c.id !== id);
        
        // Nếu độ dài giảm đi (có danh mục bị xóa)
        if (this.categories.length < initialLength) {
            // Lưu vào localStorage
            this.luuDanhSachCategory();
            
            return true;  // Xóa thành công
        }
        
        return false;  // Không tìm thấy danh mục để xóa
    }
}

// Tạo singleton instance của CategoryManager
// Tất cả file khác sẽ dùng chung instance này
const categoryManager = new CategoryManager();

// Export các class và instance để sử dụng trong file khác
export { Category, CategoryManager, categoryManager };
