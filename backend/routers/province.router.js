import express from 'express';

import { getAllProvinces, getProvincesByRegion } from '../controllers/province.controller.js';

const router= express.Router();

router.get("/get-all", getAllProvinces);
router.post("/search-by-region", getProvincesByRegion);

export default router;