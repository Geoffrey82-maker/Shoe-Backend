import Product from '../models/Product.js';
import APIFeatures from '../utils/apiFeatures.js';
export const createProduct = async (req, res) => {
    console.log("Body:", req.body);
    console.log("Files", req.files);
    console.log(JSON.stringify(req.files, null, 2));
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
            images,
            featured
        } = req.body;

        // Check slug uniqueness
        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

        const existingProduct = await Product.findOne({ slug });

        if(existingProduct) {
            return res.status(400).json({
                success: false, 
                message: "Product already exists"
            });
        }

        const imageUrls = req.files.map(file => {
            console.log(file);
            return file.path;
        });

        console.log("Image URLs:", imageUrls);
        
        console.log("Name:", name);
        console.log("Slug:", slug)
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
            images : imageUrls,
            featured
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully"
        });
        
    }catch(error) {
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

        const review = {
            user: req.user._id,
            name: req.user.firstname,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;
        product.averageRating = product.reviews.reduce(
            (acc, item) => item.rating + acc, 0
        ) / product.reviews.length;

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