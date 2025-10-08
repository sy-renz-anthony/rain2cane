import mongoose from "mongoose";

const MunicipalitySchema = new mongoose.Schema({
    municipalityID:{
        type: Number,
        required: true
    },
    provinceID:{
        type: Number,
        required: true
    },
    municipalityName:{
        type: String,
        required: true
    }
});

const Municipality = mongoose.model('Municipality', MunicipalitySchema);

export default Municipality;