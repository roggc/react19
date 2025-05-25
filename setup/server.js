require("dotenv/config");
const register = require("react-server-dom-webpack/node-register");
const path = require("path");
const { readFileSync, existsSync } = require("fs");
const { renderToPipeableStream } = require("react-server-dom-webpack/server");
const express = require("express");
const React = require("react");
const babelRegister = require("@babel/register");

register();
babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: ["@babel/transform-modules-commonjs"],
  extensions: [".js", ".jsx", ".ts", ".tsx"],
});

const app = express();

app.use(express.static(path.resolve(process.cwd(), "public")));

app.get("/", (req, res) => {
  try {
    const possibleExtensions = [".tsx", ".jsx", ".js"];
    let appPath = null;

    for (const ext of possibleExtensions) {
      const candidatePath = path.resolve(process.cwd(), `src/app${ext}`);
      if (existsSync(candidatePath)) {
        appPath = candidatePath;
        break;
      }
    }

    if (!appPath) {
      throw new Error(
        "No app file found in src/ with supported extensions (.js, .jsx, .tsx)"
      );
    }

    const appModule = require(appPath);
    const ReactApp = appModule.default ?? appModule;

    // Read the client manifest for RSC
    const manifest = readFileSync(
      path.resolve(process.cwd(), "public/react-client-manifest.json"),
      "utf8"
    );
    const moduleMap = JSON.parse(manifest);

    // Read the HTML template
    const htmlTemplate = readFileSync(
      path.resolve(process.cwd(), "index.html"),
      "utf8"
    );

    const bodyStartIndex = htmlTemplate.indexOf("<body");
    const bodyOpenEndIndex = htmlTemplate.indexOf(">", bodyStartIndex) + 1;
    const bodyCloseIndex = htmlTemplate.indexOf("</body>");
    if (
      bodyStartIndex === -1 ||
      bodyOpenEndIndex === -1 ||
      bodyCloseIndex === -1
    ) {
      throw new Error("No <body> and </body> tags found in HTML template");
    }
    const htmlStart = htmlTemplate.slice(0, bodyOpenEndIndex);
    const htmlEnd = htmlTemplate.slice(bodyCloseIndex);

    // Render the app as an RSC stream
    const { pipe } = renderToPipeableStream(
      React.createElement(ReactApp),
      moduleMap
    );

    // Create a transform stream to capture the RSC payload
    const { Writable } = require("stream");
    class HtmlWritable extends Writable {
      constructor() {
        super();
        this.chunks = [];
      }
      _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        callback();
      }
      end() {
        const rscPayload = Buffer.concat(this.chunks).toString("utf8");
        // Create the final HTML response
        // Combine the HTML start, RSC payload, and HTML end
        const html =
          htmlStart +
          `<div id="root"></div><script src="/main.js"></script><script>window.__RSC_PAYLOAD = ${JSON.stringify(
            rscPayload
          )};</script>` +
          htmlEnd;
        // const html = htmlTemplate.replace(
        //   "<!--RSC_PAYLOAD-->",
        //   `<script>window.__RSC_PAYLOAD = ${JSON.stringify(
        //     rscPayload
        //   )};</script>`
        // );
        // Send the final HTML response
        res.setHeader("Content-Type", "text/html");
        res.send(html);
        super.end();
      }
    }

    pipe(new HtmlWritable());
  } catch (error) {
    console.error("Error rendering React app:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/react", (req, res) => {
  try {
    const possibleExtensions = [".tsx", ".jsx", ".js"];
    let appPath = null;

    for (const ext of possibleExtensions) {
      const candidatePath = path.resolve(process.cwd(), `src/app${ext}`);
      if (existsSync(candidatePath)) {
        appPath = candidatePath;
        break;
      }
    }

    if (!appPath) {
      throw new Error(
        "No app file found in src/ with supported extensions (.js, .jsx, .tsx)"
      );
    }

    const appModule = require(appPath);
    const ReactApp = appModule.default ?? appModule;
    const manifest = readFileSync(
      path.resolve(process.cwd(), "public/react-client-manifest.json"),
      "utf8"
    );
    const moduleMap = JSON.parse(manifest);

    const { pipe } = renderToPipeableStream(
      React.createElement(ReactApp),
      moduleMap
    );
    pipe(res);
  } catch (error) {
    console.error("Error rendering RSC:", error);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
