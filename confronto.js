let data;
let datiFemmine = {};
let datiMaschi = {};
let img;
let font;

let buttons = []; // array per contenere i bottoni --> da riempire
let ageGroups = ["14-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", ">75"];
let sexes = ["M", "F"]; 


// Mappa dei colori per le fasce d'età
const coloriFasce = {
  "14-17": "#32a9b5",
  "18-24": "#3a0ca4",
  "25-34": "#8e0f9c",
  "35-44": "#fe07c0",
  "45-54": "#e54887",
  "55-64": "#f18701",
  "65-74": "#f7b801",
  ">75": "#e7d299"
};

// carico il CSV
function preload() {
  data = loadTable("fiducia Per.csv", "csv", "header");
  img = loadImage("ASSETS/background04_CREAM(schiarito).jpg");
  font = loadFont("ASSETS/Ribes-Regular.otf");
  document.body.style.overflow = 'hidden';
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(12);
  
// BOTTONI
for (let i = 0; i < sexes.length; i++) { // Ciclo sui sessi
  for (let j = 0; j < ageGroups.length; j++) { // Ciclo sulle fasce d'età
    let btn = createButton(`${sexes[i]} ${ageGroups[j]}`); // Etichetta del bottone
    btn.active = false; // Stato del bottone (non attivo di default)
    btn.sesso = sexes[i]; // Associa il sesso
    btn.fascia = ageGroups[j]; // Associa la fascia d'età

    // Ottieni il percorso dell'immagine
    let imagePath = getImagePath(sexes[i], ageGroups[j]);

    // Personalizzazione dello stile del bottone
    let btnX = windowWidth * 0.08;
    let btnY = windowWidth * 0.08;

    btn.size(btnX, btnY); // Imposta una dimensione standard per tutti i bottoni
    btn.style("background-color", "transparent"); // Sfondo trasparente di base
    btn.style("border", "none");
    btn.style("background-image", `url('${imagePath}')`); // Immagine di sfondo
    btn.style("background-size", "cover"); // Adatta l'immagine al bottone
    btn.style("background-repeat", "no-repeat"); // Non ripetere l'immagine
    btn.style("background-position", "center"); // Centra l'immagine
    btn.style('font-family', 'Ribes-Regular');
    btn.style('color', 'white');
    btn.style('cursor', 'pointer');
    btn.style('opacity', '0.5'); // Imposta l'opacità iniziale al 50% (opaco)

    // Centrare l'etichetta in basso
    btn.style("display", "flex"); // Usa Flexbox per controllare il layout interno
    btn.style("flex-direction", "column"); // Colonna: immagine sopra, testo sotto
    btn.style("justify-content", "flex-end"); // Sposta il contenuto in basso
    btn.style("align-items", "flex-end"); // Allinea al bordo destro
    btn.style("text-align", "right"); // Allinea il testo a destra
    btn.style("padding-right", "5px"); // Sposta il testo leggermente verso sinistra dal bordo
    btn.style("padding-bottom", "3px"); // Sposta il testo leggermente verso l'alto dal bordo inferiore

    // Evento click sul bottone
    btn.mousePressed(() => {
      // Cambia lo stato attivo del bottone
      btn.active = !btn.active;

      // Aggiorna lo stile in base allo stato
      if (btn.active) {
        btn.style("opacity", "1"); // Bottone completamente visibile
      } else {
        btn.style("opacity", "0.5"); // Bottone torna opaco
      }
    });

    buttons.push(btn); // Salva il bottone nell'array
  }
}

  positionBtn();

  //FRECCIA
  prevButton = createButton("");
  prevButton.size(50, 50);
  prevButton.style("background-color", "transparent");
  prevButton.style("border", "none");
  prevButton.style("background-image", "url('ASSETS/freccina.png')"); // Percorso corretto dell'icona caricata
  prevButton.style("background-size", "contain");
  prevButton.style("background-repeat", "no-repeat");
  prevButton.style("cursor", "pointer");
  positionPrevButton();
  prevButton.mousePressed(() => window.location.href = "DATAVIZ.html");


  // Elaborazione dati
  let fasciaEta = [...new Set(data.getColumn("fascia"))];

  for (let fascia of fasciaEta) {
    datiMaschi[fascia] = [];
    datiFemmine[fascia] = [];
  }

  for (let i = 0; i < data.getRowCount(); i++) {
    let fascia = data.getString(i, "fascia");
    let sesso = data.getString(i, "sesso");
    let anno = data.getNum(i, "anno");
    let valore = parseFloat(data.getString(i, "1A").replace(",", "."));

    if (sesso === "M") {
      datiMaschi[fascia].push({ anno, valore });
    } else if (sesso === "F") {
      datiFemmine[fascia].push({ anno, valore });
    }
  }
}

function draw() {
  background(img); // Sfondo
  disegnaAssi(); // Disegna gli assi

  // Disegna le linee per i bottoni attivi
  for (let btn of buttons) {
    if (btn.active) {
      let dati = btn.sesso === "M" ? datiMaschi[btn.fascia] : datiFemmine[btn.fascia];
      disegnaLinea(dati, btn.fascia);
    }
  }
}

//FUN<IONE PER DISEGNARE GLI ASSI
function disegnaAssi() {
  let margineX = 110; // Margine per l'asse X
  let margineY = 50; // Margine per l'asse Y
  let lunghezzaAsseX = width * 0.55; // L'asse X sarà lungo il 65% della larghezza della finestra
  let altezzaAsseY = height * 0.80; // L'asse Y sarà lungo l'85% dell'altezza della finestra

  stroke(0);
  strokeWeight(1);

  // Linea asse X
  line(margineY, height - margineX, margineY + lunghezzaAsseX, height - margineX);

  // Linea asse Y
  line(margineY, height - margineX, margineY, height - margineX - altezzaAsseY);

  // Etichette asse X (anni)
  for (let anno = 2010; anno <= 2023; anno++) {
    let x = map(anno, 2010, 2023, margineY, margineY + lunghezzaAsseX);
    line(x, height - margineX - 5, x, height - margineX + 5);
    textAlign(CENTER);
    text(anno, x, height - margineX + 20);
  }

  // Etichette asse Y (valori: 10, 12, ..., 30)
  for (let valore = 10; valore <= 30; valore += 2) {
    let y = map(valore, 10, 30, height - margineX, height - margineX - altezzaAsseY);
    line(margineY - 5, y, margineY + 5, y);
    textAlign(RIGHT);
    text(valore, margineY - 10, y + 5);
  }
}

//FUNZIONE PER DISEGNARE IL GRAFICO
function disegnaLinea(dati, fascia) {
  stroke(coloriFasce[fascia]);
  strokeWeight(2);
  noFill();

  let lunghezzaAsseX = width * 0.55;
  let altezzaAsseY = height * 0.80;
  let margineX = 110;
  let margineY = 50;

  let datiEstesi = [...dati];
  if (dati.length > 0) {
    datiEstesi.unshift({
      anno: 2010,
      valore: dati[0].valore,
    });
    datiEstesi.push({
      anno: 2023,
      valore: dati[dati.length - 1].valore,
    });
  }

  beginShape();
  for (let punto of datiEstesi) {
    let x = map(punto.anno, 2010, 2023, margineY, margineY + lunghezzaAsseX);
    let y = map(punto.valore, 10, 30, height - margineX, height - margineX - altezzaAsseY);
    curveVertex(x, y);
  }
  endShape();
}


// Funzione per generare il percorso dell'immagine
function getImagePath(sex, ageGroup) {
  // Gestisci l'eccezione per ">75"
  if (ageGroup === ">75") {
    return `facce/${sex}_75.jpg`; // Usa "75" al posto di ">75"
  }
  // Gestisci i casi standard
  return `facce/${sex}_${ageGroup}.jpg`;
}

function positionBtn() {
  let spazioXBottoni = windowWidth * 0.40; // Le colonne occupano il tot% della larghezza dello schermo
  let margineDestro = windowWidth * 0.05; // Margine destro
  
  let numeroColonne = 4; // Numero fisso di colonne
  let colonnaX = spazioXBottoni / numeroColonne; // Calcolo dello spazio tra le colonne
  let colonnaY = Math.min(windowHeight * 0.20, 150); // Adatta lo spazio verticale a una percentuale dell'altezza dello schermo (max 120px)

  // Calcola l'altezza totale occupata dalle righe di bottoni
  let totaleRighe = Math.ceil(buttons.length / numeroColonne);
  let altezzaTotale = totaleRighe * colonnaY;

  // Calcola l'offset per centrare verticalmente le righe
  let yOffset = (windowHeight - altezzaTotale) / 2;

  for (let i = 0; i < buttons.length; i++) {
    let btn = buttons[i];
    
    // Calcola la colonna (0, 1, 2, 3) su cui il bottone sarà posizionato
    let colonna = i % numeroColonne; // Calcola la colonna
    // Calcola la riga in cui il bottone si troverà
    let riga = Math.floor(i / numeroColonne); // Calcola la riga
    
    // Calcola la posizione X (da destra, con margine)
    let x = windowWidth - margineDestro - spazioXBottoni + (colonna + 0.5) * colonnaX; 
    // Calcola la posizione Y
    let y = yOffset + riga * colonnaY; 

    btn.position(x, y); // Applica la posizione al bottone
  }
}




//function toggleButton(btn) {
  //btn.active = !btn.active; // Cambia stato
  //btn.style("background-color", btn.active ? "green" : "white"); // Cambia colore
//}

function positionPrevButton(){
  prevButton.position(width - 60, height - 60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  positionBtn();
  positionPrevButton();
}