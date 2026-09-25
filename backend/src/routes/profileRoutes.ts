import express from "express";

import {
  getUserProfileById,
} from "../controllers/profileController";


const router = express.Router();


router.get(
  "/:user_id",
  getUserProfileById
);



export default router;