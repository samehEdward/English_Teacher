// Playback of recorded blobs (the learner's own audio).
//
// Deliberately NOT part of speechController: this is HTMLAudioElement
// playback of an already-captured blob. It holds no microphone and has no
// bearing on the speech state machine, so routing it through the mic states
// would block legitimate playback while the app is idle.
//
// It does stop any previous clip, so two recordings can never overlap.

let current = null;

/**
 * Play a recorded clip, replacing anything already playing.
 * @param {string} url object URL from speechController.stopRecording()
 * @returns {HTMLAudioElement|null}
 */
export function playLocalAudio(url) {
  if (!url) return null;

  stopLocalAudio();

  try {
    const audio = new Audio(url);
    audio.addEventListener('ended', () => {
      if (current === audio) current = null;
    });
    // Autoplay policy: playback started outside a user gesture is rejected.
    // That is correct behaviour here, so log rather than retry.
    const played = audio.play();
    if (played && typeof played.catch === 'function') {
      played.catch((err) => {
        console.debug('[playback] blocked or failed', err && err.name);
        if (current === audio) current = null;
      });
    }
    current = audio;
    return audio;
  } catch (err) {
    console.warn('[playback] could not play clip', err);
    return null;
  }
}

export function stopLocalAudio() {
  if (!current) return;
  try {
    current.pause();
    current.currentTime = 0;
  } catch (e) { /* already torn down */ }
  current = null;
}

export function isPlayingLocalAudio() {
  return !!current && !current.paused;
}
