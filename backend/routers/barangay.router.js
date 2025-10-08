import express from 'express';

import { getAllBarangays, getBarangaysByMunicipality } from '../controllers/barangay.controller.js';
const router= express.Router();

router.get("/get-all", getAllBarangays);
router.post("/search-by-municipality", getBarangaysByMunicipality);

export default router;