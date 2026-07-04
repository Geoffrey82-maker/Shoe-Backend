import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { adjustInventory } from "../services/inventoryService.js";

import InventoryHistory from "../models/InventoryHistory.js";

export const getAllOrders = async (req, res) => {
    try {

        const search = req.query.search || "";

        const filter = search
            ? {
                orderNumber: {
                    $regex: search,
                    $options: "i"
                }
            }
            : {};

        if (req.query.status) {

            filter.orderStatus = req.query.status;

        }

        const page = Number(req.query.page) || 1;

        const limit = 10;

        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .populate(
                "user",
                "firstname lastname email"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);
        
        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            orders
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });

        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const allowedStatuses = [
            "pending",
            "processing",
            "packed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }


        if(status === "shipped") {
            //send shipped email
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be modified."
            });
        }

        if (
            status === "cancelled" &&
            order.orderStatus === "delivered"
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivered orders cannot be cancelled."
            });
        }

        order.orderStatus = status;

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated",
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

export const getDashboardStats = async(req, res) => {
    try {
        const totalOrders = await Order.countDocuments();

        const totalProducts = await Product.countDocuments();

        const totalUsers = await User.countDocuments();

        const pendingOrders = await Order.countDocuments({
            orderStatus: "pending"
        });

        const paidOrders = await Order.countDocuments({
            "payment.status" : "paid"
        });

        const revenueResult = await Order.aggregate([
            {
                $match: {
                    "payment.status" : "paid"
                }
            },

            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        const processingOrders = await Order.countDocuments({ orderStatus : "processing" });

        const shippedOrders = await Order.countDocuments({ orderStatus: "shipped" });

        const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });

        const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const lowStockProducts =
            await Product.countDocuments({
                stock: {
                    $lte: 5
                },
                isActive: true
            });

        res.status(200).json({
            success: true,

            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                pendingOrders,
                paidOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue,
                lowStockProducts
            }
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getRecentOrders = async (req, res) => {
    try{
        const orders = await Order.find({
                "payment.status": "paid"
            })
            .select(
                "orderNumber totalAmount orderStatus payment createdAt"
            )
            .populate("user", "firstname lastname email")
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.status(200).json({
            success: true,
            orders
        });

    }catch(error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Low Stock Products
export const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            stock: { $lte: 5 },
            isActive: true
        }).select(
            "name stock price images category"
        ).sort({ stock: 1 });

        res.status(200).json({
            success: true, 
            products
        });
    }catch(error) {
        console.error(error);
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Best selling Products
export const getBestSellingProduct = async (req, res) => {
    try {
        const bestSellers = await Order.aggregate([
            {
                $match: {

                    "payment.status": "paid",

                    orderStatus: {

                        $ne: "cancelled"

                    }

                }
            },

            { $unwind: "$items" },

            {
                $group: {
                    _id: "$items.product",
                    totalSold: {
                        $sum: "$items.quantity"
                    }
                }
            },

            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },

            {
                $sort: {
                    totalSold: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json({
            success: true,
            bestSellers
        });

    }catch(error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getMonthlySales = async (req, res) => {
    try {

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    "payment.status": "paid"
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$createdAt"
                        }
                    },
                    revenue: {
                        $sum: "$totalAmount"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    revenue: 1
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            monthlySales
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const restockProduct = async (req, res) => {

    try {

        const { quantity } = req.body;

        const qty = Number(quantity);

        if (!Number.isFinite(qty) || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero."
            });
        }

        const product = await adjustInventory({

            productId: req.params.id,
            quantity: qty,
            reason: "restock",
            performedBy: req.user._id

        });

        res.status(200).json({
            success: true,
            message: "Product restocked.",
            product

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

export const adjustProductInventory = async (req, res) => {

    try {

        const {
            quantity,
            reason
        } = req.body;

        const allowedReasons = [
            "restock",
            "manual_adjustment",
            "damaged",
            "returned",
            "correction"
        ];

        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory adjustment reason."
            });
        }

        const product = await adjustInventory({
            productId: req.params.id,
            quantity: Number(quantity),
            reason,
            performedBy: req.user._id
        });

        res.status(200).json({
            success: true,
            product
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

export const getInventoryHistory = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const history = await InventoryHistory.find({
            product: req.params.id
        })
        .populate(
            "performedBy",
            "firstname lastname"
        )
        .sort({
            createdAt: -1
        }).select(
            "quantity reason createdAt performedBy"
        )
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            success: true,
            history
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
