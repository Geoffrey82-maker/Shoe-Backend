import baseTemplate from "./baseTemplate.js";

const orderConfirmationTemplate = ({
    firstname,
    orderNumber,
    totalAmount,
    paymentMethod,
    orderUrl
}) => {

    const body = `
        <p>
            Hi <strong>${firstname}</strong>,
        </p>

        <p>
            Thank you for shopping with <strong>SoleStreet</strong>.
            We've received your order and we're already preparing it.
        </p>

        <table
            width="100%"
            cellpadding="12"
            cellspacing="0"
            style="
                margin-top:30px;
                border-collapse:collapse;
                border:1px solid #eeeeee;
            ">

            <tr style="background:#fafafa;">
                <td><strong>Order Number</strong></td>
                <td>${orderNumber}</td>
            </tr>

            <tr>
                <td><strong>Total</strong></td>
                <td>$${Number(totalAmount).toFixed(2)}</td>
            </tr>

            <tr style="background:#fafafa;">
                <td><strong>Payment Method</strong></td>
                <td>${paymentMethod}</td>
            </tr>

            <tr>
                <td><strong>Status</strong></td>
                <td style="color:#F15A24;">
                    Processing
                </td>
            </tr>

        </table>

        <p style="margin-top:35px;">

            You'll receive another email as soon as your order ships.

        </p>

        <p>

            Thank you for choosing
            <strong>SoleStreet.</strong>

        </p>
    `;

    return baseTemplate({

        title: "Order Confirmation",

        heading: "Your Order Has Been Confirmed 🎉",

        body,

        buttonText: "View Order",

        buttonUrl: orderUrl

    });

};

export default orderConfirmationTemplate;