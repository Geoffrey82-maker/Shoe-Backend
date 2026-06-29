import transporter from "../config/email.js";

import verificationTemplate
    from "../emails/templates/verificationTemplate.js";

import welcomeTemplate
    from "../emails/templates/welcomeTemplate.js";

export const sendVerificationEmail = async (
    subscriber
) => {

    const verifyUrl =
        `${process.env.FRONTEND_URL}/verify-subscription/${subscriber.verificationToken}`;

    await transporter.sendMail({

        from:
            `"SoleStreet" <${process.env.EMAIL_USER}>`,

        to: subscriber.email,

        subject:
            "Verify your SoleStreet Newsletter Subscription",

        html: verificationTemplate({

            firstname: subscriber.firstname,

            verifyUrl

        })

    });

};

export const sendWelcomeEmail = async (
    subscriber
) => {

    await transporter.sendMail({

        from:
            `"SoleStreet" <${process.env.EMAIL_USER}>`,

        to: subscriber.email,

        subject:
            "Welcome to SoleStreet 👟",

        html: welcomeTemplate({

            firstname: subscriber.firstname

        })

    });

};