import mongoose from "mongoose";

const ProvinceSchema = new mongoose.Schema({
    province_id:{
        type: Number,
        required: true
    },
    region_id:{
        type: Number,
        required: true
    },
    province_name:{
        type: String,
        required: true
    }
});

const Province = mongoose.model('Province', ProvinceSchema);

export default Province;