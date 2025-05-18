import { Router } from "express";
const router = Router();
import userRoutes from "./user.route";
import notificationRoutes from "./notification.route";

router.use("/user", userRoutes);
router.use("/notification", notificationRoutes);

export default router;
