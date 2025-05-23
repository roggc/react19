# Project ready to develop with React 19 (Typescript or Javascript) to make SPA (Single Page Application) without SSR (Server Side Rendering)

This project can be created with **`npx create-react19-app@latest my-app`**. **If you are looking for multi-page file based routing with SSR app then pass the option `--ssr` to the command: `npx create-react19-app@latest my-app`. It will create a project like [this one]() instead.**

This is a project ready to develop with **React 19**. Specifically with **Server Functions**. With the use of Server Functions and **Suspense** you can fetch data from the Server once in the **Client**, so there is no need for Server Components then.

This project is ready to develop either in **Typescript** or **Javascript**. If an `app.tsx` is found, then it will take preference over a possible `app.jsx` or `app.js`. There must be at least an `app.tsx` or `app.jsx` (or `app.js`).

The app is developed in the `src` folder.

The `setup` folder has the `server.js` and `client.jsx` files.

The `server.js` file is the one executed by `node`. It defines an endpoint, `/`, that serves the `index.html` file found in the root directory of the project. But before sending it to the Client does two things: gets the RSC payload of the app (the one developed in the `src` folder) and injects it into the `index.html` file.

Once in the Client, the code of `client.jsx` file enters in action. It takes the RSC payload injected in the html file and creates the content to be rendered by the app.

To start the app in development mode you must run `npm run dev`. This will execute Webpack in watch mode and will start the app with the `node` command. It uses the package `concurrently` to execute both in parallel. The server is faster to be ready than Webpack, so when executing the command wait for Webpack log to show and then you can navigate to the page (`localhost:3000`).

There is no hot reloading, so when you do changes to the code, you have to reload yourself the page to see those changes.

The project has the package [react-enhanced-suspense](https://www.npmjs.com/package/react-enhanced-suspense) installed. It is an enhanced `Suspense` that works as React's `Suspense` if no extra props are used.

This project is inspired by [this other project](https://github.com/adamjberg/react-server-components).
