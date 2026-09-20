import { Router } from "express";

import {
  getDashboardUsers,
} from "../controllers/DashboardUserListController";

import {
  saveUserAction,
} from "../controllers/userActionController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();



router.get(
  "/dashboard",
  authMiddleware,
  getDashboardUsers
);


router.post(
  "/action",
  authMiddleware,
  saveUserAction
);

export default router;

