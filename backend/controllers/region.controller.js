import Region from '../models/region.model.js';

import mongoose from 'mongoose';

export const getAllRegions = async(req, res) =>{
    try{
        const regions = await Region.find({});
        if(!regions){
            res.status(200).json({success: false, message: "No Region saved in Records!"});
        }else{
            res.status(200).json({success: true, data: regions});
        }
    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(200).json({success: false, message: "Server Error occurred!"});
    }

    return res;
}