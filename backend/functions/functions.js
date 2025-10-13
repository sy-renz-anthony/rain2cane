import User from '../models/user.model.js';
import Device from '../models/device.model.js';
import mongoose from 'mongoose';
import Barangay from '../models/barangay.model.js';
import Municipality from '../models/municipality.model.js';
import Province from '../models/province.model.js';
import Region from '../models/region.model.js';

export const isUserEmailExisting = async (email, idToExcempt) =>{
    try{
        const user=await User.find({emailAddress: email});

        if(!user || user.length<1){
            return false;
        }else if(idToExcempt == user[0]._id){
            return false;
        }else{
            return true;
        }
    }catch(error){
        console.error("Error in checking existence of User email! - "+error.message);
        error.message = "Server Error!\n"+error.message;
        throw(error);
    }
}

export const isDeviceIDExisting = async (deviceID, idToExcempt) =>{
    try{
        const device=await Device.find({"deviceID": deviceID});

        if(!device || device.length<1){
            return false;
        }else if(idToExcempt == device[0]._id){
            return false;
        }else{
            return true;
        }
    }catch(error){
        console.error("Error in checking existence of Device ID! - "+error.message);
        error.message = "Server Error!\n"+error.message;
        throw(error);
    }
}

export const isDateValid = async (stringInput) =>{
    if(typeof stringInput != 'string'){
        return false;
    }

    const tokens = stringInput.split("-");
    if(tokens.length != 3){
        return false;
    }

    for(var i=0; i<tokens.length; i++){
        if(isNaN(tokens[i]))
            return false;
    }

    if(tokens[0]<999)
        return false;

    if(tokens[1]<1 || tokens[1]>12)
        return false;

    if(tokens[2]<1)
        return false;
    else if(tokens[1] == 2 && tokens[2]>29)
        return false;
    else if((tokens[1] == 1 || tokens[1] == 3 || tokens[1] == 5 || tokens[1] == 7 || tokens[1] == 8 || tokens[1] == 10 || tokens[1] == 12) && tokens[2] > 31)
        return false;
    else if((tokens[1] == 4 || tokens[1] == 6 || tokens[1] == 9 || tokens[1] == 11) && tokens[2] > 30)
        return false;
    
    return true;
}

export const isAddressValid = async (region, province, municipality, barangay ) =>{
    if(!region || !mongoose.isValidObjectId(region)){
        return false;
    }
    
    if(!province || !mongoose.isValidObjectId(province)){
        return false;
    }
    
    if(!municipality || !mongoose.isValidObjectId(municipality)){
        return false;
    }
    
    if(!barangay || !mongoose.isValidObjectId(barangay)){
        return false;
    }

    try{
        const barangayData = await Barangay.findById(barangay);
        const municipalityData = await Municipality.findById(municipality);
        const provinceData = await Province.findById(province);
        const regionData = await Region.findById(region);

        if(!barangay || !municipality || !province || !regionData){
            return false;
        }

        if(barangayData.municipality_id != municipalityData.municipality_id || municipalityData.province_id != provinceData.province_id || provinceData.region_id !== regionData.region_id){

            console.log("check");
            return false;
        }

    }catch(error){
        console.error("Error in checking validity of address! - "+error.message);
        return false;
    }

    return true;
}