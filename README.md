# Project ready to develop with React 19 (Typescript or Javascript) to make SPA (Single Page Application) without SSR (Server Side Rendering)

This project can be created with **`npx create-react19-app@latest --nossr my-app`**. **If you are looking for multi-page file based routing with SSR app then use the command: `npx create-react19-app@latest my-app` (without passing the `--nossr` option). It will create a project like [this one](https://github.com/roggc/react19ssr) instead.**

This is a project ready to develop with **React 19** to make **SPAs** (Single Page Applications) that work entirely in the **Client**, **without SSR** (Server Side Rendering).

With React 19 you have **Server Functions** and `Suspense`, which allows you to fetch data from the **Server** in an easy and simple way:

```typescript
<Suspense fallback="Loading...">{serverFunction()}</Suspense>
```

Where `serverFunction` is:

```typescript
"use server";

export default async function () {
  return await new Promise<string>((res) =>
    setTimeout(() => res("Done"), 2000)
  );
}
```

This project is ready to develop either in **Typescript** or **Javascript**. If an `app.tsx` is found, then it will take preference over a possible `app.jsx` or `app.js`. There must be at least an `app.tsx` or `app.jsx` (or `app.js`).

The app is developed in the `src` folder.

The `setup` folder has the `server.js` and `client.jsx` files.

The `server.js` file is the one executed by `node`. It defines two endpoints, `/` and `/rsc_payload`. The fist one, `/`, serves the `index.html` file found in the `src` directory of the project. Before sending this file to the Client, it injects the `div` tag where the app will be created in the Client, and the `main.js` script tag.

The `client.jsx` file defines the `main.js` script. What it does is to fetch the RSC payload from the endpoint `/rsc_payload` and create the app with this RSC payload into the `div`.

To start the app in development mode you must run `npm run dev`. This will execute Webpack in watch mode and will start the app with the `node` command. It uses the package `concurrently` to execute both in parallel. The server is faster to be ready than Webpack, so when executing the command wait for Webpack log to show and then you can navigate to the page (`localhost:3000`).

There is no hot reloading, so when you do changes to the code, you have to reload yourself the page to see those changes.

The project has the package [react-enhanced-suspense](https://www.npmjs.com/package/react-enhanced-suspense) installed. It is an enhanced `Suspense` that works as React's `Suspense` if no extra props are used.

This project is inspired by [this other project](https://github.com/adamjberg/react-server-components).

## About whether to use a Server Component or not

If you do:

```typescript
// src/app.tsx

export default async function App() {
  await new Promise((resolve) => setTimeout(resolve, 8000));

  return <>{/* content */}</>;
}
```

This is terrible, because content will not show until 8 seconds, so for 8 seconds the user will see a blank screen in the page. So the technique to fetch data in a Server Component must be avoided because it increases a lot the First Contentful Paint (FCP), that is, when the user sees something.

Then if you do not fetch data in a Server Component the utility of it is doubtful. You can opt in for a Client component instead:

```typescript
// src/app.tsx
"use client";

export default function App() {
  // logic
  return <>{/* content */}</>;
}
```

and use Server Functions and `Suspense` to fetch data from the Server as explained before.
