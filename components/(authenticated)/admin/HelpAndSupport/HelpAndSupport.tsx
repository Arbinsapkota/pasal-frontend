"use client";
import {
  fetchAllMessages,
  fetchMessagesWithClient,
  sendMessage,
} from "@/redux/helpSupportService";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const HelpAndSupportAdmin: React.FC = () => {
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    { senderId: number; content: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Fetch all clients
    fetchAllMessages()
      .then((data) => setClients(data.clients))
      .catch((error) => console.error(error));
  }, []);

  const loadMessages = (clientId: number) => {
    setSelectedClientId(clientId);
    fetchMessagesWithClient(clientId)
      .then((data) => setMessages(data.messages))
      .catch((error) => console.error(error));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedClientId) {
      const message = {
        senderId: 1,
        receiverId: selectedClientId,
        content: newMessage,
      };
      sendMessage(message)
        .then((data) => {
          setMessages((prev) => [...prev, data.message]);
          setNewMessage("");
        })
        .catch((error) => console.error(error));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <></>
    // <div className="p-4">
    //   <h1 className="text-xl font-bold">Help and Support (Admin)</h1>
    //   <div className="flex flex-col md:flex-row">
    //     {/* Client List */}
    //     <Card className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-4">
    //       <CardHeader>
    //         <h2 className="font-medium">Clients</h2>
    //       </CardHeader>
    //       <CardContent>
    //         <ul>
    //           {clients.map((client) => (
    //             <li
    //               key={client.id}
    //               className="p-2 cursor-pointer hover:bg-gray-100"
    //               onClick={() => loadMessages(client.id)}
    //             >
    //               {client.name}
    //             </li>
    //           ))}
    //         </ul>
    //       </CardContent>
    //     </Card>

    //     {/* Messages */}
    //     <Card className="w-full md:w-3/4">
    //       <CardHeader>
    //         <h2 className="font-medium">Messages</h2>
    //       </CardHeader>
    //       <CardContent className="h-64 overflow-y-auto">
    //         {messages.map((msg, index) => (
    //           <div
    //             key={index}
    //             className={`p-2 ${
    //               msg.senderId === 1 ? "text-right bg-gray-200" : "bg-blue-200"
    //             }`}
    //           >
    //             {msg.content}
    //           </div>
    //         ))}
    //       </CardContent>
    //       <CardFooter className="flex mt-4">
    //         <Input
    //           type="text"
    //           value={newMessage}
    //           onChange={(e) => setNewMessage(e.target.value)}
    //           onKeyPress={handleKeyPress}
    //           className="flex-1 border p-2"
    //           placeholder="Type a message..."
    //         />
    //         <Button onClick={handleSendMessage} className="ml-2">
    //           Send
    //         </Button>
    //       </CardFooter>
    //     </Card>
    //   </div>
    // </div>
  );
};

export default HelpAndSupportAdmin;
