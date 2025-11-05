let neuralNetwork;
let video;
let trainingProgress = 0;

// Tus tres clases
const classes = ["clase1", "clase2", "clase3"];

async function preload() {
  await tf.setBackend('webgl'); // Establece backend seguro
  await tf.ready();

  neuralNetwork = ml5.neuralNetwork({
    task: "imageClassification",
    debug: true
  });
}

function setup() {
  noCanvas();
  document.getElementById("estado").innerText = "Cargando imágenes de entrenamiento...";
  cargarDatosEntrenamiento();
}

async function cargarDatosEntrenamiento() {
  for (let i = 0; i < classes.length; i++) {
    for (let j = 1; j <= 50; j++) {
      // 👇 Ajusta aquí si tus imágenes son .png
      const imagePath = `training/${classes[i]}/image${j}.jpg`;

      try {
        const img = await loadImage(imagePath);
        neuralNetwork.addData({ image: img }, { label: classes[i] });
      } catch (err) {
        console.warn("⚠️ No se pudo cargar:", imagePath);
      }
    }
  }

  console.log("✅ Todas las imágenes intentadas de cargar.");
  neuralNetwork.normalizeData();
  entrenarModelo();
}

function entrenarModelo() {
  document.getElementById("estado").innerText = "Entrenando modelo...";
  const opcionesEntrenamiento = {
    epochs: 50,
    batchSize: 16
  };

  neuralNetwork.train(opcionesEntrenamiento, mientrasEntrena, entrenamientoTerminado);
}

function mientrasEntrena(epoch, loss) {
  trainingProgress = Math.round((epoch / 50) * 100);
  console.log(`Época: ${epoch} - Pérdida: ${loss.loss.toFixed(4)}`);
  document.getElementById("estado").innerText = `Entrenando modelo... (${trainingProgress}%)`;
}

function entrenamientoTerminado() {
  document.getElementById("estado").innerText = "✅ Entrenamiento completado. Activando cámara...";
  console.log("Entrenamiento completado.");
  neuralNetwork.save();
  iniciarClasificacion();
}

function iniciarClasificacion() {
  video = createCapture(VIDEO);
  video.size(224, 224);
  video.hide();
  document.getElementById("estado").innerText = "Clasificando en tiempo real...";
  clasificarEnVivo();
}

function clasificarEnVivo() {
  neuralNetwork.classify({ image: video }, (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    const label = results[0].label;
    const confidence = (results[0].confidence * 100).toFixed(2);

    document.getElementById("resultado").innerHTML = `
      <h2>Resultado:</h2>
      <p><strong>Clase:</strong> ${label}</p>
      <p><strong>Confianza:</strong> ${confidence}%</p>
    `;

    setTimeout(clasificarEnVivo, 500);
  });
}
