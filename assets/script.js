const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}));

const Couleur = Struct('r', 'g', 'b');
const Coords = Struct('x', 'y');
const Balle = Struct('coords', 'vitesse', 'couleur');
const touchStates = {
    NOTOUCH: 0,
    TOUCH: 1,
    INTERSECT: 2
};
const ballRadius = 20;
const mouseRadius = 50;
const vitesseMax = 10;
const vitesseMin = -10;

var attackzoneActive = false;
var balles = new Array();
var cursorPosition = Coords(0,0);
var timeUntilAttack = 100;
var timer = 0;
var score = 0;

function ajouterBalle(){
    balles[balles.length] = Balle(getRandomCoords(), getRandomSpeed(),getRandomColor());
    var activeBall = balles[balles.length - 1];
    var balle = document.createElement('div');
    balle.classList.add('balle');
    balle.style.backgroundColor = `rgb(${activeBall.couleur.r}, ${activeBall.couleur.g}, ${activeBall.couleur.b})`;
    balle.style.left = activeBall.coords.x - 20 + 'px';
    balle.style.top = activeBall.coords.y - 20 + 'px';
    document.getElementById('playground').appendChild(balle);
}

function moveBalls(){
    balles.forEach(balle =>{
        if (balle.coords.x + balle.vitesse.x - 20 < 0 || balle.coords.x + balle.vitesse.x + 20 > 800) balle.vitesse.x = -balle.vitesse.x;
        if (balle.coords.y + balle.vitesse.y - 20 < 0 || balle.coords.y + balle.vitesse.y + 20 > 800) balle.vitesse.y = -balle.vitesse.y;
        balle.coords.x += balle.vitesse.x;
        balle.coords.y += balle.vitesse.y;
    })
    var ballesElems = $(".balle");
    for (var i = 0; i < ballesElems.length; i++){
        ballesElems[i].style.top = balles[i].coords.y - 20 + 'px';
        ballesElems[i].style.left = balles[i].coords.x - 20 + 'px';
    }
}


function getRandomCoords(){
    var coords = null;
    do{
        coords = Coords(getRndInteger(20,780), getRndInteger(20,780));
    }while (verifierIntersectionToucher(coords, cursorPosition, ballRadius, mouseRadius * 2) != touchStates.NOTOUCH) 
    
    return coords;
}

function getRandomSpeed(){
    return Coords(getRndInteger(vitesseMin, vitesseMax), getRndInteger(vitesseMin, vitesseMax));
}

function getRandomColor(){
    var couleur = Couleur();

    couleur.r = Math.round(Math.random() * 255);
    couleur.g = Math.round(Math.random() * 255);
    couleur.b = Math.round(Math.random() * 255);
    return couleur;
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

function verifierIntersectionToucher(coords1, coords2, r1, r2){
    var distSq = Math.pow((coords1.x - coords2.x), 2) +  Math.pow((coords1.y - coords2.y), 2);
    var radsumSq = Math.pow((r1+r2), 2);
    if (distSq == radsumSq){
        return touchStates.TOUCH;
    }
    else if (distSq > radsumSq){
        return touchStates.NOTOUCH;
    }
    else {
        return touchStates.INTERSECT;
    }
}

function verifierIntersectionToucherBalle(balle){
    return verifierIntersectionToucher(balle.coords, cursorPosition, ballRadius, mouseRadius);
}

function attaqueEnn(){
    balles.forEach(balle => {if (verifierIntersectionToucherBalle(balle)!= touchStates.NOTOUCH) clearInterval(gameLoop) })
}
function attaque(){
    var i = 0;
    balles.forEach(balle => {if (verifierIntersectionToucher(balle.coords, cursorPosition, ballRadius, 100)!= touchStates.NOTOUCH) {balles.splice(i, 1) ;$(".balle")[i].remove(); score++;  document.getElementById('score').innerHTML = score}i++})
}

window.onerror = function(message, url, lineNumber) {  
    return true;
};

document.getElementById('playground').addEventListener('mousemove', function(e) {
    var distanceToLeft = (window.innerWidth - 800) / 2;
    var distanceToTop = $($('h1')[0]).outerHeight(true);
    cursorPosition = Coords(Math.ceil(e.pageX - distanceToLeft), Math.ceil(e.pageY - distanceToTop));

    if (cursorPosition.y < 750 && cursorPosition.y > 50) document.getElementById('pointer').style.top = cursorPosition.y - 50 + 'px';
    if (cursorPosition.x < 750 && cursorPosition.x > 50) document.getElementById('pointer').style.left = cursorPosition.x - 50 + 'px';
    if (cursorPosition.x > 800 || cursorPosition.y > 800 || cursorPosition.x < 0 || cursorPosition.y < 0) document.getElementById('pointer').remove();

})

document.getElementById('playground').addEventListener('mouseenter', function(e) {
    var pointers = document.querySelectorAll("[id='pointer']");
    var pointer = document.createElement('div');
    pointer.id = 'pointer';
    if (pointers.length == 0)document.getElementById('playground').appendChild(pointer);

    if (cursorPosition.y < 50)document.getElementById('pointer').style.top = cursorPosition.y + 'px';
    else if (cursorPosition.y > 750)document.getElementById('pointer').style.top = cursorPosition.y - 100 + 'px';
    if (cursorPosition.x < 50)document.getElementById('pointer').style.left = cursorPosition.x + 'px';
    else if (cursorPosition.x > 750)document.getElementById('pointer').style.left = cursorPosition.x - 100 + 'px';
})

document.getElementById('playground').addEventListener('click', function(e){
    if (timeUntilAttack == 0){
        timeUntilAttack = 100;
    var attackzone = document.createElement('div');
    attackzone.id = 'attackzone';
    document.getElementById('pointer').appendChild(attackzone);
    attackzoneActive = true;
    }
    
})





function decrementCountdown(){
    if (timeUntilAttack > 0) timeUntilAttack -=1;
    document.getElementById('progress').style.width = (100-timeUntilAttack) + '%';
    
}

function mainLoop(){
    decrementCountdown();
    moveBalls();
    attaqueEnn();
    timer++;
    if (attackzoneActive) attaque();
    if (timer >= 150) {ajouterBalle(); timer = 0}
    if (timeUntilAttack <= 50 && attackzoneActive) {attackzoneActive = false;document.getElementById('attackzone').remove(); }
}
var gameLoop = setInterval('mainLoop()', 10);