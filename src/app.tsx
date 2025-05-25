import Suspense from "react-enhanced-suspense";
// import serverFunction from "./server-function";
import Counter from "./counter";

export default function App() {
  return (
    <>
      <h1>Hello you!</h1>
      <Counter />
      <Suspense fallback="Loading...">
        {new Promise<string>((res) => setTimeout(() => res("Done"), 8000))}
      </Suspense>
    </>
  );
}
