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
let scrollSpeed = 8; // Velocità dello scrolling manuale
let autoScrollSpeed = 8; // Velocità dello scroll automatico
let sfondo; // Variabile per l'immagine di sfondo
let gomitoloPosizioneIniziale;
let autoScroll = false; // Flag per gestire lo scroll automatico
let scrollButton; // Pulsante per attivare/disattivare lo scroll automatico
let seed;
let rotationAngle = 0;
let gomitoloScrollSpeed = 8; // Velocità per il gomitolo
let filiScrollSpeed = 12;    // Velocità aumentata per i fili

// Funzione per caricare i font e l'immagine di sfondo
function preload() {
  sfondo = loadImage("ASSETS/background04_CREAM(schiarito).jpg"); // Sostituisci con il percorso corretto
  font = loadFont("ASSETS/RockSalt-Regular.ttf"); // Sostituisci con il percorso corretto
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  centro = createVector(width / 2, height / 2.5);
  gomitoloPosizioneIniziale = centro.y;
  seed = random(10000);
  randomSeed(seed);
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
  scrollButton.size(50, 50);
  scrollButton.style("background-color", "transparent");
  scrollButton.style("border", "none");
  scrollButton.style("background-image", "url('ASSETS/freccina_giu.png')"); // Percorso corretto dell'icona caricata
  scrollButton.style("background-size", "contain");
  scrollButton.style("background-repeat", "no-repeat");
  scrollButton.style("background-position", "center");
  scrollButton.style("cursor", "pointer");

  // Imposta il bottone con uno stile fixed
  scrollButton.style("position", "fixed");
  scrollButton.style("right", "20px"); // Distanza dal lato destro della finestra
  scrollButton.style("bottom", "20px"); // Distanza dal fondo della finestra

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

  // Disegna il testo che si muove insieme al canvas
  textFont(font);
  stroke("black");
  strokeWeight(1);
  fill("black");
  textSize(15);

  // Aggiorna la posizione del testo in base allo scrolling
  let textY = windowHeight / 7 + tangleOffset; // Testo che si sposta con tangleOffset
  text('La fiducia interpersonale\nè una questione INTRICATA !', windowWidth / 5, textY);
  text('Per renderla più comprensibile\nabbiamo provato a sciogliere alcuni nodi .', 1000, textY + 500);
  text('Ogni filo rappresenta diversi\ngruppi di età .', windowWidth / 6, textY + 900);
  text('Ogni colore racconta una storia di fiducia\nin base alla generazione\na cui appartieni .', 900, textY + 1200);
}

function mouseWheel(event) {
  if (!autoScroll) {
    if (event.delta > 0) {
      // Usa velocità diverse basate sulla posizione
      if (tangleOffset + centro.y + raggio > 0) {
        // Quando il gomitolo è ancora visibile
        progress += gomitoloScrollSpeed;
        tangleOffset -= gomitoloScrollSpeed;
        rotationAngle += 0.25;
      } else {
        // Quando ci sono solo i fili
        progress += filiScrollSpeed;
        tangleOffset -= filiScrollSpeed;
      }
    } else if (tangleOffset < 0) {
      // Stessa logica per lo scroll verso l'alto
      if (tangleOffset + centro.y + raggio > 0) {
        progress -= gomitoloScrollSpeed;
        tangleOffset += gomitoloScrollSpeed;
        rotationAngle -= 0.25;
      } else {
        progress -= filiScrollSpeed;
        tangleOffset += filiScrollSpeed;
      }
    }

    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);

    // Verifica se sei arrivato all'ultimo possibile scroll
    if (tangleOffset <= -maxLunghezza) {
      cambiaPagina(); // Passa alla nuova pagina
    }

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
    rotationAngle += 0.1 * (autoScrollSpeed/scrollSpeed); // Add rotation proportional to scroll speed

    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);

    if (progress >= maxLunghezza || tangleOffset <= -maxLunghezza) {
      autoScroll = false;
      scrollButton.style("opacity", "1");
      noLoop();

      cambiaPagina();
    }
  }
}

function drawGomitolo() {
  randomSeed(seed);
  
  // Prima passata - fili base
  //for (let i = 0; i < numFili; i++) {
  randomSeed(seed + 1 * 1000);
  stroke(colori[0]);
  strokeWeight(spessoreFilo);
  drawFilo3D();
  //}
  
  // Seconda passata - intrecci
  for (let k = 0; k < 5; k++) { // Increased passes for more interlacing
    for (let i = 0; i < numFili; i++) {
      randomSeed(seed + i * 1000 + k * 10000);
      stroke(colori[i]);
      strokeWeight(spessoreFilo * 1.2); // Slightly thicker for visibility
      drawIntreccio3D();
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

    // Applica rotazione
    let y3D_rotated = y3D * cos(-rotationAngle) - z3D * sin(-rotationAngle);
    let z3D_rotated = y3D * sin(-rotationAngle) + z3D * cos(-rotationAngle);

    let prospettiva = 0.8 + z3D_rotated / (2 * raggio);
    let x2D = centro.x + x3D * prospettiva;
    let y2D = centro.y - y3D_rotated * prospettiva;

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

function drawIntreccio3D() {
  let punti = [];
  // Generate fewer points for shorter curves
  for (let i = 0; i < 20; i++) { // Reduced from 200 to 20 points
    let u = random(-1, 1);
    let theta = random(TWO_PI);
    let phi = acos(u);

    // Reduce radius slightly for interlacing effect
    let raggioIntreccio = raggio * 0.9;
    
    let x3D = raggioIntreccio * sin(phi) * cos(theta);
    let y3D = raggioIntreccio * sin(phi) * sin(theta);
    let z3D = raggioIntreccio * cos(phi);

    // Apply same rotation as drawFilo3D
    let y3D_rotated = y3D * cos(-rotationAngle) - z3D * sin(-rotationAngle);
    let z3D_rotated = y3D * sin(-rotationAngle) + z3D * cos(-rotationAngle);

    let prospettiva = 0.8 + z3D_rotated / (2 * raggio);
    let x2D = centro.x + x3D * prospettiva;
    let y2D = centro.y - y3D_rotated * prospettiva;

    // Larger random displacement for more chaotic look
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

function cambiaPagina() {
    window.location.href = "DATAVIZ.html"; // Cambia con l'URL della tua seconda pagina
}