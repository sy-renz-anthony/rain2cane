import mongoose from "mongoose";

const MunicipalitySchema = new mongoose.Schema({
    municipality_id:{
        type: Number,
        required: true
    },
    province_id:{
        type: Number,
        required: true
    },
    municipality_name:{
        type: String,
        required: true
    }
});

const Municipality = mongoose.model('Municipality', MunicipalitySchema);

export default Municipality;