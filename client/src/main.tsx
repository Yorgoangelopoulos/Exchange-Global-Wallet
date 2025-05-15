import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill Buffer for browser environment to support bip39
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

createRoot(document.getElementById("root")!).render(<App />);
