'use client';
import { fetchMessagesWithClient, sendMessage } from "@/redux/helpSupportService";
import React, { useEffect, useState } from "react";
import { Card,CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
const HelpAndSupportClient: React.FC = () => {
  const [messages, setMessages] = useState<{ senderId: number; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const clientId = 4; 
  const adminId = 1;

  useEffect(() => {
    fetchMessagesWithClient(adminId)
      .then((data) => setMessages(data.messages))
      .catch((error) => console.error(error));
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = { senderId: clientId, receiverId: adminId, content: newMessage };
      sendMessage(message)
        .then((data) => {
          setMessages((prev) => [...prev, data.message]);
          setNewMessage("");
        })
        .catch((error) => console.error(error));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 my-8">
      <h1 className="text-xl md:text-center font-bold">Help and Support </h1>
      <h2 className="text-lg font-medium md:text-center">Connect with us</h2>
      <Card className="w-full md:w-2/5 mx-auto mt-4">
        <CardContent className="h-64 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 ${msg.senderId === clientId ? "text-right bg-gray-200" : "bg-blue-200"}`}
            >
              {msg.content}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex mt-4">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border p-2"
            placeholder="Type a message..."
          />
          <Button onClick={handleSendMessage} className="ml-2">
            Send
          </Button>
        </CardFooter>
      </Card>

    
    </div>
  );
};

export default HelpAndSupportClient;
