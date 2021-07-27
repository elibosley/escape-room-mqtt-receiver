import Head from 'next/head'
import Image from 'next/image'
import { useSubscription } from 'mqtt-react-hooks'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';

export default function Home() {
  const { message, connectionStatus } = useSubscription(['cmnd/FIREPLACE/POWER','cmnd/CRASH_EFFECT/POWER']);
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    if (message) setMessages((msgs: any) => [...msgs, message]);
  }, [message]);
  return (
    <div className={styles.container}>
      <Head>
        <title>MQTT Listener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Status: {connectionStatus}
        </h1>

        <p className={styles.description}>
         Messages: {JSON.stringify(messages)}
        </p>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}
