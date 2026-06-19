import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Product from "../models/Product.js";
import { sendOrderConfirmationEmail } from '../services/emailService.js';

export const createOrder = async (req, res) => {
    try {

        const { items, shippingAddress, paymentMethod, couponCode } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if(!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const subtotal = cart.items.reduce(
            (sum, item) => sum + ( item.price * item.quantity), 0
        );

        const shippingFee = 0;

let discountAmount = 0;

if (couponCode) {

    const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
    });

    if (!coupon) {
        return res.status(400).json({
            success: false,
            message: "Invalid coupon"
        });
    }

    if (coupon.expiresAt < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Coupon expired"
        });
    }

    if (coupon.discountType === "percentage") {

        discountAmount =
            subtotal *
            (coupon.discountValue / 100);

    } else {

        discountAmount =
            coupon.discountValue;
    }
}

const totalAmount =
    subtotal +
    shippingFee -
    discountAmount;
        const count = await Order.countDocuments();

        const orderNumber = `SHOE-${1000 + count + 1}`;

        for(const item of cart.items) {
            const product = await Product.findById(item.product);

            if(!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${item.name} is out of stock`
                });
            }
        }

        const order = await Order.create({
            orderNumber,

            user: req.user._id,

            items: cart.items,

            shippingAddress,

            subtotal,

            shippingFee,

            discountAmount,

            couponCode,

            totalAmount,

            payment: {
                method: paymentMethod,
                status: "pending"
            }
        });

        if(couponCode) {
            await Coupon.findOneAndUpdate(
                {
                    code: couponCode.toUpperCase()
                },
                {
                    $inc: {
                        usedCount: 1
                    }
                }
            );
        }

        try {

            await sendOrderConfirmationEmail(
                req.user.email,
                order.orderNumber
            );
        }catch(emailError) {
            console.error(
                "Email Error:",
                emailError.message
            );
        }

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });


    }catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    }catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if(order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const markOrderPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.paymentStatus = "paid";

        order.paidAt = new Date();

        await order.save();

        res.status(200).json({
            success: true,
            message : "Order marked as paid"
        });
    
    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: message.error
        });
    }
}

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if(order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if(order.orderStatus === "shipped" || order.orderStatus === "delivered"){
            return res.status(400).json({
                success: false,
                message: "Order can no longer be cancelled"
            });
        }

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully"
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
