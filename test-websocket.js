import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:5000/ws");

ws.on("open", function open() {
  console.log("Conexão estabelecida");
  ws.send(JSON.stringify({ type: "get_server_stats" }));
});

ws.on("message", function message(data) {
  console.log("Recebido:", JSON.parse(data.toString()));
  ws.close();
});

ws.on("error", function error(err) {
  console.error("Erro:", err);
});
