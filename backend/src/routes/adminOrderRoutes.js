import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import { 
    getAllOrders, 
    updateOrderStatus, 
    getDashboardStats, 
    getRecentOrders,  
    getLowStockProducts, 
    getBestSellingProduct, 
    getMonthlySales,
    restockProduct,
    adjustProductInventory,
    getInventoryHistory
} from "../controllers/adminController.js";

import validate from "../middleware/validationMiddlware.js";

import {
    updateOrderStatusValidator,
    updatePaymentStatusValidator
} from "../validators/adminValidator.js";

import { updatePaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.get(
    "/orders", 
    protect, 
    admin, 
    getAllOrders
);

router.get(
    "/dashboard", 
    protect, 
    admin, 
    getDashboardStats
);

router.get(
    "/orders/recent", 
    protect, 
    admin, 
    getRecentOrders
);

router.get(
    "/products/low-stock", 
    protect, 
    admin, 
    getLowStockProducts
);

router.get(
    "/products/best-sellers",
    protect,
    admin,
    getBestSellingProduct
);

router.get(
    "/sales/monthly", 
    protect, 
    admin, 
    getMonthlySales
);

router.put(
    "/orders/:id/status",
    protect,
    admin,
    updateOrderStatusValidator,
    validate,
    updateOrderStatus
);

router.put(
    "/orders/:id/payment-status",
    protect,
    admin,
    updatePaymentStatusValidator,
    validate,
    updatePaymentStatus
);

// Inventory management routes
router.put(

    "/products/:id/restock",

    protect,

    admin,

    restockProduct

);

router.put(

    "/products/:id/inventory",

    protect,

    admin,

    adjustProductInventory

);

router.get(

    "/products/:id/history",

    protect,

    admin,

    getInventoryHistory

);

export default router;