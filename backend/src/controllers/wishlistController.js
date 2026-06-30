import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";

export const addToWishlist = async (req, res) => {

    try {

        const product = await Product.findById(

            req.params.productId

        );

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        let wishlist = await Wishlist.findOne({

            user: req.user._id

        });

        if (!wishlist) {

            wishlist = await Wishlist.create({

                user: req.user._id,

                products: []

            });

        }

        const exists = wishlist.products.find(

            item =>

                item.product.toString() ===

                product._id.toString()

        );

        if (exists) {

            return res.status(400).json({
                success: false,
                message: "Already in wishlist."

            });

        }

        wishlist.products.push({
            product: product._id,
            priceWhenAdded: product.price
        });

        await wishlist.save();

        res.status(200).json({

            success: true,

            message: "Added to wishlist."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const removeFromWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user._id

        });

        if (!wishlist) {

            return res.status(404).json({

                success: false,

                message: "Wishlist not found."

            });

        }

        wishlist.products = wishlist.products.filter(

            item =>

                item.product.toString() !==

                req.params.productId

        );

        await wishlist.save();

        res.status(200).json({

            success: true,

            message: "Removed."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user._id

        })

        .populate(

            "products.product"

        );

        res.status(200).json({

            success: true,

            wishlist

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getWishlistCount = async (req, res) => {

    const wishlist = await Wishlist.findOne({

        user: req.user._id

    });

    res.json({

        success: true,

        count:

            wishlist

            ?

            wishlist.products.length

            :

            0

    });

};

export const moveWishlistItemToCart = async (
    req,
    res
) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user._id

        });

        if (!wishlist) {

            return res.status(404).json({

                success: false,

                message: "Wishlist not found"

            });

        }

        const item = wishlist.products.find(

            p =>

                p.product.toString() ===

                req.params.productId

        );

        if (!item) {

            return res.status(404).json({

                success: false,

                message: "Item not found"

            });

        }

        let cart = await Cart.findOne({

            user: req.user._id

        });

        if (!cart) {

            cart = await Cart.create({

                user: req.user._id,

                items: []

            });

        }

        const existing = cart.items.find(

            i =>

                i.product.toString() ===

                req.params.productId

        );

        if (existing) {

            existing.quantity += 1;

        }

        else {

            cart.items.push({

                product: req.params.productId,

                quantity: 1

            });

        }

        wishlist.products = wishlist.products.filter(

            p =>

                p.product.toString() !==

                req.params.productId

        );

        await cart.save();

        await wishlist.save();

        res.json({

            success: true,

            message: "Moved to cart."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

export const moveAllWishlistToCart = async (

    req,

    res

) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user._id

        });

        if (!wishlist) {

            return res.status(404).json({

                success:false,

                message:"Wishlist empty"

            });

        }

        let cart = await Cart.findOne({

            user:req.user._id

        });

        if(!cart){

            cart = await Cart.create({

                user:req.user._id,

                items:[]

            });

        }

        for(const item of wishlist.products){

            const existing = cart.items.find(

                i=>i.product.toString()===

                item.product.toString()

            );

            if(existing){

                existing.quantity++;

            }

            else{

                cart.items.push({

                    product:item.product,

                    quantity:1

                });

            }

        }

        wishlist.products=[];

        await cart.save();

        await wishlist.save();

        res.json({

            success:true,

            message:"Wishlist moved to cart."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};