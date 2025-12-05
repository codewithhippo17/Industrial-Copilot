import { createOpencodeClient } from "@opencode-ai/sdk/client";

// OpenCode client configuration for remote server
export const createOCPClient = () => {
  // Use the Cloudflare tunnel URL to connect to the OpenCode server
  const baseUrl = "https://analyst-skirts-resolved-moved.trycloudflare.com";
    
  return createOpencodeClient({
    baseUrl,
    throwOnError: false,
  });
};

// Global client instance
export const opcClient = createOCPClient();