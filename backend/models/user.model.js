import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    password:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    middleName:{
        type: String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true
    },
    emailAddress:{
        type: String,
        required: true,
        unique: true
    },
    sendSmsNotification:{
        type: Boolean,
        required: true,
        default: false
    },
    resetOTP:{
        type: String,
        default: ""
    },
    resetOTPExpire:{
        type: Number,
        default: 0
    },
    address:{
        type: String,
        required: false
    },
    region:{
        type: mongoose.Types.ObjectId,
        ref: 'Region',
        required: true
    },
    province:{
        type: mongoose.Types.ObjectId,
        ref: 'Province',
        required: true
    },
    municipality:{
        type: mongoose.Types.ObjectId,
        ref: 'Municipality',
        required: true
    },
    barangay:{
        type: mongoose.Types.ObjectId,
        ref: 'Barangay',
        required: true
    },
    profilePic:{
        type: String,
        default: ""
    }
});

const User=mongoose.model('User', UserSchema);

export default User;