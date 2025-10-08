import Province from '../models/province.model.js';

import mongoose from 'mongoose';

export const getAllProvinces = async(req, res) =>{
    try{
        const provinces = await Province.find({});
        if(!provinces){
            res.status(200).json({success: false, message: "No Province saved in Records!"});
        }else{
            res.status(200).json({success: true, data: provinces});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}

export const getProvincesByRegion = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const regionID = req.body.regionID;
    if(!Number.isInteger(regionID) || regionID < 1 || regionID > 17){
        return res.status(200).json({success: false, message: "Invalid region ID!"});
    }

    try{
        const provinces = await Province.find({"region_id": regionID});
        if(!provinces){
            res.status(200).json({success: false, message: "No Province found!"});
        }else{
            res.status(200).json({success: true, data: provinces});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}