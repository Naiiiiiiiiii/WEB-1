import { syncToStorage } from "./admin.js";

export class ImportSlip {
  constructor({
    id = null,
    slipNumber = "",
    items = null,
    productId = null,
    productName = "",
    variantSize = null,
    quantity = 0,
    importPrice = 0,
    totalValue = 0,
    supplier = "",
    note = "",
    createdDate = new Date().toISOString(),
    completedDate = null,
    status = "DRAFT",
    createdBy = "Admin",
  }) {
    this.id = id;
    this.slipNumber = slipNumber;
    
    if (Array.isArray(items) && items.length > 0) {
      this.items = items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        variantSize: it.variantSize ?? null,
        quantity: Number(it.quantity) || 0,
        importPrice: Number(it.importPrice) || 0,
        totalValue: it.totalValue || Number(it.quantity) * Number(it.importPrice),
      }));
    } else if (productId) {
      this.items = [
        {
          productId,
          productName,
          variantSize: variantSize ?? null,
          quantity: Number(quantity) || 0,
          importPrice: Number(importPrice) || 0,
          totalValue: totalValue || Number(quantity) * Number(importPrice),
        },
      ];
    } else {
      this.items = [];
    }

    this.productId = this.items[0]?.productId ?? null;
    this.productName = this.items[0]?.productName ?? "";
    this.variantSize = this.items[0]?.variantSize ?? null;
    this.quantity = this.items[0]?.quantity ?? 0;
    this.importPrice = this.items[0]?.importPrice ?? 0;
    this.totalValue = totalValue || this.items.reduce(
      (s, it) => s + (it.totalValue || it.quantity * it.importPrice), 0
    );
    
    this.supplier = supplier;
    this.note = note;
    this.createdDate = createdDate;
    this.completedDate = completedDate;
    this.status = status;
    this.createdBy = createdBy;
  }

  static fromJSON(json) {
    return new ImportSlip(json);
  }

  toJSON() {
    return {
      id: this.id,
      slipNumber: this.slipNumber,
      items: this.items,
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
      createdBy: this.createdBy,
    };
  }

  canEdit() {
    return this.status === "DRAFT";
  }

  complete() {
    if (this.status === "DRAFT") {
      this.status = "COMPLETED";
      this.completedDate = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export class ImportManager {
  constructor() {
    this.STORAGE_KEY = "shoestore_import_slips";
    this.slips = this.loadSlips();
  }

  loadSlips() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const slipsData = JSON.parse(data);
        return slipsData.map((s) => ImportSlip.fromJSON(s));
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách phiếu nhập:", error);
    }
    return [];
  }

  saveSlips() {
    try {
      const slipsData = this.slips.map((s) => s.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(slipsData));
      syncToStorage("importSlips", slipsData);
      console.log("✅ Đã lưu phiếu nhập:", slipsData.length, "phiếu");
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu danh sách phiếu nhập:", error);
      return false;
    }
  }

  generateSlipNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");

    const todaySlips = this.slips.filter(
      (s) => s.createdDate.slice(0, 10) === now.toISOString().slice(0, 10)
    );

    const sequence = String(todaySlips.length + 1).padStart(3, "0");
    return `PN-${dateStr}-${sequence}`;
  }

  addSlip(slipData) {
    const newId = this.slips.length > 0 
      ? Math.max(...this.slips.map((s) => s.id)) + 1 
      : 1;

    const prepared = {};
    if (Array.isArray(slipData.items) && slipData.items.length > 0) {
      prepared.items = slipData.items;
    } else if (slipData.productId) {
      prepared.items = [
        {
          productId: slipData.productId,
          productName: slipData.productName || "",
          variantSize: slipData.variantSize ?? null,
          quantity: slipData.quantity || 0,
          importPrice: slipData.importPrice || 0,
          totalValue: slipData.totalValue || (slipData.quantity || 0) * (slipData.importPrice || 0),
        },
      ];
    } else {
      prepared.items = [];
    }

    const newSlip = new ImportSlip({
      ...slipData,
      ...prepared,
      id: newId,
      slipNumber: this.generateSlipNumber(),
      status: "DRAFT",
      createdDate: new Date().toISOString(),
    });

    this.slips.push(newSlip);
    this.saveSlips();
    return newSlip;
  }

  getSlipById(id) {
    return this.slips.find((s) => s.id === Number(id));
  }

  updateSlip(id, updatedData) {
    const slip = this.getSlipById(id);
    if (!slip || !slip.canEdit()) {
      return false;
    }

    if (Array.isArray(updatedData.items)) {
      slip.items = updatedData.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        variantSize: it.variantSize ?? null,
        quantity: Number(it.quantity) || 0,
        importPrice: Number(it.importPrice) || 0,
        totalValue: it.totalValue || Number(it.quantity) * Number(it.importPrice),
      }));
    } else {
      if (!Array.isArray(slip.items) || slip.items.length === 0)
        slip.items = [{}];
      const item = slip.items[0];
      const allowedItemFields = [
        "productId",
        "productName",
        "variantSize",
        "quantity",
        "importPrice",
      ];
      allowedItemFields.forEach((f) => {
        if (updatedData[f] !== undefined) item[f] = updatedData[f];
      });
      item.totalValue = item.quantity * item.importPrice;
    }

    slip.totalValue = slip.items.reduce(
      (s, it) => s + (it.totalValue || it.quantity * it.importPrice), 0
    );
    slip.supplier = updatedData.supplier !== undefined 
      ? updatedData.supplier 
      : slip.supplier;
    slip.note = updatedData.note !== undefined 
      ? updatedData.note 
      : slip.note;

    slip.productId = slip.items[0]?.productId ?? null;
    slip.productName = slip.items[0]?.productName ?? "";
    slip.variantSize = slip.items[0]?.variantSize ?? null;
    slip.quantity = slip.items[0]?.quantity ?? 0;
    slip.importPrice = slip.items[0]?.importPrice ?? 0;

    this.saveSlips();
    return true;
  }

  deleteSlip(id) {
    const slip = this.getSlipById(id);
    if (!slip || !slip.canEdit()) {
      return false;
    }

    const initialLength = this.slips.length;
    this.slips = this.slips.filter((s) => s.id !== Number(id));

    if (this.slips.length < initialLength) {
      this.saveSlips();
      return true;
    }
    return false;
  }

  completeSlip(id) {
    const slip = this.getSlipById(id);
    if (!slip) {
      return { success: false, message: "Không tìm thấy phiếu nhập" };
    }

    if (!slip.canEdit()) {
      return {
        success: false,
        message: "Phiếu nhập đã được hoàn thành trước đó",
      };
    }

    slip.complete();
    this.saveSlips();

    return { success: true, slip };
  }

  searchSlips(filters = {}) {
    let results = [...this.slips];

    if (filters.status && filters.status !== "ALL") {
      results = results.filter((s) => s.status === filters.status);
    }

    if (filters.productName && filters.productName.trim()) {
      const searchTerm = filters.productName.toLowerCase().trim();
      results = results.filter(
        (s) =>
          s.productName.toLowerCase().includes(searchTerm) ||
          s.slipNumber.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.fromDate) {
      results = results.filter(
        (s) => new Date(s.createdDate) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter((s) => new Date(s.createdDate) <= toDate);
    }

    results.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    return results;
  }

  getAllSlips() {
    return [...this.slips].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );
  }

  getSlipsByStatus(status) {
    return this.slips.filter((s) => s.status === status);
  }

  getTotalImportValue(fromDate = null, toDate = null) {
    let slips = this.slips.filter((s) => s.status === "COMPLETED");

    if (fromDate) {
      slips = slips.filter(
        (s) => new Date(s.completedDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      slips = slips.filter((s) => new Date(s.completedDate) <= endDate);
    }

    return slips.reduce((sum, slip) => sum + slip.totalValue, 0);
  }

  getSlipsCount() {
    return {
      total: this.slips.length,
      draft: this.slips.filter((s) => s.status === "DRAFT").length,
      completed: this.slips.filter((s) => s.status === "COMPLETED").length,
    };
  }
}

export const importManager = new ImportManager();