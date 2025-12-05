import { createOpencodeClient } from "@opencode-ai/sdk/client";

// OpenCode client configuration for remote server
export const createOCPClient = () => {
  // Read the OpenCode server URL from environment variable
  // Falls back to localhost if not configured
  const baseUrl = process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL;
  
  if (!process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL) {
    console.warn("⚠️ NEXT_PUBLIC_OPENCODE_SERVER_URL not set, using default:", baseUrl);
  }
    
  return createOpencodeClient({
    baseUrl,
    throwOnError: false,
  });
};

// Global client instance
export const opcClient = createOCPClient();
