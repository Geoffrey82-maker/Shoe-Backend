import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Email server ready");
    }
});

export default transporter;
