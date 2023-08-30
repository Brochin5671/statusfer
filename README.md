# Statusfer

## Overview

A real-time short-form blogging CRUD web app where you can post and see other users' chats using a REST API, <span>socket.io</span>, and MongoDB.

## How to Use

- Go to [Statusfer](https://statusfer.fly.dev)
- Register an account
- Type your first status in the textbox and click _Post_
- Edit and delete your statuses using the buttons attached to them
- Like or dislike statuses with the feedback arrow icon buttons
- View a status by clicking the _View_ button
- View a user's profile by clicking on their username
- View your profile or choose to logout by clicking on Profile
- When on profile, click Settings if you want to change your username, email, password, or delete your account
- When logged out, go to Login to access your account again

## How It Works

### Client-side

- Fetch API is used to communicate with the server
- Uses the <span>socket.io</span> client to listen for events and update pages in real-time

### Server-side

- Uses Express.js as the back-end framework for the Node.js runtime to deliver resources to the client
- Mongoose API is used to communicate with the MongoDB database
- Bcryptjs hashes passwords so they can be securely stored in the database
- JWTs are used to authenticate users for user requests
- Uses <span>socket.io</span> to emit events for the client
- Filters profanity using the _obscenity_ package

## How to Run It Locally

- Clone the repository:

```
git clone https://github.com/Brochin5671/statusfer.git
```

- Ensure to create a **.env** file with the following variables:

```
DB_CONNECTION=<connection link to your MongoDB cluster>

ACCESS_TOKEN_SECRET=<your secret>

REFRESH_TOKEN_SECRET=<your secret>
```

- Run your application

- Ensure Node v18.x is installed

```
npm ci
npm start
```

- The application will be available at **localhost:3000**
