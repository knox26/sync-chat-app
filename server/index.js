import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoute from "./routes/MessagesRoute.js";
import channelRoutes from "./routes/ChannelRoutes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

//cors setup
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

//uploads setup

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

//cookie parser setup
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoute);
app.use("/api/channels", channelRoutes);

//db connection
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("DB connected sucessfully");
  })
  .catch((err) => {
    console.log(err.meassage);
  });

//server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

setupSocket(server);
