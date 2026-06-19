import express from "express";
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword, 
  uploadAvatar,
  getAddresses,
  addAddress,
  deleteAddress,
  updateAddress,
  setDefaultAddress
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

import validate from "../middleware/validationMiddlware.js";
import { registerValidator } from "../validators/authValidator.js";
import avatarUpload from "../middleware/avatarUploadMiddleware.js";

const router = express.Router();

// ------- Auth routes

router.post(
  '/register', 
  registerValidator, 
  validate, register
);
router.post(
  '/login', 
  login
);

router.get(
  '/profile', 
  protect, 
  getProfile
);

router.post(
  "/forgot-password", 
  forgotPassword
);

router.post(
  "/reset-password/:token", 
  resetPassword
);

router.put(
  "/profile", 
  protect, 
  updateProfile
);

router.put(
  "/change-password", 
  protect, 
  changePassword
);

router.put(
  "/avatar", 
  protect, 
  avatarUpload.single("avatar"), 
  uploadAvatar
);

// Addresses routes
router.get(
    "/addresses",
    protect,
    getAddresses
);

router.post(
    "/addresses",
    protect,
    addAddress
);

router.delete(
    "/addresses/:id",
    protect,
    deleteAddress
);

router.put(
    "/addresses/:id",
    protect,
    updateAddress
);

router.put(
    "/addresses/:id/default",
    protect,
    setDefaultAddress
);

export default router;