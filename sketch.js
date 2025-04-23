let video;
let detector;
let detections = [];
let isDetecting = false;
let lastDetectionTime = 0;
let detectionInterval = 500; // ms entre detecciones
let canvas;

let translations = {
  person: "persona",
  bottle: "botella",
  book: "libro",
  clock: "reloj",
  cup: "taza",
  cat: "gata",
  keyboard: "teclado",
  laptop: "portátil",
  painting: "cuadro",
  chair: "silla",
  couch: "sofá",
  plant: "planta",
  tree: "árbol",
  kite: "cometa",
  animal: "animal",
  article: "artículo",
  bank: "banco",
  box: "caja",
  computer: "computadora",
  flower: "flor",
  "cell phone": "teléfono móvil",
  "potted plant": "maceta",
  fan: "ventilador",
  tv: "televisión",
};

function updateObjectSelectOptions() {
  const select = document.getElementById("objectSelect");
  select.innerHTML = "";
  Object.keys(translations).forEach((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = translations[label] ? translations[label] : label;
    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openFormBtn");
  const closeBtn = document.getElementById("closeFormBtn");
  const formOverlay = document.getElementById("formOverlay");
  const translationForm = document.getElementById("translationForm");

  openBtn?.addEventListener("click", () => {
    formOverlay.style.display = "flex";
  });

  closeBtn?.addEventListener("click", () => {
    formOverlay.style.display = "none";
  });

  translationForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    let selectedLabel = document.getElementById("objectSelect").value;
    let newTranslation = document.getElementById("newTranslation").value.trim();

    if (newTranslation) {
      translations[selectedLabel] = newTranslation;
      updateObjectSelectOptions(); // 👈 Refrescar <select> después de guardar
      document.getElementById("newTranslation").value = "";
    }

    formOverlay.style.display = "none";
  });

  updateObjectSelectOptions(); // 👈 Llenar <select> al cargar la página
});

function preload() {
  detector = ml5.objectDetector("cocossd");
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  detections = results || [];
  isDetecting = false;
}

function setup() {
  canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");

  const constraints = {
    video: {
      facingMode: "environment",
    },
  };

  video = createCapture(constraints, function () {
    let checkVideoReady = setInterval(() => {
      if (video.width > 0 && video.height > 0) {
        clearInterval(checkVideoReady);
        adjustCanvasToVideo();
        document.getElementById("loader").style.display = "none"; // Oculta el loader
        requestDetection();
      }
    }, 100);
  });

  video.hide();
}

function adjustCanvasToVideo() {
  if (video.width && video.height) {
    const container = document.getElementById("canvas-container");
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const videoRatio = video.width / video.height;

    let newWidth, newHeight;
    if (containerWidth / containerHeight > videoRatio) {
      newHeight = containerHeight;
      newWidth = containerHeight * videoRatio;
    } else {
      newWidth = containerWidth;
      newHeight = containerWidth / videoRatio;
    }

    resizeCanvas(newWidth, newHeight);
    console.log(`Canvas ajustado: ${newWidth}x${newHeight}`);
  } else {
    setTimeout(adjustCanvasToVideo, 500);
  }
}

function requestDetection() {
  if (
    !isDetecting &&
    millis() - lastDetectionTime > detectionInterval &&
    video.width > 0 &&
    video.height > 0
  ) {
    isDetecting = true;
    lastDetectionTime = millis();
    detector.detect(video, gotDetections);
  }
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
    const scaleX = width / video.width;
    const scaleY = height / video.height;

    let x = object.x * scaleX;
    let y = object.y * scaleY;
    let objWidth = object.width * scaleX;
    let objHeight = object.height * scaleY;
    let label = translations[object.label] || object.label;

    stroke(0, 255, 0);
    strokeWeight(3);
    noFill();
    rect(x, y, objWidth, objHeight);

    noStroke();
    fill(0);
    rect(x, y - 30, textWidth(label) + 20, 30);
    fill(255);
    textSize(20);
    text(label, x + 10, y - 8);
  }

  requestDetection();
}

function windowResized() {
  adjustCanvasToVideo();
}

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    isDetecting = true;
  } else {
    isDetecting = false;
    lastDetectionTime = 0;
  }
});
