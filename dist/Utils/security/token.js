"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodedToken = exports.createLoginCredentials = exports.getSignature = exports.getSignatureLevel = exports.verifyToken = exports.generateToken = exports.tokenTypeEnum = exports.SignatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["USER"] = "USER";
    SignatureLevelEnum["ADMIN"] = "ADMIN";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["ACCESS"] = "ACCESS";
    tokenTypeEnum["REFRESH"] = "REFRESH";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
const generateToken = async ({ payload, secret, options, }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return await (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const getSignatureLevel = async (role = user_model_1.RoleEnum.USER) => {
    let SignatureLevel = SignatureLevelEnum.USER;
    switch (role) {
        case user_model_1.RoleEnum.ADMIN:
            SignatureLevel = SignatureLevelEnum.ADMIN;
            break;
        case user_model_1.RoleEnum.USER:
            SignatureLevel = SignatureLevelEnum.USER;
            break;
        default:
            break;
    }
    return SignatureLevel;
};
exports.getSignatureLevel = getSignatureLevel;
const getSignature = async (signatureLevel = SignatureLevelEnum.USER) => {
    let signatures = {
        access_token: "",
        refresh_token: "",
    };
    switch (signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            signatures.access_token = process.env.ACCESS_ADMIN_TOKEN_SECRET;
            signatures.refresh_token = process.env.REFRESH_ADMIN_TOKEN_SECRET;
        case SignatureLevelEnum.USER:
            signatures.access_token = process.env.ACCESS_USER_TOKEN_SECRET;
            signatures.refresh_token = process.env.REFRESH_USER_TOKEN_SECRET;
        default:
            break;
    }
    return signatures;
};
exports.getSignature = getSignature;
const createLoginCredentials = async (user) => {
    const signaturelevel = await (0, exports.getSignatureLevel)(user.role);
    const signatures = await (0, exports.getSignature)(signaturelevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.access_token,
        options: { expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
            jwtid,
        },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refresh_token,
        options: { expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
            jwtid,
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = tokenTypeEnum.ACCESS }) => {
    const userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token)
        throw new error_response_1.UnAuthorizedException("Missing Token Parts");
    const signatures = await (0, exports.getSignature)(bearer);
    const decoded = await (0, exports.verifyToken)({ token, secret: tokenType === tokenTypeEnum.REFRESH
            ? signatures.refresh_token
            : signatures.access_token });
    if (!decoded?._id || !decoded?.iat)
        throw new error_response_1.UnAuthorizedException("Invalid Token");
    const user = await userModel.findById({ id: { _id: decoded._id } });
    if (!user)
        throw new error_response_1.NotFoundException("User Not Found");
    return { user, decoded };
};
exports.decodedToken = decodedToken;
