import mongoose from "mongoose";

const RegionSchema = new mongoose.Schema({
    region_id:{
        type: Number,
        required: true
    },
    region_name:{
        type: String,
        required: true
    },
    region_description:{
        type: String,
        default: ""
    }
});

const Region = mongoose.model('Region', RegionSchema);

export default Region;