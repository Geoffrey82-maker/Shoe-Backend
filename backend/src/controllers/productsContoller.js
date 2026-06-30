import Product from '../models/Product.js';
import APIFeatures from '../utils/apiFeatures.js';
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name, 
            description,
            brand,
            category,
            price,
            discountPrice,
            stock,
            sizes,
            colors,
            featured
        } = req.body;

        if (
            discountPrice &&
            Number(discountPrice) >= Number(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount price must be less than the regular price."
            });
        }

        // Check slug uniqueness
        let slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-");

        const existingProduct = await Product.findOne({ slug });

        if(existingProduct) {
            slug = `${slug}-${Date.now()}`;
        }

        const images = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one product image."
            });
        }

        const product = await Product.create({
            name, 
            slug,
            description,
            brand,
            category,
            price,
            discountPrice,
            stock,
            sizes,
            colors,
            images,
            featured
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
        
    }catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            description,
            brand,
            category,
            price,
            discountPrice,
            stock,
            sizes,
            colors,
            featured,
            isActive
        } = req.body;

        if (name) {

            const slug = name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-");

            const existingProduct = await Product.findOne({
                slug,
                _id: {
                    $ne: product._id
                }
            });

            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: "Another product already uses this name."
                });
            }

            product.name = name;
            product.slug = slug;
        }

        if (description !== undefined)
            product.description = description;

        if (brand !== undefined)
            product.brand = brand;

        if (category !== undefined)
            product.category = category;

        if (price !== undefined)
            product.price = price;

        if (discountPrice !== undefined)
            product.discountPrice = discountPrice;

        if (stock !== undefined)
            product.stock = stock;

        if (sizes !== undefined)
            product.sizes = sizes;

        if (colors !== undefined)
            product.colors = colors;

        if (featured !== undefined)
            product.featured = featured;

        if (isActive !== undefined)
            product.isActive = isActive;

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteProduct = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        for (const image of product.images) {

            try {

                await cloudinary.uploader.destroy(image.public_id);

            } catch (err) {

                console.error(
                    "Failed to delete image:",
                    image.public_id
                );

            }

        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getProducts = async (req, res) => {
    try {
        const resultPerPage = 12;

        const apiFeatures = new APIFeatures(
            Product.find(),
            req.query
        ).search().filter().sort().paginate(resultPerPage);

        const products = await apiFeatures.query

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message : error.message
        });
    }
};

export const getProductById = async (req, res) => {

    try {

        const product = await Product.findById(
            req.params.id
        );

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        res.json({
            success: true,
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const getProductBySlug = async(req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const createReview = async (req, res) => {
    try{
        const { rating, comment } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5."
            });
        }

        const product = await Product.findById(req.params.id);

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const alreadyReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

        if(alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You already reviewed this product"
            });
        }

        const purchased = await Order.exists({

            user: req.user._id,

            "payment.status": "paid",

            "items.product": product._id

        });

        const reviewImages = req.files
            ? req.files.map(file => ({

                url: file.path,

                public_id: file.filename

            }))
            : [];

        const review = {

            user: req.user._id,

            name: req.user.firstname,

            rating: Number(rating),

            comment,

            verifiedPurchase: !!purchased,

            images: reviewImages

        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.averageRating = Number(
            (
                product.reviews.reduce(
                    (acc, item) => acc + item.rating,
                    0
                ) / product.reviews.length
            ).toFixed(1)
        );

        await product.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully"
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deleteReview = async (req, res) => {

    try {

        const product = await Product.findById(req.params.productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        const review = product.reviews.id(req.params.reviewId);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found"
            });

        }

        const isOwner =
            review.user.toString() === req.user._id.toString();

        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {

            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this review."
            });

        }

        for (const image of review.images) {

            await cloudinary.uploader.destroy(

                image.public_id

            );

        }

        review.deleteOne();

        product.numReviews = product.reviews.length;

        product.averageRating =
            product.numReviews === 0
                ? 0
                : product.reviews.reduce(
                    (sum, item) => sum + item.rating,
                    0
                ) / product.numReviews;

        await product.save();

        res.status(200).json({

            success: true,

            message: "Review deleted successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const updateReview = async (req, res) => {

    try {

        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        const review = product.reviews.id(req.params.reviewId);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found"
            });

        }

        if (
            review.user.toString() !== req.user._id.toString()
        ) {

            return res.status(403).json({
                success: false,
                message: "Not authorized."
            });

        }

        review.rating = Number(rating);

        review.comment = comment;

        product.averageRating =
            product.reviews.reduce(
                (sum, item) => sum + item.rating,
                0
            ) / product.reviews.length;

        await product.save();

        res.status(200).json({

            success: true,

            message: "Review updated.",

            review

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const voteReviewHelpful = async (req, res) => {

    try {

        const product = await Product.findById(

            req.params.productId

        );

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }

        const review = product.reviews.id(

            req.params.reviewId

        );

        if (!review) {

            return res.status(404).json({

                success: false,

                message: "Review not found"

            });

        }

        const alreadyVoted =

            review.votedUsers.some(

                id =>

                    id.toString() ===

                    req.user._id.toString()

            );

        if (alreadyVoted) {

            return res.status(400).json({

                success: false,

                message: "You already voted."

            });

        }

        review.helpfulVotes++;

        review.votedUsers.push(

            req.user._id

        );

        await product.save();

        res.status(200).json({

            success: true,

            helpfulVotes:

                review.helpfulVotes

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};