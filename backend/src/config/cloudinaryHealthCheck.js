import cloudinary from "./cloudinary.js";

const cloudinaryHealthCheck = async () => {
    try {
        const result = await cloudinary.api.ping();

        console.log("Cloudinary connected");
        console.log(result);
    }catch(error) {
        console.log("Cloudinary Connection Failed");
        console.log(error.message);

        process.exitCode = 1;
    }
};

export default cloudinaryHealthCheck;