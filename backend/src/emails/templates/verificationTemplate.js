import baseTemplate from "./baseTemplate.js";

const verificationTemplate = ({
    firstname,
    verifyUrl
}) => {

    const body = `

        <p>

            Hi <strong>${firstname || "there"}</strong>,

        </p>

        <p>

            Thanks for subscribing to
            <strong>SoleStreet</strong>.

        </p>

        <p>

            Please verify your email address by
            clicking the button below.

        </p>

        <p>

            Once verified you'll receive:

        </p>

        <ul>

            <li>🔥 Sneaker releases</li>

            <li>💰 Exclusive discounts</li>

            <li>🚀 Early access to new arrivals</li>

            <li>🎁 Members-only promotions</li>

        </ul>

    `;

    return baseTemplate({

        title: "Verify Subscription",

        heading: "Welcome to SoleStreet",

        body,

        buttonText: "Verify Email",

        buttonUrl: verifyUrl

    });

};

export default verificationTemplate;