let data;
let datiFemmine = {}; //creao un oggetto per le femmine
let datiMaschi = {};  ////creo un oggeto pere i maschi --> l'oggetto mi aiuta a raggruppare e oragnizzare i dati  

//variabili per l'animazione
let isAnimating = false;
let animationProgress = 0;
let animationStartTime = 0;
let animationDuration = 1000; // 1 second transition
let previousState = null;
let targetState = null;

//variabili per i bottoni
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

//variabili per le immagini delle facce
let img;
let imagesFemmine = [];
let imagesMaschi = [];
let imagesMF = [];
let imgBottoneF;

//variabili per i font
let font;
let fontScritte;

// Mappa dei colori per le fasce d'età
const coloriFasce = { //uso const perché mi permette di rappresenta un set di associazioni fisso che non viene riassegnato
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
  fontScritte = loadFont("ASSETS/RockSalt-Regular.ttf");
  for (let age of ageGroups) {
    let ageFormatted = age.replace(">", "").trim();  // rimuove il ">" da ">75" e altre fasce d'età
    
    //immagine F
    let fileNameFemmine = `facce/F_${ageFormatted}.jpg`;
    imagesFemmine.push(loadImage(fileNameFemmine)); // push --> mi aggiunge l'immagine all'array imagesFemmine[]

    //immagini M
    let fileNameMaschi = `facce/M_${ageFormatted}.jpg`;
    imagesMaschi.push(loadImage(fileNameMaschi)); 
    
    //immagini unite M+F
    let fileNameMF = `facce_unite/MF_${ageFormatted}.png`;
    imagesMF.push(loadImage(fileNameMF)); 
  }

  document.body.style.overflow = 'hidden';
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(12);

  // Bottone FEMMINE
  buttonF = createButton('FEMMINE');
  styleButton(buttonF);
  buttonF.mousePressed(() => toggleButton(buttonF)); 

  // Bottone MASCHI
  buttonM = createButton('MASCHI');
  styleButton(buttonM);
  buttonM.mousePressed(() => toggleButton(buttonM));

  // Bottone MEDIA
  buttonMedia = createButton('MEDIA');
  styleButton(buttonMedia);
  buttonMedia.style('background-color', '#f0e4d4');
  buttonMedia.mousePressed(() => toggleButton(buttonMedia)); 

  positionButton();
  
  // Bottoni LEGENDA FASCE D'ETÀ
  creazioneBottoniFasce(); 

  // Bottone FRECCIA
  nextButton = createButton("");
  nextButton.size(windowWidth*0.05, windowHeight*0.05);
  nextButton.style("background-color", "transparent");
  nextButton.style("border", "none");
  nextButton.style("background-image", "url('ASSETS/freccina destra.png')");
  nextButton.style("background-size", "contain");
  nextButton.style("background-repeat", "no-repeat");
  nextButton.style("cursor", "pointer");
  positionNextButton();
  nextButton.mousePressed(() => window.location.href = "confronto.html");

  // Elaborazione dei dati
  elaborazioneDati();
  
}

function draw() {
  background(img);
  disegnaAssi();
  drawCard();
  testi();
  
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

//-------------------------------------- FUNZIONI PER ANALISI DATI DATI --------------------------------------//

// Funzione per elaborare i dati del dataset
function elaborazioneDati() { 
  let fasciaEta = [...new Set(data.getColumn("fascia"))];

  //inizializzo 2 oggetti che hanno le fasce d'età come chiavi
  for (let fascia of fasciaEta) { //--> per ogni fascia contenuta nell'array fasciaeta
    datiMaschi[fascia] = []; // creo delle prorpietà dell'oggetto datiMaschi per ogni fascia d'età a cui associo degli array vuoti --> sono da riempire con i dati del dataset
    datiFemmine[fascia] = [];
  }

  //organizzo i dati per anno e fascia
  for (let i = 0; i < data.getRowCount(); i++) {
    let fascia = data.getString(i, "fascia");
    let sesso = data.getString(i, "sesso");
    let anno = data.getNum(i, "anno");
    let valore = parseFloat(data.getString(i, "1A").replace(",", "."));
  //organizzo i dati ni base al sesso
    if (sesso === "M") { //se è M --> aggiungo i dati all'oggetto datiMaschi
      datiMaschi[fascia].push({ anno, valore }); // per ogni [fascia] aggiunge un oggetto con le prorpietà ({anno, valore})
    } else if (sesso === "F") {
      datiFemmine[fascia].push({ anno, valore });
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

//-------------------------------------- FUNZIONI PER IL GRAFICO --------------------------------------//

//FUNZIONE PER DISEGNARE GLI ASSI
function disegnaAssi() {
  let margineX = 110; // Margine per l'asse X
  let margineY = 50; // Margine per l'asse Y
  let lunghezzaAsseX = width * 0.65; // L'asse X sarà lungo il 65% della larghezza della finestra
  let altezzaAsseY = height * 0.78; // L'asse Y sarà lungo l'85% dell'altezza della finestra

  stroke(0);
  strokeWeight(1);
  textFont(font);

  // Linea asse X
  line(margineY, height - margineX, margineY + lunghezzaAsseX, height - margineX);

  // Linea asse Y
  line(margineY, height - margineX, margineY, height - margineX - altezzaAsseY -15);

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
    let y = map(valore, 10, 30, height - margineX, height - margineX - altezzaAsseY );
    line(margineY - 5, y, margineY + 5, y);
    textAlign(RIGHT);
    //aggiungi testo con valore percentuale
    text(valore, margineY -9, y - 6);
  }
}

//FUNZIONE PER DISEGANRE LINEE DEL GRAFICO
function disegnaLinea(dati, fascia) {
  // Controlla se la fascia corrente è selezionata
  if (fascia === fasciaSelezionata) {
    strokeWeight(6); // Spessore aumentato
  } else {
    strokeWeight(2.5); // Spessore normale
  }

  stroke(coloriFasce[fascia]);
  noFill();

  let lunghezzaAsseX = width * 0.65;
  let altezzaAsseY = height * 0.78;
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
  let altezzaAsseY = height * 0.78;

  for (let fascia in dati) {
    let valore2010 = dati[fascia].find(punto => punto.anno === primoAnno)?.valore || 0;
    let y = map(valore2010, 10, 30, height - margineX, height - margineX - altezzaAsseY);

    stroke(coloriFasce[fascia]);
    strokeWeight(2.5);
    line(0, y, margineY, y);
  }
}

//-------------------------------------- FUNZIONI PER LA CARD --------------------------------------//

//CARTA D'INDENTITà 
function drawCard() {
  let rectX = windowWidth * 0.72;
  let rectY = windowHeight * 0.45;
  let rectW = windowWidth * 0.27;
  let rectH = windowHeight * 0.35;
  
  let fillColor = coloriFasce[fasciaSelezionata] || "#ffffff"; 
  let sessoSelezionato = isButtonFOn ? "F" : isButtonMOn ? "M" : isButtonMediaOn ? "Media" : "Nessuno";

  // Calcoli per il valore medio
  let valoreMedioMedia = calcolaMediaSesso(sessoSelezionato);
  let valoreMedio = fasciaSelezionata ? calcolaMediaFasciaSesso(fasciaSelezionata, sessoSelezionato) : valoreMedioMedia;

  // Calcoli per gli anni massimo e minimo
  let annoMassimo = fasciaSelezionata
    ? calcolaAnnoMassimo(fasciaSelezionata, sessoSelezionato)
    : calcolaAnnoMassimoSesso(sessoSelezionato);
  let annoMinimo = fasciaSelezionata
    ? calcolaAnnoMinimo(fasciaSelezionata, sessoSelezionato)
    : calcolaAnnoMinimoSesso(sessoSelezionato);



  // Rettangolo card
  fill(250, 250, 250, 220);
  fill(color(coloriFasce[fasciaSelezionata] + "80"));
  stroke(fillColor);
  strokeWeight(3);
  rect(rectX, rectY, rectW, rectH);

  // Testo
  fill(0);
  noStroke();
  textFont(font);
  textSize(32);
  textAlign(LEFT, TOP);

  let fasciaText = fasciaSelezionata ? `${fasciaSelezionata}` : "- - -";
  let tipoText = "";
  if (isButtonFOn) tipoText += "Femmina";
  else if (isButtonMOn) tipoText += "Maschio";
  else if (isButtonMediaOn) tipoText += "F + M";
  else tipoText += "Nessuno selezionato";
 
  text(tipoText, rectX + 10, rectH*1.30);
  text(fasciaText, rectX + 10, rectH*1.45);
  
  textSize(16);

  text(`Valore Medio: ${valoreMedio.toFixed(2)}%`, rectX + 10, rectH*1.95);
  text(`Fiducia massima nell'anno ${annoMassimo}`, rectX + 10, rectH*2.05);
  text(`Fiducia minima nell'anno ${annoMinimo}`, rectX + 10, rectH*2.15);
  

  // Immagine faccia
  if (fasciaSelezionata) {
    let imgX = rectX * 1.213;
    let imgY =rectH * 1.33;
    let imgSize = imgX * 0.12;
    let imgIndex = ageGroups.indexOf(fasciaSelezionata);

    if (isButtonFOn) {
      image(imagesFemmine[imgIndex], imgX, imgY, imgSize, imgSize);
    } else if (isButtonMOn) {
      image(imagesMaschi[imgIndex], imgX, imgY, imgSize, imgSize);
    } else if (isButtonMediaOn) {
      //image(imagesFemmine[imgIndex], imgX - (rectX * 0.08), imgY, imgSize, imgSize);
      //image(imagesMaschi[imgIndex], imgX, imgY, imgSize, imgSize);
      image(imagesMF[imgIndex], imgX - rectX * 0.07, imgY, imgSize * 1.5, imgSize);
    } else {
      // nessuna selezione
    }
  }
}

// calcolare la media dei valori per una fascia d'età e un sesso specifici
function calcolaMediaFasciaSesso(fascia, sesso) {
  let datiSelezionati;

  // Seleziona i dati in base al sesso
  if (sesso === "F") {
    datiSelezionati = datiFemmine[fascia];
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi[fascia];
  } else if (sesso === "Media") {
    datiSelezionati = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
  }

  // Se non ci sono dati, ritorna 0
  if (!datiSelezionati || datiSelezionati.length === 0) {
    return 0;
  }

  // Calcola la media
  let somma = 0;
  for (let i = 0; i < datiSelezionati.length; i++) {
    somma += datiSelezionati[i].valore;
  }

  return somma / datiSelezionati.length; // Restituisce la media
}

// Calcola la media dei valori per tutte le fasce d'età e un sesso specifico
function calcolaMediaSesso(sesso) {
  let datiSelezionati;

  // Seleziona i dati in base al sesso
  if (sesso === "F") {
    datiSelezionati = datiFemmine;
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi;
  } else if (sesso === "Media") {
    // Combina i dati maschili e femminili calcolando la media
    datiSelezionati = {};
    for (let fascia in datiFemmine) {
      datiSelezionati[fascia] = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
    }
  }

  // Converte l'oggetto in un array e appiattisce i dati
  let tuttiIDati = Object.values(datiSelezionati).flat();

  // Calcola la media complessiva
  let somma = 0;
  let count = 0;

  for (let dato of tuttiIDati) {
    somma += dato.valore;
    count++;
  }

  return count > 0 ? somma / count : 0; // Media o 0 se non ci sono dati
}


// calcolare l'anno con il valore massimo per una fascia d'età e un sesso specifici
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

// Calcolare l'anno con il valore massimo di tutte le fasce d'età per un sesso specifico
function calcolaAnnoMassimoSesso(sesso) {
  let datiSelezionati;

  // Seleziona i dati in base al sesso
  if (sesso === "F") {
    datiSelezionati = datiFemmine;
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi;
  } else if (sesso === "Media") {
    // Combina i dati maschili e femminili calcolando la media
    datiSelezionati = {};
    for (let fascia in datiFemmine) {
      datiSelezionati[fascia] = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
    }
  }

  // Appiattisco i dati per poter fare il calcolo
  let tuttiIDati = Object.values(datiSelezionati).flat();

  let valoreMassimo = 0;
  let annoMassimo = 0;

  // Cerca l'anno con il valore massimo
  for (let dato of tuttiIDati) {
    if (dato.valore > valoreMassimo) {
      valoreMassimo = dato.valore;
      annoMassimo = dato.anno;
    }
  }

  return annoMassimo;
}


// calcolare l'anno con il valore minimo per una fascia d'età e un sesso specifici
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

// Calcolare l'anno con il valore minimo di tutte le fasce d'età per un sesso specifico
function calcolaAnnoMinimoSesso(sesso) {
  let datiSelezionati;

  // Seleziona i dati in base al sesso
  if (sesso === "F") {
    datiSelezionati = datiFemmine;
  } else if (sesso === "M") {
    datiSelezionati = datiMaschi;
  } else if (sesso === "Media") {
    // Combina i dati maschili e femminili calcolando la media
    datiSelezionati = {};
    for (let fascia in datiFemmine) {
      datiSelezionati[fascia] = calcolaMedia(datiFemmine[fascia], datiMaschi[fascia]);
    }
  }

  // Appiattisco i dati per poter fare il calcolo
  let tuttiIDati = Object.values(datiSelezionati).flat();

  let valoreMinimo = Number.MAX_VALUE;
  let annoMinimo = 0;

  // Cerca l'anno con il valore minimo
  for (let dato of tuttiIDati) {
    if (dato.valore < valoreMinimo) {
      valoreMinimo = dato.valore;
      annoMinimo = dato.anno;
    }
  }

  return annoMinimo;
}


//-------------------------------------- FUNZIONI PER BOTTONI --------------------------------------//

// stile BOTTONI M/F
function styleButton(button) {
  button.style('background-color', 'transparent');
  button.style('border-radius', '10px');
  button.style('padding', '10px 20px');
  button.style('font-family', 'Ribes-Regular');
  button.style('font-size', '13px');
  button.style("cursor", "pointer");
}

// posizione BOTTONI M/F
function positionButton() {
  // Calcolare la posizione iniziale a destra della finestra
  let buttonStartX = windowWidth - (windowWidth / 5.5); // Posizione a destra
  let buttonStartY = windowHeight * 0.28; // Posizione iniziale in alto, sarà incrementata per i bottoni successivi
  buttonF.position(buttonStartX, buttonStartY);
  buttonM.position(buttonStartX, buttonStartY + windowHeight*0.07); 
  buttonMedia.position(buttonStartX, buttonStartY + windowHeight*0.14); 
}

// cambio stato BOTTONI M/F
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

//posizione FRECCIA
function positionNextButton(){
  nextButton.position(width*0.96, height*0.93);
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

// posizione BOTTONI FASCE
function positionBottoniFasce() {
  let startX = windowWidth * 0.16; 
  let startY = windowHeight * 0.1; 
  let spacingX = windowWidth * 0.06; 

  for (let i = 0; i < bottoniFasce.length; i++) {
    let posX = startX + i * spacingX; 
    let posY = startY;
    bottoniFasce[i].position(posX, posY);
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


//testi
function testi(){
  textFont(font);
  text("% di fiducia", width *0.01, height * 0.01);

  textFont(fontScritte);
  textSize(14);
  push();
  rotate(-PI/15);

  text("eh sì,\nci fidiamo poco", width * 0.035, height * 0.07);
  pop();

  text("Seleziona una fascia d'età\ne un genere per scoprire\nl'andamento della fiducia", width * 0.78, 0);
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

//GESTIONE RIDIMENSIONAMENTO DELLO SCHERMO
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  positionButton();
  positionBottoniFasce();
  positionNextButton();
}

//cambio pagina --> TORNARE AL GOMITOLO
// usare l'evento "wheel" di js per tornare al gomitolo
window.addEventListener("wheel", (event) => {
  //se lo scroll è verso l'alto (=se è negativo)
  if (event.deltaY < -50) {
    // --> torno alla pagina
    window.location.href = "gomitolo.html";
  }
});

