import { Router } from "express";
import { signup } from "../controllers/AuthController.js";
import {
  login,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logOut,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/profiles/" });
const authRoutes = Router();

authRoutes.post("/signup", signup);

authRoutes.post("/login", login);

authRoutes.get("/user-info", verifyToken, getUserInfo);

authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
export default authRoutes;

authRoutes.post("/logout", logOut);
