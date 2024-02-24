import "@mercuryworkshop/alicejs";
import { WispStream, WispConnection } from "./wisp-client-js/wisp.js";

let conn: WispConnection;
let stream: WispStream;

function Message(args: { value: string }) {
  return <div class="message">{args.value}</div>;
}

function ServerOptions(args: {
  setMessages: (arr: any) => void;
  getMessages: () => Array<any>;
}) {
  return (
    <div class="container">
      <input id="domain" value="foxmoss.com" class="input"></input>
      <input id="port" value="80" class="input"></input>
      <button
        on:click={() => {
          args.setMessages([Message({ value: "... Start of stream ..." })]);

          stream = conn.create_stream(
            (document.getElementById("domain") as HTMLInputElement).value,
            parseInt(
              (document.getElementById("port") as HTMLInputElement).value,
            ),
          );

          stream.addEventListener("message", (event: any) => {
            let messages = args.getMessages();
            messages.push(
              <Message value={new TextDecoder().decode(event.data)}></Message>,
            );
            args.setMessages(messages);
          });
          stream.addEventListener("close", (event: any) => {
            let messages = args.getMessages();
            messages.push(<Message value="... End of stream ..."></Message>);
            args.setMessages(messages);
          });
        }}
        class="button"
      >
        Load Stream
      </button>
    </div>
  );
}

function Input(args: {
  setMessages: (arr: any) => void;
  getMessages: () => Array<any>;
}) {
  return (
    <div class="container">
      <textarea id="userInput" class="input">
        GET / HTTP/1.1
      </textarea>
      <button
        class="button"
        on:click={() => {
          let messages = args.getMessages();
          messages.push(
            <Message
              value={
                (document.getElementById("userInput") as HTMLTextAreaElement)
                  .value
              }
            ></Message>,
          );
          args.setMessages(messages);

          let outData = (
            document.getElementById("userInput") as HTMLTextAreaElement
          ).value;
          let arrData = outData.split("").map((x) => [x.charCodeAt(0)]);

          for (let index = 0; index < arrData.length; index++) {
            if (arrData[index][0] === "\n".charCodeAt(0)) {
              arrData[index].push(0x0d);
              arrData[index].reverse();
            }
          }

          let out: number[] = [];
          out = out.concat(...arrData);

          stream.send(new Uint8Array(out));
        }}
      >
        Send.
      </button>
    </div>
  );
}
function App() {
  this.messages = [];

  let setMessages = (val: any[]) => {
    this.messages = val;
  };
  let getMessages = () => {
    return this.messages;
  };

  return (
    <div class="app">
      <ServerOptions setMessages={setMessages} getMessages={getMessages} />
      <div class="content">{use(this.messages)}</div>
      <Input setMessages={setMessages} getMessages={getMessages} />
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
