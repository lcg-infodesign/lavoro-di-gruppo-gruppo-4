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
  "14-17": "#e7d299",
  "18-24": "#f7b801",
  "25-34": "#f18701",
  "35-44": "#e54887",
  "45-54": "#fe07c0",
  "55-64": "#8e0f9c",
  "65-74": "#3a0ca4",
  ">75": "#32a9b5"
};

// carico il CSV
function preload() {
  data = loadTable("fiducia Per.csv", "csv", "header");
  img = loadImage("ASSETS/background02WHITE.jpg");
  font = loadFont("ASSETS/RockSalt-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(8);

  // BOTTONI
  let xOffset = windowWidth - 200; // Offset orizzontale iniziale
  let yOffset = 150; // Offset verticale iniziale

  for (let i = 0; i < sexes.length; i++) { // Ciclo sui sessi
    for (let j = 0; j < ageGroups.length; j++) { // Ciclo sulle fasce d'età
      let btn = createButton(`${sexes[i]} ${ageGroups[j]}`); // Etichetta del bottone
      btn.position(xOffset, yOffset + j * 50); // Posizionamento
      btn.mousePressed(() => toggleButton(btn)); // Evento click
      btn.active = false; // Stato del bottone
      btn.sesso = sexes[i]; // Associa il sesso
      btn.fascia = ageGroups[j]; // Associa la fascia d'età
      btn.style ("font-family", "RockSalt-Regular");
      btn.style ("font-size", "10px");
      buttons.push(btn); // Salva il bottone nell'array
    }
    xOffset += 100; // Sposta la colonna a destra
  }

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

// Funzione per calcolare la media dei dati
function calcolaMedia(datiFemmine, datiMaschi) {
  let media = [];
  let lunghezza = Math.min(datiFemmine.length, datiMaschi.length);
  for (let i = 0; i < lunghezza; i++) {
    let anno = datiFemmine[i].anno; // Anni corrispondenti
    let valoreMedio = (datiFemmine[i].valore + datiMaschi[i].valore) / 2;
    media.push({ anno, valore: valoreMedio });
  }
  return media;
}

//FUN<IONE PER DISEGNARE GLI ASSI
function disegnaAssi() {
  let margine = 50;

  stroke(0);
  strokeWeight(1);

  // Linea asse X
  line(margine, height - margine, width - margine, height - margine);

  // Linea asse Y
  line(margine, height - margine, margine, margine);

  // Etichette asse X (anni)
  for (let anno = 2010; anno <= 2023; anno++) {
    let x = map(anno, 2010, 2023, 50, width - 50);
    line(x, height - margine - 5, x, height - margine + 5);
    textAlign(CENTER);
    text(anno, x, height - margine + 20);
  }

  // Etichette asse Y (valori: 10, 12, ..., 30)
  for (let valore = 10; valore <= 30; valore += 2) {
    let y = map(valore, 10, 30, height - 50, 50); // Aggiornato per partire da 10
    line(45, y, 55, y);
    textAlign(RIGHT);
    text(valore, 40, y + 5);
  }
}

//FUNZIONE PER DISEGNARE IL GRAFICO
function disegnaLinea(dati, fascia) {
  stroke(coloriFasce[fascia]); // Colore linea
  strokeWeight(2); // Spessore linea
  noFill();

  // Aggiungi punti fittizi agli estremi per far combaciare inizio linee all'asse Y e fine linee al 2023
  let datiEstesi = [...dati];
  if (dati.length > 0) {
    datiEstesi.unshift({
      anno: 2010,
      valore: dati[0].valore, // Usa il valore del primo dato disponibile
    });
    datiEstesi.push({
      anno: 2023,
      valore: dati[dati.length - 1].valore, // Usa il valore dell'ultimo dato disponibile
    });
  }

  beginShape();
  for (let punto of datiEstesi) {
    let x = map(punto.anno, 2010, 2023, 50, width - 50);
    let y = map(punto.valore, 10, 30, height - 50, 50); // Aggiornato per partire da 10
    curveVertex(x, y);
  }
  endShape();
}

function disegnaLineeOrizzontali(dati) {
  let margine = 50; // Margine per gli assi
  let primoAnno = 2010; // Primo anno del grafico

  for (let fascia in dati) {
    // Trova il valore corrispondente all'anno 2010
    let valore2010 = dati[fascia].find(punto => punto.anno === primoAnno)?.valore || 0;

    // Calcola la posizione verticale per il valore del 2010
    let y = map(valore2010, 10, 30, height - margine, margine);

    // Disegna una linea orizzontale verso sinistra, fuori dall'asse Y
    stroke(coloriFasce[fascia]); // Imposta il colore in base alla fascia
    strokeWeight(2); // Imposta lo spessore della linea
    line(0, y, margine, y); // Prolunga la linea verso il bordo sinistro della finestra
  }
}

function toggleButton(btn) {
  btn.active = !btn.active; // Cambia stato
  btn.style("background-color", btn.active ? "green" : "white"); // Cambia colore
}