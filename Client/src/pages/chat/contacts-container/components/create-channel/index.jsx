import React, { useEffect, useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACTS_ROUTES,
} from "../../../../../../utils/constants.js";
import { apiClient } from "@/lib/api-client.js";

import { Button } from "@/components/ui/button.jsx";
import MultipleSelector from "@/components/ui/multipleselect.jsx";
import { useAppStore } from "@/store/index.js";

function CreateChannel() {
  // useState hooks
  const [newChannelModel, setNewChannelModel] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  // zustand store hooks
  const { setSelectedChatType, selectedChatData, addChannel } = useAppStore();

  // useEffect hooks
  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });

      setAllContacts(response.data);
    };
    getData();
  }, []);

  const createChannel = async () => {
    try {
      console.log("channelName hai bhai --->", channelName);
      console.log("selectedContacts hai bhai --->", selectedContacts);
      if (channelName.length >= 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModel(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setNewChannelModel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-3 p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col  ">
          <div className="items-center flex flex-col">
            <DialogHeader>
              <DialogTitle>Please fill the details</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="w-full mt-3 ">
              <Input
                placeholder="Channel Name"
                className=" rounded-lg p-6 bg-[#2c2e3b] border-none "
                onChange={(e) => setChannelName(e.target.value)}
                value={channelName}
              />
            </div>
            <div className=" w-full mt-5">
              <MultipleSelector
                className="rounded-lg py-2 bg-[#2c2e3b] border-none text-white"
                defaultOptions={allContacts}
                placeholder="search contacts"
                value={selectedContacts}
                onChange={setSelectedContacts}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 ">
                    No results found.{" "}
                  </p>
                }
              />
            </div>
            <div className=" w-full mt-5">
              <Button
                className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                onClick={createChannel}
              >
                Create Channel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateChannel;