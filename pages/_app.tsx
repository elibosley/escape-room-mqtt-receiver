import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
