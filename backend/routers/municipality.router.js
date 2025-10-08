import express from 'express';

import { getAllMunicipalities, getMunicipalitiesByProvince } from '../controllers/municipality.controller.js';

const router= express.Router();

router.get("/get-all", getAllMunicipalities);
router.post("/search-by-province", getMunicipalitiesByProvince);

export default router;