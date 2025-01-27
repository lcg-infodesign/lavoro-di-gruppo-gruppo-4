let centro;
let raggio = 200;
let numFili = 8;
let colori = ["#E7D299", "#F7B801", "#F18701", "#E54887", "#FE07C0", "#8E0F9C", "#3A0CA4", "#32A9B5"];
let spessoreFilo = 3;
let tangleOffset = 0; // Offset per lo scrolling
let progress = 0; // Progresso dello scrolling
let paths = []; // Array per i percorsi di ogni filo
let velocitaDiscesa = []; // Array per le velocità di discesa di ogni filo
let maxLunghezza = 2000; 
let scrollSpeed = 6.5; // Scroll manuale
let autoScrollSpeed = 5; // Scroll automatico
let sfondo; 
let gomitoloPosizioneIniziale; 
let autoScroll = false; // Flag per lo scroll automatico
let scrollButton; 
let seed; // Punto di partenza per la generazione casuale
let rotationAngle = 0;
let gomitoloScrollSpeed = 8;
let filiScrollSpeed = 12;  

// Testi
let textData = [
  {
    content: "La fiducia interpersonale\nè una questione INTRICATA !",
    x: 0.21, 
    y: 0.1, 
    size: 22, 
  },
  {
    content: "Per renderla più comprensibile\nabbiamo provato a\nsciogliere alcuni nodi .",
    x: 0.75,
    y: 0.8,
    size: 18,
  },
  {
    content: "Ogni filo rappresenta diversi\ngruppi di età .",
    x: 0.16,
    y: 1.4,
    size: 18,
  },
  {
    content: "Ogni colore racconta\nuna storia di fiducia\nin base alla generazione\na cui appartieni .",
    x: 0.75,
    y: 2,
    size: 18,
  },
  {
    content: "Tieni d'occhio la pagina ! \ni fili stanno per\nprendere forma . . .",
    x: 0.7,
    y: 2.85,
    size: 18,
  },
];

function preload() {
  sfondo = loadImage("ASSETS/background04_CREAM(schiarito).jpg");
  font = loadFont("ASSETS/RockSalt-Regular.ttf"); 
}

function setup() {
  document.body.style.overflowX = "hidden";
  createCanvas(windowWidth, windowHeight);
  centro = createVector(width / 2, height / 2.5);
  gomitoloPosizioneIniziale = centro.y;
  seed = random(10000); 
  randomSeed(seed);
  noFill();
  noLoop();
  // Genera percorsi per ogni filo
  for (let i = 0; i < numFili; i++) {
    paths.push([]);
    velocitaDiscesa.push(random(0.8, 1.5));
    let start = generateDistributedStartPoint(i);
    generateLinePath(i, start);
  }

  draw(); 

  // Pulsante per scroll automatico
  scrollButton = createButton("");
  scrollButton.size(50, 50);
  scrollButton.style("background-color", "transparent");
  scrollButton.style("border", "none");
  scrollButton.style("background-image", "url('ASSETS/freccina_giu.png')"); // Percorso corretto dell'icona caricata
  scrollButton.style("background-size", "contain");
  scrollButton.style("background-repeat", "no-repeat");
  scrollButton.style("background-position", "center");
  scrollButton.style("cursor", "pointer");

  scrollButton.style("position", "fixed");
  scrollButton.style("right", "20px"); 
  scrollButton.style("bottom", "20px"); 

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
    // Disegna solo i punti fino al progresso
    for (let j = 0; j < progress; j++) {
      if (j < paths[i].length) {
        let point = paths[i][j];
        vertex(point.x, point.y + tangleOffset);
      }
    }
    endShape();
  }

  if (tangleOffset + centro.y + raggio > 0) {
    push();
    translate(0, tangleOffset);
    drawGomitolo();
    pop();
  }

  autoScrollBehavior(); 

  // Disegna i testi
  textFont(font);
  stroke("black");
  strokeWeight(1);
  fill("black");
  textAlign(CENTER, CENTER);

  textData.forEach((textItem) => {
    // Posizione del testo in base alla finestra
    textSize(textItem.size);
    let textX = textItem.x * windowWidth;
    let textY = textItem.y * windowHeight + tangleOffset; 
    text(textItem.content, textX, textY);
  });
}

// Scroll manuale
function mouseWheel(event) {
  if (!autoScroll) {
    if (event.delta > 0) {
      // Scroll verso il basso
      if (tangleOffset + centro.y + raggio > 0) {
        progress += gomitoloScrollSpeed;
        tangleOffset -= gomitoloScrollSpeed;
        rotationAngle += 0.25;
      } else {
        // Se il gomitolo è completamente visibile, scrolla i fili
        progress += filiScrollSpeed;
        tangleOffset -= filiScrollSpeed;
      }
    } else if (tangleOffset < 0) {
      // Scroll verso l'alto
      if (tangleOffset + centro.y + raggio > 0) {
        progress -= gomitoloScrollSpeed;
        tangleOffset += gomitoloScrollSpeed;
        rotationAngle -= 0.25;
      } else {
        progress -= filiScrollSpeed;
        tangleOffset += filiScrollSpeed;
      }
    }

    // Limita il progresso e l'offset
    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);

    // Cambia pagina quando il gomitolo è completamente scrollato
    if (tangleOffset <= -maxLunghezza) {
      cambiaPagina(); 
    }

    redraw();
  }
}

// Scroll automatico
function toggleAutoScroll() {
  autoScroll = !autoScroll;
  scrollButton.style("opacity", autoScroll ? "0.5" : "1");
  // Avvia o ferma il loop
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
    rotationAngle += 0.1 * (autoScrollSpeed/scrollSpeed); // Rotazione più lenta rispetto allo scroll manuale

    // Limita il progresso e l'offset
    progress = constrain(progress, 0, maxLunghezza);
    tangleOffset = constrain(tangleOffset, -maxLunghezza, 0);

    // Cambia pagina quando il gomitolo è completamente scrollato
    if (progress >= maxLunghezza || tangleOffset <= -maxLunghezza) {
      autoScroll = false;
      scrollButton.style("opacity", "1");
      noLoop();

      cambiaPagina();
    }
  }
}

// Disegna i fili di "sfondo"
function drawGomitolo() {  
  randomSeed(seed);
  stroke(colori[0]);
  strokeWeight(spessoreFilo);
  drawFilo3D();
  // for (let i = 1; i < numFili; i++) {
  //   randomSeed(seed + i * 1000);
  //   stroke(colori[i]);
  //   strokeWeight(spessoreFilo);
  //   drawFilo3D();
  // }
  
  // Disegna i fili in primo piano per creare l'effetto di intreccio
  for (let k = 0; k < 5; k++) { // 4 iterazioni per aumentare l'intensità dell'effetto
    for (let i = 0; i < numFili; i++) { // per ogni iterazione disegno i fili
      randomSeed(seed + i * 1000 + k * 10000); // Cambia il seed per ogni filo, il seed è un numero che fissa la sequenza di numeri casuali
      stroke(colori[i]);
      strokeWeight(spessoreFilo); 
      drawIntreccio3D();
    }
  }
}

// Fili
function drawFilo3D() {
  let punti = [];
  for (let i = 0; i < 200; i++) {
    let u = random(-1, 1);
    let theta = random(TWO_PI);
    let phi = acos(u);

    let x3D = raggio * sin(phi) * cos(theta);
    let y3D = raggio * sin(phi) * sin(theta);
    let z3D = raggio * cos(phi);

    // Rotazione del filo attorno all'asse z
    let y3D_rotated = y3D * cos(-rotationAngle) - z3D * sin(-rotationAngle);
    let z3D_rotated = y3D * sin(-rotationAngle) + z3D * cos(-rotationAngle);

    // Prospettiva
    let prospettiva = 0.8 + z3D_rotated / (2 * raggio);
    let x2D = centro.x + x3D * prospettiva;
    let y2D = centro.y - y3D_rotated * prospettiva;

    // Sposta i punti in modo casuale 
    x2D += random(-1, 1);
    y2D += random(-1, 1);
    punti.push(createVector(x2D, y2D));
  }

  // Disegna il filo
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
    let raggioIntreccio = raggio;
    
    // equazione parametrica della sfera
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

// Genera un punto di partenza per ogni filo
function generateDistributedStartPoint(index) { 
  let angle = (TWO_PI / numFili) * index;
  let distance = raggio * 0.2;
  let x = centro.x + cos(angle) * distance;
  let y = centro.y + sin(angle) * distance;
  return createVector(x, y);
}

// Genera il percorso per ogni filo
function generateLinePath(index, start) {
  let x = start.x;
  let y = start.y;
  let oscillazioneOffset = random(0, TWO_PI); // Offset per l'oscillazione
  let spintaVariabile = random(0.8, 1); // Variabile per spingere i fili verso sinistra

  for (let i = 0; i < maxLunghezza; i++) {
    let oscillazione = sin(i * 0.03 + oscillazioneOffset) * random(0.3, 0.8);
    let spintaSinistra = 0;
    // Cambia la spinta e l'oscillazione in base alla lunghezza del filo in modo da farli uscire dalla pagina
    if (i >= 1500 && i < 1700) {
      spintaSinistra = map(i, 1500, 1700, 0, -2) * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(2, 3);
    } else if (i >= 1700 && i < 1900) {
      spintaSinistra = map(i, 1400, 1700, -2, -4) * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(3, 4);
    } else if (i >= 1900) {
      spintaSinistra = -6 * spintaVariabile;
      oscillazione = sin(i * 0.05 + oscillazioneOffset) * random(4, 5);
    }

    // Discesa
    let movimentoVerticale = velocitaDiscesa[index]; 
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
    window.location.href = "grafico.html"; //Cambia pagina al termine dello scroll
}

