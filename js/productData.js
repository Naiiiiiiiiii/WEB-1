/**
 * productData.js
 * File lưu trữ DỮ LIỆU THÔ ban đầu của các sản phẩm.
 */


const calculateInitialStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    // Tính tổng trường 'stock' của tất cả các biến thể
    return variants.reduce((total, variant) => total + variant.stock, 0);
};

export const productDataList = [
    {
        id: 1,
        name: "Giày thể thao CA Match",
        categoryId: "C001", 
        price: 2300000,
        oldPrice: 2400000,
        img: "./img/giaythethao_CAMatch.avif",
        rating: 5,
        ratingCount: 128,
        badge: "hot",
        description:
            "Giày thể thao CA Match với thiết kế hiện đại, đế cao su bền bỉ, chất liệu thoáng khí, phù hợp cho các hoạt động thể thao và dạo phố.",
        images: [
            "./img/giaythethao_CAMatch.avif",
            "./img/giaythethao_CAMatch.avif",
            "./img/giaythethao_CAMatch.avif",
        ],

        variants: [
            { size: 38, stock: 10 },
            { size: 39, stock: 12 },
            { size: 40, stock: 15 },
            { size: 41, stock: 18 },
            { size: 42, stock: 12 },
            { size: 43, stock: 8 },
        ],

        costPrice: 1650000,
        initialStock: calculateInitialStock([
            { size: 38, stock: 10 }, { size: 39, stock: 12 }, { size: 40, stock: 15 },
            { size: 41, stock: 18 }, { size: 42, stock: 12 }, { size: 43, stock: 8 }
        ]), 
        lowStockThreshold: 5,
        imports: [],
        sales: [],
        isHidden: false
    },
    {
        id: 2,
        name: "Giày thể thao Suede Classic Unisex",
        categoryId: "C001", 
        price: 1840000,
        oldPrice: 2300000,
        img: "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
        rating: 4,
        ratingCount: 95,
        badge: "sale",
        description:
            "Mẫu giày Suede Classic mang phong cách retro, chất liệu da lộn cao cấp, dễ phối đồ, phù hợp cho cả nam và nữ.",
        images: [
            "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
            "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
        ],

        variants: [
            { size: 36, stock: 8 },
            { size: 37, stock: 10 },
            { size: 38, stock: 12 },
            { size: 39, stock: 15 },
            { size: 40, stock: 18 },
            { size: 41, stock: 14 },
        ],

        costPrice: 1250000,
        initialStock: calculateInitialStock([
            { size: 36, stock: 8 }, { size: 37, stock: 10 }, { size: 38, stock: 12 }, 
            { size: 39, stock: 15 }, { size: 40, stock: 18 }, { size: 41, stock: 14 }
        ]),
        lowStockThreshold: 6,
        imports: [],
        sales: [],
        isHidden: false
    },
    {
        id: 3,
        name: "GIÀY DA CÔNG SỞ (DA THẬT) - GERMANO BELLESI - SẢN XUẤT THỦ CÔNG TẠI ITALY",
        categoryId: "C002", // ✅ ĐÃ SỬA
        price: 10990000,
        oldPrice: null,
        img: "./img/giaycongsoGERMANO.webp",
        rating: 5,
        ratingCount: 203,
        badge: "new",
        description:
            "Giày da công sở Germano Bellesi được sản xuất thủ công tại Ý, sử dụng da thật cao cấp, mang lại sự sang trọng và đẳng cấp cho phái mạnh.",
        images: ["./img/giaycongsoGERMANO.webp", "./img/giaycongsoGERMANO.webp"],

        // KHÔNG CÓ BIẾN THỂ (Quản lý tồn kho chung)
        variants: [
            { size: 39, stock: 20 },
            { size: 40, stock: 25 },
            { size: 41, stock: 22 },
            { size: 42, stock: 18 },
            { size: 43, stock: 12 },
        ],

        costPrice: 8200000,
        initialStock: 8, 
        lowStockThreshold: 3,
        imports: [
            { date: "2025-09-15T00:00:00Z", qty: 5, costPrice: 8200000, note: "Nhập đợt 1" },
            { date: "2025-10-01T00:00:00Z", qty: 3, costPrice: 8200000, note: "Nhập bổ sung" },
        ],
        sales: [],
        isHidden: false
    },
    {
        id: 4,
        name: "Giày Boots nam MATURE Chelsea Boots – Đen – Version 2025",
        categoryId: "C002", 
        price: 1399000,
        oldPrice: null,
        img: "./img/bootsnam.webp",
        rating: 4,
        ratingCount: 76,
        badge: null,
        description:
            "Chelsea Boots MATURE phiên bản 2025 với thiết kế tối giản, chất liệu da bền đẹp, dễ phối đồ, phù hợp cho phong cách lịch lãm và cá tính.",
        images: ["./img/bootsnam.webp", "./img/bootsnam.webp"],

        variants: [
            { size: 39, stock: 6 },
            { size: 40, stock: 10 },
            { size: 41, stock: 12 },
            { size: 42, stock: 8 },
            { size: 43, stock: 5 },
        ],

        costPrice: 980000,
        initialStock: calculateInitialStock([
            { size: 39, stock: 6 }, { size: 40, stock: 10 }, { size: 41, stock: 12 }, 
            { size: 42, stock: 8 }, { size: 43, stock: 5 }
        ]),
        lowStockThreshold: 4,
        imports: [],
        sales: [],
        isHidden: false
    },
    {
        id: 5,
        name: "Giày Sneaker nam DYNAMIC – Vàng bò – Version 2025",
        categoryId: "C001", 
        price: 1399000,
        oldPrice: null,
        img: "./img/casual_Dynamic.webp",
        rating: 5,
        ratingCount: 156,
        badge: null,
        description:
            "Sneaker DYNAMIC phiên bản 2025 với màu vàng bò nổi bật, thiết kế trẻ trung, đế êm ái, mang lại sự thoải mái cho cả ngày dài.",
        images: ["./img/casual_Dynamic.webp", "./img/casual_Dynamic.webp"],

        variants: [
            { size: 38, stock: 8 },
            { size: 39, stock: 15 },
            { size: 40, stock: 18 },
            { size: 41, stock: 15 },
            { size: 42, stock: 10 },
        ],

        costPrice: 960000,
        initialStock: calculateInitialStock([
            { size: 38, stock: 8 }, { size: 39, stock: 15 }, { size: 40, stock: 18 }, 
            { size: 41, stock: 15 }, { size: 42, stock: 10 }
        ]),
        lowStockThreshold: 6,
        imports: [],
        sales: [],
        isHidden: false
    },
    {
        id: 6,
        name: "Giày nam Warrior 2025 phong cách trẻ trung",
        categoryId: "C001", 
        price: 522500,
        oldPrice: 550000,
        img: "./img/casual_Warrior.png",
        rating: 4,
        ratingCount: 89,
        badge: "sale",
        description:
            "Giày Warrior 2025 với phong cách trẻ trung, giá cả hợp lý, chất liệu nhẹ và bền, phù hợp cho sinh viên và giới trẻ năng động.",
        images: ["./img/casual_Warrior.png", "./img/casual_Warrior.png"],

        variants: [
            { size: 39, stock: 20 },
            { size: 40, stock: 25 },
            { size: 41, stock: 22 },
            { size: 42, stock: 18 },
            { size: 43, stock: 12 },
        ],

        costPrice: 370000,
        initialStock: calculateInitialStock([
            { size: 39, stock: 20 }, { size: 40, stock: 25 }, { size: 41, stock: 22 }, 
            { size: 42, stock: 18 }, { size: 43, stock: 12 }
        ]),
        lowStockThreshold: 8,
        imports: [],
        sales: [],
        isHidden: false
    },
];