Deno.serve(
  {
    port: 8000,
    onListen: () => {
      console.log("Listening on ws://localhost:8000");
    },
  },
  (req) => {
    // Upgrade?
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() != "websocket") {
      return new Response("request isn't trying to upgrade to websocket");
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = (e) => {
      console.log("socket opened");
    };
    socket.onmessage = (e: MessageEvent<ArrayBuffer>) => {
      console.log("socket message:", decodeMessage(e.data));
      socket.send(e.data);
    };
    socket.onerror = (e) => {
      // console.log("socket errored:", e);
    };
    socket.onclose = () => {
      console.log("socket closed");
    };

    return response;
  }
);

function decodeMessage(data: ArrayBuffer): string {
  return JSON.parse(new TextDecoder().decode(data));
}
