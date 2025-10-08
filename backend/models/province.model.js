import mongoose from "mongoose";

const ProvinceSchema = new mongoose.Schema({
    provinceID:{
        type: Number,
        required: true
    },
    regionID:{
        type: Number,
        required: true
    },
    provinceName:{
        type: String,
        required: true
    }
});

const Province = mongoose.model('Province', ProvinceSchema);

export default Province;