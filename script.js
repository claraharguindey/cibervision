let video;
let detector;
let detections = [];
let translations = {
  person: "persona",
  bottle: "botella",
  book: "libro",
  clock: "reloj",
  cup: "taza",
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
};

document
  .getElementById("translationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Evita que el formulario recargue la página
    let selectedLabel = document.getElementById("objectSelect").value;
    let newTranslation = document.getElementById("newTranslation").value.trim();

    // Actualizar el diccionario de traducciones si el campo no está vacío
    if (newTranslation) {
      translations[selectedLabel] = newTranslation;
    }
  });

function preload() {
  detector = ml5.objectDetector("cocossd");
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  detections = results;
  detector.detect(video, gotDetections);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  detector.detect(video, gotDetections);
}

function draw() {
  image(video, 0, 0);

  for (let i = 0; i < detections.length; i++) {
    let object = detections[i];
    let label = object.label;

    if (translations[label]) {
      label = translations[label];
    }

    stroke(0, 255, 0);
    strokeWeight(4);
    noFill();
    rect(object.x, object.y, object.width, object.height);
    noStroke();
    fill(255);
    textSize(24);
    text(label, object.x + 10, object.y + 24);
  }
}
