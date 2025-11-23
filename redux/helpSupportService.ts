import { axiosAuthInstance } from "@/components/axiosInstance";


export const fetchAllMessages = async () => {
  try {
    const response = await axiosAuthInstance().get("/help-support/messages");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchMessagesWithClient = async (clientId: number) => {
  try {
    const response = await axiosAuthInstance().get(`/help-support/messages/${clientId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (message: { senderId: number; receiverId: number; content: string }) => {
  try {
    const response = await axiosAuthInstance().post("/help-support/messages", message);
    return response.data;
  } catch (error) {
    throw error;
  }
};
