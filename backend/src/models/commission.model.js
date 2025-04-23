import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
    amount : {
        type: Number,
        required: true,
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},{timestamps: true});

export const Commission = mongoose.model('Commission', CommissionSchema);