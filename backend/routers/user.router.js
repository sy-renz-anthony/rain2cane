import express from 'express';

import userAuthentication from "../functions/userAuthentication.js";
import { register, login, logout, update, changePassword, requestPasswordResetOTP, isOTPCodesCorrect, resetPasswordWithOTP, validateMyPassword, getMyInfo } from '../controllers/user.controller.js';

const router= express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", userAuthentication, logout);
router.put("/update", userAuthentication, update);
router.put("/change-my-password", userAuthentication, changePassword);
router.post("/request-password-reset-otp", requestPasswordResetOTP);
router.post("/validate-otp-codes", isOTPCodesCorrect);
router.post("/reset-password-with-otp", resetPasswordWithOTP);
router.post("/validate-my-password", userAuthentication, validateMyPassword);
router.get("/get-my-info", userAuthentication, getMyInfo);

export default router;