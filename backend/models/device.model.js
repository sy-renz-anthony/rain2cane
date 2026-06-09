import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    deviceID:{
        type: String,
        required: true
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    lastUpdate:{
        type: Number,
        required: true,
        default: 0
    },
    owner:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    temperature:{
        type: Number,
        required: true,
        default: 0
    },
    humidity:{
        type: Number,
        required: true,
        default: 0
    },
    tankLevel:{
        type: Number,
        default: 0
    },
    isRaining:{
        type: Boolean,
        default: false
    },
    isIrrigating1:{
        type: Boolean,
        default: false
    },
    isIrrigating2:{
        type: Boolean,
        default: false
    },
    isIrrigating3:{
        type: Boolean,
        default: false
    },
    isSoilMoist1:{
        type: Boolean,
        default: false
    },
    isSoilMoist2:{
        type: Boolean,
        default: false
    },
    isSoilMoist3:{
        type: Boolean,
        default: false
    },
    rainGauge:{
        type: Number,
        default: 0
    }
});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;