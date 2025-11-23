import React, { useState } from "react";

interface Message {
  sender: "user" | "support";
  text: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    sender: "support",
    text: "Hello! How can we assist you today?",
    timestamp: "10:00 AM",
  },
  {
    sender: "user",
    text: "I need help with my recent order.",
    timestamp: "10:02 AM",
  },
  {
    sender: "support",
    text: "Sure! Could you please provide your order ID?",
    timestamp: "10:03 AM",
  },
];

const ChatWithUs = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      sender: "user",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="w-auto mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Chat With Us</h1>
      <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              } p-3 rounded-lg mb-2 max-w-xs`}
            >
              <p>{message.text}</p>
              <span className="block text-xs text-gray-500 mt-1 text-right">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-lg mr-2"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWithUs;
