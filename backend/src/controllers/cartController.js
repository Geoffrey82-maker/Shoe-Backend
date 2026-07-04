import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const addToCart = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid product."

            });

        }

        if (!size) {

            return res.status(400).json({

                success: false,

                message: "Please select a size."

            });

        }

        if (!color) {

            return res.status(400).json({

                success: false,

                message: "Please select a color."

            });

        }

        if (Number(quantity) <= 0) {

            return res.status(400).json({

                success: false,

                message: "Quantity must be greater than zero."

            });

        }

        const product = await Product.findOne({

            _id: productId,

            isActive: true

        });

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.sizes.includes(Number(size))) {

            return res.status(400).json({

                success: false,

                message: "Selected size is unavailable."

            });

        }

        if (!product.colors.includes(color)) {

            return res.status(400).json({

                success: false,

                message: "Selected color is unavailable."

            });

        }

        const requestedQuantity = Number(quantity || 1);

        if (product.stock < requestedQuantity) {

            return res.status(400).json({

                success: false,

                message: "Insufficient stock."

            });

        }

        let cart = await Cart.findOne({
            user: req.user._id
        });

        if(!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => 
                item.product.toString() === productId && item.size === Number(size) && item.color === color
        );

        if(existingItem) {

            const newQuantity =

            existingItem.quantity +

            Number(quantity || 1);

        if (newQuantity > product.stock) {

            return res.status(400).json({

                success: false,

                message: "Requested quantity exceeds available stock."

            });

        }

        existingItem.quantity = newQuantity;

        }else {
            cart.items.push({
                product : product._id,
                name: product.name,
                image: product.images?.[0]?.url || "",
                size: Number(size),
                color,
                quantity: Number(quantity || 1),
                price: product.discountPrice || product.price
            });
        }

        await cart.save();

        return res.status(200).json({

            success: true,

            message: "Item added to cart.",

            count: cart.items.length,

            cart

        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getCart = async (req, res) => {
    try {

        const cart = await Cart.findOne({

            user: req.user._id

        })

        .populate({

            path: "items.product",

            select:

                "name slug price discountPrice images stock isActive"

        });
        
        if(!cart) {
            return res.status(200).json({
                success: true,
                items: [],
                totalItems: 0,
                totalQuantity: 0,
                subtotal: 0
            });
        }

        cart.items = cart.items.filter(

            item => item.product

        );

        const totalItems = cart.items.length;

        const totalQuantity = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = cart.items.reduce(
                (sum, item) => sum +(
                    (
                        item.product.discountPrice || item.product.price
                    )* item.quantity),0
                );

        await cart.save();

        res.status(200).json({
            success: true,
            cart,
            totalItems,
            totalQuantity,
            subtotal
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid cart item ID."

            });

        }

        const { quantity } = req.body;

        if (!quantity || Number(quantity) <= 0) {

            return res.status(400).json({

                success: false,

                message: "Quantity must be greater than zero."

            });

        }

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if(!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(item => item._id.toString() === itemId);

        if(!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        const product = await Product.findById(item.product);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product no longer exists."

            });

        }

        if (Number(quantity) > product.stock) {

            return res.status(400).json({

                success: false,

                message: "Requested quantity exceeds available stock."

            });

        }

        item.quantity = Number(quantity);

        await cart.save();

        const totalItems = cart.items.length;

        const totalQuantity = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        return res.status(200).json({

            success: true,

            message: "Cart updated successfully.",

            totalItems,

            totalQuantity,

            subtotal,

            cart

        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const removeCartItem = async (req, res) => {
    try {

        const { itemId } = req.params;

        // 1. Validate item ID
        if (!mongoose.Types.ObjectId.isValid(itemId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID."
            });

        }

        // 2. Find user's cart
        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found."
            });

        }

        // 3. Check whether the item exists
        const originalCount = cart.items.length;

        cart.items = cart.items.filter(
            item => item._id.toString() !== itemId
        );

        if (cart.items.length === originalCount) {

            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });

        }

        // 4. Save updated cart
        await cart.save();

        // 5. Recalculate totals
        const totalItems = cart.items.length;

        const totalQuantity = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // 6. Return updated information
        res.status(200).json({
            success: true,
            message: "Item removed from cart.",
            totalItems,
            totalQuantity,
            subtotal
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const clearCart = async (req, res) => {

    try {

        const cart = await Cart.findOne({

            user: req.user._id

        });

        if (!cart) {

            return res.status(404).json({

                success: false,

                message: "Cart not found."

            });

        }

        cart.items = [];

        await cart.save();

        res.status(200).json({

            success: true,

            message: "Cart cleared successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
