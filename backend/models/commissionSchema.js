import mongoose from 'mongoose'

const commissionSchema = new mongoose.Model({
    amount : Number,
    user : mongoose.Schema.Types.ObjectId,
    createdAt : {
        type : Date,
        default : Date.now
    } 
});

export const Commission = mongoose.model("commission",commissionSchema);