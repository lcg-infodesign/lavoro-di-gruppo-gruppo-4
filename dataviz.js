let data;
let datiFemmine = {};
let datiMaschi = {};
let img;

let isAnimating = false;
let animationProgress = 0;
let animationStartTime = 0;
let animationDuration = 1000; // 1 second transition
let previousState = null;
let targetState = null;

let buttonF;
let buttonM;
let buttonMedia;
let isButtonFOn = false; // stato del bottone FEMMINE
let isButtonMOn = false; // stato del bottone MASCHI
let isButtonMediaOn = true; // stato del bottone MEDIA

const ageGroups = ["14-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", ">75"];
const sexes = ["F", "M"];
let bottoniFasce = [];

let fasciaSelezionata = null; // variabile per tenere traccia della fascia selezionata con i btnFasce

let images = [];

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


function preload() {
  data = loadTable("fiducia Per.csv", "csv", "header");
  img = loadImage("ASSETS/background04_CREAM(schiarito).jpg");
  font = loadFont("ASSETS/Ribes-Regular.otf");
  // Ciclo per caricare tutte le immagini
  //for (let gender of sexes) {
  //  for (let age of ageGroups) {
      // Modifica del nome della fascia d'età
  //    let ageFormatted = age.replace(">", "").trim();  // Rimuove il ">" da ">75" e altre fasce d'età
  //    let fileName = `facce/${gender}_${ageFormatted}.jpg`;
  //    images.push(loadImage(fileName)); // Aggiungi l'immagine all'array
  //  }
  //}

  document.body.style.overflow = 'hidden';
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(12);

  // Bottone FEMMINE
  buttonF = createButton('FEMMINE');
  styleButton(buttonF);
  buttonF.mousePressed(() => toggleButton(buttonF)); // associa la funzione toggleButton

  // Bottone MASCHI
  buttonM = createButton('MASCHI');
  styleButton(buttonM);
  buttonM.mousePressed(() => toggleButton(buttonM));

  // Bottone MEDIA
  buttonMedia = createButton('MEDIA');
  styleButton(buttonMedia);
  buttonMedia.mousePressed(() => toggleButton(buttonMedia)); 

  positionButton();
  
  // Bottoni legenda 
  creazioneBottoniFasce();

  // Bottone freccia 
  nextButton = createButton("");
  nextButton.size(50, 50);
  nextButton.style("background-color", "transparent");
  nextButton.style("border", "none");
  nextButton.style("background-image", "url('ASSETS/freccina destra.png')"); // Percorso corretto dell'icona caricata
  nextButton.style("background-size", "contain");
  nextButton.style("background-repeat", "no-repeat");
  nextButton.style("cursor", "pointer");
  positionNextButton();
  nextButton.mousePressed(() => window.location.href = "confronto.html");


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
  drawCard(); 

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

function disegnaAssi() {
  let margineX = 110; // Margine per l'asse X
  let margineY = 50; // Margine per l'asse Y
  let lunghezzaAsseX = width * 0.65; // L'asse X sarà lungo il 65% della larghezza della finestra
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
    textSize(12);
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

//FUNZIONE PER DISEGANRE LINEE DEL GRAFICO
function disegnaLinea(dati, fascia) {
  // Controlla se la fascia corrente è selezionata
  if (fascia === fasciaSelezionata) {
    strokeWeight(5); // Spessore aumentato
  } else {
    strokeWeight(2); // Spessore normale
  }

  stroke(coloriFasce[fascia]);
  noFill();

  let lunghezzaAsseX = width * 0.65;
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


//FUNZIONE PER DISEGNARE LINEE ORIZZONTALI CHE ENTRANO
function disegnaLineeOrizzontali(dati) {
  let margineX = 110;
  let margineY = 50;
  let primoAnno = 2010;
  let altezzaAsseY = height * 0.80;

  for (let fascia in dati) {
    let valore2010 = dati[fascia].find(punto => punto.anno === primoAnno)?.valore || 0;
    let y = map(valore2010, 10, 30, height - margineX, height - margineX - altezzaAsseY);

    stroke(coloriFasce[fascia]);
    strokeWeight(2);
    line(0, y, margineY, y);
  }
}

//CARTA D'INDENTITà 
function drawCard() {
  let rectX = windowWidth * 0.70;
  let rectY = windowHeight * 0.05;
  let rectW = windowWidth * 0.25;
  let rectH = windowHeight * 0.20;
  
  let fillColor = coloriFasce[fasciaSelezionata] || "#ffffff"; 
  let sessoSelezionato = isButtonFOn ? "F" : isButtonMOn ? "M" : "Media";
  let valoreMedio = fasciaSelezionata ? calcolaMediaFasciaSesso(fasciaSelezionata, sessoSelezionato) : 0;
  let annoMassimo = fasciaSelezionata ? calcolaAnnoMassimo(fasciaSelezionata, sessoSelezionato) : 0;
  let annoMinimo = fasciaSelezionata ? calcolaAnnoMinimo(fasciaSelezionata, sessoSelezionato) : 0;


  // Rettangolo
  fill(250, 250, 250, 220);
  stroke(fillColor); // Bordo nero
  strokeWeight(3);
  rect(rectX, rectY, rectW, rectH);

  // Testo
  fill(0); // Colore del testo
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);

  let fasciaText = fasciaSelezionata ? `Fascia Età: ${fasciaSelezionata}` : "Fascia Età: Nessuna selezione";
  let tipoText = "Tipo: ";
  if (isButtonFOn) tipoText += "Femmina";
  else if (isButtonMOn) tipoText += "Maschio";
  else if (isButtonMediaOn) tipoText += "Tutti";
  else tipoText += "Nessuno selezionato";

  // Disegna il testo nel rettangolo
  text(tipoText, rectX + 10, rectY + 10);
  text(fasciaText, rectX + 10, rectY + 40);
  text(`Valore Medio: ${valoreMedio.toFixed(2)}`, rectX + 10, rectY + 70);
  text(`Anno Massimo: ${annoMassimo}`, rectX + 10, rectY + 100);
  text(`Anno Minimo: ${annoMinimo}`, rectX + 10, rectY + 130);
  
}

// Funzione per calcolare la media dei valori
function calcolaMediaFasciaSesso(fascia, sesso) {
  let datiSelezionati = sesso === "F" ? datiFemmine[fascia] : datiMaschi[fascia];
  let somma = 0;
  let count = 0;

  for (let i = 0; i < datiSelezionati.length; i++) {
    somma += datiSelezionati[i].valore;
    count++;
  }

  return count > 0 ? somma / count : 0;  // Restituisci la media, o 0 se non ci sono dati
}

function calcolaAnnoMassimo(fascia, sesso) {
  let datiSelezionati;

  if (sesso === "F") {
    datiSelezionati = datiFemmine[fascia];
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi[fascia];
  } else if (sesso === "Media") {
    let datiMedi = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
    datiSelezionati = datiMedi;
  }

  let valoreMassimo = 0;
  let annoMassimo = 0;

  for (let i = 0; i < datiSelezionati.length; i++) {
    if (datiSelezionati[i].valore > valoreMassimo) {
      valoreMassimo = datiSelezionati[i].valore;
      annoMassimo = datiSelezionati[i].anno;
    }
  }

  return annoMassimo;
}


function calcolaAnnoMinimo(fascia, sesso) {
  let datiSelezionati;

  if (sesso === "F") {
    datiSelezionati = datiFemmine[fascia];
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi[fascia];
  } else if (sesso === "Media") {
    let datiMedi = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
    datiSelezionati = datiMedi;
  }

  let valoreMinimo = Number.MAX_VALUE;
  let annoMinimo = 0;

  for (let i = 0; i < datiSelezionati.length; i++) {
    if (datiSelezionati[i].valore < valoreMinimo) {
      valoreMinimo = datiSelezionati[i].valore;
      annoMinimo = datiSelezionati[i].anno;
    }
  }

  return annoMinimo;
}




//STILE DEI BOTTONI M/F
function styleButton(button) {
  button.style('background-color', 'transparent');
  button.style('border-radius', '10px');
  button.style('padding', '10px 20px');
  button.style('font-family', 'Ribes-Regular');
  button.style('font-size', '13px');
  button.style("cursor", "pointer");
}

//POSIZIONE DEI BOTTONI M/F
function positionButton(){
  // Calcolare la posizione iniziale a destra della finestra
  let buttonStartX = windowWidth - (windowWidth / 5); // Posizione a destra
  let buttonStartY = windowHeight * 0.45; // Posizione iniziale in alto, sarà incrementata per i bottoni successivi
  buttonF.position(buttonStartX, buttonStartY);
  buttonM.position(buttonStartX, buttonStartY + 50); // 50px sotto il primo
  buttonMedia.position(buttonStartX, buttonStartY + 100); // 100px sotto il primo
}

//POSIZIONE FRECCIA
function positionNextButton(){
  nextButton.position(width - 60, height - 60);
}

//CAMBIO STATO BOTTONE PREMUTO
function toggleButton(button) {
  if (isAnimating) return;

  let previousF = isButtonFOn;
  let previousM = isButtonMOn;
  let previousMedia = isButtonMediaOn;

  // Reset all buttons first
  isButtonFOn = false;
  isButtonMOn = false;
  isButtonMediaOn = false;
  buttonF.style('background-color', 'transparent');
  buttonM.style('background-color', 'transparent');
  buttonMedia.style('background-color', 'transparent');

  // Set new state
  if (button === buttonF) {
    isButtonFOn = true;
    button.style('background-color', '#f0e4d4');
  } else if (button === buttonM) {
    isButtonMOn = true;
    button.style('background-color', '#f0e4d4');
  } else if (button === buttonMedia) {
    isButtonMediaOn = true;
    button.style('background-color', '#f0e4d4');
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

// FUNZIONE DI INTERPOLAZIONE
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

// BOTTONI FASCE D'ETÀ
function creazioneBottoniFasce() {
  for (let i = 0; i < ageGroups.length; i++) {
    let fascia = ageGroups[i]; // Ottieni la fascia corrispondente
    let btn = createButton(`${fascia}`);
    styleButton(btn);

    // Assegna il colore corrispondente alla fascia
    btn.style('background-color', coloriFasce[fascia]);
    btn.style('color', '#ffffff'); // Colore testo per garantire visibilità
    btn.style('border', 'none');
    btn.style('opacity', '0.5');

    btn.active = false;
    btn.fascia = fascia; // Memorizza la fascia per riferimento futuro
    btn.mousePressed(() => toggleBottoniFasce(btn));
    bottoniFasce.push(btn);
  }

  positionBottoniFasce();
}

//POSIZIONE BOTTNI FASCE
function positionBottoniFasce() {
  let startX = windowWidth * 0.75; // Colonna destra
  let startY = windowHeight * 0.75; // Inizio verticale
  let spacingY = Math.max(windowHeight * 0.05, 30); // Spaziatura verticale minima
  let columnSpacingX = Math.max(windowWidth * 0.1, 50); // Spaziatura tra colonne

  for (let i = 0; i < bottoniFasce.length; i++) {
    let btn = bottoniFasce[i];
    let col = i % 2; // Alternanza tra colonna 0 e colonna 1
    let row = Math.floor(i / 2); // Determina la riga in base al numero del bottone

    let posX = startX + col * columnSpacingX; // Posizione orizzontale in base alla colonna
    let posY = startY + row * spacingY; // Posizione verticale in base alla riga

    btn.position(posX, posY);
  }
}

//CAMBIO STATO BOTTONI FASCE --> 1! 
function toggleBottoniFasce(btn) {
  // Se il bottone è già attivo, lo disattiviamo
  if (btn.active) {
    btn.active = false;
    btn.style("opacity", "0.5"); // Bottone opaco
    fasciaSelezionata = null; // Nessuna fascia selezionata
  } else {
    // Disattiva tutti gli altri bottoni
    for (let otherBtn of bottoniFasce) {
      otherBtn.active = false;
      otherBtn.style("opacity", "0.5");
    }
    // Attiva il bottone corrente
    btn.active = true;
    btn.style("opacity", "1"); // Bottone completamente visibile
    fasciaSelezionata = btn.fascia; // Memorizza la fascia selezionata
  }
}

//GESTIONE RIDIMENSIONAMENTO DELLO SCHERMO
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  positionButton();
  positionBottoniFasce();
  positionNextButton();
}