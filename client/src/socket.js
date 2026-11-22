import { io } from "socket.io-client";
import { API } from "./config";
export const socket = io(API);
export const clientId =
  localStorage.getItem("clientId") ||
  (() => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("clientId", id);
    return id;
  })();