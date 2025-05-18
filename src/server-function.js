"use server";

export default function () {
  return new Promise((res) => setTimeout(() => res("Done"), 2000));
}
