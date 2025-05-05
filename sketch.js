let mode = 0;
let audioStarted = false;
let splash; 

let particles = [];
let colors = ['#ffadad', '#ffd6a5', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

let numSlider, speedSlider, sizeSlider, distSlider, resetBtn;
let fft, soundFile;


function preload() {
  soundFile = loadSound('glacier.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  splash = new Splash();
  colorMode(HSB);

  fft = new p5.FFT();
  fft.setInput(soundFile);

  // 创建界面控制组件
  numSlider = createSlider(100, 1000, 300, 10);
  numSlider.position(10, 10);

  speedSlider = createSlider(0.1, 5, 1, 0.1);
  speedSlider.position(10, 40);

  sizeSlider = createSlider(2, 20, 8, 1);
  sizeSlider.position(10, 70);

  distSlider = createSlider(20, 200, 100, 5);
  distSlider.position(10, 100);

  resetBtn = createButton("Reset");
  resetBtn.position(10, 130);
  resetBtn.mousePressed(makeParticles);

  makeParticles();
}

function draw() {
  if (mode === 0) {
    background(0, 0, 5);
    if (mouseIsPressed && splash.update()) {
      splash.hide();
      mode = 1;
      if (!soundFile.isPlaying()) {
        soundFile.loop();
      }
    }
  } else if (mode === 1) {
    background(0, 0, 5, 20);

    let count = numSlider.value();
    let particleSpeed = speedSlider.value();
    let size = sizeSlider.value();
    let connectDist = distSlider.value();

    let freq = fft.analyze();

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      let f = getFreqValue(p.pos.x, freq);
      let s = particleSpeed * map(f, 0, 255, 0.5, 2);
      let sz = size * map(f, 0, 255, 0.5, 3);
      let colorFactor = map(f, 0, 255, 0, 255);

      p.update(s);
      p.show(sz, colorFactor);
    }

    stroke(0, 0, 100, 10);
    strokeWeight(1);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let a = particles[i];
        let b = particles[j];
        let d = dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        if (d < connectDist) {
          line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        }
      }
    }
  }
}

function makeParticles() {
  particles = [];
  let n = numSlider.value();
  for (let i = 0; i < n; i++) {
    let x = random(width);
    let y = random(height);
    particles.push(new Particle(x, y));
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.baseColor = color(random(colors));
  }

  update(s) {
    let v = this.vel.copy();
    v.mult(random(0.5, s));
    this.pos.add(v);

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  show(sz, colorFactor) {
    let dynamicColor = color(
      (this.baseColor.levels[0] + colorFactor) % 255,
      this.baseColor.levels[1],
      this.baseColor.levels[2]
    );
    noStroke();
    fill(dynamicColor);
    ellipse(this.pos.x, this.pos.y, sz, sz);
  }
}

function getFreqValue(x, freq) {
  let i = floor(map(x, 0, width, 0, freq.length));
  return freq[i];
}

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    soundFile.loop();
    audioStarted = true;
    mode = 1; 
  }
}


