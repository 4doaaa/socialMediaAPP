// ==================== Module Imports & Dependencies ====================

import { Router } from 'express';
import { authentication } from '../../Middlewares/authentication.middleware';
import { endpoint } from './chat.authorization';
import { tokenTypeEnum } from '../../Utils/security/token';
import { validation } from '../../Middlewares/validation.middleware';
import * as validators from './chat.validation';
import  ChatService  from "./chat.service";


// ==================== Express Router Initialization (with mergeParams) ====================

const router: Router = Router({
    mergeParams: true,
});


// ==================== GET – Retrieve Private Chat ====================

router.get("/",
authentication(endpoint.getChat, tokenTypeEnum.ACCESS) ,
 validation(validators.getChatSchema),
 ChatService.getChat
);


// ==================== POST – Create New Group Chat ====================

router.post("/group",
authentication(endpoint.getChat, tokenTypeEnum.ACCESS) ,
 validation(validators.createGroupChatSchema),
 ChatService.createGroupChat
);


// ==================== GET – Retrieve Specific Group Chat by ID ====================

router.get("/group/:groupId",
authentication(endpoint.getChat, tokenTypeEnum.ACCESS) ,
 validation(validators.getGroupChatSchema),
 ChatService.getGroupChat
);


// ==================== Export Router ====================

export default router;