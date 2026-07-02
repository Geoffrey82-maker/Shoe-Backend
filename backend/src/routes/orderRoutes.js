import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderPaymentStatus,
    requestReturn,
    getReturnRequests,
    processReturnRequest,
    processRefund
} from "../controllers/orderController.js";
import admin from "../middleware/adminMiddleware.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
    
// Add to
router.get(
    '/my-orders', 
    protect, 
    getMyOrders
);

router.get(
    '/:id', 
    protect, 
    getOrderById
);

router.get(
    "/returns",
    protect,
    admin,
    getReturnRequests
);

router.post(
    '/', 
    protect, 
    createOrder
);

router.post(
    "/:id/request-return",
    protect,
    requestReturn
);

router.put(
    "/:id/cancel", 
    protect, 
    cancelOrder
);

router.put(
    "/returns/:id",
    protect,
    admin,
    processReturnRequest
);

router.put(
    "/refund/:id",
    protect,
    admin,
    processRefund
);

export default router;