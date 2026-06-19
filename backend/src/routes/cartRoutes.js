import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem} from "../controllers/cartController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
    
// Add to
router.get('/', protect, getCart);

router.post('/', protect, addToCart);

router.put('/:itemId', protect, updateCartItem);

router.delete('/:itemId', protect, removeCartItem);

export default router;