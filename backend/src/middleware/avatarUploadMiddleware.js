import multer from "multer";
import { CloudinaryStorage }
from "multer-storage-cloudinary";

import cloudinary
from "../config/cloudinary.js";

const storage =
new CloudinaryStorage({

    cloudinary,

    params: {

        folder:
        "shoe-store-avatars",

        allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "webp"
        ]

    }

});

const avatarUpload =
multer({
    storage
});

export default avatarUpload;