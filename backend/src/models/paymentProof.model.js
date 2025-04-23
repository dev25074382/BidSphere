import mongoose from "mongoose";

const PaymentProofSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    proof: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum : ['Pending', 'Approved', 'Rejected','Settled'],
        default: 'Pending',
    },
    comment :{
        type: String,
    }
},{timestamps: true});

export const PaymentProof = mongoose.model('PaymentProof', PaymentProofSchema);