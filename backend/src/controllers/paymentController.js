import stripe from "../config/stripe.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import axios from "axios";
import generateAccessToken from "../config/mpesa.js";
import generateToken from "../utils/generateToken.js";

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

        console.log("Charging:", order.totalAmount);

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

        const order = await order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.payment.status = status;

        if(status === "paid") {
            order.paidAt = new Date();
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
            const order = await Order.findOne({
                "payment.transactionId" : paymentIntent.id
            });
            console.log("Order Found:", order?.id);

            if(order) {

                if(order.payment.status === "paid") {
                    return res.json({ received: true });
                }

                order.payment.status = "paid";
                order.paidAt = new Date();

                order.orderStatus = "processing";

                //Reduce stock
                for(const item of order.items) {
                    const product = await Product.findById(item.product);

                    if(product) {
                        product.stock -= item.quantity;

                        if(product.stock < 0) {
                            product.stock = 0;
                        }

                        await product.save();
                    }
                }

                console.log(`Order ${order._id} marked as paid`);

                console.log(
                    `Cart cleared for user ${order.user}`
                );

                //Optional: clear cart after successful payment
                await Cart.findOneAndDelete({ user: order.user });

                console.log(
                    `Stock updated for order ${order._id}`
                );
                await order.save();
            }
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

        const token = await generateToken();

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

        

    }catch(error) {

        console.log(
            "MPESA ERROR:",
            error.response?.data
        );

        console.log(error);
    }
};

export const mpesaCallback = async(req, res) => {
    console.log(JSON.stringify(req.body, null, 2));

    res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Success"
    });
};