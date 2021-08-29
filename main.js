// Selectors
const loop = document.getElementById("loop");
const prev = document.getElementById("prev");
const play = document.getElementById("play");
const nxt = document.getElementById("nxt");
const mute = document.getElementById("mute");
const volume = document.getElementById("volume");
const seek = document.getElementById("seek");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const canvas = document.getElementsByTagName("canvas")[0];
const freq = document.getElementById("freq");
const fillSlider = document.getElementById("fillSlider");
const file = document.getElementById("file");
const playing = document.getElementById("playing");

// Audio playlist
const audios = [];
const fileNames = [];

// Creating the audio element
const audio = new Audio();

// Audio settings
const audioly = new Audioly(audio);

// Start time for cutting audio
let startTime = 0;

// Styles to use
const onColor = "rgb(41, 250, 138)";
const offColor = "#fff";
const onShadow =
  " inset 1px 2px 4px rgba(0, 0, 0, 0.9), inset 1px 0px 1px rgba(255, 255, 255, 0.9)";
const offShadow = "  0px 2px 2px rgba(0, 0, 0, 0.7)";

// Icons from audio settings
const icon = (icon) => {
  return audioly.audIcons(icon);
};

// Sliders
const cutSlider = () => {
  audioly.cutSlider(fillSlider, {
    sliderRGBColor: {
      r: "131",
      g: "49",
      b: "49",
    },
    thumb: true,
    thumbWidth: "3",
    thumbColor: "#000",
    aud: { start: startTime, end: 30 },
  });
};
const fillSliderDisplay = () => {
  audioly.fillSlider(fillSlider, {
    sliderRGBColor: {
      r: "131",
      g: "49",
      b: "49",
    },
  });
};

// When a new file is uploaded
file.addEventListener("change", async (e) => {
  // Getting the uploaded audio file
  const uploaded_file = await e.target.files[0];

  // Splitting the file's name without extention
  const spl = uploaded_file.name.split(".");
  const filename = spl[0];

  // Creating a binary large object (blob) from the file
  const blob = URL.createObjectURL(uploaded_file);

  // Adding each uploaded file to the audios array and
  // fileName array to create playlist
  audios.push(blob);
  fileNames.push(filename);

  // If the audios array has 1 or more files uploaded,
  // and the audio's source is empty, then set the audio's
  // source to the first element in the array
  if (audios.length >= 1 && audio.src === "") {
    audio.src = audios[0];

    // Displaying the file's name
    playing.innerText = fileNames[0];
  }
});

// Showing current time and duration for the current audio after page loads
// And also updating the UI
audio.onloadedmetadata = () => {
  currentTime.innerText = audioly.getCurrentTime();
  duration.innerText = audioly.getDuration();

  // If paused show "play" otherwise show "pause"
  if (audio.paused) {
    play.innerHTML = icon("play");
  } else {
    play.innerHTML = icon("pause");
  }

  // Drawing the waveform of a playing song
  audioly.drawWaveform(canvas, {
    color: "#fff",
    background: "rgb(46,46,58)",
  });

  // Fill sliders

  // cutSlider();
  fillSliderDisplay();
};

// Playing and pausing audio
play.addEventListener("click", () => {
  if (audio.src) {
    audioly.playPause(
      play,
      { playStr: icon("play"), pauseStr: icon("pause") },
      {
        on: `color: ${onColor}; box-shadow: ${onShadow}`,
        off: `color: ${offColor}; box-shadow: ${offShadow}`,
      }
    );
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.keyCode === 32) {
    audioly.playPause(
      play,
      { playStr: icon("play"), pauseStr: icon("pause") },
      {
        on: `color: ${onColor}; box-shadow: ${onShadow}`,
        off: `color: ${offColor}; box-shadow: ${offShadow}`,
      }
    );
  }
});

// Previous and Next
prev.addEventListener("click", () => {
  if (audio.src) {
    audioly.goBack(audios, {
      el: playing, // Now playing element
      names: fileNames, // An array of names of audios
    });
  }
});

nxt.addEventListener("click", () => {
  if (audio.src) {
    audioly.goForward(audios);
  }
});

// Mute and unmute
mute.addEventListener("click", () => {
  audioly.muteNunmute(mute, icon("mute"), icon("unmute"));
});

// Loop audio
loop.addEventListener("click", () => {
  if (audio.src) {
    audioly.loopNunloop(
      loop,
      {
        loopStr: icon("loop"),
        unloopStr: icon("loop"),
      },
      {
        on: "color:" + onColor,
        off: "color:#222",
      }
    );
  }
});

// Volume change
volume.addEventListener("input", () => {
  audioly.changeVolume(volume);
});

// Seek change
seek.addEventListener("input", () => {
  audioly.changeAudPosition(seek);

  // Getting the position of audio
  startTime = Math.floor(audioly.currentPosition());

  // Fill sliders

  // cutSlider();
  fillSliderDisplay();
});

// Update audio time
audio.addEventListener("timeupdate", () => {
  // updating seek value when current time changes
  audioly.updateAudTime(seek);

  // Fill sliders

  // cutSlider();
  fillSliderDisplay();

  // Showing current time and duration for the current audio
  currentTime.innerText = audioly.getCurrentTime();

  // Play the next song when the current one has finished playing
  if (audio.ended && !audio.loop) {
    audioly.goForward(audios);
  }
});
