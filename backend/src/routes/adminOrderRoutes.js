import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import { getAllOrders, updateOrderStatus, getDashboardStats, getRecentOrders,  getLowStockProducts, getBestSellingProduct, getMonthlySales } from "../controllers/adminController.js";

import { updatePaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/orders", protect, admin, getAllOrders);

router.get("/dashboard", protect, admin, getDashboardStats);

router.get("/orders/recent", protect, admin, getRecentOrders);

router.get("/products/low-stock", protect, admin, getLowStockProducts);

router.get("/products/best-sellers", getBestSellingProduct);

router.get("/sales/monthly", protect, admin, getMonthlySales);

router.put("/orders/:id/status", protect, admin, updateOrderStatus);

router.put("/orders/:id/payment-status", protect, admin, updatePaymentStatus);

export default router;