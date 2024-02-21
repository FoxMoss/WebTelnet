import "@mercuryworkshop/alicejs";
import { WispStream, WispConnection } from "./wisp-client-js/wisp.js"

let conn: WispConnection;
let stream: WispStream;

function ServerOptions(args: any) {

  return (
    <div class="container">
      <input id="domain" value="foxmoss.com" class="input"></input>
      <input id="port" value="80" class="input"></input>
      <button on:click={() => {
        stream = conn.create_stream((document.getElementById("domain") as HTMLInputElement).value,
          parseInt((document.getElementById("port") as HTMLInputElement).value));

        stream.addEventListener("message", (event: any) => {
          args.ref.messages.push((<div>{new TextDecoder().decode(event.data)}</div>));
          args.ref.messages = args.ref.messages;

        });
      }} class="button">Load Stream</button>
    </div>
  );
}


function Input(args: any) {
  return (
    <div class="container border-t-4 mt-10">
      <textarea id="userInput" class="input">GET / HTTP/1.1</textarea>
      <button class="button" on:click={() => {
        args.ref.messages.push((<div>{(document.getElementById("userInput") as HTMLTextAreaElement).value}</div>));
        args.ref.messages = args.ref.messages;
        let outData = (document.getElementById("userInput") as HTMLTextAreaElement).value;
        outData.replace("\n", "\r\n");
        stream.send(new TextEncoder().encode(outData));
      }}>
        Send.
      </button>
    </div>
  );
}
function App() {
  this.messages = [
  ]

  return (
    <div class="app">
      <ServerOptions ref={this} />
      <div class="content">{use(this.messages)}</div>
      <Input ref={this} />
    </div>
  );
}

window.addEventListener("load", () => {
  document.body.appendChild(<App />);

  if (window.location.protocol == "https:") {
    conn = new WispConnection(`wss://${window.location.host}/wisp/`);
    return;
  }
  //debuging
  conn = new WispConnection(`ws://${window.location.host}/wisp/`);
  // conn = new WispConnection(`ws://localhost:4000/`);
});
