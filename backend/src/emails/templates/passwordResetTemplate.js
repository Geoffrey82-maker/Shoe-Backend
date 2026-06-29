import baseTemplate from "./baseTemplate.js";

const passwordResetTemplate = ({
    firstname,
    resetUrl
}) => {

    const body = `
        <p>

            Hi <strong>${firstname}</strong>,

        </p>

        <p>

            We received a request to reset your
            SoleStreet password.

        </p>

        <p>

            Click the button below to create a
            new password.

        </p>

        <p>

            This link expires in
            <strong>15 minutes</strong>.

        </p>

        <p>

            If you didn't request this,
            simply ignore this email.

        </p>
    `;

    return baseTemplate({

        title: "Reset Password",

        heading: "Reset Your Password",

        body,

        buttonText: "Reset Password",

        buttonUrl: resetUrl

    });

};

export default passwordResetTemplate;