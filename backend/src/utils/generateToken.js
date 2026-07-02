import jwt from 'jsonwebtoken';

const generateToken = (userId) => {

    if (!process.env.JWT_SECRET) {

        throw new Error("JWT_SECRET is not configured.");

    }

    if (!process.env.JWT_EXPIRES_IN) {

        throw new Error("JWT_EXPIRES_IN is missing.");

    }

    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,

            algorithm: "HS256"
        }
    );
};

export default generateToken;