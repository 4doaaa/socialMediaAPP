import { Request, Response } from "express";
import { IConfirmEmailDTO, ILoginDTO, ISignupDTO } from "./auth.dto";
import { IUser, UserModel } from "../../DB/models/user.model";
import { BadRequestException, ConflictException, NotFoundException } from "../../Utils/response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { generateOtp } from "../../Utils/security/generateOtp";
import { emailEvent } from "../../Utils/email/events/email.events";
import { createLoginCredentials } from "../../Utils/security/token";  
import { HydratedDocument } from "mongoose";
// ==================== Authentication Service Class ====================

class AuthenticationService {
    private _userModel = new UserRepository(UserModel);
    constructor() {}

    // ==================== Signup Method ====================

    signup = async (req: Request, res: Response): Promise<Response> => {

        const { username, email, password }: ISignupDTO = req.body;

        const checkUser = await this._userModel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser) throw new ConflictException("User Already Exists");
        const otp = generateOtp();
        const user = (await this._userModel.createUser({
            data: [{
                username,
                email,
                password,
                confirmEmailOTP: `${otp}`,
                confirmEmailOTPExpires: new Date(Date.now() + 10 * 60 * 1000),
            }],
            options: { validateBeforeSave: true },

        }));
        await emailEvent.emit("confirm email", {
            to: email,
            username,
            otp,
        });
        return res.status(201).json({ message: "User Created Successfully", user })
    }

    // ==================== Login Method ====================

    login = async (req: Request, res: Response) => {
        const { email, password }: ILoginDTO = req.body;
        const user = await this._userModel.findOne({
            filter: { email},
        });
if (!user) throw new NotFoundException("User Not Found");
if (!user.confirmedAt) throw new BadRequestException("Verify Your Account ");
if (!(await compareHash(password, user.password!!)))
    throw new BadRequestException("Invalid password");

//create token 
const credentials = await createLoginCredentials(user);
        res.status(200).json({ message: "User Logged In Successfully",
        credentials,
            });
    };

    // ==================== Confirm Email Method ====================

   confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    // 1. Find user by email only to check existence first
    const user = await this._userModel.findOne({
        filter: { email },
    });

    // Throw error if user does not exist in the database
    if (!user) {
        throw new NotFoundException("User Not Found");
    }

    // 2. Check if the user has already confirmed their email
    if (user.confirmedAt) {
        throw new BadRequestException("Email is already confirmed");
    }

    // 3. Verify if an OTP exists for this user
    if (!user.confirmEmailOTP) {
        throw new BadRequestException("No OTP found, please request a new one");
    }

    // 4. Check if the OTP has expired
    if (user.confirmEmailOTPExpires && new Date() > user.confirmEmailOTPExpires) {
        throw new BadRequestException("OTP has expired");
    }

    // 5. Compare the provided OTP with the hashed OTP in database
    // Added 'await' because hashing operations are asynchronous
    const isOtpValid = await compareHash(otp, user.confirmEmailOTP as string);
    
    if (!isOtpValid) {
        throw new BadRequestException("Invalid OTP");
    }

    // 6. Update user status and remove OTP fields after successful verification
    await this._userModel.updateOne({
        filter: { email },
        update: {
            confirmedAt: new Date(),
            $unset: { 
                confirmEmailOTP: "", 
                confirmEmailOTPExpires: "" 
            }
        },
    });

    return res.status(200).json({ message: "Email Confirmed Successfully" });
};
}
// ==================== Export Service Instance & Type ====================

export default new AuthenticationService();
export type HUserDocument = HydratedDocument<IUser>;