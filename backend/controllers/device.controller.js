import Device from "../models/device.model.js";
import User from "../models/user.model.js";

import mongoose from "mongoose";
import { isDeviceIDExisting, isAddressValid } from "../functions/functions.js";

export const register = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const owner = req.body._id;
    const deviceID = req.body.deviceID;
    const address=req.body.address;
    const region = req.body.region;
    const province = req.body.province;
    const municipality = req.body.municipality;
    const barangay = req.body.barangay;

    

    if(!deviceID){
        return res.status(200).json({success: false, message: "Please provide the Device ID!"});
    }

    if(!owner || !mongoose.isValidObjectId(owner)){
        return res.status(200).json({success: false, message: "Please Login properly!"});
    }

    if(!region || !mongoose.isValidObjectId(region)){
        return res.status(200).json({success: false, message: "Invalid Region!"});
    }

    if(!province || !mongoose.isValidObjectId(province)){
        return res.status(200).json({success: false, message: "Invalid Province!"});
    }

    if(!municipality || !mongoose.isValidObjectId(municipality)){
        return res.status(200).json({success: false, message: "Invalid Municipality!"});
    }

    if(!barangay || !mongoose.isValidObjectId(barangay)){
        return res.status(200).json({success: false, message: "Invalid Barangay!"});
    }

    if(!await isAddressValid(region, province, municipality, barangay)){
        return res.status(200).json({success: false, message: "Invalid Address!"});
    }

    
    const session = await mongoose.startSession();
    
    try{

        if(await isDeviceIDExisting(deviceID)){
            return res.status(200).json({success: false, message: "Device ID is already registered!"});
        }

        const ownerData = await User.findById(owner);
        if(!ownerData || ownerData.length<1){
            return res.status(200).json({success: false, message: "Please Login properly!"});
        }

        session.startTransaction();
        
        let device = new Device();
        device.deviceID=deviceID;
        device.owner=owner;
        device.address=address;
        device.region=region;
        device.province=province;
        device.municipality=municipality;
        device.barangay=barangay;
        
        await device.save({session});
        
        await session.commitTransaction();
        
        res.status(200).json({success: true, data: [device]});
    }catch(error){
        
        if(session.inTransaction()){
            await session.abortTransaction();
        }
        console.error("Error in registering Device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        await session.endSession();
    }

    return res;
}