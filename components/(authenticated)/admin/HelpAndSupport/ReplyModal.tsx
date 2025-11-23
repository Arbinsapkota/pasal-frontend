// components/ReplyModal.tsx
"use client";

import React from "react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  email: string | undefined;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  email,
}) => {
  const [replyMessage, setReplyMessage] = React.useState<string>("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Reply To: {email}
        </h3>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-2 mt-2"
          rows={4}
          placeholder="Enter your reply..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
            onClick={() => onSubmit(replyMessage)}
          >
            Send Reply
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
