import { Router } from "express";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

import {
  getChatMessages,
} from "../controllers/chatController";

const router = Router();

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| GET /api/chat/messages/:userId
|
|--------------------------------------------------------------------------
*/

router.get(
  "/messages/:userId",
  authMiddleware,
  getChatMessages
);

export default router;
