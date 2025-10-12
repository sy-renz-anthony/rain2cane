import mongoose from "mongoose";

const BarangaySchema = new mongoose.Schema({
    barangay_id:{
        type: Number,
        required: true
    },
    municipality_id:{
        type: Number,
        required: true
    },
    barangay_name:{
        type: String,
        required: true
    }
});

const Barangay = mongoose.model('Barangay', BarangaySchema);

export default Barangay;