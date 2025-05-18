import { Router } from "express";
const router = Router();
import notificationController from "../controllers/notification.controller";

router.post("/", notificationController.sendNotification);

export default router;
