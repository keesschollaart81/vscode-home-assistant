/*

Todo: this is slightly modified version of
https://github.com/home-assistant/home-assistant-js-websocket/blob/master/lib/socket.ts
At some point, the home-assistant-js-websocket should support both the brower WebSocket and the ws implementation

*/
 
import * as ha from "home-assistant-js-websocket";
import * as WebSocket from "ws";   
const DEBUG = false; 
const MSG_TYPE_AUTH_REQUIRED = "auth_required";
const MSG_TYPE_AUTH_INVALID = "auth_invalid";
const MSG_TYPE_AUTH_OK = "auth_ok"; 
const ERR_INVALID_AUTH = 2; 
 
export function createSocket(auth: ha.Auth): Promise<any> {
      
    // Convert from http:// -> ws://, https:// -> wss://
    const url = auth.wsUrl;

    if (DEBUG) {
        console.log("[Auth phase] Initializing", url);
    }

    function connect(
        triesLeft: number,
        promResolve: (socket: any) => void,
        promReject: (err: number) => void
    ) {
        if (DEBUG) {
            console.log("[Auth Phase] New connection", url);
        }

        const socket = new WebSocket(url);

        // If invalid auth, we will not try to reconnect.
        let invalidAuth = false;

        const closeMessage = () => {
            // If we are in error handler make sure close handler doesn't also fire.
            socket.removeEventListener("close", closeMessage);
            if (invalidAuth) {
                promReject(ha.ERR_INVALID_AUTH);
                return;
            }

            // Reject if we no longer have to retry
            if (triesLeft === 0) {
                // We never were connected and will not retry
                promReject(ha.ERR_CANNOT_CONNECT);
                return;
            }

            const newTries = triesLeft === -1 ? -1 : triesLeft - 1;
            // Try again in a second
            setTimeout(
                () =>
                    connect(
                        newTries,
                        promResolve,
                        promReject
                    ),
                1000
            );
        };

        // Auth is mandatory, so we can send the auth message right away.
        const handleOpen = async (event: any) => {
            try {
                if (auth.expired) {
                    await auth.refreshAccessToken();
                }
                socket.send(JSON.stringify({
                    type: "auth",
                    access_token: auth.accessToken
                }));
            } catch (err) {
                // Refresh token failed
                invalidAuth = err === ERR_INVALID_AUTH;
                socket.close();
            }
        };

        const handleMessage = async (event: any) => {
            const message = JSON.parse(event.data);

            if (DEBUG) {
                console.log("[Auth phase] Received", message);
            }
            switch (message.type) {
                case MSG_TYPE_AUTH_INVALID:
                    invalidAuth = true;
                    socket.close();
                    break;

                case MSG_TYPE_AUTH_OK:
                    socket.removeEventListener("open", handleOpen);
                    socket.removeEventListener("message", handleMessage);
                    socket.removeEventListener("close", closeMessage);
                    socket.removeEventListener("error", closeMessage);
                    promResolve(socket);
                    break;

                default:
                    if (DEBUG) {
                        // We already send this message when socket opens
                        if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
                            console.warn("[Auth phase] Unhandled message", message);
                        }
                    }
            }
        };

        socket.addEventListener("open", handleOpen);
        socket.addEventListener("message", handleMessage);
        socket.addEventListener("close", closeMessage);
        socket.addEventListener("error", closeMessage);
    }

    return new Promise((resolve, reject) =>
        connect(
            3,
            resolve,
            reject
        )
    );
}

