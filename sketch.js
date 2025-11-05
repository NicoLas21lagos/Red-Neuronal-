let neuralNetwork;
let video;
let training = true;
let trainingProgress = 0;

const classes = ["clase1", "clase2", "clase3"];

function preload() {
  neuralNetwork = ml5.neuralNetwork({
    task: 'classification',
    debug: true
  });
}

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.size(64, 64);
  video.hide();
  
  setupTraining();
}

async function setupTraining() {
  for (let i = 0; i < classes.length; i++) {
    for (let j = 1; j <= 50; j++) {
      const imagePath = `assets/training/${classes[i]}/image${j}.jpg`;
      neuralNetwork.addData({ image: video }, { label: classes[i] });
    }
  }
  
  neuralNetwork.normalizeData();
  
  const trainingOptions = {
    epochs: 50,
    batchSize: 16
  };
  
  neuralNetwork.train(trainingOptions, whileTraining, finishedTraining);
}

function whileTraining(epoch, loss) {
  trainingProgress = map(epoch, 0, 50, 0, 100);
  console.log(`Época: ${epoch}, Pérdida: ${loss}`);
}

function finishedTraining() {
  console.log("¡Entrenamiento completado!");
  training = false;
  neuralNetwork.save();
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);
  
  if (training) {
    drawTrainingProgress();
  } else {
    classifyImage();
  }
}

function drawTrainingProgress() {
  fill(0);
  textSize(20);
  text(`Entrenando: ${Math.round(trainingProgress)}%`, 20, 40);
}

function classifyImage() {
  neuralNetwork.classify({ image: video }, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  
  let label = results[0].label;
  let confidence = results[0].confidence;
  
  fill(255);
  rect(10, 10, 200, 60);
  fill(0);
  textSize(16);
  text(`Clase: ${label}`, 20, 30);
  text(`Confianza: ${nf(confidence * 100, 2, 1)}%`, 20, 50);
}