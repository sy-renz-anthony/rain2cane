import Municipality from '../models/municipality.model.js';

import mongoose from 'mongoose';

export const getAllMunicipalities = async(req, res) =>{
    try{
        const municipalities = await Municipality.find({});
        if(!municipalities){
            res.status(200).json({success: false, message: "No Municipality saved in Records!"});
        }else{
            res.status(200).json({success: true, data: municipalities});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}

export const getMunicipalitiesByProvince = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const provinceID = req.body.provinceID;
    if(!Number.isInteger(provinceID) || provinceID < 1 || provinceID > 82){
        return res.status(200).json({success: false, message: "Invalid Province ID!"});
    }

    try{
        const municipalities = await Municipality.find({"province_id": provinceID});
        if(!municipalities){
            res.status(200).json({success: false, message: "No Municipality found!"});
        }else{
            res.status(200).json({success: true, data: municipalities});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}