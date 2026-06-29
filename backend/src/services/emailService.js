import transporter from "../config/email.js";
import orderConfirmationTemplate from "../emails/templates/orderConfirmationTemplate.js";
import passwordResetTemplate
from "../emails/templates/passwordResetTemplate.js";


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

