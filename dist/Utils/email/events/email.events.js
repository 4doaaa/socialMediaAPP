"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const verify_email_template_1 = require("../verify.email.template");
const send_email_1 = require("../send.email");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("confirm email", async (data) => {
    try {
        data.subject = "Please confirm your email";
        data.html = (0, verify_email_template_1.template)(String(data.otp), data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("Error in sending email event ", error);
    }
});
