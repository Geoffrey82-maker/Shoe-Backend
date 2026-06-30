import Product from "../models/Product.js";

import InventoryHistory from "../models/InventoryHistory.js";

import { createNotification } from "../notifications/notificationService.js";

import { notifyBackInStock }from "./wishlistService.js";

export const adjustInventory = async ({

    productId,

    quantity,

    reason,

    performedBy = null

}) => {

    const product = await Product.findById(

        productId

    );

    if (!product) {

        throw new Error(

            "Product not found."

        );

    }

    const previousStock = product.stock;

    const previousStatus = product.status;

    product.stock += quantity;

    if (product.stock < 0) {

        product.stock = 0;

    }

    if (product.stock === 0) {

        product.status = "out_of_stock";

    }

    else if (

        product.stock <=

        product.lowStockThreshold

    ) {

        product.status = "low_stock";

    }

    else {

        product.status = "in_stock";

    }

    await product.save();

    if (

        previousStatus === "out_of_stock" &&

        product.status === "in_stock"

    ) {

        await notifyBackInStock(product);

    }

    await InventoryHistory.create({

        product: product._id,

        previousStock,

        newStock: product.stock,

        change: quantity,

        reason,

        performedBy

    });

    if (

        product.status === "low_stock"

    ) {

        await createNotification({

            title: "Low Stock",

            message:

            `${product.name} has only ${product.stock} left.`,

            type: "product",

            icon: "box"

        });

    }

    if (

        product.status === "out_of_stock"

    ) {

        await createNotification({

            title: "Out of Stock",

            message:

            `${product.name} is out of stock.`,

            type: "product",

            icon: "alert-triangle"

        });

    }

    return product;

};