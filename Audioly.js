class Audioly {
  constructor(audio) {
    // The actual audio elemet. From (new Audio())
    this.audio = audio;

    // Count to use for clicking back or next
    this.b_f_count = 0;
  }
  playPause(
    el,
    options = {
      playStr: "play",
      pauseStr: "pause",
    },
    styles = { on: null, off: null }
  ) {
    if (this.audio.paused) {
      this.audio.play();
      el.innerHTML = options.pauseStr;
      if (styles.on) {
        el.style = styles.on;
      }
    } else if (this.audio.played) {
      this.audio.pause();
      el.innerHTML = options.playStr;
      if (styles.off) {
        el.style = styles.off;
      }
    }
  }
  setSourceNplay(audList) {
    this.audio.src = audList[this.b_f_count];
    this.audio.play();
  }
  // Getting the playing audio's name and displaying it
  nowPlaying(now_playing = { el: null, names: null }) {
    if (now_playing.el && now_playing.names) {
      now_playing.el.innerText = now_playing.names[this.b_f_count];
    } else {
      console.error("No playing element or names selected!");
    }
  }
  goBack(audList, playing = { el: null, names: null }) {
    if (this.b_f_count <= 0) this.b_f_count = audList.length;
    this.b_f_count--;

    this.nowPlaying({ el: playing.el, names: playing.names });

    this.setSourceNplay(audList);
  }
  goForward(audList, playing = { el: null, names: null }) {
    if (this.b_f_count >= audList.length - 1) this.b_f_count = -1;
    this.b_f_count++;

    this.nowPlaying({ el: playing.el, names: playing.names });

    this.setSourceNplay(audList);
  }
  muteNunmute(el, muteStr, unmuteStr) {
    if (this.audio.muted) {
      this.audio.muted = false;
      el.innerHTML = unmuteStr;
    } else if (!this.audio.muted) {
      this.audio.muted = true;
      el.innerHTML = muteStr;
    }
  }
  loopNunloop(
    el,
    options = {
      loopStr: "loop",
      unloopStr: "unloop",
    },
    styles = { on: null, off: null }
  ) {
    if (this.audio.loop) {
      this.audio.loop = false;
      el.innerHTML = options.loopStr;
      if (styles.off) {
        el.style = styles.off;
      }
    } else if (!this.audio.loop) {
      this.audio.loop = true;
      el.innerHTML = options.unloopStr;
      if (styles.on) {
        el.style = styles.on;
      }
    }
  }
  changeVolume(el) {
    this.audio.volume = el.value / 100;
  }
  changeAudPosition(el) {
    const seekVal = this.audio.duration * (el.value / 100);
    this.audio.currentTime = seekVal;
    return seekVal;
  }
  updateAudTime(el) {
    const currentSeekVal = this.audio.currentTime * (100 / this.audio.duration);
    el.value = currentSeekVal;
    return currentSeekVal;
  }
  getTime(thing) {
    const time = Math.floor(thing);
    const min = Math.floor(time / 60);
    const sec = (time % 60).toFixed(0);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
  }
  getDuration() {
    return this.getTime(this.audio.duration);
  }
  getCurrentTime() {
    return this.getTime(this.audio.currentTime);
  }

  // Formatted current position of audio
  currentPosition() {
    return this.audio.currentTime * (100 / this.audio.duration);
  }

  // Cut audio by seconds

  cutAud(opt = { start: 0, end: 0 }) {
    // Getting the duration of audio
    const dur = Math.floor(this.audio.duration);

    // Getting the end time for audio
    const endtime = dur >= 60 ? opt.start + opt.end : dur;

    // If audio's current time is same as the end time,
    // restart the audio from the start point
    if (Math.floor(this.audio.currentTime) === endtime) {
      this.audio.currentTime = opt.start;
    }

    // Getting the left position of the slider
    // const left = opt.start + opt.end < 99 ? opt.start : 100 - opt.end;
    // if (left === 100 - opt.start) {
    // this.audio.currentTime = this.audio.duration * (left / 100);
    // }
    return { start: opt.start, end: endtime };
  }

  cutSlider(
    el,
    options = {
      thumb: false,
      thumbColor: "#000",
      thumbWidth: "3",
      sliderRGBColor: {
        r: "0",
        g: "0",
        b: "0",
      },
      aud: { start: 0, end: 30 },
    }
  ) {
    // Showing the thumb points on the slider
    if (options.thumb) {
      el.style.borderRight = `${options.thumbWidth}px solid ${options.thumbColor}`;
      el.style.borderLeft = `${options.thumbWidth}px solid ${options.thumbColor}`;
    }

    // Background color for the slider
    el.style.background = `rgba(${options.sliderRGBColor.r}, ${options.sliderRGBColor.g}, ${options.sliderRGBColor.b}, 0.3)`;

    // Cutting the audio
    this.cutAud({
      start: options.aud.start,
      end: options.aud.end,
    });

    // Getting the left position of the slider
    // const left =
    //   options.aud.start + options.aud.end < 99
    //     ? options.aud.start
    //     : 100 - options.aud.end;

    // Styling the slider with left as start point,
    // and width as the end point from user's input
    el.style.left = options.aud.start + "%";
    el.style.width = options.aud.end + "%";
  }

  // Audio Fill slider
  fillSlider(
    el,
    options = {
      thumb: false,
      thumbColor: "#000",
      thumbWidth: "3",
      sliderRGBColor: {
        r: "0",
        g: "0",
        b: "0",
      },
    }
  ) {
    // Showing the thumb point on the slider
    if (options.thumb) {
      el.style.borderRight = `${options.thumbWidth}px solid ${options.thumbColor}`;
    }

    // Styling the slider,
    // width as the point from user's input
    el.style.background = `rgba(${options.sliderRGBColor.r}, ${options.sliderRGBColor.g}, ${options.sliderRGBColor.b}, 0.3)`;
    el.style.width = this.currentPosition() + "%";
  }

  // Audio visualization
  visualizeAud(
    canvas,
    options = {
      canvasColor: "#000",
    }
  ) {
    // Audio web api
    let audCtx = new AudioContext();

    // Get source
    let src = audCtx.createMediaElementSource(this.audio);

    // Create analyzer
    let analyser = audCtx.createAnalyser();
    analyser.fftSize = 256;

    // Setting canvas width and height to the window's width and height for responsiveness
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Canvas context
    let ctx = canvas.getContext("2d");

    // Audio context Connections (source -> destination)
    src.connect(analyser);
    analyser.connect(audCtx.destination);

    // Getting buffer length from analyzer
    let bufferLength = analyser.frequencyBinCount;

    // Creating a Uint8Array (from the buffer length) to use
    let dataArray = new Uint8Array(bufferLength);

    // Canvas width and height
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;

    // Bar width and height to draw on canvas
    let barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;

    // X co-ordinate for filling the canvas rectangle
    let x = 0;

    const renderFrame = async () => {
      // Creating an animation of the analyzer
      requestAnimationFrame(renderFrame);

      x = 0;

      // Generating frequenccy data from dataArray (Uint8Array)
      analyser.getByteFrequencyData(dataArray);

      // Styling and creating rectangle on canvas
      ctx.fillStyle = options.canvasColor;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < bufferLength; i++) {
        // Making the height of every bar from each data in the dataArray
        barHeight = dataArray[i];

        // Generating static rgb values
        let r = barHeight + 12 * (i / bufferLength);
        let g = 250 * (i / bufferLength);
        let b = 50;

        // Styling and creating rectangle on canvas (dynamically)
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        // Incrementing x co-ordinate by bar's width and adding 1 to it (barwidth+1)
        x += barWidth + 1;
      }
    };
    // renderFrame();
  }
  drawWaveform(
    canvas,
    opt = {
      color: "red",
      background: "#fff",
    }
  ) {
    canvas.style.background = opt.background;
    let audCtx = new AudioContext();
    let src = this.audio.src;

    const drawBuffer = (width, height, context, buffer) => {
      let data = buffer.getChannelData(0);
      let step = Math.ceil(data.length / width);
      let amp = height / 2;

      // This will run first to prevent waveforms merging and looking distorted
      // Clearing the previous waveform
      context.fillStyle = opt.background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          let datum = data[i * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        // This will then create a waveform
        context.fillStyle = opt.color;
        context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
      }
    };

    const fetchAud_n_drawBuffer = async () => {
      // Fetching the audio source
      let req = await fetch(src);

      // Canvas width and height
      const width = canvas.width;
      const height = canvas.height;

      // Canvas context
      const ctx = canvas.getContext("2d");

      // Drawing the buffer if no error occured
      if (req.status === 200) {
        let arrayBuffer = await req.arrayBuffer();
        let audioBuffer = await audCtx.decodeAudioData(arrayBuffer);
        drawBuffer(width, height, ctx, audioBuffer);
      } else {
        console.error("Failed to fetch");
      }
    };
    fetchAud_n_drawBuffer();
  }

  // Getting audio icons using fontawesome names for icons
  audIcons(name) {
    const iconMarkup = (icon) => {
      return `<i class="fa fa-${icon}" aria-hidden="true"> </i>`;
    };
    if (name === "play") {
      return iconMarkup("play");
    } else if (name === "pause") {
      return iconMarkup("pause");
    } else if (name === "mute") {
      return iconMarkup("volume-off");
    } else if (name === "zero volume" || name === "no volume") {
      return iconMarkup("volume-down");
    } else if (name === "unmute") {
      return iconMarkup("volume-up");
    } else if (name === "loop") {
      return iconMarkup("repeat");
    } else if (name === "back") {
      return iconMarkup("step-backward");
    } else if (name === "next") {
      return iconMarkup("step-forward");
    } else {
      return "No icon!";
    }
  }
}
