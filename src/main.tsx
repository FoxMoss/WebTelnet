import "@mercuryworkshop/dreamlandjs";
import { WispStream, WispConnection } from "wisp-client-js";

let conn: WispConnection;
let stream: WispStream;
let setDisabled: (val: boolean) => void;

const WebFormat = (text: string) => text.split("").map((val: string) => {
  if (val === " ") {
    return (<span>&nbsp;</span>);
  }
  if (val === "\n") {
    return (<br />);
  }
  return val;
});
function Message(this: { value: string }) {
  this;
  return (
    <div class="message">
      {WebFormat(this.value)}
    </div>
  );
}

function ServerOptions(this: {
  setMessages: (arr: any) => void;
  getMessages: () => Array<any>;
}) {
  return (
    <div class="container">
      <input id="domain" value="foxmoss.com" class="input"></input>
      <input id="port" value="80" class="input"></input>
      <button
        on:click={() => {
          this.setMessages([<Message value="... Start of stream ..." />]);

          setDisabled(false);

          stream = conn.create_stream(
            (document.getElementById("domain") as HTMLInputElement).value,
            parseInt(
              (document.getElementById("port") as HTMLInputElement).value,
            ),
          );

          stream.addEventListener("message", (event: any) => {
            let messages = this.getMessages();
            messages.push(
              <Message value={new TextDecoder().decode(event.data)}></Message>,
            );
            this.setMessages(messages);
          });
          stream.addEventListener("close", (event: any) => {
            setDisabled(true);
            let messages = this.getMessages();
            messages.push(<Message value="... End of stream ..."></Message>);
            this.setMessages(messages);
          });
        }}
        class="button"
      >
        Load Stream
      </button>
    </div>
  );
}

function Input(this: {
  setMessages: (arr: any) => void;
  getMessages: () => Array<any>;
  disabled: boolean;
  value: string;
}) {
  this.disabled = true;
  setDisabled = (val) => {
    this.disabled = val;
    (document.getElementById("sendButton") as HTMLButtonElement).disabled = val;
  };

  this.value =
    "GET / HTTP/1.1\n" +
    "Host: foxmoss.com\n" +
    "User-Agent: curl/7.81.0\n" +
    "Accept: */*\n\n";
  return (
    <div class="container">
      <textarea
        id="userInput"
        class="input"
        bind:value={use(this.value)}
      ></textarea>
      <button
        class="button"
        id="sendButton"
        disabled
        on:click={() => {
          let messages = this.getMessages();
          messages.push(
            <Message
              value={
                (document.getElementById("userInput") as HTMLTextAreaElement)
                  .value
              }
            ></Message>,
          );
          this.setMessages(messages);

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
    this.messages = val.reverse();
  };
  let getMessages = () => {
    return this.messages.reverse();
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
