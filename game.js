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
//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(35, 35);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0); 
var PLAYER_DIRECTION = "right";             // The initial position of the player
var TIME_LEFT = 120;
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 8;                         // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var MONSTER_SIZE = new Size(28, 28);        // The size of a monster
var GAME_INTERVAL = 25;                     // The time interval of running the game
var BULLET_SIZE = new Size(10, 10);         // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 500.0;                 // The period when shooting is disabled
var MONSTER_SHOOT_INTERVAL = 800.0;  
var COIN_SIZE = new Size(20, 20);
var NUMBER_OF_COINS = 8;
var LEVEL = [4, 8, 12];
var BULLET_AMOUNTS = 8;

//
// Variables in the game
//
var timeleft = 0;
var timeleftTimer = null;
var nameShow = null; // The player name tag
var flip = true;                            // A flag indicating the direction of the player
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var MonstercanShoot = true;
var BULLETS = [];
var MONSTER_ATTACKS = [];
var MONSTERS = [];
var testing = 0;
var name = "No Name";
var shoot_sound = document.getElementById("shoot");
var background_sound = document.getElementById("background_music");
var kill_sound = document.getElementById("kill");
var lose_sound = document.getElementById("lose");
var coin_sound = document.getElementById("coin_sound");
var win_sound = document.getElementById("win");
var teleport_sound = document.getElementById("teleport_sound");
var current_level = 1;
var lastTime = 0;
var lastTime_disappear_platform = -1;
var move_direction = 1;
var score = 0;
var current_coins = 0;
var winning = true;
var cheat_mode = false;
var current_bullet_amount = 0;

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
function getUserName(){
    name = prompt("Enter your player name", name);
    player.name = name;
    document.getElementById("name_value").firstChild.data = name;
    nameShow = document.createElementNS("http://www.w3.org/2000/svg", "use");
    nameShow.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
    document.getElementById("player_name").appendChild(nameShow);
    nameShow.setAttribute("y", player.position.y - 3);
    nameShow.setAttribute("x", player.position.x + 5);
}


// The player class used in this program
function Player() {
    this.name = name;
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

Player.prototype.isOnVerticalPlatform = function() {
    var node = document.getElementById("moving_plat");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    // console.log(`Player x:${this.position.x} y:${this.position.y}`);
    // console.log(`Platform x:${x} y:${y - PLAYER_SIZE.h}`);
    if ((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) && ((this.position.y + PLAYER_SIZE.h) < y + 1)){
        if(this.position.y < y - PLAYER_SIZE.h-10)
        {
            return false;
        }
        this.position.y = y - PLAYER_SIZE.h -1;
        return true;
    }
    else{
        return false;
    }
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
        // if (node.getAttribute("id")=="moving_plat")
        // {
        //     if (intersect(position, PLAYER_SIZE, pos, size)) {
        //         console.log(this.isOnVerticalPlatform());
        //         position.x = this.position.x;
        //         position.y = y - PLAYER_SIZE.h;
        //     }
        // }
        var gang = this.isOnVerticalPlatform();
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
                if(gang == false){
                    this.verticalSpeed = 0;
                }
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if(position.x < 0 && ( position.y <= 445 && position.y >= 400 ) || position.y <10 && position.x > 520 ){
        if(position.y == 445){
            teleport_sound.play();
            position.x = 540;
            position.y = 20;
        }else{
            teleport_sound.play();
            position.x = 5;
            position.y = 445;
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

function Monster(i){
    this.node = document.getElementById("monsters").childNodes.item(i);
    this.position = new Point(parseInt(this.node.getAttribute("x")),parseInt(this.node.getAttribute("y")));
    this.displacement = new Point(parseFloat(Math.random()*2),parseFloat(Math.random()*2));
    this.flip = true;
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
        // prevent coin to be spawned in the exit place
        if (intersect(position, COIN_SIZE, new Point(0, 60) , new Size(120, 160))){
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

}
function count_down() {
    timeleft--;
    document.getElementById("time_left").firstChild.data = timeleft;
    document.getElementById("time_bar").setAttribute("width", timeleft);
    if (timeleft <= 0) {
      lose_sound.play();
      winning = false;
      end_game();
    }
}
function start_game() {
    current_bullet_amount = BULLET_AMOUNTS;
    //CLEAR BULLET DISPLAY
    document.getElementById("shuriken").firstChild.data = current_bullet_amount;

    current_coins = 0;
    var names = document.getElementById("player_name");
    for (var i = 0; i < names.childNodes.length; i++) 
    {
        var name = names.childNodes.item(i);
        names.removeChild(name);
    }
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    //clearBullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        bullets.removeChild(node);
        BULLETS.splice(i, 1);
        i--;
    }
    var monster_attacks = document.getElementById("monster_attacks");
    for (var i = 0; i < monster_attacks.childNodes.length; i++) {
        var node = monster_attacks.childNodes.item(i);
        monster_attacks.removeChild(node);
        MONSTER_ATTACKS.splice(i,1);
        i--;
    }
    BULLETS = [];
    MONSTER_ATTACKS = [];
    MONSTERS = [];
    //clearMonsters
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) 
    {
        var monster = monsters.childNodes.item(i);
        monsters.removeChild(monster);
        i--;
    }
    //claerCoins
    var coins = document.getElementById("coins");
    for (var i = 0; i < coins.childNodes.length; i++) 
    {
        var coin = coins.childNodes.item(i);
        coins.removeChild(coin);
        i--;
    }
    //clear the gate
    var gate = document.getElementsByClassName("gate");
    for(var i = 0; i< gate.length;i++){
        gate[i].remove();
        i--;
    }
    //set the gate
    var platforms = document.getElementById("platforms");
    for(var i = 0; i<4;i++){
        var block_1 = document.createElementNS("http://www.w3.org/2000/svg","rect");
        block_1.setAttribute("x", 100);
        block_1.setAttribute("y", 120+i*20);
        block_1.setAttribute("width",  20);
        block_1.setAttribute("height", 20);
        block_1.setAttribute("style", "fill:rgb(255, 238, 0)");
        block_1.setAttribute("class","gate");
        platforms.appendChild(block_1);
    }
    //clear the disappearing platform 
    var disappearplatforms = document.getElementsByClassName("disappear");
    for(var i = 0; i< disappearplatforms.length;i++){
        disappearplatforms[i].remove();
        i--;
    }
    //set the disappearing platform
    var disappearplatforms_1 = document.createElementNS("http://www.w3.org/2000/svg","rect");
    disappearplatforms_1.setAttribute("x", 180);
    disappearplatforms_1.setAttribute("y", 160);
    disappearplatforms_1.setAttribute("width", 120);
    disappearplatforms_1.setAttribute("height", 20);
    disappearplatforms_1.setAttribute("style", "fill: rgb(65, 16, 65)");
    disappearplatforms_1.setAttribute("class","disappear");
    disappearplatforms_1.setAttribute("opacity", 1);
    platforms.appendChild(disappearplatforms_1);
    var disappearplatforms_2 = document.createElementNS("http://www.w3.org/2000/svg","rect");
    disappearplatforms_2.setAttribute("x", 340);
    disappearplatforms_2.setAttribute("y", 240);
    disappearplatforms_2.setAttribute("width", 160);
    disappearplatforms_2.setAttribute("height", 20);
    disappearplatforms_2.setAttribute("style", "fill: rgb(65, 16, 65)");
    disappearplatforms_2.setAttribute("class","disappear");
    disappearplatforms_2.setAttribute("opacity", 1);
    platforms.appendChild(disappearplatforms_2);
    //set the gate


    // Create the player
    player = new Player();
    console.log(current_level);
    if(winning == false){
        current_level = 1;
    }
    if( current_level > 3){
        alert("you already finish all the level Reset the score and level")
        getUserName();
        current_level = 1;
        score = 0;
        document.getElementById("score").firstChild.data = score;
    }
    else if( current_level == 1 ){
        getUserName();
        score = 0;
        document.getElementById("score").firstChild.data = score;
    }
    else{
        alert(`you finish level ${current_level-1} Ready for the next challenge?`)
    }
    //Create the coin
    var coin_create_counter = 0;
    var points = [];
    while(coin_create_counter < NUMBER_OF_COINS){
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
    createMonster(Math.floor(Math.random() * 480) + 60, Math.floor(Math.random() * 500) + 20, true);
    MONSTERS.push(new Monster(0));
    for(var i = 1; i < LEVEL[current_level-1]; i++){
        createMonster(Math.floor(Math.random() * 480) + 60, Math.floor(Math.random() * 500) + 20);
        MONSTERS.push(new Monster(i));
    }
    //set Level
    document.getElementById("level").firstChild.data = current_level;
    // Start the game interval
    winning = true;
    clearInterval(gameInterval);
    clearInterval(timeleftTimer);
    background_sound.play();
    timeleft = TIME_LEFT;
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timeleftTimer = setInterval("count_down()", 1000);
}
function end_game(){
    background_sound.pause();
    background_sound.currentTime = 0;
    clearInterval(gameInterval);
    clearInterval(timeleftTimer);


    if(winning == false || current_level == 4){
        //claen the high score table first
        var oldhighscoretable = document.getElementById("highscoretext")
        for(var i = 0; i<oldhighscoretable.childNodes.length;i++){
            oldhighscoretable.childNodes.item(i).remove();
            i--;
        }
        // Get the high score table from cookies

        var highScoreTable = getHighScoreTable();
        // // Create the new score record
        var record = new ScoreRecord(player.name, score);

        // // Insert the new score record
        var position = 0;
        while (position < highScoreTable.length) {
            var curPositionScore = highScoreTable[position].score;
            if (curPositionScore < score)
                break;

            position++;
        }
        if (position < 5){
            highScoreTable.splice(position, 0, record);
            var top_5 = true;
        }else{
            alert(`Sorry your score is not high enough to make it into top 5 list! Your score ${score}`)
        }
        // Store the new high score table
        setHighScoreTable(highScoreTable);

        // Show the high score table
        showHighScoreTable(highScoreTable, top_5, position );
        return;
    }
    if(winning){
        score = score + (current_level-1)*100 + timeleft*5;
        document.getElementById("score").firstChild.data = score;
    }
    start_game();
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
function createMonster(x, y, can_shoot) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    if(can_shoot){
        monster.setAttribute("id", "monster_shoot")
    }
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
    console.log(BULLETS)
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if(BULLETS[i]=="right"){
            console.log("right shoot")
            node.setAttribute("x", x + BULLET_SPEED);
        }else if(BULLETS[i]=="left"){
            console.log("left shoot")
            node.setAttribute("x", x - BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            console.log("delete")
            bullets.removeChild(node);
            BULLETS.splice(i, 1);
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
        if (x > SCREEN_SIZE.w || x < 0) {
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
        case "C".charCodeAt(0):
                cheat_mode = true;
                document.getElementById("shuriken").style.setProperty("visibility", "hidden", null);
                document.getElementById("cheat").style.setProperty("visibility", "visible", null);
                document.getElementById("player").setAttribute("opacity", "0.5");

            break;
        case "V".charCodeAt(0):
                cheat_mode = false;
                document.getElementById("cheat").style.setProperty("visibility", "hidden", null);
                document.getElementById("shuriken").style.setProperty("visibility", "visible", null);
                document.getElementById("player").setAttribute("opacity", "1");
            break;
            
        case "L".charCodeAt(0):
                clearHighScoreTable();
        break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform() || player.isOnVerticalPlatform()) {
                console.log("jump key");
                player.verticalSpeed = JUMP_SPEED+4;
            }
            break;
		
        case "H".charCodeAt(0): // spacebar = shoot
            if(canShoot && cheat_mode == true){
                console.log("cheat shoot");
                shoot_sound.play();
                shootBullet(PLAYER_DIRECTION);
            }
			else if (canShoot && current_bullet_amount >= 1) {
                console.log("normal shoot");
                shoot_sound.play();
                shootBullet(PLAYER_DIRECTION);
                if(cheat_mode == false ){
                    current_bullet_amount--;
                    document.getElementById("shuriken").firstChild.data = current_bullet_amount;
                }
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
    // Check if the player find the treasure
    var treasure = document.getElementById("treasure")
    var x = parseInt(treasure.getAttribute("x"));
    var y = parseInt(treasure.getAttribute("y"));
    if (intersect(new Point(x,y),new Size(40, 40),player.position, PLAYER_SIZE)) {
        win_sound.play();
        alert("win!!!!");
        if (current_level<=3){
            current_level++;
        }
        end_game();
    }
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    if(cheat_mode == false){
        for (var i = 0; i < monsters.childNodes.length; i++) {
            var monster = monsters.childNodes.item(i);
            var x = parseInt(monster.getAttribute("x"));
            var y = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
                lose_sound.play();
                winning = false;
                end_game();
            }
        }
    }
    //check whether the player collides with a coin
    var coins = document.getElementById("coins");
    for (var i = 0; i < coins.childNodes.length; i++) {
        var coin = coins.childNodes.item(i);
        var x = parseInt(coin.getAttribute("x"));
        var y = parseInt(coin.getAttribute("y"));

        if (intersect(new Point(x, y), COIN_SIZE, player.position, PLAYER_SIZE)) {
            score+=10;
            current_coins++;
            document.getElementById("score").firstChild.data = score;
            coin_sound.play();
            coins.removeChild(coin);
            i--;
        }
    }
    // var monsters = document.getElementById("monsters");
    // for (var i = 0; i < monsters.childNodes.length; i++) {
    //     var monster = monsters.childNodes.item(i);
    //     var x = parseInt(monster.getAttribute("x"));
    //     var y = parseInt(monster.getAttribute("y"));

    //     if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
    //         lose_sound.play();
    //         alert("Game over! YOU GOT KILLED LOSER");
    //         clearInterval(gameInterval);
    //     }
    // }
    if (cheat_mode == false){
        var monster_attacks = document.getElementById("monster_attacks");
        for(var i = 0; i< monster_attacks.childNodes.length; i++){
            var monster_attack = monster_attacks.childNodes.item(i);
            var x = parseInt(monster_attack.getAttribute("x"));
            var y = parseInt(monster_attack.getAttribute("y"));
    
            if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE)) {
                lose_sound.play();
                winning = false;
                end_game();
            }
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
                kill_sound.play();
                score+=30;
                document.getElementById("score").firstChild.data = score;
                monsters.removeChild(monster);
                MONSTERS.splice(j,1);
                j--;
                BULLETS.splice(i, 1);
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

    if (monster.displacement.x > 0){
        monster.flip = true;
        object.setAttribute("transform", "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)");
    }else if(monster.displacement.x < 0){
        monster.flip = false;
    }
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
    if(monster.flip){
        object.setAttribute("transform", "translate(" + (monster.position.x*2 + MONSTER_SIZE.w) + "," + 0 + ") scale(-1, 1)");           
    }else{
        object.setAttribute("transform", "scale(1,1)");    
    }
    // if(direction_change == true){
    //     object.setAttribute("transform", "translate(" + (monster.position.x*2 + MONSTER_SIZE.w) + "," + 0 + ") scale(-1, 1)");
    // }

    // if(direction_change){
    //     console.log("change direction");
    //     object.setAttribute("transform", "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)");
    //     object.setAttribute("transform", "translate(" + (monster.position.x + MONSTER_SIZE.w) + "," + monster.position.y + ") scale(-1, 1)");
    // }


    // Add the code to translate and rotate here!
    // translate = "translate(" + x + "," + y + ")";

    // // // rotate = "rotate(" + angle + "," + OBJECT_WIDTH / 2.0 + "," + OBJECT_HEIGHT / 2.0 + ")";

    // object.setAttribute("transform", translate);
}
function move_platform(move_direction){
    var node = document.getElementById("moving_plat");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var move;
    if(y+h <= 520 && move_direction == 1){
        move = y+move_direction;
        node.setAttribute("y", `${move}`);
    }else if(y > 100 && move_direction == -1 ){
        move = y+move_direction;
        node.setAttribute("y", `${move}`);
    }else if(y+h > 520){
        move_direction = -1;
        node.setAttribute("y", `${520-h}`);
    }else if(y <= 100){
        move_direction = 1;
        node.setAttribute("y", "101");
    }
    return move_direction;
}

//
// This function updates the position and motion of the player in the system
//

function gamePlay() {
    // console.log(PLAYER_DIRECTION);
    if(current_coins == NUMBER_OF_COINS){
        var gate = document.getElementsByClassName("gate");
        if(gate){
            for(var i = 0; i<gate.length;i++){
                gate[i].remove();
                i--;
            }
        }
    }
    // console.log("x: "+player.position.x+" y: "+player.position.y);
    move_direction = move_platform(move_direction);
    var init_position = new Point();
    init_position.x = player.position.x;
    init_position.y = player.position.y;

    // Check collision with platforms and screen
    var vertical_speed = player.verticalSpeed;
    player.collidePlatform(init_position);
    player.position = init_position;

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
    var isOnVerticalPlatform = player.isOnVerticalPlatform();
    // console.log(isOnVerticalPlatform);
    collisionDetection();
	
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    // Update player position
    var displacement = new Point();



    // Move left or right
    if (player.motion == motionType.LEFT)
        {   
            flip = true;
            player.node.setAttribute("transform", "translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)");
            displacement.x = -MOVE_DISPLACEMENT;
        }
    if (player.motion == motionType.RIGHT)
        {
            flip = false;
            displacement.x = MOVE_DISPLACEMENT;
        }

    if (isOnVerticalPlatform){
        if (player.verticalSpeed > 0 ) {

            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
            if (player.verticalSpeed <= 0)
                player.verticalSpeed = 0;
        }
    }
    else{
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
        var monster = document.getElementById("monster_shoot");
        if(monster){
            Monster_shootBullet(0);
        }
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
  // Transform the player
    if (!flip) {
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    else {
        player.node.setAttribute("transform", "translate(" + (player.position.x + PLAYER_SIZE.w) + "," + player.position.y + ") scale(-1, 1)");
    }
    nameShow.setAttribute("y", player.position.y - 3);
    nameShow.setAttribute("x", player.position.x + 5);
    // Calculate the scaling and translation factors	
    
    // Add your code here
	
}
