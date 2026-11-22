import { io } from "socket.io-client";

export const socket = io("http://localhost:5000");
export const clientId =
  localStorage.getItem("clientId") ||
  (() => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("clientId", id);
    return id;
  })();