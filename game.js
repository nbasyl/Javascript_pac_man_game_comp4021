// var GAME_MAP = new Array(
//     "                              ",
//     "                              ",
//     "                              ",
//     "###                           ",
//     "  #                       MMM ",
//     "  #######################     ",
//     "   #         ##               ",
//     "             ##               ",
//     "           ######             ",
//     "#     #              #        ",
//     "#    ##            ####       ",
//     "########          #######     ",
//     "             #     ########   ",
//     "            ###               ",
//     "           #####              ",
//     "        #####  ##             ",
//     "##             ###   #        ",
//     "###              #   ###      ",
//     "######           #   ######   ",
//     "#####       #                 ",
//     "          ####                ",
//     "         ##########           ",
//     "        #####          #      ",
//     "       ###           ###      ",
//     "##                  ###       ",
//     "###           #               ",
//     "####    #   ####          #   ",
//     "##############################"
//    );
// function createPlatforms() 
// {
//     console.log("gg")
//     // svgDoc = document.getSVGDocument();
//     var platforms = document.getElementById("platforms");
//     for (y = 0; y < GAME_MAP.length; y++) {
//         var start = null, end = null;
//         for (x = 0; x < GAME_MAP[y].length; x++) {
//             if (start == null && GAME_MAP[y].charAt(x) == '#')
//                 start = x;
//             if (start != null && GAME_MAP[y].charAt(x) == ' ')
//                 end = x - 1;
//             if (start != null && x == GAME_MAP[y].length - 1)
//                 end = x;
//             if (start != null && end != null) {
//                 var platform =
//                 document.createElementNS("http://www.w3.org/2000/svg",
//                 "rect");
//                 console.log(`start:${start} end:${end}`)
//                 platform.setAttribute("x", start * 20);
//                 platform.setAttribute("y", y * 20);
//                 platform.setAttribute("width", (end - start+1)*20);
//                 platform.setAttribute("height", 20);
//                 platform.setAttribute("fill", "grey");
//                 platforms.appendChild(platform);
//                 start = end = null;
//                 }
//             }
//         }
// }
// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}
Player.prototype.isOnDisappearPlatform = function() {
    var disappearplatforms = document.getElementsByClassName("disappear");
    for (var i = 0; i < disappearplatforms.length; i++) {
        var node = disappearplatforms[i];
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return i+1;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        // if (node.id = "moving_plat") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                {
                    position.y = y + h;
                }
                else
                {
                    position.y = y - PLAYER_SIZE.h;
                }
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if(position.x < 0 && (position.y == 180 || position.y == 440)){
        if(position.y == 180){
            position.x = -(position.x)+5;
            position.y = 440;
        }else{
            position.x = -(position.x)+5;
            position.y = 180;
        }
    }else{
        if (position.x < 0) position.x = 0;
        if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
        if (position.y < 0) {
            position.y = 0;
            this.verticalSpeed = 0;
        }
        if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
            position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
            this.verticalSpeed = 0;
        }
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0); 
var PLAYER_DIRECTION = "right";    // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var MONSTER_SHOOT_INTERVAL = 400.0;  
var canShoot = true;                // A flag indicating whether the player can shoot a bullet
var MonstercanShoot = true;

var BULLETS = [];
var MONSTER_ATTACKS = [];
var MONSTERS = [];
var MONSTER_SIZE = new Size(40, 40); // The size of a monster
var testing = 0;

var COIN_SIZE = new Size(20, 20);

function Monster(i){
    this.node = document.getElementById("monsters").childNodes.item(i);
    this.position = new Point(parseInt(this.node.getAttribute("x")),parseInt(this.node.getAttribute("y")));
    this.displacement = new Point(parseFloat(Math.random()*2),parseFloat(Math.random()*2));
}
Monster.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + MONSTER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + MONSTER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + MONSTER_SIZE.h == y) return i+1;
    }
    if (this.position.y + MONSTER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}
Monster.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        // if (node.id = "moving_plat") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        if (intersect(position, MONSTER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, MONSTER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                {
                    position.y = y + h;
                }
                else
                {
                    position.y = y - MONSTER_SIZE.h;
                }
                this.verticalSpeed = 0;
            }
        }
    }
}
Monster.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + MONSTER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - MONSTER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + MONSTER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - MONSTER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


function coin_collidePlatform(position){
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        // if (node.id = "moving_plat") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        if (intersect(position, COIN_SIZE, pos, size)) {
            return false;
        }
    }
    return true;
}

// Should be executed after the page is loaded
function load() {
    // createPlatforms();
    // Attach keyboard events
    document.addEventListener("keydown", keydown, false);
    document.addEventListener("keyup", keyup, false);

    // Create the player
    player = new Player();
    //Create the coin
    var coin_create_counter = 0;
    var points = [];
    while(coin_create_counter < 6){
        var x = Math.floor(Math.random() * 480) + 60;
        var y = Math.floor(Math.random() * 500) + 20;
        var point = new Point(x,y);
        if(coin_collidePlatform(point)){
            points.push(point);
            coin_create_counter++; 
        }
    }
    for(var i =0; i<points.length;i++){
        createCoin(points[i].x,points[i].y);
    }
    // Create the monsters
    for(var i = 0; i < 3; i++){
        createMonster(Math.floor(Math.random() * 480) + 60, Math.floor(Math.random() * 500) + 20);
        MONSTERS.push(new Monster(i));
    }

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
}
function createCoin(x, y) {
    var coin = document.createElementNS("http://www.w3.org/2000/svg", "use");
    coin.setAttribute("x", x);
    coin.setAttribute("y", y);
    coin.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#coin");
    document.getElementById("coins").appendChild(coin);
}
//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    document.getElementById("monsters").appendChild(monster);
}



//
// This function shoots a bullet from the player
//
function shootBullet(direction) {
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    BULLETS.push(direction);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    document.getElementById("bullets").appendChild(bullet);
}

function Monster_shootBullet(i){

    MonstercanShoot = false;
    setTimeout("MonstercanShoot = true", MONSTER_SHOOT_INTERVAL);
    var monster = MONSTERS[i];
    var monster_attack = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster_attack.setAttribute("x", monster.position.x + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    monster_attack.setAttribute("y", monster.position.y + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    MONSTER_ATTACKS.push(monster.displacement.x);
    monster_attack.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster_attack");
    document.getElementById("monster_attacks").appendChild(monster_attack);
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if(BULLETS[i]=="right"){
            node.setAttribute("x", x + BULLET_SPEED);
        }else if(BULLETS[i]=="left"){
            node.setAttribute("x", x - BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            BULLETS.splice(i, 1);
            i--;
        }
    }
}
function move_monster_attacks() {
    // Go through all bullets
    var monster_attacks = document.getElementById("monster_attacks");
    for (var i = 0; i < monster_attacks.childNodes.length; i++) {
        var node = monster_attacks.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if(MONSTER_ATTACKS[i] >= 0){
            node.setAttribute("x", x + BULLET_SPEED); 
        }else if(MONSTER_ATTACKS[i] < 0){
            node.setAttribute("x", x - BULLET_SPEED);
        }
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            monster_attacks.removeChild(node);
            MONSTER_ATTACKS.splice(i,1);
            i--;
        }
    }
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            PLAYER_DIRECTION = "left";
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            PLAYER_DIRECTION = "right";
            break;
			

        // Add your code here
		
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
		
		case "H".charCodeAt(0): // spacebar = shoot
			if (canShoot) {
                shootBullet(PLAYER_DIRECTION);
            }
			break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            alert("Game over! YOU GOT KILLED LOSER");
            clearInterval(gameInterval);
        }
    }
    //check whether the player collides with a coin
    var coins = document.getElementById("coins");
    for (var i = 0; i < coins.childNodes.length; i++) {
        var coin = coins.childNodes.item(i);
        var x = parseInt(coin.getAttribute("x"));
        var y = parseInt(coin.getAttribute("y"));

        if (intersect(new Point(x, y), COIN_SIZE, player.position, PLAYER_SIZE)) {
            coins.removeChild(coin);
            i--;
        }
    }
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            alert("Game over! YOU GOT KILLED LOSER");
            clearInterval(gameInterval);
        }
    }
    var monster_attacks = document.getElementById("monster_attacks");
    for(var i = 0; i< monster_attacks.childNodes.length; i++){
        var monster_attack = monster_attacks.childNodes.item(i);
        var x = parseInt(monster_attack.getAttribute("x"));
        var y = parseInt(monster_attack.getAttribute("y"));

        if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE)) {
            alert("Game over! YOU ARE KILL BY THE DIABLO");
            clearInterval(gameInterval);
        }
    }

    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                MONSTERS.splice(j,1);
                j--;
                bullets.removeChild(bullet);
                i--;
            }
        }
    }
}
function switch_direction(node){
    if(node.motion == motionType.LEFT){
        node.motion == motionType.RIGHT;
    }else if(node.motion == motionType.RIGHT){
        node.motion == motionType.LEFT;
    }
}

function move_monster(monster){
    var OBJECT_WIDTH = 40;
    var OBJECT_HEIGHT = 40;
    var x, y;
    var object = monster.node;
    var width = SCREEN_SIZE.w;
    var height = SCREEN_SIZE.h;
    var direction_change = false;

    if (object == null) return;

    x = parseFloat(object.getAttribute("x"));
    if (isNaN(x)) x = 0;

    y = parseFloat(object.getAttribute("y"));
    if (isNaN(y)) y = 0;

    x += monster.displacement.x;
    if (x < 0) {
        x = 0;
        monster.displacement.x = -monster.displacement.x;
        direction_change = true;
    }
            
    if (x > width - OBJECT_WIDTH) {
        x = width - OBJECT_WIDTH;
        monster.displacement.x = -monster.displacement.x;
        direction_change = true;
    }

    y += monster.displacement.y;
    if (y < 0) {
        y = 0;
        monster.displacement.y = -monster.displacement.y;
    }
                    
    if (y > height - OBJECT_HEIGHT) {
        y = height - OBJECT_HEIGHT;
        monster.displacement.y = -monster.displacement.y;
    }
    monster.position.x = x;
    monster.position.y = y;
    object.setAttribute("x", x);
    object.setAttribute("y", y);

    // if(direction_change){
    //     console.log("gg");
    //     rotate = "rotate(" + 180 + "," + (x+OBJECT_WIDTH / 2.0) +"," + (y+OBJECT_HEIGHT / 2.0) + ")";
    //     object.setAttribute("transform", rotate);
    // }


    // Add the code to translate and rotate here!
    // translate = "translate(" + x + "," + y + ")";

    // // // rotate = "rotate(" + angle + "," + OBJECT_WIDTH / 2.0 + "," + OBJECT_HEIGHT / 2.0 + ")";

    // object.setAttribute("transform", translate);
}

//
// This function updates the position and motion of the player in the system
//
var lastTime = 0;
var lastTime_disappear_platform = -1;

function gamePlay() {
    console.log(PLAYER_DIRECTION);
    var isOnDisappearPlatform = player.isOnDisappearPlatform();
    if(isOnDisappearPlatform){
        var i =isOnDisappearPlatform-1;
        if(lastTime_disappear_platform == -1){
            lastTime_disappear_platform = i;
            lastTime = new Date();
        }
        else if ( (Math.floor((new Date() - lastTime)/1000) >= 1 || Math.floor((new Date() - lastTime)/1000) <= 2) && lastTime_disappear_platform == i) {
            document.getElementsByClassName("disappear")[i].setAttribute("fill-opacity", `${1- ((new Date() - lastTime)/1000)/3}`);
            
        } 
        if(Math.floor((new Date() - lastTime)/1000) >= 3 && lastTime_disappear_platform == i){
            // get from url
            document.getElementsByClassName("disappear")[i].remove();
            lastTime = 0;
            lastTime_disappear_platform = -1;
        }
    }else{
        lastTime = 0;
        lastTime_disappear_platform = -1;
        var disappearplatforms = document.getElementsByClassName("disappear");
        for (var i = 0; i < disappearplatforms.length; i++) {
            var node = disappearplatforms[i];
            node.setAttribute("fill-opacity","1");
        }
    }
    collisionDetection();
	
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        {   
            displacement.x = -MOVE_DISPLACEMENT;
        }
    if (player.motion == motionType.RIGHT)
        {
            displacement.x = MOVE_DISPLACEMENT;
        }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    if(MonstercanShoot){
        Monster_shootBullet(0);
    }
    for(var i = 0; i< MONSTERS.length; i++){
        var monster = MONSTERS[i];
        move_monster(monster);
    }

    move_monster_attacks();
    moveBullets();
    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
            
    // Calculate the scaling and translation factors	
    
    // Add your code here
	
}
