import mongoose from "mongoose";

const BarangaySchema = new mongoose.Schema({
    barangayID:{
        type: Number,
        required: true
    },
    municipalityID:{
        type: Number,
        required: true
    },
    barangayName:{
        type: String,
        required: true
    }
});

const Barangay = mongoose.model('Barangay', BarangaySchema);

export default Barangay;