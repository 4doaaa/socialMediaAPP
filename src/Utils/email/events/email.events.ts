import { EventEmitter } from "node:events";

import  Mail from "nodemailer/lib/mailer";
import { template } from "../verify.email.template";
import { sendEmail } from "../send.email";

// ==================== Email Event Emitter Setup ====================

export const emailEvent = new EventEmitter();

// ==================== Email Data Interface ====================

interface IEmail extends Mail.Options {
    otp: number;
    username: string;
}

// ==================== Confirm Email Event Listener ====================

emailEvent.on("confirm email" ,async (data:IEmail) => {
    try {
        data.subject = "Please confirm your email"; 
       data.html = template(String(data.otp), data.username , data.subject);
       await sendEmail(data);
    } catch (error) {
        console.log("Error in sending email event " , error);
    }
});