import Cart from "../models/Cart.js";
import Product from "../models/Product.js"

export const addToCart = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.body;

        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
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
            existingItem.quantity += Number(quantity || 1);
        }else {
            cart.items.push({
                product : product._id,
                name: product.name,
                image: product.images?.[0] || "",
                size: Number(size),
                color,
                quantity: Number(quantity || 1),
                price: product.discountPrice || product.price
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item added to the cart",
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

        const cart = await Cart.findOne({ user: req.user._id});
        
        if(!cart) {
            return res.status(200).json({
                success: true,
                items: [],
                totalItems: 0,
                totalQuantity: 0,
                subtotal: 0
            });
        }

        const totalItems = cart.items.length;

        const totalQuantity = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity), 0
        );

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
        const { quantity } = req.body;

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if(!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        console.log("Requested itemId", itemId);

        cart.items.forEach(item => {
            console.log("Existing cart item:", item._id?.toString());
        })

        const item = cart.items.id(itemId);

        if(!item) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        item.quantity = Number(quantity);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully"
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

        const cart = await Cart.findOne({
            user: req.user._id
        });

        if(!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== itemId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart"
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}