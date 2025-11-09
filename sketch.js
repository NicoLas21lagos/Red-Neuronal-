let featureExtractor;
let classifier;
let statusP;

function setup() {
  noCanvas();
  statusP = select('#status');
  statusP.html('Inicializando modelo...');

  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  classifier = featureExtractor.classification();
}

function modelReady() {
  statusP.html('Modelo base cargado. Cargando imágenes de entrenamiento...');
  loadImagesAndTrain();
}

async function loadImagesAndTrain() {
  const classes = ['clase1', 'clase2'];

  for (let c of classes) {
    for (let i = 1; i <= 50; i++) {
      const imgPath = `assets/training/${c}/image${i}.jpg`;

      await new Promise((resolve) => {
        const img = createImg(
          imgPath,
          '',
          '',
          () => {
            classifier.addImage(img.elt, c);
            img.remove();
            resolve();
          }
        );

        img.hide();

        img.elt.addEventListener('error', () => {
          console.warn('❌ No se pudo cargar:', imgPath);
          resolve();
        });
      });
    }
  }

  statusP.html('✅ Imágenes cargadas correctamente. Listo para entrenar.');
}

function trainModel() {
  statusP.html('Entrenando modelo...');

  classifier.train((lossValue) => {
    if (lossValue != null && !isNaN(lossValue)) {
      statusP.html('Pérdida: ' + Number(lossValue).toFixed(4));
    } else {
      statusP.html('Entrenamiento completado ✅');
    }
  });
}

function saveModel() {
  classifier.save();
  statusP.html('Modelo guardado en la carpeta /model.');
}

function classifyImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = createImg(URL.createObjectURL(file), '', '', () => {
    classifier.classify(img, (err, result) => {
      if (err) {
        console.error(err);
        select('#result').html('❌ Error en la clasificación.');
        return;
      }

      if (!result || result.length === 0) {
        select('#result').html('⚠️ No se obtuvo una predicción.');
        return;
      }

      const topResult = result[0];
      const confidence = topResult.confidence || 0;
      const label = topResult.label;

      const threshold = 0.3;

      if (confidence < threshold) {
        select('#result').html(`No pertenece a ninguna clase (confianza: ${(confidence * 100).toFixed(2)}%)`);
      } else {
        select('#result').html(`Predicción: ${label} (${(confidence * 100).toFixed(2)}%)`);
      }

      console.log(result);
    });
  });

  img.hide();
}

