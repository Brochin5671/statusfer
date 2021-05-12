# Statusfer (Beta)

## Overview
A public chatting web-app where you can post and see other users' statuses in real-time using a REST API, <span>socket.io</span>, and MongoDB.

## How to Use
* Go to [Statusfer](https://statusfer.herokuapp.com)
* Register an account
* Type your first status in the textbox and click Post
* Edit and delete your statuses using the buttons attached to them
* Like or dislike statuses with the feedback buttons
* View a status by clicking the View button
* View a user's profile by clicking on their username
* View your profile or choose to logout by clicking on Profile
* When on profile, click Settings if you want to change your username, email, password, or delete your account
* When logged out, go to Login to access your account again

## How It Works

### Client-side
* Fetch API is used to communicate with the server
* Uses the <span>socket.io</span> client to listen for events and update pages in real-time

### Server-side
* Uses Express.js as the back-end framework for the Node.js environment to deliver resources to the client
* Mongoose API is used to communicate with the MongoDB database
* Bcryptjs hashes passwords so they can be securely stored in the database
* JWTs are used to authenticate users for user requests
* Uses <span>socket.io</span> to emit events for the client
* Filters profanity using bad-words package

## How to Run It

* Clone the repository:

```
git clone https://github.com/Brochin5671/statusfer.git
```

* Make sure to create a **.env** file with the following variables:

```
DB_CONNECTION=<connection link to your MongoDB>

ACCESS_TOKEN_SECRET=<your secret>

REFRESH_TOKEN_SECRET=<your secret>
```

* Run your application

```
npm start
```

* The application will be available at **localhost:3000**

## Dependencies
* @hapi/joi: ^17.1.1
* bad-words: ^3.0.4
* bcryptjs: ^2.4.3
* compression: ^1.7.4
* cookie-parser: ^1.4.5
* cors: ^2.8.5
* dotenv: ^8.2.0
* express: ^4.17.1
* express-rate-limit: ^5.2.6
* http: 0.0.1-security
* jsonwebtoken: ^8.5.1
* mongoose: ^5.10.3
* socket<span>.io</span>: ^3.0.4