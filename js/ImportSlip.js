// File: js/ImportSlip.js - Model Phiếu Nhập & Import Manager

/**
 ImportSlip
  Đại diện cho một phiếu nhập hàng
 */
export class ImportSlip {
    constructor({
        id = null,
        slipNumber = '',
        productId = null,
        productName = '',
        variantSize = null,
        quantity = 0,
        importPrice = 0,
        totalValue = 0,
        supplier = '',
        note = '',
        createdDate = new Date().toISOString(),
        completedDate = null,
        status = 'DRAFT', 
        createdBy = 'Admin'
    }) {
        this.id = id;
        this.slipNumber = slipNumber;
        this.productId = productId;
        this.productName = productName;
        this.variantSize = variantSize;
        this.quantity = quantity;
        this.importPrice = importPrice;
        this.totalValue = totalValue || (quantity * importPrice);
        this.supplier = supplier;
        this.note = note;
        this.createdDate = createdDate;
        this.completedDate = completedDate;
        this.status = status;
        this.createdBy = createdBy;
    }

    /**
     * Chuyển đổi từ JSON sang ImportSlip instance
     */
    static fromJSON(json) {
        return new ImportSlip(json);
    }

    /**
     * Chuyển đổi ImportSlip sang JSON để lưu trữ
     */
    toJSON() {
        return {
            id: this.id,
            slipNumber: this.slipNumber,
            productId: this.productId,
            productName: this.productName,
            variantSize: this.variantSize,
            quantity: this.quantity,
            importPrice: this.importPrice,
            totalValue: this.totalValue,
            supplier: this.supplier,
            note: this.note,
            createdDate: this.createdDate,
            completedDate: this.completedDate,
            status: this.status,
            createdBy: this.createdBy
        };
    }

    /**
     * Kiểm tra phiếu nhập có thể sửa hay không
     */
    canEdit() {
        return this.status === 'DRAFT';
    }

    /**
     * Hoàn thành phiếu nhập
     */
    complete() {
        if (this.status === 'DRAFT') {
            this.status = 'COMPLETED';
            this.completedDate = new Date().toISOString();
            return true;
        }
        return false;
    }
}

/**
 ImportManager
 Quản lý danh sách phiếu nhập hàng
 */
export class ImportManager {
    constructor() {
        this.STORAGE_KEY = 'shoestore_import_slips';
        this.slips = this.loadSlips();
    }

    // ============================================================
    // LOAD & SAVE
    // ============================================================

    /**
     * Tải danh sách phiếu nhập từ localStorage
     */
    loadSlips() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const slipsData = JSON.parse(data);
                return slipsData.map(s => ImportSlip.fromJSON(s));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách phiếu nhập:', error);
        }
        return [];
    }

    /**
     * Lưu danh sách phiếu nhập vào localStorage
     */
    saveSlips() {
        try {
            const slipsData = this.slips.map(s => s.toJSON());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(slipsData));
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách phiếu nhập:', error);
            return false;
        }
    }

    // ============================================================
    // CRUD OPERATIONS
    // ============================================================

    /**
     * Tạo số phiếu nhập tự động (format: PN-YYYYMMDD-XXX)
     */
    generateSlipNumber() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Đếm số phiếu trong ngày
        const todaySlips = this.slips.filter(s => 
            s.createdDate.slice(0, 10) === now.toISOString().slice(0, 10)
        );
        
        const sequence = String(todaySlips.length + 1).padStart(3, '0');
        return `PN-${dateStr}-${sequence}`;
    }

    /**
     * Thêm phiếu nhập mới (Nháp)
     */
    addSlip(slipData) {
        const newId = this.slips.length > 0 
            ? Math.max(...this.slips.map(s => s.id)) + 1 
            : 1;

        const newSlip = new ImportSlip({
            ...slipData,
            id: newId,
            slipNumber: this.generateSlipNumber(),
            status: 'DRAFT',
            createdDate: new Date().toISOString()
        });

        this.slips.push(newSlip);
        this.saveSlips();
        return newSlip;
    }

    /**
     * Lấy phiếu nhập theo ID
     */
    getSlipById(id) {
        return this.slips.find(s => s.id === Number(id));
    }

    /**
     * Cập nhật phiếu nhập (chỉ khi còn ở trạng thái DRAFT)
     */
    updateSlip(id, updatedData) {
        const slip = this.getSlipById(id);
        if (!slip || !slip.canEdit()) {
            return false;
        }

        // Cập nhật các trường được phép
        const allowedFields = ['productId', 'productName', 'variantSize', 'quantity', 'importPrice', 'supplier', 'note'];
        allowedFields.forEach(field => {
            if (updatedData[field] !== undefined) {
                slip[field] = updatedData[field];
            }
        });

        // Tính lại tổng giá trị
        slip.totalValue = slip.quantity * slip.importPrice;

        this.saveSlips();
        return true;
    }

    /**
     * Xóa phiếu nhập (chỉ khi còn ở trạng thái DRAFT)
     */
    deleteSlip(id) {
        const slip = this.getSlipById(id);
        if (!slip || !slip.canEdit()) {
            return false;
        }

        const initialLength = this.slips.length;
        this.slips = this.slips.filter(s => s.id !== Number(id));

        if (this.slips.length < initialLength) {
            this.saveSlips();
            return true;
        }
        return false;
    }

    /**
     * Hoàn thành phiếu nhập
     */
    completeSlip(id) {
        const slip = this.getSlipById(id);
        if (!slip) {
            return { success: false, message: 'Không tìm thấy phiếu nhập' };
        }

        if (!slip.canEdit()) {
            return { success: false, message: 'Phiếu nhập đã được hoàn thành trước đó' };
        }

        slip.complete();
        this.saveSlips();

        return { success: true, slip };
    }

    // ============================================================
    // TÌM KIẾM & LỌC
    // ============================================================

    /**
     * Tìm kiếm và lọc phiếu nhập
     */
    searchSlips(filters = {}) {
        let results = [...this.slips];

        // Lọc theo trạng thái
        if (filters.status && filters.status !== 'ALL') {
            results = results.filter(s => s.status === filters.status);
        }

        // Lọc theo tên sản phẩm
        if (filters.productName && filters.productName.trim()) {
            const searchTerm = filters.productName.toLowerCase().trim();
            results = results.filter(s => 
                s.productName.toLowerCase().includes(searchTerm) ||
                s.slipNumber.toLowerCase().includes(searchTerm)
            );
        }

        // Lọc theo ngày tạo
        if (filters.fromDate) {
            results = results.filter(s => 
                new Date(s.createdDate) >= new Date(filters.fromDate)
            );
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999); // Bao gồm cả ngày cuối
            results = results.filter(s => 
                new Date(s.createdDate) <= toDate
            );
        }

        // Sắp xếp theo ngày tạo 
        results.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        return results;
    }

    /**
     * Lấy tất cả phiếu nhập
     */
    getAllSlips() {
        return [...this.slips].sort((a, b) => 
            new Date(b.createdDate) - new Date(a.createdDate)
        );
    }

    /**
     * Lấy phiếu nhập theo trạng thái
     */
    getSlipsByStatus(status) {
        return this.slips.filter(s => s.status === status);
    }

    // ============================================================
    // THỐNG KÊ
    // ============================================================

    /**
     * Tính tổng giá trị nhập trong khoảng thời gian
     */
    getTotalImportValue(fromDate = null, toDate = null) {
        let slips = this.slips.filter(s => s.status === 'COMPLETED');

        if (fromDate) {
            slips = slips.filter(s => new Date(s.completedDate) >= new Date(fromDate));
        }

        if (toDate) {
            const endDate = new Date(toDate);
            endDate.setHours(23, 59, 59, 999);
            slips = slips.filter(s => new Date(s.completedDate) <= endDate);
        }

        return slips.reduce((sum, slip) => sum + slip.totalValue, 0);
    }

    /**
     * Đếm số phiếu theo trạng thái
     */
    getSlipsCount() {
        return {
            total: this.slips.length,
            draft: this.slips.filter(s => s.status === 'DRAFT').length,
            completed: this.slips.filter(s => s.status === 'COMPLETED').length
        };
    }
}

// Export
export const importManager = new ImportManager();