import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.hero}>
      {/* Perspective grid background */}
      <div className={styles.gridBg} aria-hidden="true">
        <div className={styles.gridPlane} />
        <div className={styles.sun} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleMain}>Forma</span>
          <span className={styles.titleAccent}>Vox</span>
        </h1>

        <p className={styles.tagline}>Where sound begins as a shape</p>

        <div className={styles.divider} />

        <p className={styles.desc}>
          Draw a waveform. Hear it played back through a polyphonic synthesizer.
          Capture your voice and reshape it into new instruments.
        </p>

        <div className={styles.actions}>
          <Link to="/synth" className={styles.ctaPrimary}>
            Draw + Play
          </Link>
          <Link to="/voice" className={styles.ctaSecondary}>
            Voice Capture
          </Link>
        </div>

        <div className={styles.hints}>
          <span className={styles.hint}>
            <kbd className={styles.kbd}>A</kbd>–
            <kbd className={styles.kbd}>L</kbd> play notes
          </span>
          <span className={styles.hint}>
            <kbd className={styles.kbd}>W</kbd>{" "}
            <kbd className={styles.kbd}>E</kbd>{" "}
            <kbd className={styles.kbd}>T</kbd> sharps
          </span>
        </div>
      </div>
    </div>
  );
}
