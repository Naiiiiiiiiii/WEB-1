

class Category {
    constructor(id, name) { 
        this.id = id;
        this.name = name;
    }
}

class CategoryManager {
    constructor() {
        this.STORAGE_KEY = 'categories_shoestore';
        this.categories = this.taiDanhSachCategory();
        

        if (this.categories.length === 0) {
            this.categories = [

                new Category('C001', 'Giày Thể Thao'),
                new Category('C002', 'Giày Công Sở'),
                new Category('C003', 'Giày Casual'), 
            ];
            this.luuDanhSachCategory();
        }
    }

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

    luuDanhSachCategory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách Category:', error);
            return false;
        }
    }

    taoNewId() {
        const maxIdNum = this.categories.reduce((max, c) => {
            const num = parseInt(c.id.slice(1));
            return num > max ? num : max;
        }, 0);

        return 'C' + String(maxIdNum + 1).padStart(3, '0');
    }

    getAllCategories() {
        return this.categories;
    }

    
    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }
    
    
    getCategoryNameById(id) {
        const category = this.categories.find(c => c.id === id);
        return category ? category.name : 'Không rõ';
    }

    addCategory(name) {
        if (this.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return false;
        }
        const newCategory = new Category(this.taoNewId(), name);
        this.categories.push(newCategory);
        this.luuDanhSachCategory();
        return true;
    }

    updateCategory(id, newName) {
        const category = this.categories.find(c => c.id === id);
        if (category) {

             if (this.categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== id)) {
                 return false;
             }
            category.name = newName;
            this.luuDanhSachCategory();
            return true;
        }
        return false;
    }

    
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

const categoryManager = new CategoryManager();
export { Category, CategoryManager, categoryManager };