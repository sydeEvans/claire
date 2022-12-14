const { App } = require("../../packages/claire");
const fs = require("fs");
const path = require("path");
const os = require("os");
const pty = require("node-pty");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

async function main() {
  const app = App();

  await app.launch({
    browserOptions: {
      title: "app",
      icon: fs
        .readFileSync(path.join(__dirname, "app_icon.png"))
        .toString("base64"),
    },
    serverFolder: path.join(__dirname, "www"),
  });

  await app.load("index.html");

  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  app.registerRpcMethod("writeData", async (data) => {
    ptyProcess.write(data);
  });

  ptyProcess.onData((data) => {
    app.dispatchEvent("data", data);
  });

  // ptyProcess.

  app.on("exit", () => {
    process.exit();
  });
}

main().catch((e) => console.log(e));
