import Draw from "../components/Draw";

export default function DrawPage() {
  const handleWaveUpdate = (waveform) => {
    // Optional: you can log, send to engine, or debug waveform
    console.log("Waveform updated:", waveform);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Draw Waveform</h2>
      <Draw width="100%" height={400} onWaveUpdate={handleWaveUpdate} />
      <p style={{ opacity: 0.7, marginTop: 10 }}>
        Draw one continuous waveform. You can lift and continue refining.
      </p>
    </div>
  );
}
