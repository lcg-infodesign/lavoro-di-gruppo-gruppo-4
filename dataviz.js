// Add at the top with other let declarations
let isAnimating = false;
let animationProgress = 0;
let animationStartTime = 0;
let animationDuration = 1000; // 1 second transition
let previousState = null;
let targetState = null;
let data;
let datiFemmine = {};
let datiMaschi = {};
let img;

let buttonF;
let buttonM;
let buttonMedia;
let isButtonFOn = false; // Stato del bottone FEMMINE
let isButtonMOn = false; // Stato del bottone MASCHI
let isButtonMediaOn = false; // Stato del bottone MEDIA
//let buttonWidth = 120;
//let buttonHeight = 150;
//let buttonSpacing = 20;

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
  img = loadImage("ASSETS/background04_CREAM(schiarito).jpg");
  font = loadFont("ASSETS/Ribes-Regular.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(12);

  // Calcolare la posizione iniziale a destra della finestra
  let buttonStartX = windowWidth - (windowWidth / 5); // Posizione a destra
  let buttonStartY = windowHeight - (windowHeight / 1.5) ; // Posizione iniziale in alto, sarà incrementata per i bottoni successivi

  // Bottone FEMMINE
  buttonF = createButton('FEMMINE');
  buttonF.position(buttonStartX, buttonStartY);
  buttonF.style('background-color', '#eeebec');
  buttonF.style('border-radius', '10px'); // Angoli stondati
  buttonF.style('padding', '10px 20px'); // Padding
  buttonF.style ("font-family", "Ribes-Regular");
  buttonF.style ("font-size", "13px");
  buttonF.mousePressed(() => toggleButton(buttonF)); // Associa la funzione toggleButton

  // Bottone MASCHI
  buttonM = createButton('MASCHI');
  buttonM.position(buttonStartX, buttonStartY + 50); // Posizionato sotto il primo
  buttonM.style('background-color', '#eeebec');
  buttonM.style('border-radius', '10px'); // Angoli stondati
  buttonM.style('padding', '10px 20px'); // Padding
  buttonM.style ("font-family", "Ribes-Regular");
  buttonM.style ("font-size", "13px");
  buttonM.mousePressed(() => toggleButton(buttonM)); // Associa la funzione toggleButton

  // Bottone MEDIA
  buttonMedia = createButton('MEDIA');
  buttonMedia.position(buttonStartX, buttonStartY + 100); // Posizionato sotto il secondo
  buttonMedia.style('background-color', '#eeebec');
  buttonMedia.style('border-radius', '10px'); // Angoli stondati
  buttonMedia.style('padding', '10px 20px'); // Padding
  buttonMedia.style ("font-family", "Ribes-Regular");
  buttonMedia.style ("font-size", "13px");
  buttonMedia.mousePressed(() => toggleButton(buttonMedia)); // Associa la funzione toggleButton

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

  if (isAnimating) {
    animationProgress = (millis() - animationStartTime) / animationDuration;
    if (animationProgress >= 1) {
      isAnimating = false;
      animationProgress = 1;
    }
  }

  for (let fascia in datiFemmine) {
    if (isAnimating) {
      let datiInizio = [];
      let datiFine = [];

      // Determine start and end data based on previous and target states
      if (previousState.F) datiInizio = datiFemmine[fascia];
      else if (previousState.M) datiInizio = datiMaschi[fascia];
      else if (previousState.Media) datiInizio = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);

      if (targetState.F) datiFine = datiFemmine[fascia];
      else if (targetState.M) datiFine = datiMaschi[fascia];
      else if (targetState.Media) datiFine = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);

      let datiInterpolati = interpolateDati(datiInizio, datiFine, animationProgress);
      disegnaLineeOrizzontali({ [fascia]: datiInterpolati });
      disegnaLinea(datiInterpolati, fascia);
    } else {
      // Non-animated state
      if (isButtonMediaOn) {
        let media = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
        disegnaLineeOrizzontali({ [fascia]: media });
        disegnaLinea(media, fascia);
      } else if (isButtonFOn) {
        disegnaLineeOrizzontali(datiFemmine);
        disegnaLinea(datiFemmine[fascia], fascia);
      } else if (isButtonMOn) {
        disegnaLineeOrizzontali(datiMaschi);
        disegnaLinea(datiMaschi[fascia], fascia);
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

//FUNZIONE PER DISEGNARE GLI ASSI
function disegnaAssi() {
  let margine = 50;
  let lunghezzaAsseX = width * 0.65; // L'asse X sarà lungo 3/4 della larghezza della finestra

  stroke(0);
  strokeWeight(1);

  // Linea asse X
  line(margine, height - margine, margine + lunghezzaAsseX, height - margine); // Cambia qui la lunghezza

  // Linea asse Y
  line(margine, height - margine, margine, margine);

  // Etichette asse X (anni)
  for (let anno = 2010; anno <= 2023; anno++) {
    let x = map(anno, 2010, 2023, margine, margine + lunghezzaAsseX); // Usa la nuova lunghezza
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

  let lunghezzaAsseX = width * 0.65; // L'asse X è lungo 3/4 della larghezza della finestra
  let margine = 50;

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
    // Cambia la mappatura per usare la nuova lunghezza dell'asse X
    let x = map(punto.anno, 2010, 2023, margine, margine + lunghezzaAsseX);
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
  if (isAnimating) return;

  let previousF = isButtonFOn;
  let previousM = isButtonMOn;
  let previousMedia = isButtonMediaOn;

  // Reset all buttons first
  isButtonFOn = false;
  isButtonMOn = false;
  isButtonMediaOn = false;
  buttonF.style('background-color', '#eeebec');
  buttonM.style('background-color', '#eeebec');
  buttonMedia.style('background-color', '#eeebec');

  // Set new state
  if (button === buttonF) {
    isButtonFOn = true;
    button.style('background-color', '#ebd7da');
  } else if (button === buttonM) {
    isButtonMOn = true;
    button.style('background-color', '#ebd7da');
  } else if (button === buttonMedia) {
    isButtonMediaOn = true;
    button.style('background-color', '#ebd7da');
  }

  // Start animation if state changed
  if (previousF !== isButtonFOn || previousM !== isButtonMOn || previousMedia !== isButtonMediaOn) {
    previousState = {
      F: previousF,
      M: previousM,
      Media: previousMedia
    };
    targetState = {
      F: isButtonFOn,
      M: isButtonMOn,
      Media: isButtonMediaOn
    };
    isAnimating = true;
    animationProgress = 0;
    animationStartTime = millis();
  }
}


// Add interpolation function
function interpolateDati(datiInizio, datiFine, progress) {
  let risultato = [];
  for (let i = 0; i < datiInizio.length; i++) {
    let valoreLerp = lerp(datiInizio[i].valore, datiFine[i].valore, progress);
    risultato.push({
      anno: datiInizio[i].anno,
      valore: valoreLerp
    });
  }
  return risultato;
}