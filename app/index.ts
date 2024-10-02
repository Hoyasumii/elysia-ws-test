import { Elysia, t } from "elysia";

const maximumRequests = 2;

const store = {
  counter: 0,
};

new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
  .ws("/ws", {
    body: t.Object({
      message: t.String(),
    }),
    idleTimeout: 1,
    open(ws) {
      if (store.counter === maximumRequests) {
        ws.terminate();
        return;
      }

      store.counter++;
      console.log(`Um novo dispositivo foi conectado: ${store.counter}`);
    },
    message(ws, { message }) {
      console.log(ws);
      console.log(message);

      ws.send({ data: message });
    },

    close(ws, code, reason) {
      if (store.counter !== maximumRequests) {
        store.counter--;
        console.log(`Um dispositivo foi desconectado: ${store.counter}`);
        return;
      }

      if (code === 1001) {
        console.log("A conexão foi fechada por inatividade (timeout)");
      } else {
        console.log("A conexão foi fechada pelo cliente ou por um erro");
      }
    },
  })
  .listen(3000);
