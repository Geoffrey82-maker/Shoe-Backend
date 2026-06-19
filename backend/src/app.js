import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import productRoute from './routes/productRoutes.js';
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhook } from './controllers/paymentController.js';
import couponRoutes from "./routes/couponRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js";


const app = express();

//Middleware

// Stripe webhook route
app.post(
    "/api/payments/stripe/webhook",
    express.raw({
        type: "application/json"
    }),
    stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Health route

app.get('/', (req, res) => {
    res.json({
        success : true,
        message: "Commerce app running"
    });
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wishlist", wishlistRoutes)

export default app;