import Wishlist from "../models/Wishlist.js";

import { createNotification }

from "../notifications/notificationService.js";

import User from "../models/User.js";

import { sendBackInStockEmail }from "../services/emailService.js";

export const notifyPriceDrop = async (

    product

) => {

    const wishlists = await Wishlist.find({

        "products.product": product._id

    });

    for (const wishlist of wishlists) {

        const item = wishlist.products.find(

            p =>

                p.product.toString() ===

                product._id.toString()

        );

        if (

            item.priceWhenAdded >

            product.price

        ) {

            await createNotification({

                user: wishlist.user,

                title: "Price Drop",

                message:

                `${product.name} dropped from $${item.priceWhenAdded} to $${product.price}.`,

                type: "product",

                icon: "tag",

                actionUrl: `/products/${product.slug}`

            });

            item.priceWhenAdded = product.price;

        }

    }

    await Promise.all(

        wishlists.map(w => w.save())

    );

};

export const notifyBackInStock = async (product) => {

    const wishlists = await Wishlist.find({

        "products.product": product._id

    });

    for (const wishlist of wishlists) {

        await createNotification({

            user: wishlist.user,

            title: "Back in Stock",

            message:
                `${product.name} is back in stock.`,

            type: "product",

            icon: "package",

            actionUrl: `/products/${product.slug}`

        });

        const user = await User.findById(

            wishlist.user

        );

        if (user) {

            await sendBackInStockEmail(

                user.email,

                user.firstname,

                product

            );

        }

    }

};