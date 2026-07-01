import RecentlyViewed from "../models/RecentlyViewed.js";

import Product from "../models/Product.js";

export const addRecentlyViewed = async (req,res)=>{

    const product = await Product.findById(

        req.params.productId

    );

    if(!product){

        return res.status(404).json({

            success:false,

            message:"Product not found"

        });

    }

    let recent = await RecentlyViewed.findOne({ user:req.user._id});

    if(!recent){

        recent = await RecentlyViewed.create({ user:req.user._id, products:[] });
    }

    recent.products = recent.products.filter(
        p => p.product.toString()!== product._id.toString()
    );

    recent.products.unshift({ product:product._id });

    recent.products= recent.products.slice(0,10);

    await recent.save();

    res.json({
        success:true
    });

};

export const getRecentlyViewed=async(req,res)=>{
    const recent=

    await RecentlyViewed.findOne({

    user:req.user._id

    })
    .populate(
        "products.product"
    );

    res.json({
        success:true,
        products: recent? recent.products : []
    });

};