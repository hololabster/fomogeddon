export const playDigitalSound = (type) => {
  try {
    // Create AudioContext
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect oscillator to gain and output
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set sound parameters based on type
    switch (type) {
      case "select":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          880,
          audioContext.currentTime + 0.1
        );
        oscillator.frequency.exponentialRampToValueAtTime(
          990,
          audioContext.currentTime + 0.2
        );
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case "start":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          880,
          audioContext.currentTime + 0.2
        );
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case "stop":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          220,
          audioContext.currentTime + 0.2
        );
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case "alert":
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          440,
          audioContext.currentTime + 0.1
        );
        oscillator.frequency.setValueAtTime(
          880,
          audioContext.currentTime + 0.2
        );
        oscillator.frequency.setValueAtTime(
          440,
          audioContext.currentTime + 0.3
        );
        oscillator.frequency.setValueAtTime(
          880,
          audioContext.currentTime + 0.4
        );
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;

      case "trade":
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1320,
          audioContext.currentTime + 0.15
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case "success":
        // First sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          660,
          audioContext.currentTime + 0.15
        );
        oscillator.frequency.setValueAtTime(
          880,
          audioContext.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.4
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);

        // Second sound (chord)
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);

          oscillator2.type = "sine";
          oscillator2.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.4
          );

          oscillator2.start();
          oscillator2.stop(audioContext.currentTime + 0.4);
        }, 100);
        break;

      case "fail":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          220,
          audioContext.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.4
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Audio playback error:", error);
  }
};
