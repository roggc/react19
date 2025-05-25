"use client";

import Suspense from "react-enhanced-suspense";
import Counter from "./counter";
import serverFunction from "./server-function";

export default function App() {
  return (
    <>
      <h1>Hello you!</h1>
      <Counter />
      <Suspense fallback="Loading...">{serverFunction()}</Suspense>
    </>
  );
}
