import express from 'express';

import { getAllRegions } from '../controllers/region.controller.js';

const router= express.Router();

router.get("/get-all", getAllRegions);

export default router;