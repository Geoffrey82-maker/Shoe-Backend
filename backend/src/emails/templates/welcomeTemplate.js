import baseTemplate from "./baseTemplate.js";

const welcomeTemplate = ({
    firstname
}) => {

    const body = `

        <p>

            Hi <strong>${firstname || "Sneaker Lover"}</strong>,

        </p>

        <p>

            Your newsletter subscription has been successfully verified.

        </p>

        <p>

            From today you'll receive:

        </p>

        <ul>

            <li>👟 New sneaker releases</li>

            <li>💰 Exclusive discounts</li>

            <li>🚀 Early access to limited collections</li>

            <li>🎁 Members-only offers</li>

        </ul>

        <p>

            Thank you for joining the SoleStreet family.

        </p>

    `;

    return baseTemplate({

        title: "Welcome to SoleStreet",

        heading: "Subscription Confirmed",

        body,

        buttonText: "Start Shopping",

        buttonUrl: process.env.FRONTEND_URL

    });

};

export default welcomeTemplate;