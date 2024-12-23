import { useAppStore } from "@/store";
import { createContext, useContext, useEffect, useRef } from "react";
import { HOST } from "../../utils/constants.js";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      if (!socket.current) {
        socket.current = io(HOST, {
          withCredentials: true,
          query: { userId: userInfo.id },
        });
        socket.current.on("connect", () => {
          console.log("Connected to socket server");
        });

        const handleRecieveMessage = (message) => {
          const { selectedChatType, selectedChatData, addMessage,addContactsInDMContacts } =
            useAppStore.getState();
          if (
            selectedChatType !== undefined &&
            (selectedChatData._id === message.sender._id ||
              selectedChatData._id === message.recipient._id)
          ) {
            console.log("Recieved Message", message);
            addMessage(message);
          }
          addContactsInDMContacts(message);
        };

        const handleRecieveChannelMessage = (message) => {
          const {
            selectedChatType,
            selectedChatData,
            addMessage,
            addChannelInChannelList,
          } = useAppStore.getState();
          console.log(
            "handleRecieveChannelMessage called with message:",
            message
          );
          if (
            selectedChatType !== undefined &&
            selectedChatData._id === message.channelId
          ) {
            console.log("Recieved Channel Message", message);
            addMessage(message._doc);
          }
          addChannelInChannelList(message);
        };

        socket.current.on("recieveMessage", handleRecieveMessage);
        socket.current.on(
          "recieve-channel-message",
          handleRecieveChannelMessage
        );

        return () => {
          socket.current.disconnect();
        };
      }
    }
  }, [userInfo]);
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
