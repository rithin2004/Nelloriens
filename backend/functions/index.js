import { https } from "firebase-functions";
import app from "./src/app.js";

export const api = https.onRequest(app);