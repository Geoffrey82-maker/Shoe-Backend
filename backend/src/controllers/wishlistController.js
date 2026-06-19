import Wishlist from "../models/Wishlist.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({
            user: req.user._id
        });

        if(!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        // Checking for existing item in wishlist
        const exists = wishlist.products.some(id => id.toString() === productId);

        if(exists) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // we add item to wishlist
        wishlist.products.push(productId);

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Added to wishlist"
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success : false,
            message: error.message
        });
    }
}

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");

        res.status(200).json({
            success: true,
            wishlist
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}