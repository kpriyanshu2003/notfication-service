import Client from "android-sms-gateway";
import { env } from "./env";

const httpFetchClient = {
  get: async (url: string | URL | Request, headers: any) => {
    const response = await fetch(url, { method: "GET", headers });
    return response.json();
  },
  post: async (url: string | URL | Request, body: any, headers: any) => {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return response.json();
  },
  delete: async (url: string | URL | Request, headers: any) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    return response.json();
  },
};

const androidSms = new Client(
  env.ANDROID_SMS_GATEWAY_LOGIN,
  env.ANDROID_SMS_GATEWAY_PASSWORD,
  httpFetchClient,
  env.ANDROID_SMS_GATEWAY_URL
);

export default androidSms;
