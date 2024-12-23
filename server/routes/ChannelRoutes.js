import { Router } from "express";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
} from "../controllers/ChannelController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);

channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);

channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);

export default channelRoutes;
