import transporter from "../config/email.js";
import orderConfirmationTemplate
from "../emails/templates/orderConfirmationTemplate.js";
import passwordResetTemplate
from "../emails/templates/passwordResetTemplate.js";
import backInStockTemplate from "../emails/templates/backInStockTemplate.js";
import abandonedCartTemplate from "../emails/templates/abandonedCartTemplate.js";

export const sendOrderConfirmationEmail = async (user, order) => {
    await transporter.sendMail({
        from: `"SoleStreet" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Order ${order.orderNumber} Confirmed`,
        html: orderConfirmationTemplate({

            firstname: user.firstname,

            orderNumber: order.orderNumber,

            totalAmount: order.totalAmount,

            paymentMethod: order.payment.method,

            orderUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`

        })
    });
};

export const sendPasswordResetEmail =
async({user, resetUrl})=>{

    await transporter.sendMail({

        from:
            `"SoleStreet" <${process.env.EMAIL_USER}>`,

        to: user.email,

        subject: "Reset Your SoleStreet Password",

        html: passwordResetTemplate({

            firstname: user.firstname,

            resetUrl

        })

    });

};

export const sendBackInStockEmail = async (

    email,

    firstname,

    product

) => {

    await transporter.sendMail({
        
        from: `"SoleStreet" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: `${product.name} is Back in Stock!`,

        html: backInStockTemplate({

            firstname,

            product

        })

    });

};

export const sendAbandonedCartEmail = async (user,cart)=>{

    await transporter.sendMail({

        from:`"SoleStreet" <${process.env.EMAIL_USER}>`,

        to:user.email,

        subject:"You left something behind 👟",

        html:abandonedCartTemplate({

            firstname:user.firstname,
            cart,
            cartUrl: `${process.env.FRONTEND_URL}/cart`

        })
    });
};