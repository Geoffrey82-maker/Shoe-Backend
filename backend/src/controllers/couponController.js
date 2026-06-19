import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);

        res.status(201).json({
            success: true,
            coupon
        });
    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if(!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon"
            });
        }

        if(coupon.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Coupon expired"
            });
        }

        if(
            coupon.usageLimit > 0 && 
            coupon.usedCount >= coupon.usageLimit
        ) {
            return res.status(400).json({
                success: false,
                message: "Coupon usage limit reached"
            });
        }

        if(amount < coupon.minimumAmount) {
            return res.status(400).json({
                success : false,
                messag: `Minimum order amount is ${coupon.minimumAmount}`
            });
        }

        let discount = 0;

        if(coupon.discountType === "percentage") {
            discount = amount * (coupon.discountValue / 100);
        }else {
            discount = coupon.discountValue;
        }

        const finalAmount = amount - discount;

        res.status(200).json({
            success: true,
            coupon: coupon.code,
            discount,
            finalAmount
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: true,
            message: error.message
        });
    }
}

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: coupons.length,
            coupons
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById( req.params.id );

        if(!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        coupon.isActive = !coupon.isActive;

        res.status(200).json({
            success: true,
            coupon
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
} 

// delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if(!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found"
            });
        }

        await coupon.deleteOne();

        res.status(200).json({
            success: true,
            message: "Coupon deleted"
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}