import transporter from "../config/email.js";

export const sendOrderConfirmationEmail = async (email, orderNumber) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Order Confirmation",
        html: `
            <h2>Thank you for ordering at Shoe Store</h2>
            <p>
                Your order <strong>${orderNumber}</strong>
                has been received.
            </p>
        `
    });
};

export const sendPasswordResetEmail =
async(email, resetUrl)=>{

    await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Password Reset Request",

        html: `
            <h2>Password Reset</h2>

            <p>
                You requested a password reset.
            </p>

            <p>
                Click the link below:
            </p>

            <a href="${resetUrl}">
                Reset Password
            </a>

            <p>
                This link expires in
                15 minutes.
            </p>
        `
    });

};