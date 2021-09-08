import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import MQTT from "async-mqtt";
import { useRouter } from "next/dist/client/router";
import { useCallback } from "react";

const FIREPLACE_COMMAND = "cmnd/FIREPLACE/POWER";
const CRASH_EFFECT_COMMAND = "cmnd/CRASH_EFFECT/POWER";
const ON = "ON";
const OFF = "OFF";
export default function Home() {
  const {
    query: { brokerUrl },
    push,
  } = useRouter();

  const [fireGoing, setFireGoing] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [initialize, setInitialized] = useState<boolean>(false);
  const [clientConnected, setClientConnected] = useState<boolean>(false);

  const setupMqtt = useCallback(async () => {
    let client: MQTT.AsyncMqttClient;
    try {
      client = await MQTT.connect(
        brokerUrl ? `ws://${brokerUrl}` : "ws://192.168.1.182:9091"
      );
      client.on("connect", () => {
        setClientConnected(true);
      });
      client.on("error", (e) => alert(e));
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
      alert(e.message);
      console.log(e.stack);
      if (client) {
        client.end();
      }
    }
  }, [brokerUrl]);

  const [crashSound, { stop: stopCrash }] = useSound("static/destruction.mp3", {
    volume: 0.75,
  });

  useEffect(() => {
    if (initialize) {
      setupMqtt();
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
      console.log("RECEIVED FIRE STOP COMMAND");
      setFireGoing(false);
    }
    if (messages[FIREPLACE_COMMAND] === ON) {
      setFireGoing(true);
    }
  }, [messages, crashSound, stopCrash]);

  const musicPlayers = useRef<HTMLAudioElement | undefined>();

  function checkIfContinue(ev: Event) {
    if (fireGoing) {
      this.currentTime = 0;
      this.play();
    }
  }
  useEffect(() => {
    if (musicPlayers.current) {
      console.log(musicPlayers.current);
      musicPlayers.current.addEventListener("ended", checkIfContinue, false);
      musicPlayers.current.play();
    }
  }, [musicPlayers, fireGoing]);
  return (
    <div className={styles.container}>
      <Head>
        <title>MQTT Listener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <audio
          src="static/short.mp3"
          controls
          autoPlay
          muted
          ref={musicPlayers}
        />
        <h1 className={styles.title}>
          {" "}
          Broker URL:
          <input
            onChange={(e) =>
              push({
                pathname: "/",
                query: { brokerUrl: e.currentTarget.value },
              })
            }
            value={brokerUrl}
          />
        </h1>
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
      <button onClick={() => setFireGoing(false)}>STOP</button>
    </div>
  );
}
