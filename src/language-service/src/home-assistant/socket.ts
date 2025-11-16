/*

This is slightly modified version of
https://github.com/home-assistant/home-assistant-js-websocket/blob/master/lib/socket.ts

*/

import type { Auth } from "home-assistant-js-websocket/dist/auth";

import WebSocket from "ws";

const MSG_TYPE_AUTH_REQUIRED = "auth_required";
const MSG_TYPE_AUTH_INVALID = "auth_invalid";
const MSG_TYPE_AUTH_OK = "auth_ok";
const ERR_CANNOT_CONNECT = 1;
const ERR_INVALID_AUTH = 2;

// Note: Auth type is extended inline where needed with intersection types
// This allows us to pass custom properties without modifying the original type

interface HaWebSocket extends WebSocket {
  haVersion: string;
}

export function createSocket(
  auth: Auth & { hassUrl?: string },
  ignoreCertificates: boolean,
): Promise<any> {
  // Convert from http:// -> ws://, https:// -> wss://
  const url = auth.wsUrl;
  
  // Additional logging for debugging
  if (!url) {
    console.error("[Auth phase] WebSocket URL is undefined or empty. This will cause connection failure.");
  }

  console.log(
    "[Auth phase] Initializing WebSocket connection to Home Assistant",
    url,
  );

  function connect(
    triesLeft: number,
    promResolve: (socket: any) => void,
    promReject: (err: number) => void,
  ) {
    console.log(
      `[Auth Phase] Connecting to Home Assistant... Tries left: ${triesLeft}`,
      url,
    );

    const socket = new WebSocket(url, {
      rejectUnauthorized: !ignoreCertificates,
    }) as HaWebSocket;

    // If invalid auth, we will not try to reconnect.
    let invalidAuth = false;

    // Helper function to remove all event listeners to prevent memory leaks
    const removeAllListeners = () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("close", closeMessage);
      socket.removeEventListener("error", errorMessage);
    };

    const closeMessage = (ev: {
      wasClean: boolean;
      code: number;
      reason: string;
      target: WebSocket;
    }) => {
      let errorMessage;
      if (ev && ev.code && ev.code !== 1000) {
        errorMessage = `WebSocket connection to Home Assistant closed with code ${ev.code} and reason ${ev.reason}`;
      }
      // Remove all listeners before handling close/error to prevent memory leaks
      removeAllListeners();
      closeOrError(errorMessage);
    };

    const errorMessage = (ev: {
      error: any;
      message: any;
      type: string;
      target: WebSocket;
    }) => {
      let errMessage =
        "Disconnected from Home Assistant with a WebSocket error";
      if (ev.message) {
        errMessage += ` with message: ${ev.message}`;
      }
      // Remove all listeners before handling close/error to prevent memory leaks
      removeAllListeners();
      closeOrError(errMessage);
    };

    const closeOrError = (errorText?: string) => {
      if (errorText) {
        console.log(
          `WebSocket Connection to Home Assistant closed with an error: ${errorText}`,
        );
      }
      if (invalidAuth) {
        promReject(ERR_INVALID_AUTH);
        return;
      }

      // Reject if we no longer have to retry
      if (triesLeft === 0) {
        // We never were connected and will not retry
        promReject(ERR_CANNOT_CONNECT);
        return;
      }

      const newTries = triesLeft === -1 ? -1 : triesLeft - 1;
      // Try again in a second
      setTimeout(() => connect(newTries, promResolve, promReject), 1000);
    };

    // Auth is mandatory, so we can send the auth message right away.
    const handleOpen = async (): Promise<void> => {
      try {
        if (auth.expired) {
          await auth.refreshAccessToken();
        }
        
        // Get the token from auth.accessToken, ensuring it's not undefined
        const token = auth.accessToken;
        
        // Validate token before sending
        if (!token) {
          console.error("[Auth phase] No access token available, authentication will fail");
          console.error("[Auth phase] Auth object details:", {
            hasWsUrl: !!auth.wsUrl,
            wsUrl: auth.wsUrl,
            hasToken: !!auth.accessToken,
            isExpired: auth.expired,
            hassUrl: (auth as any).hassUrl // Use type assertion for custom property
          });
          invalidAuth = true;
        } else if (token.trim() === "") {
          console.error("[Auth phase] Access token is empty, authentication will fail");
          invalidAuth = true;
        } else {
          // Log token for debugging (partial for security)
          const tokenFirstFive = token.substring(0, 5);
          const tokenLength = token.length;
          console.log(`[Auth phase] Sending auth message with token (first 5 chars: ${tokenFirstFive}..., length: ${tokenLength})`);
        }
        
        // Send authentication even if invalid to get proper error message from server
        socket.send(
          JSON.stringify({
            type: "auth",
            access_token: token || "",
          }),
        );
        
        if (invalidAuth) {
          console.error("[Auth phase] Invalid token detected before sending auth message");
        }
      } catch (err) {
        // Refresh token failed
        console.error("[Auth phase] Error during authentication:", err);
        invalidAuth = err === ERR_INVALID_AUTH;
        socket.close();
      }
    };

    const handleMessage = (event: {
      data: any;
      type: string;
      target: WebSocket;
    }) => {
      const message = JSON.parse(event.data);

      console.log(
        `[Auth phase] Received a message of type ${message.type}`,
        message,
      );

      switch (message.type) {
        case MSG_TYPE_AUTH_INVALID:
          invalidAuth = true;
          console.error("[Auth phase] Authentication invalid - token was rejected by Home Assistant server");
          console.error("[Auth phase] Check that your token is valid and not expired");
          if (auth.accessToken) {
            console.error(`[Auth phase] Token starts with: ${auth.accessToken.substring(0, 5)}... (length: ${auth.accessToken.length})`);
            console.error(`[Auth phase] WebSocket URL: ${auth.wsUrl || "unknown"}`);
            // Check if token looks like a JWT
            if (auth.accessToken.split(".").length === 3) {
              try {
                // Decode JWT to get expiration info (don't verify signature)
                const [, payload] = auth.accessToken.split(".");
                const decodedPayload = JSON.parse(atob(payload));
                
                // Check expiration
                if (decodedPayload.exp) {
                  const expiryDate = new Date(decodedPayload.exp * 1000);
                  const now = new Date();
                  
                  if (expiryDate < now) {
                    console.error(`[Auth phase] Token is expired! Expired on: ${expiryDate.toISOString()}`);
                    console.error("[Auth phase] Please generate a new token in Home Assistant");
                  } else {
                    console.error(`[Auth phase] Token is not expired (expires: ${expiryDate.toISOString()}). Server rejected it for another reason.`);
                  }
                }
              } catch (error) {
                console.error("[Auth phase] Failed to decode token:", error);
              }
            }
          } else {
            console.error("[Auth phase] No token was provided to authenticate with");
          }
          socket.close();
          break;

        case MSG_TYPE_AUTH_OK:
          console.log("[Auth phase] Authentication successful!");
          removeAllListeners();
          socket.haVersion = message.ha_version;
          promResolve(socket);
          break;

        default:
          // We already send this message when socket opens
          if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
            console.log("[Auth phase] Unhandled message", message);
          }
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", closeMessage);
    socket.addEventListener("error", errorMessage);
  }

  return new Promise((resolve, reject) => connect(3, resolve, reject));
}
