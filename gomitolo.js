let centro;
let raggio = 200;
let numFili = 8;
let colori = ["#E7D299", "#F7B801", "#F18701", "#E54887", "#FE07C0", "#8E0F9C", "#3A0CA4", "#32A9B5"];
let spessoreFilo = 3;
let tangleOffset = 0; // Offset del gomitolo per scorrimento
let progress = 0; // Progresso delle linee con scrolling
let paths = [];
let velocitaDiscesa = []; // Array per la velocità di discesa di ogni filo
let maxLunghezza = 2000; // Lunghezza massima delle linee
let scrollSpeed = 5; // Velocità dello scrolling manuale
let autoScrollSpeed = 15; // Velocità dello scroll automatico
let sfondo; // Variabile per l'immagine di sfondo
let gomitoloPosizioneIniziale;
let autoScroll = false; // Flag per gestire lo scroll automatico
let scrollButton; // Pulsante per attivare/disattivare lo scroll automatico

function preload() {
  sfondo = loadImage("ASSETS/background04_CREAM(schiarito).jpg"); // Sostituisci con il percorso corretto
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  centro = createVector(width / 2, height / 3);
  gomitoloPosizioneIniziale = centro.y;
  noFill();
  noLoop();

  // Inizializza percorsi e velocità di discesa
  for (let i = 0; i < numFili; i++) {
    paths.push([]);
    velocitaDiscesa.push(random(0.8, 1.5)); // Velocità casuale per ogni filo
    let start = generateDistributedStartPoint(i);
    generateLinePath(i, start);
  }

  draw(); // Disegna una volta inizialmente

  // Crea il pulsante per lo scroll automatico
  scrollButton = createButton("");
  scrollButton.position(width - 60, height - 60);
  scrollButton.size(50, 50);
  scrollButton.style("background-color", "transparent");
  scrollButton.style("border", "none");
  scrollButton.style("background-image", "url('ASSETS/freccina_giu.png')"); // Percorso corretto dell'icona caricata
  scrollButton.style("background-size", "contain");
  scrollButton.style("background-repeat", "no-repeat");
  scrollButton.style("background-position", "center");
  scrollButton.style("cursor", "pointer");
  scrollButton.mousePressed(toggleAutoScroll);
}

function draw() {
  image(sfondo, 0, 0, width, height);

  // Disegna i fili
  for (let i = 0; i < numFili; i++) {
    stroke(colori[i]);
    strokeWeight(spessoreFilo);
    noFill();
    beginShape();
    for (let j = 0; j < progress; j++) {
      if (j < paths[i].length) {
        let point = paths[i][j];
        vertex(point.x, point.y + tangleOffset);
      }
    }
    endShape();
  }

  // Disegna il gomitolo se è ancora visibile
  if (tangleOffset + centro.y + raggio > 0) {
    push();
    translate(0, tangleOffset);
    drawGomitolo();
    pop();
  }

  autoScrollBehavior(); // Gestisci lo scroll automatico
}

function mouseWheel(event) {
  if (!autoScroll) {
    if (event.delta > 0) {
      progress += scrollSpeed;
      tangleOffset -= scrollSpeed;
    } else if (tangleOffset < 0) {
      progress -= scrollSpeed;
      tangleOffset += scrollSpeed;
    }

    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);
    redraw();
  }
}

function toggleAutoScroll() {
  autoScroll = !autoScroll;
  scrollButton.style("opacity", autoScroll ? "0.5" : "1");

  if (autoScroll) {
    loop();
  } else {
    noLoop();
  }
}

function autoScrollBehavior() {
  if (autoScroll) {
    progress += autoScrollSpeed;
    tangleOffset -= autoScrollSpeed;

    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);

    if (progress >= maxLunghezza || tangleOffset <= -maxLunghezza) {
      autoScroll = false;
      scrollButton.style("opacity", "1");
      noLoop();
    }
  }
}

function drawGomitolo() {
  for (let i = 0; i < numFili; i++) {
    stroke(colori[i]);
    strokeWeight(spessoreFilo);
    drawFilo3D();
  }

  for (let k = 0; k < 50; k++) {
    let ordineCasuale = ([...Array(numFili).keys()]);
    for (let i of ordineCasuale) {
      stroke(colori[i]);
      strokeWeight(spessoreFilo);
      drawIntreccio();
    }
  }
}

function drawFilo3D() {
  let punti = [];
  for (let i = 0; i < 200; i++) {
    let u = random(-1, 1);
    let theta = random(TWO_PI);
    let phi = acos(u);

    let x3D = raggio * sin(phi) * cos(theta);
    let y3D = raggio * sin(phi) * sin(theta);
    let z3D = raggio * cos(phi);

    let prospettiva = 0.8 + z3D / (2 * raggio);
    let x2D = centro.x + x3D * prospettiva;
    let y2D = centro.y - y3D * prospettiva;

    x2D += random(-2, 2);
    y2D += random(-2, 2);

    punti.push(createVector(x2D, y2D));
  }

  beginShape();
  for (let p of punti) {
    curveVertex(p.x, p.y);
  }
  endShape();
}

function drawIntreccio() {
  let punti = [];
  for (let i = 0; i < 4; i++) {
    let u = random(-1, 1);
    let theta = random(TWO_PI);
    let phi = acos(u);

    let x3D = raggio * sin(phi) * cos(theta);
    let y3D = raggio * sin(phi) * sin(theta);
    let z3D = raggio * cos(phi);

    let prospettiva = 0.8 + z3D / (2 * raggio);
    let x2D = centro.x + x3D * prospettiva;
    let y2D = centro.y - y3D * prospettiva;

    x2D += random(-5, 5);
    y2D += random(-5, 5);

    punti.push(createVector(x2D, y2D));
  }

  beginShape();
  for (let p of punti) {
    curveVertex(p.x, p.y);
  }
  endShape();
}

function generateDistributedStartPoint(index) {
  let angle = (TWO_PI / numFili) * index;
  let distance = raggio * 0.5;
  let x = centro.x + cos(angle) * distance;
  let y = centro.y + sin(angle) * distance;
  return createVector(x, y);
}

function generateLinePath(index, start) {
  let x = start.x;
  let y = start.y;
  let oscillazioneOffset = random(0, TWO_PI);
  let spintaVariabile = random(1, 1.2);

  for (let i = 0; i < maxLunghezza; i++) {
    let oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(1.5, 2.5);
    let spintaSinistra = 0;

    if (i >= 1080 && i < 1400) {
      spintaSinistra = map(i, 1100, 1400, 0, -2) * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(3.5, 4.5);
    } else if (i >= 1400 && i < 1700) {
      spintaSinistra = map(i, 1400, 1700, -2, -4) * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(5.5, 6.5);
    } else if (i >= 1700) {
      spintaSinistra = -6 * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(7.5, 8.5);
    }

    let movimentoVerticale = velocitaDiscesa[index]; // Usa la velocità unica per ogni filo
    x += oscillazione + spintaSinistra;
    y += movimentoVerticale;

    paths[index].push(createVector(x, y));

    if (x < 0) {
      break;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centro = createVector(width / 2, height / 3);
  gomitoloPosizioneIniziale = centro.y;
  scrollButton.position(width - 60, height - 60);
}