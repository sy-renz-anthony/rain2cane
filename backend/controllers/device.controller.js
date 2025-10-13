import Device from "../models/device.model";

import mongoose from "mongoose";

export const register = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const lName = req.body.lastName;
    const fName = req.body.firstName;
    const mName = req.body.middleName;
    const contactNum = req.body.contactNumber;
    const emailAdd = req.body.emailAddress;
    const add = req.body.address;
    var sendSmsNotification = req.body.sendSmsNotification;
    const region = req.body.region;
    const province = req.body.province;
    const municipality = req.body.municipality;
    const barangay = req.body.barangay;

    if(!lName){
        return res.status(200).json({success: false, message: "Please provide the your Last Name!"});
    }else if(!fName){
        return res.status(200).json({success: false, message: "Please provide the your First Name!"});
    }else if(!mName){
        return res.status(200).json({success: false, message: "Please provide the your Middle Name!"});
    }

    if(!contactNum){
        return res.status(200).json({success: false, message: "Please provide the your Contact Number!"});
    }

    if(!emailAdd){
        return res.status(200).json({success: false, message: "Please provide the your Email Address!"});
    }

    if(!typeof(sendSmsNotification) == Boolean || !sendSmsNotification){
        sendSmsNotification=false;
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

    //return res.status(200).json({success: true, message: "Ok"});
    const salt = Number (process.env.SALT || 10);

    const session = await mongoose.startSession();
    
    try{

        if(await isUserEmailExisting(emailAdd)){
            return res.status(200).json({success: false, message: "Email Address is already in use!"});
        }

        session.startTransaction();
        
        const pwd = Math.random().toString(36).slice(2, 12);
        const hashedPassword = await bcrypt.hash(pwd, salt);

        let user = new User();
        user.password = hashedPassword;
        user.lastName=lName;
        user.firstName=fName;
        user.middleName=mName;
        user.contactNumber=contactNum;
        user.emailAddress=emailAdd;
        user.address=add;
        user.sendSmsNotification = sendSmsNotification;
        user.region=region;
        user.province=province;
        user.municipality=municipality;
        user.barangay=barangay;
        
        await user.save({session});
        
        await sendNewPasswordEmail(emailAdd, fName+" "+lName, pwd);
        
        await session.commitTransaction();
        user=user.toObject();

        delete user.password;
        delete user.resetOTP;
        delete user.resetOTPExpire;

        res.status(200).json({success: true, data: [user]});
    }catch(error){
        
        if(session.inTransaction()){
            await session.abortTransaction();
        }
        console.error("Error in User Account creation! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        await session.endSession();
    }

    return res;
}