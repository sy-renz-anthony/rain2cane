import mongoose from "mongoose";

const RegionSchema = new mongoose.Schema({
    regionID:{
        type: Number,
        required: true
    },
    regionName:{
        type: String,
        required: true
    },
    regionDescription:{
        type: String,
        default: ""
    }
});

const Region = mongoose.model('Region', RegionSchema);

export default Region;