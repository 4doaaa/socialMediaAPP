import {model,models,Schema, Types } from "mongoose";
// ==================== Enums ====================

export enum GenderEnum  {
    MALE = "MALE",
    FEMALE ="FEMALE",
}
export enum RoleEnum  {
    USER ="USER",
    ADMIN ="ADMIN",
}

// ==================== User Interface ====================

export interface IUser {
    _id?: Types.ObjectId;
    firstName: string;
    lastName: string;
    username?: string;  

    email: string;
    confirmedAt?: Date;
    confirmEmail?: Date;
    confirmEmailOTP?: string;
    confirmEmailOTPExpires?: Date;
   changeCredentialsTime?: Date;
   
       password?: string;
    resetPasswordOTP?: string;
   
        phone?: string;
        address?: string;
        gender: GenderEnum;
        role: RoleEnum;
        profileImage?: string;
        createdAt: Date;
        updatedAt?: Date;
}

// ==================== User Schema Definition ====================

export const userSchema = new Schema<IUser>({
    firstName: {
        type:String,
        required: true,
        minlength:[2 , "First Name must be at least 2 characters long"],
        maxlength:[20 , "First Name must be at most 20 characters long"],
    },
    lastName: {
        type:String,
        required: true,
        minlength:[2 , "lastName Name must be at least 2 characters long"],
        maxlength:[20 , "lastName Name must be at most 20 characters long"],
    },
    email:
    {
        type:String,
        required: true,
        unique: true,
    },
    confirmEmailOTP: String,
    confirmedAt: Date,  
    changeCredentialsTime: { type: Date },

    password: {
        type:String,
        required:true,
    },
   resetPasswordOTP:{
        type:String,
   },
    phone: String,
    address: String,
    profileImage: String,

    gender: {
        type:String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    role: {
        type:String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER,
},
},
 {timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
  });

// ==================== Virtual Fields ====================

 userSchema.virtual("messages" , {
    localField:"_id",
foreignField:"receiverId", 
ref:"Message",
//justOne:true,


});
userSchema.virtual("username").set(function(value:string){
    const [firstName , lastName] = value.split(" ") || [];
   this.set({ firstName , lastName });
}).get(function() {
return `${this.firstName} ${this.lastName}`;
})

// ==================== User Model Export ====================

export const UserModel = models.User || model("User", userSchema);

