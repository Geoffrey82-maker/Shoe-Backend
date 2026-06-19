import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder } from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
    
// Add to
router.get('/my-orders', protect, getMyOrders);

router.get('/:id', protect, getOrderById);

router.post('/', protect, createOrder);

router.put("/:id/cancel", protect, cancelOrder);


export default router;