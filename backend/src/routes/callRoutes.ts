import { Router } from "express";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

import {
  createCall,
  acceptCall,
  rejectCall,
  endCall,
} from "../controllers/callController";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createCall
);

router.post(
  "/:callId/accept",
  authMiddleware,
  acceptCall
);

router.post(
  "/:callId/reject",
  authMiddleware,
  rejectCall
);

router.post(
  "/:callId/end",
  authMiddleware,
  endCall
);

export default router;