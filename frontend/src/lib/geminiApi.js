import { axiosInstance } from "./axios.js";

export const summarizeChat = async (messages) => {
  const { data } = await axiosInstance.post("/gemini/summarize", { messages });
  return data.summary;
};
