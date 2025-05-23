import { Router } from "express";
const router = Router();
import userRoutes from "./user.route";
import notificationRoutes from "./notification.route";

router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);

export default router;
