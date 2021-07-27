import Head from "next/head";
import Image from "next/image";
import { useSubscription } from "mqtt-react-hooks";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import useSound from "use-sound";

export default function Home() {
  const { message, connectionStatus } = useSubscription([
    "cmnd/FIREPLACE/POWER",
    "cmnd/CRASH_EFFECT/POWER",
  ]);

  const [crashSound] = useSound("static/destruction.mp3");
  const [fireSound, { stop }] = useSound("static/fireplace.mp3", {
    volume: 0.25,
  });
  const [messages, setMessages] = useState<any>([]);
  const [initialize, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (message) setMessages((msgs: any) => [...msgs, message]);
  }, [message]);

  useEffect(() => {
    if (initialize) {
      fireSound();
    }
  }, [initialize]);

  return (
    <div className={styles.container}>
      <Head>
        <title>MQTT Listener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Status: {connectionStatus}</h1>

        <p className={styles.description}>
          Messages: {JSON.stringify(messages)}
        </p>
      </main>
      <button onClick={() => setInitialized(true)}>Start Fire Sound</button>
      <button onClick={() => crashSound()}>Crash Me Baby</button>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
