import { Router } from "express";
import userController from "../controllers/user.controller";
const router = Router();

router.get("/:id/notifications", userController.getUserNotifications);

export default router;
