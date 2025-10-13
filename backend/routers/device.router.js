import express from 'express';

import userAuthentication from "../functions/userAuthentication.js";
import { register } from '../controllers/device.controller.js';

const router= express.Router();

router.post("/register", userAuthentication, register);

export default router;