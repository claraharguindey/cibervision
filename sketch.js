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
  fan: "ventilador",
  tv: "televisión",
};

// Gestión del formulario
document.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openFormBtn");
  const closeBtn = document.getElementById("closeFormBtn");
  const formOverlay = document.getElementById("formOverlay");
  const translationForm = document.getElementById("translationForm");

  openBtn.addEventListener("click", () => {
    formOverlay.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    formOverlay.style.display = "none";
  });

  translationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let selectedLabel = document.getElementById("objectSelect").value;
    let newTranslation = document.getElementById("newTranslation").value.trim();

    if (newTranslation) {
      translations[selectedLabel] = newTranslation;
      document.getElementById("newTranslation").value = "";
    }

    formOverlay.style.display = "none";
  });
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

// Enfoque completamente diferente para resolver el problema de la distorsión
function setup() {
  // Creamos un canvas con dimensiones iniciales
  canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");

  // Configuración de vídeo - IMPORTANTE: NO ajustamos el tamaño del video
  // Dejamos que la cámara use su resolución nativa
  const constraints = {
    video: {
      facingMode: "environment",
    },
  };

  video = createCapture(constraints, function (stream) {
    // Una vez que el video está listo, ajustamos el canvas a la proporción real del video
    setTimeout(adjustCanvasToVideo, 500);
  });

  video.hide();

  // Iniciar detección
  requestDetection();
}

// Función para ajustar el canvas a la proporción real del video
function adjustCanvasToVideo() {
  if (video.width && video.height) {
    // Mantenemos la proporción exacta del video
    const containerWidth =
      document.getElementById("canvas-container").offsetWidth;
    const containerHeight =
      document.getElementById("canvas-container").offsetHeight;

    // Calculamos el tamaño máximo que puede tener el video manteniendo su proporción
    const videoRatio = video.width / video.height;

    let newWidth, newHeight;

    // Decidimos si ajustamos por ancho o por alto
    if (containerWidth / containerHeight > videoRatio) {
      // El contenedor es más ancho que el video
      newHeight = containerHeight;
      newWidth = containerHeight * videoRatio;
    } else {
      // El contenedor es más alto que el video
      newWidth = containerWidth;
      newHeight = containerWidth / videoRatio;
    }

    // Redimensionamos el canvas a la proporción exacta del video
    resizeCanvas(newWidth, newHeight);

    console.log(
      `Video real: ${video.width}x${video.height}, ratio: ${videoRatio}`
    );
    console.log(`Canvas ajustado: ${newWidth}x${newHeight}`);
  } else {
    // Si aún no tenemos dimensiones, intentamos de nuevo
    setTimeout(adjustCanvasToVideo, 500);
  }
}

function requestDetection() {
  if (!isDetecting && millis() - lastDetectionTime > detectionInterval) {
    isDetecting = true;
    lastDetectionTime = millis();
    detector.detect(video, gotDetections);
  }
}

function draw() {
  // Dibujamos el video completo en el canvas (que ya tiene la proporción correcta)
  background(0);
  image(video, 0, 0, width, height);

  // Dibujamos las detecciones
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];

    // Escalamos las coordenadas para que coincidan con el tamaño del canvas
    const scaleX = width / video.width;
    const scaleY = height / video.height;

    let x = object.x * scaleX;
    let y = object.y * scaleY;
    let objWidth = object.width * scaleX;
    let objHeight = object.height * scaleY;

    // Usamos traducción si existe, o mantenemos la etiqueta original
    let label = translations[object.label] || object.label;

    // Dibujamos el recuadro
    stroke(0, 255, 0);
    strokeWeight(3);
    noFill();
    rect(x, y, objWidth, objHeight);

    // Dibujamos la etiqueta con fondo
    noStroke();
    fill(0, 200);
    rect(x, y - 30, textWidth(label) + 20, 30);
    fill(255);
    textSize(20);
    text(label, x + 10, y - 8);
  }

  // Solicitamos nueva detección
  requestDetection();
}

// Manejar cambios de orientación o tamaño de ventana
function windowResized() {
  // Reajustamos el canvas cuando cambia el tamaño de la ventana
  adjustCanvasToVideo();
}

// Pausar las detecciones cuando la página no está visible
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    isDetecting = true; // Evita nuevas detecciones
  } else {
    isDetecting = false;
    lastDetectionTime = 0; // Permite reanudar las detecciones
  }
});
