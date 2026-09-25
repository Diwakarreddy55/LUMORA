import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware";

import {
  getChatList,
  getChatMessages,
} from "../controllers/chatController";

const router = Router();

/**
 * ============================================================
 * CHAT LIST
 *
 * GET /api/chat/list
 *
 * User ID comes from JWT.
 * Do NOT send userId in URL.
 * ============================================================
 */
router.get(
  "/list",
  authMiddleware,
  getChatList
);

/**
 * ============================================================
 * CHAT MESSAGES
 *
 * GET /api/chat/messages/:userId
 *
 * :userId = person we are chatting with
 * Logged-in user comes from JWT.
 * ============================================================
 */
router.get(
  "/messages/:userId",
  authMiddleware,
  getChatMessages
);

export default router;