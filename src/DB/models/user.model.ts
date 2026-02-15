// ==================== Import Dependencies & Types ====================
import {HydratedDocument, model,models,Schema, Types } from "mongoose";
import { generateHash } from "../../Utils/security/hash";
import { HUserDocument } from "request.express";
import { emailEvent } from "../../Utils/email/events/email.events";

// ==================== Custom Types & Extensions ====================
type UserDocumentWithExtras = HydratedDocument<IUser> & {
    wasNew: boolean;
    confirmEmailPlainOTP?: string;
};

// ==================== User Enumerations ====================
export enum GenderEnum  {
    MALE = "MALE",
    FEMALE ="FEMALE",
}
export enum RoleEnum  {
    USER ="USER",
    ADMIN ="ADMIN",
}

// ==================== User Interface Definition ====================
export interface IUser {
    _id?: Types.ObjectId;
    firstName: string;
    lastName: string;
    username?: string;
    slug?: string;  

    
    email: string;
    confirmedAt?: Date;
    confirmEmail?: Date;
    confirmEmailOTP?: string;
    confirmEmailOTPExpires?: Date;
   changeCredentialsTime?: Date;
   
       password: string;
    resetPasswordOTP?: string;
   
        phone?: string;
        address?: string;
        gender: GenderEnum;
        role: RoleEnum;
        profileImage?: string;
        createdAt: Date;
        updatedAt?: Date;
}

// ==================== User Schema Implementation ====================
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
    slug: {
        type:String,
        required: true,
        minlength:[2 , "lastName Name must be at least 2 characters long"],
        maxlength:[51 , "lastName Name must be at most 51 characters long"],
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

  
// ==================== Virtual Fields & Setters/Getters ====================

 userSchema.virtual("messages" , {
    localField:"_id",
foreignField:"receiverId", 
ref:"Message",
//justOne:true,


});
userSchema
.virtual("username")
.set(function(value:string){
    const [firstName , lastName] = value.split(" ") || [];
   this.set({ firstName , lastName , slug:value.replaceAll(/\s+/g , "-").toLowerCase()});
})
.get(function() {
return `${this.firstName} ${this.lastName}`;
})

// ==================== Legacy Middleware & Hooks (Commented Out) ====================
// userSchema.pre(["findOneAndUpdate","updateOne"], async function(next) {
//     const query = this.getQuery()
//     const update = this.getUpdate() as UpdateQuery<HUserDocument>;
//    if(update.freezedAt) {
//     this.setUpdate({...update, changeCredentialsTime: new Date()});
//    }
    
// });

// userSchema.post(["findOneAndUpdate","updateOne"],async function(next) {
//     const query = this.getQuery()
//     const update = this.getUpdate() as UpdateQuery<HUserDocument>;
//     console.log({query, update});
//     if(update["$set"].changeCredentialsTime) {
//         const tokenModel = new TokenRepository(TokenModel);
//         await tokenModel.deleteMany({filter:{userId: query._id}});
//     }
// });


// userSchema.pre("save",async function (next) {
//     console.log("Pre Hook 1", this);
//     next();
// });

// userSchema.pre("save", function (next) {
//     console.log("Pre Hook 2", this);
//     next();
// });

// userSchema.post("save", function (doc, next) {
//     console.log("Post Hook 1", doc);
//     next(new BadRequestException("Error From Pre Hook 1"));
// });

// userSchema.post("save", function (doc, next) {
//     console.log("Post Hook 2", doc);
//     next();
// });

// userSchema.pre("validate", function (next) {
//     console.log("Pre Hook" , this );
    
// }) 
// userSchema.pre("validate", function (next) {
//     console.log("pre Hook", this);
//     if (!this.slug?.includes("-")) {
//         throw new BadRequestException("Slug required & must hold - like ex: first-name-last-name"
//         );
//     }
//      next();
    
// });

// userSchema.post("validate", function (doc,next) {
//     console.log("post Hook", doc);
//     next();
    
// });

// userSchema.pre("save", 
//     async function (this:HUserDocument & {wasNew:boolean} ,next) {

//     this.wasNew = this.isNew;
//     console.log(this.wasNew);
// if(this.isModified("password")) {
//     this.password = await generateHash(this.password);
// }
//      next();
// });
// userSchema.post("save", function (doc,next) {
// const that = this as HUserDocument & {wasNew:boolean};
//     if(that.wasNew){
//     emailEvent.emit("confirmEmail" ,{ to: this.email, otp:123456});
// }
// });


// userSchema.pre("findOne", function (next) {
//     console.log({this:this});
//     const query = this.getQuery();
// this.setQuery({...query, freezedAt:{$exists:false}});
//     next();
    
// })

// userSchema.pre("updateOne",
//     { document: true ,query: false },
//     async function (next) {
//     console.log({this: this, query: this.getQuery()});
//     next();
// });

// ==================== Active Document Middleware (Hooks) ====================

// userSchema.pre(["findOneAndDelete","deleteOne"] , async function (next) {
//     const query = this.getQuery();
//     const tokenModel = new TokenRepository(TokenModel);
//     await tokenModel.deleteMany({filter:{userId: query._id}});
// });


// userSchema.pre("insertMany", async function (next, docs) {
//     for (const doc of docs) {
//         doc.password = await generateHash(doc.password);
//     }
//     next();
// });

// ==================== Password Hashing & OTP Generation Hook ====================


userSchema.pre<UserDocumentWithExtras>(
    "save",
    async function (next) {
        this.wasNew = this.isNew;

        if (this.isModified("password")) {
            this.password = await generateHash(this.password);
        }

        if (this.isModified("confirmEmailOTP")) {
            this.confirmEmailPlainOTP = this.confirmEmailOTP as string;
            this.confirmEmailOTP = await generateHash(this.confirmEmailOTP as string);
        }
    }
);

// ==================== Post-Save Email Notification Hook ====================
userSchema.post<UserDocumentWithExtras>("save", async function (doc,next) {
    if (this.wasNew && this.confirmEmailPlainOTP) {
        emailEvent.emit("confirmEmail", {
            to: this.email,
            username: this.username,
            otp: this.confirmEmailPlainOTP,
        });
    }
});

// ==================== Model Export ====================
export const UserModel = models.User || model<IUser>("User", userSchema);