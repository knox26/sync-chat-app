import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  //
  const sendChannelMessage = async (meassage) => {
    const { sender, content, messageType, fileUrl, channelId } = meassage;

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timeStamp: new Date(),
      fileUrl,
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    console.log("messageData", messageData);
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const channel = await Channel.findById(channelId).populate("members");

    const finalData = { ...messageData, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("recieve-channel-message", finalData);
        }
      });
    }
  };

  const sendMessage = async (meassage) => {
    const senderSocketId = userSocketMap.get(meassage.sender);
    const receipientSocketId = userSocketMap.get(meassage.recipient);

    const createdMessage = await Message.create(meassage);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color ")
      .populate("recipient", "id email firstName lastName image color ");

    if (receipientSocketId) {
      io.to(receipientSocketId).emit("recieveMessage", messageData);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(
        `User connected with id: ${userId} and socket id: ${socket.id}`
      );
    } else {
      console.log("User ID is not provided during connection");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
