import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Product from "../models/Product.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { adjustInventory } from "../services/inventoryService.js";
import { createNotification } from "../notifications/notificationService.js";
import { completeOrder } from "./paymentController.js";

export const createOrder = async (req, res) => {
    let session;
    try {

        session = await mongoose.startSession();

        session.startTransaction();

        const { shippingAddress, paymentMethod, couponCode } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required."
            });
        }

        const allowedMethods = [
            "card",
            "cash",
            "mpesa"
        ];

        if (!allowedMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if(!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let subtotal = 0;

        const shippingFee = 0;

        let coupon = null;

        let discountAmount = 0;

        const orderNumber =
            `SHOE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

        for (const item of cart.items) {

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is out of stock`
                });
            }

            subtotal += product.price * item.quantity;

            item.price = product.price;

        }

        if (couponCode) {

            coupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
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

             if (
                coupon.usageLimit &&
                coupon.usedCount >= coupon.usageLimit
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon usage limit reached."
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

        const totalAmount = Math.max(
            subtotal +
            shippingFee -
            discountAmount,
            0
        );


        const order = await Order.create(
            [{
                orderNumber,

                user: req.user._id,

                items: await Promise.all(
                    cart.items.map(async (item) => {
                        const product = await Product.findById(item.product);

                        return {

                            product: product._id,

                            name: product.name,

                            image: product.images[0]?.url || "",

                            size: item.size,

                            color: item.color,

                            quantity: item.quantity,

                            price: product.price

                        };
                    })
                ),

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
            }],
            { session }
        );

        const createdOrder = order[0];

        //Clear user's cart
        cart.items = [];

        await cart.save({ session });

        await session.commitTransaction();

        session.endSession();

        try {

            await sendOrderConfirmationEmail(
                req.user,
                createdOrder
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
            order: createdOrder
        });


    }catch (error) {

        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

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
        }).populate({
            path: "items.product",
            select: "name images price"
        })
        .sort({ createdAt: -1 });

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

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }

        const order = await Order.findById(req.params.id)
        .populate({
            path: "items.product",
            select: "name slug images brand"
        })

        .populate({
            path: "user",
            select: "firstname lastname email"
        });

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (
            order.user.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {

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

export const updateOrderPaymentStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }
        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.payment.status === "paid") {

            return res.status(400).json({

                success: false,

                message: "Order already paid."

            });

        }

        const { transactionId,gateway = "manual" } = req.body;

        const success = await completeOrder(

            order,

            gateway,

            transactionId,

            new Date()

        );

        if (!success) {

            return res.status(400).json({

                success: false,

                message: "Unable to complete order."

            });

        }

        res.status(200).json({
            success: true,
            message: "Order marked as paid.",
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

export const cancelOrder = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

       if (
            order.user.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({

                success: false,

                message: "Access denied"

            });
        }

       if (
            ["cancelled", "shipped", "delivered"].includes(order.orderStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Order can no longer be cancelled."
            });
        }

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();

        
        // Restore product stock
        
        for (const item of order.items) {

            await adjustInventory({

                productId: item.product,

                quantity: item.quantity,

                reason: "order_cancelled"

            });

        }

        await order.save();

        await createNotification({

            user: order.user,

            title: "Order Cancelled",

            message: `Your order ${order.orderNumber} has been cancelled.`,

            type: "order",

            icon: "x-circle",

            actionUrl: `/orders/${order._id}`

        });

        res.status(200).json({

            success: true,

            message: "Order cancelled successfully.",

            order

        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const requestReturn = async (req, res) => {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }

        if (order.user.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        if (order.orderStatus !== "delivered") {

            return res.status(400).json({

                success: false,

                message: "Only delivered orders can be returned."

            });

        }

        if (order.returnRequest.requested) {

            return res.status(400).json({

                success: false,

                message: "Return request already submitted."

            });

        }

        const { reason } = req.body;

        if (!reason) {

            return res.status(400).json({

                success: false,

                message: "Return reason is required."

            });

        }

        order.returnRequest.requested = true;

        order.returnRequest.reason = reason;

        order.returnRequest.status = "pending";

        order.orderStatus = "return_requested";

        order.returnRequest.requestedAt = new Date();

        await order.save();

        res.status(200).json({

            success: true,

            message: "Return request submitted successfully.",

            order

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getReturnRequests = async (req, res) => {

    try {

        const orders = await Order.find({

            "returnRequest.requested": true

        })

        .populate({

            path: "user",

            select: "firstname lastname email"

        })

        .sort({

            "returnRequest.requestedAt": -1

        });

        res.status(200).json({

            success: true,

            count: orders.length,

            orders

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const processReturnRequest = async (req, res) => {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }

        if (!order.returnRequest.requested) {

            return res.status(400).json({

                success: false,

                message: "No return request found."

            });

        }

        const { status,adminNotes } = req.body;

        if (!["approved", "rejected"].includes(status)) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be approved or rejected."

            });

        }

        if (status === "approved") {

            for (const item of order.items) {

                await adjustInventory({

                    productId: item.product,

                    quantity: item.quantity,

                    reason: "return"

                });

                order.orderStatus = "return_approved";
            }

        }

        if (status === "rejected") {

            order.orderStatus = "return_rejected";

        }
        
        await order.save();

                await createNotification({

            user: order.user,

            title: "Return Request Updated",

            message:

                status === "approved"

                ?

                `Your return for ${order.orderNumber} has been approved.`

                :

                `Your return for ${order.orderNumber} has been rejected.`,

            type: "order",

            icon: "rotate-ccw",

            actionUrl: `/orders/${order._id}`

        });

                res.status(200).json({

            success: true,

            message:
                `Return ${status} successfully.`,

            order

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const processRefund = async (req, res) => {

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid order ID."

            });

        }

        const order = await Order.findById(req.params.id);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found."

            });

        }

        if (

            order.returnRequest.status !== "approved"

        ) {

            return res.status(400).json({

                success: false,

                message: "Return has not been approved."

            });

        }

        if (

            order.payment.refund.status === "processed"

        ) {

            return res.status(400).json({

                success: false,

                message: "Refund already processed."

            });

        }

        order.payment.refund.status = "processed";
        order.orderStatus = "refunded";

        order.payment.refund.refundedAt = new Date();

        order.payment.refund.amount = order.totalAmount;

        await order.save();

        await createNotification({

            user: order.user,

            title: "Refund Processed",

            message:
                `Your refund for ${order.orderNumber} has been processed.`,

            type: "payment",

            icon: "credit-card",

            actionUrl: `/orders/${order._id}`

        });

        res.status(200).json({

            success: true,

            message: "Refund processed successfully.",

            order

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
