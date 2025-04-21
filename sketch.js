let video;
let detector;
let detections = [];
let isDetecting = false;
let lastDetectionTime = 0;
let detectionInterval = 500; // Intervalo entre detecciones en ms
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
  tv: "televisión"
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("translationForm")
    .addEventListener("submit", function(e) {
      e.preventDefault();
      let selectedLabel = document.getElementById("objectSelect").value;
      let newTranslation = document.getElementById("newTranslation").value.trim();
      if (newTranslation) {
        translations[selectedLabel] = newTranslation;
      }
    });
    
  const style = document.createElement('style');
  style.textContent = `
    body, html { 
      margin: 0; 
      padding: 0; 
      width: 100%; 
      overflow-x: hidden; 
    }
    canvas { 
      display: block; 
      width: 100% !important; 
      height: auto !important; 
    }
  
  `;
  document.head.appendChild(style);
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
  // Usar el ancho completo de la ventana sin margen
  const fullWidth = windowWidth;
  // Mantener la relación de aspecto
  const fullHeight = (fullWidth / 4) * 3; 
  
  // Crear el canvas al 100% del ancho
  createCanvas(fullWidth, fullHeight);
  
  // Configuración de vídeo también al 100% del ancho
  const constraints = {
    video: {
      facingMode: "environment", // Usa cámara trasera en móviles
      width: { ideal: fullWidth },
      height: { ideal: fullHeight }
    }
  };
  
  video = createCapture(constraints);
  video.size(fullWidth, fullHeight);
  video.hide();
  
  // Iniciar primera detección
  requestDetection();
}

function requestDetection() {
  if (!isDetecting && millis() - lastDetectionTime > detectionInterval) {
    isDetecting = true;
    lastDetectionTime = millis();
    detector.detect(video, gotDetections);
  }
}

function draw() {
  // Dibujar frame
  image(video, 0, 0, width, height);
  
  // Dibujar detecciones almacenadas
  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
    
    // Adaptar coordenadas si el tamaño del canvas es diferente al del video
    const scaleX = width / video.width;
    const scaleY = height / video.height;
    
    let x = object.x * scaleX;
    let y = object.y * scaleY;
    let w = object.width * scaleX;
    let h = object.height * scaleY;
    
    // Usar traducción si existe, o mantener la etiqueta original
    let label = translations[object.label] || object.label;
    
    // Usar strokeWeight más delgado para móviles
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h);
    
    // Usar texto más pequeño y con fondo para mejor legibilidad
    noStroke();
    fill(0, 200);
    rect(x, y, textWidth(label) + 20, 24);
    fill(255);
    textSize(16);
    text(label, x + 10, y + 16);
  }
  
  // Solicitar nueva detección
  requestDetection();
}

// Manejar cambios de orientación o tamaño de ventana
function windowResized() {
  const fullWidth = windowWidth;
  const fullHeight = (fullWidth / 4) * 3;
  
  resizeCanvas(fullWidth, fullHeight);
  
  // Redimensionar el video también
  if (video) {
    video.size(fullWidth, fullHeight);
  }
}

// Pausa las detecciones cuando la página no está visible
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    isDetecting = true; // Evita nuevas detecciones
  } else {
    isDetecting = false;
    lastDetectionTime = 0; // Permite reanudar las detecciones
  }
});

