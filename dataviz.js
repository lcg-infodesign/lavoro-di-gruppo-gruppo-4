let data;
let datiFemmine = {};
let datiMaschi = {};
let img;

let buttonF;
let buttonM;
let isButtonFOn = false; // Stato del bottone FEMMINE
let isButtonMOn = false; // Stato del bottone MASCHI

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
  img = loadImage("background03CREAM.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Bottone FEMMINE
  buttonF = createButton('FEMMINE');
  buttonF.position(400, 20);
  buttonF.style('background-color', 'gray');
  buttonF.mousePressed(() => toggleButton(buttonF)); // Associa la funzione toggleButton

  // Bottone MASCHI
  buttonM = createButton('MASCHI');
  buttonM.position(300, 20);
  buttonM.style('background-color', 'gray');
  buttonM.mousePressed(() => toggleButton(buttonM)); // Associa la funzione toggleButton

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
  background(img);

  disegnaAssi();

  if (isButtonFOn && isButtonMOn) {
    // Disegna la media tra maschi e femmine
    for (let fascia in datiFemmine) {
      if (datiMaschi[fascia] && datiMaschi[fascia].length > 0) {
        let media = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
        
        // Disegna la linea orizzontale in base alla media
        disegnaLineeOrizzontali({ [fascia]: media });  // Disegna linee orizzontali sulla media
        disegnaLinea(media, fascia);  // Disegna la linea della media
      }
    }
  } else {
    if (isButtonFOn) {
      for (let fascia in datiFemmine) {
        disegnaLineeOrizzontali(datiFemmine);  // Disegna linee orizzontali per le femmine
        disegnaLinea(datiFemmine[fascia], fascia);  // Disegna la linea delle femmine
      }
    }

    if (isButtonMOn) {
      for (let fascia in datiMaschi) {
        disegnaLineeOrizzontali(datiMaschi);  // Disegna linee orizzontali per i maschi
        disegnaLinea(datiMaschi[fascia], fascia);  // Disegna la linea dei maschi
      }
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

function toggleButton(button) {
  // Verifica quale bottone è stato premuto
  if (button === buttonF) {
    isButtonFOn = !isButtonFOn; // Inverti lo stato del bottone FEMMINE
    button.style('background-color', isButtonFOn ? 'red' : 'gray');
  } else if (button === buttonM) {
    isButtonMOn = !isButtonMOn; // Inverti lo stato del bottone MASCHI
    button.style('background-color', isButtonMOn ? 'blue' : 'gray');
  }
}
