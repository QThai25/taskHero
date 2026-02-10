import axios from "./axios";

export interface ChatResponse {
  reply?: string;
  title?: string;
  _id?: string;
}

export const chatApi = {
  send(message: string) {
    return axios.post<ChatResponse>("/chat", { message });
  },
};
