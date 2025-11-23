"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./storyboard.module.css";

type SceneKey = 1 | 2 | 3 | 4 | 5;

export default function HomePage() {
  const [scene, setScene] = useState<SceneKey>(1);
  const timeoutsRef = useRef<number[]>([]);

  // Timeline: 0?2, 2?4, 4?7, 7?10, 10?13 seconds
  useEffect(() => {
    const schedule = [
      { atMs: 0, scene: 1 as SceneKey },
      { atMs: 2000, scene: 2 as SceneKey },
      { atMs: 4000, scene: 3 as SceneKey },
      { atMs: 7000, scene: 4 as SceneKey },
      { atMs: 10000, scene: 5 as SceneKey }
    ];

    schedule.forEach((s) => {
      const id = window.setTimeout(() => setScene(s.scene), s.atMs);
      timeoutsRef.current.push(id);
    });

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // Try to initialize subtle audio via WebAudio (may be blocked by browsers)
  const audioStartedRef = useRef(false);
  useEffect(() => {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = 0.06; // very quiet
      master.connect(ctx.destination);

      // Heartbeat: short low thumps every ~0.9s for first 4s, then fade into pad
      const startTime = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const t = startTime + i * 0.9;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(60, t);
        osc.connect(gain);
        gain.connect(master);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.3);
      }

      // Gentle inspiring pad that swells
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.type = "sawtooth";
      padOsc.frequency.value = 220; // A3 base
      padOsc.connect(padGain);
      padGain.connect(master);
      const t0 = ctx.currentTime + 0.5;
      padGain.gain.setValueAtTime(0.0001, t0);
      padGain.gain.exponentialRampToValueAtTime(0.08, t0 + 2);
      padGain.gain.exponentialRampToValueAtTime(0.02, t0 + 6);
      padGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 13);
      padOsc.start(t0);
      padOsc.stop(t0 + 13.5);
    } catch {
      // Ignore audio failure
    }
  }, []);

  const sceneClass = useMemo(() => `${styles.scene} ${styles[`scene${scene}`]}`, [scene]);

  return (
    <main className={styles.container}>
      <div className={styles.background} />
      <div className={styles.movingLight} />

      {/* Scene Visual Layers */}
      <div className={`${styles.layer} ${styles.layerRoad} ${scene >= 2 ? styles.show : ""}`} />
      <div className={`${styles.layer} ${styles.layerFog} ${scene >= 2 ? styles.show : ""}`} />
      <div className={`${styles.layer} ${styles.layerCompass} ${scene >= 3 ? styles.show : ""}`}>
        <div className={styles.compassGlow}>
          <div className={styles.compassCircle}>
            <div className={`${styles.compassNeedle} ${scene >= 3 ? styles.spin : ""}`} />
            <span className={styles.cardinal} style={{ top: "-14px" }}>?</span>
            <span className={styles.cardinal} style={{ right: "-14px" }}>?</span>
            <span className={styles.cardinal} style={{ bottom: "-14px" }}>?</span>
            <span className={styles.cardinal} style={{ left: "-14px" }}>?</span>
          </div>
        </div>
      </div>

      <div className={`${styles.layer} ${styles.layerBook} ${scene >= 4 ? styles.show : ""}`}>
        <div className={styles.book}>
          <div className={styles.bookSpine} />
          <div className={styles.bookCover}>
            <div className={styles.bookTitle}>????? ??????</div>
            <div className={styles.bookSubtitle}>7 ????? ???? ??????</div>
            <div className={styles.bookSubtitle}>????? ?? ??? ????????</div>
          </div>
        </div>
      </div>

      <div className={`${styles.layer} ${styles.layerPerson} ${scene >= 5 ? styles.show : ""}`}>
        <div className={styles.person}>
          <div className={styles.personHead} />
          <div className={styles.personBody} />
          <div className={styles.personArm} />
        </div>
      </div>

      {/* Text Overlays */}
      <div className={sceneClass}>
        {scene === 1 && (
          <div className={styles.textBox}>???? ???? ????????</div>
        )}
        {scene === 2 && (
          <div className={styles.textBox}>??? ?????? ???? ????? ?????? ?????? ??????.</div>
        )}
        {scene === 3 && (
          <div className={styles.textBox}>????? ???????</div>
        )}
        {scene === 4 && (
          <div className={styles.textBox}>7 ????? ???? ?????? ????? ?? ??? ????????.</div>
        )}
        {scene === 5 && (
          <div className={styles.textBox}>???? ????? ??????? ???? ????.</div>
        )}
      </div>

      <footer className={styles.footer}>? {new Date().getFullYear()} ????? ??????</footer>
    </main>
  );
}
