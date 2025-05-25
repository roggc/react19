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

    let rscPayload = "";
    const { Writable } = require("stream");
    const rscWritable = new Writable({
      write(chunk, encoding, callback) {
        rscPayload += chunk.toString();
        callback();
      },
    });

    res.setHeader("Content-Type", "text/html");
    res.write(
      htmlStart + `<div id="root"></div><script src="/main.js"></script>`
    );

    pipe(rscWritable);

    rscWritable.on("finish", () => {
      // Inject the RSC payload as a script
      res.write(
        `<script>window.__RSC_PAYLOAD = ${JSON.stringify(rscPayload)};</script>`
      );

      // Send the end of the HTML
      res.write(htmlEnd);
      res.end();
    });

    rscWritable.on("error", (error) => {
      console.error("Error en el stream RSC:", error);
      res.status(500).end("Error interno del servidor");
    });
  } catch (error) {
    console.error("Error rendering React app:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/rsc_payload", (req, res) => {
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
