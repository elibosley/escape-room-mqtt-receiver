import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import MQTT from "async-mqtt";
import { useRouter } from "next/dist/client/router";

const FIREPLACE_COMMAND = "cmnd/FIREPLACE/POWER";
const CRASH_EFFECT_COMMAND = "cmnd/CRASH_EFFECT/POWER";
const ON = "ON";
const OFF = "OFF";
export default function Home() {
  const { query } = useRouter();
  const [brokerUrl, setBrokerUrl] = useState("");
  useEffect(() => {
    setBrokerUrl(`ws://${query.brokerUrl}`);
  }, [query.brokerUrl]);
  const [fireGoing, setFireGoing] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [initialize, setInitialized] = useState<boolean>(false);
  const [clientConnected, setClientConnected] = useState<boolean>(false);
  useEffect(() => {
    const setupMqtt = async () => {
      const client = await MQTT.connect("ws://192.168.1.182:9091");

      client.on("connect", () => {
        setClientConnected(true);
      });
      try {
        await client.subscribe(FIREPLACE_COMMAND);
        await client.subscribe(CRASH_EFFECT_COMMAND);
        client.on("message", async (topic, payload) => {
          setMessages((m) => ({ ...m, [topic]: payload.toString() }));
        });
        // This line doesn't run until the server responds to the publish
        //
        // This line doesn't run until the client has disconnected without error
        console.log("Done");
      } catch (e) {
        // Do something about it!
        console.log(e.stack);
        client.end();
      }
    };
    setupMqtt();
  }, []);

  const [crashSound, { stop: stopCrash }] = useSound("static/destruction.mp3", {
    volume: 0.75,
  });
  const [fireSound, { stop: stopFireSound }] = useSound(
    "static/fireplace.mp3",
    {
      volume: 0.5,
      onend: () => {
        if (fireGoing) {
          fireSound();
          console.info("Fire ended - Restarting");
        }
        console.info("Fire ended, fire stopped so cancelling sound");
      },
    }
  );

  useEffect(() => {
    if (initialize) {
      setFireGoing(true);
    }
  }, [initialize]);

  useEffect(() => {
    if (messages[CRASH_EFFECT_COMMAND] === ON) {
      crashSound();
    }
    if (messages[CRASH_EFFECT_COMMAND] === OFF) {
      stopCrash();
    }
    if (messages[FIREPLACE_COMMAND] === OFF) {
      setFireGoing(false);
    }
    if (messages[FIREPLACE_COMMAND] === ON) {
      setFireGoing(true);
    }
  }, [messages, crashSound]);

  useEffect(() => {
    if (fireGoing) {
      fireSound();
    } else {
      stopFireSound();
    }
  }, [fireGoing, fireSound, stopFireSound]);

  return (
    <div className={styles.container}>
      <Head>
        <title>MQTT Listener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          MQTT Status:{" "}
          {clientConnected ? (
            <span style={{ color: "green" }} className={styles.title}>
              Connected
            </span>
          ) : (
            <span style={{ color: "red" }} className={styles.title}>
              Disconnected
            </span>
          )}
        </h1>
        <h1 className={styles.title}>
          Room Status:{" "}
          {initialize ? (
            <h1 style={{ color: "green" }}>READY</h1>
          ) : (
            <h1 style={{ color: "red" }}>NOT READY</h1>
          )}
        </h1>

        <p className={styles.description}>
          Messages: {JSON.stringify(messages)}
        </p>
      </main>
      {!initialize && (
        <button className={styles.button} onClick={() => setInitialized(true)}>
          Start Room
        </button>
      )}
    </div>
  );
}
