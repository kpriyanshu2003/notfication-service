# Notification Service

A simple notification service that sends notifications to users via email, SMS and push notifications.\
This service is built using Node.js and Express.js. It uses Postgres as the database to store user information and notification history.

## Setup

1. Clone the repository: `git clone <url>`
2. Install dependencies: `yarn` or `npm install`
3. Install the android app for sending sms from [Aleksandr's Android SMS Gateway App](https://github.com/capcom6/android-sms-gateway)
4. Create a `.env` file in the root directory by following the `.env.example` file. And setup the following:

   - Postgres database and update the `.env` file with the database connection string.
   - Rabbit mq server and update the `.env` file with the rabbit mq connection string.
   - Firebase project and update the `.env` file with the firebase credentials for FCM based push notifications.
   - Create credentials for the email service and update the `.env` file with the email service credentials.

5. Run the migrations: `yarn prisma:migrate` or `npm run prisma:migrate`
6. Start the server: `yarn start` or `npm run start`
7. Start the consumer: `yarn consumer` or `npm run consumer`

## Assumptions

- SMS services were paid, so I used the android app to send SMS.\
- The app is running on the same network as the android device.
