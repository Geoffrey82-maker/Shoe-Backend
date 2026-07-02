import express from "express";
import { 
    addToCart, 
    getCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart
} from "../controllers/cartController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
    
// Add to
router.get('/', protect, getCart);

router.post('/', protect, addToCart);

router.put('/:itemId', protect, updateCartItem);

router.delete('/:itemId', protect, removeCartItem);

router.delete('/clear', protect, clearCart);

export default router;