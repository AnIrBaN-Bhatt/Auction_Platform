import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({ 
    userName: {
        type : String,
        minLength: [3,"Name should have atleast 3 characters"],
        maxLength : [40 , "Name should not exceed 40 characters"]
    },
    password : {
        type : String,
        select : false,
        minLength: [8,"password should have atleast 8 characters"],
        maxLength : [32 , "password should not exceed 32 characters"]
    },
    passwordCopy: {
    type: String,
    select: false // optional: keep false so it's not returned in queries unless explicitly selected
},
    email : String,
    address : String,
    phone : {
        type : String,
        minLength : [10, "Phone number should be exactly 10 characters"],
        maxLength : [10, "Phone number should be exactly 10 characters"]
    },
    profileImage : {
        public_id : {
            type : String,
            required : true
        },
        url : {
            type : String,
            required : true    
        }
    },
    paymentMethods: {
        bankTransfer: {
            bankAccountNumber : String,
            bankAccountName : String,
            bankName : String
        },
        upi : {
            upiNumber : Number,
        },
        paypal:{
            paypalEmail : String
        }
    },
    role : {
        type : String,
        enum : ["Auctioneer","Bidder","Super Admin"]
    },
    unpaidCommission : {
        type : Number,
        default : 0
    },
    auctionsWon: {
        type: Number,
        default : 0
    },
    moneySpent: {
        type : Number,
        default : 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }   

});

userSchema.pre("save", async function(next) {          // This is a middleware that runs before saving the user
    if(!this.isModified("password")){                        // If the password is not modified, then it will not run
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);    // Hashing the password with 10 rounds of salt
    next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {  // This is a method that compares the entered password with the hashed password
    return await bcrypt.compare(enteredPassword, this.password); // It returns true if the entered password matches the hashed password
}

userSchema.methods.generateJasonWebToken = function() {  // This is a method that generates a JWT token
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, { // It takes the user id and the secret key from the environment variables
        expiresIn: process.env.JWT_EXPIRE_TIME // It sets the expiration time of the token
    }  
    );
}


export const User = mongoose.model("User", userSchema)               // Create a model named User and apply the style of userSchema 

