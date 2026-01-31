// ==================== Imports ====================

import { sign, verify ,Secret, SignOptions, JwtPayload} from 'jsonwebtoken';
import { RoleEnum, UserModel } from '../../DB/models/user.model';
import { HUserDocument } from '../../Modules/Auth/auth.service';
import { v4 as uuid } from 'uuid';
import { BadRequestException, NotFoundException, UnAuthorizedException } from '../response/error.response';
import { UserRepository } from '../../DB/repository/user.repository';
import { TokenModel } from '../../DB/models/token.model';
import { TokenRepository } from '../../DB/repository/token.repository';


// ==================== Enums ====================
export enum SignatureLevelEnum {
    USER = "USER",
    ADMIN = "ADMIN",    
}

export enum tokenTypeEnum {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH",    
}

export enum LogoutEnum {
    ONLY = "ONLY",
    ALL = "ALL",    
}

// ==================== Token Generation & Verification ====================

export const generateToken = async({
    payload,
    secret,
    options,
}: {
    payload: object;
    secret: Secret;
    options: SignOptions;
}): Promise<string> => {
    return await sign(payload, secret, options);
};


// ==================== Token Verification ====================
export const verifyToken = async({
    token,
    secret,
}: {
    token: string;
    secret: Secret;
}): Promise<JwtPayload> => {
    return await verify(token, secret) as JwtPayload
};

// ==================== Signature Level & Secrets Management ====================

export const getSignatureLevel = async(
    role:RoleEnum = RoleEnum.USER) => {
    let SignatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER;
    switch(role) {
        case RoleEnum.ADMIN:
            SignatureLevel = SignatureLevelEnum.ADMIN;
            break;
        case RoleEnum.USER:
            SignatureLevel = SignatureLevelEnum.USER;
            break;
        default:
        break;
    }   
    return SignatureLevel;
};


// ==================== Get Signatures Based on Level ====================
export const getSignature = async (
    signatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER
): Promise<{ access_token: string; refresh_token: string }> => {
    
    switch (signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            return {
                access_token: process.env.ACCESS_ADMIN_TOKEN_SECRET as string,
                refresh_token: process.env.REFRESH_ADMIN_TOKEN_SECRET as string,
            };
        case SignatureLevelEnum.USER:
            return {
                access_token: process.env.ACCESS_USER_TOKEN_SECRET as string,
                refresh_token: process.env.REFRESH_USER_TOKEN_SECRET as string,
            };
        default:
            return {
                access_token: process.env.ACCESS_USER_TOKEN_SECRET as string,
                refresh_token: process.env.REFRESH_USER_TOKEN_SECRET as string,
            };
    }
};

// ==================== Login Credentials Creation ====================

export const createLoginCredentials = async(user:HUserDocument):
Promise<{ access_token: string; refresh_token:string }>=> {
    const signaturelevel = await getSignatureLevel(user.role);
    const signatures = await getSignature(signaturelevel);

   const jti = uuid();
    const access_token = await generateToken({ 
    payload: { _id: user._id }, 
    secret: signatures.access_token, 
    options: { expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
    jwtid: jti
     },
});

const refresh_token = await generateToken({ 
    payload: { _id: user._id }, 
    secret: signatures.refresh_token, 
    options: { expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
   jwtid: jti
    },
});
return { access_token, refresh_token };
}

// ==================== Token Decoding & Validation ====================

export const decodedToken = async({
    authorization ,
     tokenType = tokenTypeEnum.ACCESS
    }: {
    authorization : string;
     tokenType?: tokenTypeEnum;
    }) => {
        const userModel = new UserRepository(UserModel) ;
        const tokenModel = new TokenRepository(TokenModel);

const [ bearer , token] = authorization.split(" ");
if (!bearer || !token) throw new UnAuthorizedException("Missing Token Parts")
const signatures = await getSignature(bearer as SignatureLevelEnum);

const decoded = await verifyToken({token, secret: tokenType === tokenTypeEnum.REFRESH 
     ?signatures.refresh_token 
     : signatures.access_token});

     if(!decoded?._id || !decoded?.iat) 
        throw new UnAuthorizedException("Invalid Token");
  
const revoked = await tokenModel.findOne({ filter: { jti: decoded.jti as string } });
if (revoked) {
    throw new UnAuthorizedException("Token has been revoked (logged out)");
}
     const user = await userModel.findById({id: {_id: decoded._id}});

    if (!user) throw new NotFoundException("User Not Found");

if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000)
    throw new UnAuthorizedException("Loggedout From All Devices");              
    return { user , decoded };

};

    // ==================== Create Revoke Token ====================
    export const createRevokeToken = async (decoded: JwtPayload) => {
        const tokenModel = new TokenRepository(TokenModel);

        const [results] = await tokenModel.create({
        data: [{
            jti: decoded.jti as string,
            expiresIn: decoded.iat as number,
            userId: decoded._id,
        },
        ],
        }) || [];
        if(!results)
            throw new BadRequestException("Fail To revoke Token ");
        return results;
        
    }