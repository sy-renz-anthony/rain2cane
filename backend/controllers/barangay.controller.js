import Barangay from '../models/barangay.model.js';

import mongoose from 'mongoose';

export const getAllBarangays = async(req, res) =>{
    try{
        const barangays = await Barangay.find({});
        if(!barangays){
            res.status(200).json({success: false, message: "No Barangays saved in Records!"});
        }else{
            res.status(200).json({success: true, data: barangays});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}

export const getBarangaysByMunicipality = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const municipalityID = req.body.municipalityID;
    if(!Number.isInteger(municipalityID) || municipalityID < 1 ){
        return res.status(200).json({success: false, message: "Invalid Municipality ID!"});
    }

    try{
        const barangays = await Barangay.find({"municipality_id": municipalityID});
        if(!barangays){
            res.status(200).json({success: false, message: "No Barangay found!"});
        }else{
            res.status(200).json({success: true, data: barangays});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}