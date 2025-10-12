import User from '../models/user.model.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { isUserEmailExisting, isAddressValid } from '../functions/functions.js';
import { sendPasswordResetOTPEmail, sendNewPasswordEmail } from '../functions/emailService.js';


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

export const update = async(req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const id = req.body._id;
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

    if(!id || !mongoose.isValidObjectId(id)){
        return res.status(200).json({success: false, message: "Invalid User DB ID!"});
    }

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

    const session = await mongoose.startSession();
    
    try{

        const user= await User.findById(id);
        if(!user){
            return res.status(200).json({success: false, message: "Please Login Properly!"});
        }


        if(await isUserEmailExisting(emailAdd, id)){
            return res.status(200).json({success: false, message: "Email Address is already in use!"});
        }

        session.startTransaction();
        
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
        
        let updatedUser =await User.findByIdAndUpdate(id, user, {new:true, session});
        //this convert the mongoose object into plain javascript object to delete the critical info later
        updatedUser = updatedUser.toObject();
        await session.commitTransaction();

        delete updatedUser.password;
        delete updatedUser.resetOTP;
        delete updatedUser.resetOTPExpire;

        res.status(200).json({success: true, data: [updatedUser]});
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

export const login = async (req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const emailAddress = req.body.emailAddress;
    const password = req.body.password;

    if(!emailAddress){
        return res.status(200).json({success: false, message: "Invalid Email Address!"});
    }

    if(!password){
        return res.status(200).json({success: false, message: "Invalid Password!"});
    }

    try{
        const userData = await User.findOne({emailAddress});
        if(!userData){
            return res.status(200).json({success: false, message: "Invalid Email Address or Password!"});
        }

        const correctPassword = await bcrypt.compare(password, userData.password);

        if(!correctPassword){
            return res.status(200).json({success: false, message: "Invalid Email Address or Password!"});
        }

        const token = jwt.sign({id: userData._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({success: true, message: "Login Successful!", token: token});

    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }

    return res;
}

export const logout = async (req, res) =>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict'
        });

        res.status(200).json({success: true, message: "Logged out!"});
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }

    return res;
}

export const changePassword = async (req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const newPassword=req.body.password;
    const confirmNewPassword=req.body.confirmPassword;
    const id = req.body._id;

    if(!newPassword || newPassword.length < 10){
        return res.status(404).json({success: false, message: "Invalid new password!"});
    }
    if(!confirmNewPassword){
        return res.status(404).json({success: false, message: "Please confirm new password!"});
    }
    if(newPassword !== confirmNewPassword){
        return res.status(404).json({success: false, message: "Passwords mismatched! Please confirm new password again!"});
    }

    if(!id || !mongoose.isValidObjectId(id)){
        return res.status(401).json({success: false, message: "Please Login Properly!"});
    }

    const salt = Number (process.env.SALT || 10);
    const session = await mongoose.startSession();
    try{
        const user=await User.findById(id);
        if(!user){
            return res.status(401).json({success: false, message: "Authentication failed!"});
        }

        session.startTransaction();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await User.findByIdAndUpdate(id, user, {new: true, session});
        await session.commitTransaction();
        res.status(200).json({success: true, message: "Password updated successfully!"});
    }catch(error){
        console.log("error changing password: - "+error.message);
        res.status(500).json({success: false, message: "Server Error!\n"+error.message});
        await session.abortTransaction();
    }finally{
        await session.endSession();
    }

    return res;
}

export const requestPasswordResetOTP = async (req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const email = req.body.emailAddress;

    if(!email){
        return res.status(200).json({success: false, message: "Invalid email!"});
    }

    const session = await mongoose.startSession();
    try{
        const userData = await User.findOne({emailAddress: email});
        if(!userData){
            res.status(200).json({success: false, message: "No User Account found with this email!"});
        }else{
            session.startTransaction();
            const otp = String(Math.floor(100000 + Math.random() * 900000));

            userData.resetOTP = otp;
            userData.resetOTPExpire = Date.now() + 5 * 60 * 1000;

            await User.findByIdAndUpdate(userData._id, userData, {new:true, session});

            await sendPasswordResetOTPEmail(userData.emailAddress, userData.firstName+" "+userData.lastName, otp);

            await session.commitTransaction();
            res.status(200).json({success: true, message: "Password Reset OTP codes sent successfully!"});
        }

    }catch(error){
        await session.abortTransaction();
        console.error("Error in creating a Password reset OTP codes for User Account! - "+error.message);
        res.status(500).json({success: false, message: error.message});
    }finally{
        await session.endSession();
    }

    return res;
}

export const isOTPCodesCorrect = async (req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const email = req.body.emailAddress;
    const otp = req.body.otp;
    
    if(!email){
        return res.status(200).json({success: false, message: "Please provide your Email Address to reset password!"});
    }else if(!otp){
        return res.status(200).json({success: false, message: "Input the OTP codes to reset password!"});
    }

    try{
        const userData = await User.findOne({"emailAddress": email});

        var output = {success: true, message: "OTP codes are valid!"};

        if(!userData){
            output={success: false, message: "User Account not found!"};
        }else if(userData.resetOTP === "" || userData.resetOTP !== otp){
            output = {success: false, message: "Invalid OTP codes!"};
        }else if(userData.resetOTPExpire <= Date.now()){
            output={success: false, message: "OTP codes are already expired!"};
        }

        res.status(200).json(output);
        
    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }

    return res;
}

export const resetPasswordWithOTP = async (req, res) =>{
    if(!req.body){
        return res.status(200).json({success: false, message: "Invalid values!"});
    }

    const email = req.body.emailAddress;
    const otp = req.body.otp;
    const newPassword =req.body.password;
    const confirmNewPassword = req.body.confirmPassword;

    if(!email){
        return res.status(200).json({success: false, message: "Please provide your Email Address to reset password!"});
    }else if(!otp){
        return res.status(200).json({success: false, message: "Input the OTP codes to reset password!"});
    }else if(!newPassword){
        return res.status(200).json({success: false, message: "Please input your new password!"});
    }else if(newPassword.length<10){
        return res.status(200).json({success: false, message: "Passwords should not be less than 10 characters in length!"});
    }else if(!confirmNewPassword){
        return res.status(200).json({success: false, message: "Please confirm your password!"});
    }else if(newPassword !== confirmNewPassword){
        return res.status(200).json({success: false, message: "Passwords mismatched! Please confirm your password again."});
    }

    try{
        const userData = await User.findOne({"emailAddress": email});

        if(!userData){
            res.status(200).json({success: false, message: "User Account not found!"});
        }else if(userData.resetOTP === "" || userData.resetOTP !== otp){
            res.status(200).json({success: false, message: "Invalid OTP codes!"});
        }else if(userData.resetOTPExpire <= Date.now()){
            res.status(200).json({success: false, message: "OTP codes are already expired!"});
        }else{
            const salt = Number (process.env.SALT || 10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            userData.password = hashedPassword;
            userData.resetOTP="";
            userData.resetOTPExpire=0;
            
            await User.findByIdAndUpdate(userData._id, userData);

            res.status(200).json({success: true, message: "Password reset successfully!"});
        }

    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }

    return res;
}

export const validateMyPassword = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }
    const id= req.body._id;
    const password=req.body.password;

    if(!id || !mongoose.isValidObjectId(id)){
        return res.status(401).json({success: false, message: "Please Login properly!"});
    } 

    if(!password){
        return res.status(200).json({success: false, message: "Invalid Password!"});
    }

    try{
        const personalInfo = await User.findById(id).select("-resetOTPExpire -resetOTP");
        if(!personalInfo){
            return res.status(401).json({success: false, message: "Please Login properly!"});
        }

        const correctPassword = await bcrypt.compare(password, personalInfo.password);

        if(!correctPassword){
            return res.status(200).json({success: false, message: "Invalid Password!"});
        }

        res.status(200).json({success: true, message:"Password Validated!"});

    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(500).json({success: false, message: "Server Error!\n"+error.message});
    }

    return res;
}

export const getMyInfo = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }
    const id= req.body._id;

    if(!id || !mongoose.isValidObjectId(id)){
        return res.status(401).json({success: false, message: "Please Login properly!"});
    } 

    try{
        const personalInfo = await User.findById(id).select("-password -resetOTPExpire -resetOTP");
        if(!personalInfo){
            return res.status(401).json({success: false, message: "Please Login properly!"});
        }

        res.status(200).json({success: true, data: [personalInfo]});

    }catch(error){
        console.log("Server Error! - "+error.message);
        res.status(500).json({success: false, message: "Server Error!\n"+error.message});
    }

    return res;
}