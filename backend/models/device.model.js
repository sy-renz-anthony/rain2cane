import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    deviceID:{
        type: String,
        required: true
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
    tankWaterLevel:{
        type: Number,
        required: true,
        default: 0
    },
    atmosphereHumidity:{
        type: Number,
        required: true,
        default: 0
    },
    atmosphereMoisture:{
        type: Number,
        required: true,
        default: 0
    },
    soilMoisture:{
        type: Number,
        required: true,
        default: 0
    },
    status:{
        type: String,
        required: true
    },
    lastUpdate:{
        type: Date,
        required: true,
        default: Date.now()
    }
});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;