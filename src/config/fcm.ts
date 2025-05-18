import admin from "firebase-admin";
import { env } from "./env";
import logger from "./logger";

export const initializeFCM = (): void => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FCM_PROJECT_ID,
          clientEmail: env.FCM_CLIENT_EMAIL,
          privateKey: env.FCM_PRIVATE_KEY,
        }),
      });
      logger.info("Firebase Cloud Messaging initialized");
    }
  } catch (error) {
    logger.error("Failed to initialize Firebase Cloud Messaging", { error });
  }
};

export const sendFCMMessage = async (
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<string> => {
  try {
    const response = await admin.messaging().send({
      token,
      notification: { title, body },
      data,
    });
    logger.debug("FCM message sent", { messageId: response });
    return response;
  } catch (error) {
    logger.error("Failed to send FCM message", { error, token });
    throw error;
  }
};

export default { initializeFCM, sendFCMMessage };
