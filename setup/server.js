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
    const possibleExtensions = [".html", ".htm"];
    let htmlPath = null;

    for (const ext of possibleExtensions) {
      const candidatePath = path.resolve(process.cwd(), `src/index${ext}`);
      if (existsSync(candidatePath)) {
        htmlPath = candidatePath;
        break;
      }
    }

    if (!htmlPath) {
      return res
        .status(404)
        .send(
          `Page not found: No "index" file found in "src/" with supported extensions (.html, .htm)`
        );
    }

    // Read the HTML template
    const htmlTemplate = readFileSync(htmlPath, "utf8");

    const bodyStartIndex = htmlTemplate.indexOf("<body");
    const bodyOpenEndIndex = htmlTemplate.indexOf(">", bodyStartIndex) + 1;
    const bodyCloseIndex = htmlTemplate.indexOf("</body>");
    if (
      bodyStartIndex === -1 ||
      bodyOpenEndIndex === -1 ||
      bodyCloseIndex === -1
    ) {
      return res
        .status(500)
        .send(`No "body" opening and/or closing tags found in HTML template`);
    }
    const htmlStart = htmlTemplate.slice(0, bodyOpenEndIndex);
    const htmlEnd = htmlTemplate.slice(bodyCloseIndex);

    res.setHeader("Content-Type", "text/html");
    res.write(
      htmlStart +
        `<div id="root"></div><script src="/main.js"></script>` +
        htmlEnd
    );
    res.end();
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
      const { pipe } = renderToPipeableStream(
        React.createElement(
          "div",
          null,
          'No "app" file found in "src/" with supported extensions (.js, .jsx, .tsx)'
        )
      );
      pipe(res);
      return;
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
