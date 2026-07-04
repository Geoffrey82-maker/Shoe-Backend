import stripe from "../config/stripe.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import axios from "axios";
import generateAccessToken from "../config/mpesa.js";
import generateToken from "../utils/generateToken.js";
import { adjustInventory } from "../services/inventoryService.js";
import User from "../models/User.js";
import { createNotification } from "../notifications/notificationService.js";

export const completeOrder = async (
    order,
    gateway,
    transactionId,
    paidAt = new Date()
) => {

    order.payment.status = "paid";

    order.payment.gateway = gateway;

    order.payment.transactionId = transactionId;

    order.payment.paidAt = paidAt;

    order.orderStatus = "processing";

    for (const item of order.items) {

        const product = await Product.findById(item.product);

        if (!product) {

            order.orderStatus = "on_hold";

            await order.save();

            return false;

        }

        if (product.stock < item.quantity) {

            order.orderStatus = "on_hold";

            await order.save();

            return false;

        }

        await adjustInventory({

            productId: item.product,

            quantity: -item.quantity,

            reason: "sale"

        });

    }

    if(order.couponCode) {
        await Coupon.findOneAndUpdate(
            {
                code: order.couponCode.toUpperCase()
            },
            {
                $inc: {
                    usedCount: 1
                }
            },
        );
    }

    await Cart.findOneAndDelete(
        {
        user: order.user
        }
    );

    await order.save();

    return true;
};

export const createPaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findById(orderId);

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

        if(order.payment.status === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            });
        }

        if(order.payment.method !== "card") {
            return res.status(400).json({
                success: false,
                message: "This order is not using card payment."
            });
        }

        if (!order.totalAmount || order.totalAmount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid order total."
            });

        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(
                order.totalAmount * 100
            ),
            currency: "usd",

            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            }
        });

        order.payment.transactionId = paymentIntent.id;
        await order.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
         
    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [

            "pending",

            "paid",

            "failed",

            "refunded"

        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid payment status."

            });

        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.payment.status = status;

        if(status === "paid") {
            order.payment.paidAt = new Date();
        }else {
            order.payment.paidAt = null;
        }

        if (status === "paid") {

            order.orderStatus = "processing";

        }

        await order.save();

        res.status(200).json({
            success: true,
            order
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {

       event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
       );
    }catch(error) {
        console.error("Webhook signature verification failed:", error.message);

        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if(event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        console.log("Webhook Event:", event.type);

        console.log("Payment Intent:", paymentIntent);


        try {

            if (!paymentIntent.metadata?.orderId) {
                throw new Error("Missing order ID in Stripe metadata");
            }

            const order = await Order.findById(
                paymentIntent.metadata.orderId
            );

            if (!order) {
                throw new Error("Order not found");
            }

            if (order.payment.status === "paid") {
                return res.json({
                    received: true
                });
            }

            if (
                order.payment.transactionId !== paymentIntent.id
            ) {
                throw new Error("Payment ID mismatch");
            }

            const success = await completeOrder(
                order,
                "stripe",
                paymentIntent.id,
                new Date(paymentIntent.created * 1000)
            );

            if (!success) {

                console.error(
                    `Failed completing order ${order.orderNumber}`
                );

                return res.status(500).json({
                    received: false,
                });

            }

            await createNotification({

                user: order.user,

                title: "Payment Successful",

                message:
                    `Your payment for ${order.orderNumber} was successful.`,

                type: "payment",

                icon: "credit-card",

                actionUrl: `/orders/${order._id}`

            });

            const admins = await User.find({

                role: "admin"

            }).select("_id");

            for (const admin of admins) {

                await createNotification({

                    user: admin._id,

                    title: "New Paid Order",

                    message:
                        `${order.orderNumber} has been paid.`,

                    type: "order",

                    icon: "shopping-cart",

                    actionUrl:
                        `/admin/orders/${order._id}`

                });

            }

            return res.json({
                received: true
            });
        }catch(error) {
            console.error(error);
        }
    }

    res.json({ received : true });
}

export const initiateMpesaPayment = async(req, res) => {
    try {
        const { orderId, phone } = req.body;

        const order = await Order.findById(orderId);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                success: false,

                message: "Access denied"

            });

        }

        if (order.payment.status === "paid") {

            return res.status(400).json({

                success: false,

                message: "Order already paid"

            });

        }

        if (order.payment.method !== "mpesa") {

            return res.status(400).json({

                success: false,

                message: "This order is not using M-Pesa."

            });

        }

        if (!phone) {

            return res.status(400).json({

                success: false,

                message: "Phone number is required."

            });

        }

        const token = await generateAccessToken();

        console.log("MPESA TOKEN:", token);

        const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

        const password = Buffer.from(
            process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
        ).toString("base64");

        console.log({
            shortcode: process.env.MPESA_SHORTCODE,
            callback: process.env.MPESA_CALLBACK_URL,
            timestamp,
            password
        });

        let response;

        response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(order.totalAmount),
                PartyA: phone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: phone,
                CallBackURL: process.env.MPESA_CALLBACK_URL,
                AccountReference: order.orderNumber,
                TransactionDesc: "Shoe Store Payment"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // The STK push has only been initiated here - there is no M-Pesa
        // receipt number yet. That only arrives later via mpesaCallback.
        // We store the CheckoutRequestID as the transactionId so the
        // callback can look the order back up (see mpesaCallback below).
        order.payment.checkoutRequestId = response.data.CheckoutRequestID;
        order.payment.transactionId = response.data.CheckoutRequestID;

        order.payment.gateway = "mpesa";

        await order.save();

        console.log("MPESA RESPONSE:", response.data);

        res.status(200).json({
            success: true,
            message: "STK Push sent successfully",
            data: response.data
        });

        

    }catch(error) {

        console.log(
            "MPESA ERROR:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to initiate M-Pesa payment."
        });
    } 
};

export const mpesaCallback = async(req, res) => {

    try {

        console.log(JSON.stringify(req.body, null, 2));
        const callback = req.body?.Body?.stkCallback;

        if (!callback) {

            return res.status(400).json({

                ResultCode: 0,

                ResultDesc: "Invalid callback"

            });

        }

        const checkoutRequestId = callback.CheckoutRequestID;

        const resultCode = callback.ResultCode;

        const order = await Order.findOne({
            "payment.transactionId": checkoutRequestId
        });

        if (!order) {

            return res.status(404).json({
                ResultCode: 0,
                ResultDesc: "Order not found"
            });

        }

        if (resultCode !== 0) {

            order.payment.status = "failed";

            await order.save();

            return res.status(200).json({
                ResultCode: 0,
                ResultDesc: "Received"
            });

        }

            const receipt = callback.CallbackMetadata?.Item?.find(

                item =>

                item.Name === "MpesaReceiptNumber"

            );
        const receiptNumber = receipt?.Value;

        if (!receiptNumber) {
            throw new Error(
                "Receipt number missing."
            );
        }

        const success = await completeOrder(
            order,
            "mpesa",
            receiptNumber,
            new Date()
        );

        await createNotification({

            user: order.user,

            title: "Payment Successful",

            message:
                `Your payment for ${order.orderNumber} was successful.`,

            type: "payment",

            icon: "credit-card",

            actionUrl: `/orders/${order._id}`

        });

        res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Success"
        });
    }catch(error) {

        console.error(error);
        res.status(500).json({
            ResultCode: 0,
            ResultDesc: "Internal Server Error"
        });
    }
}
