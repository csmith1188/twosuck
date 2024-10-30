//find canvas element by id
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// list of sucks
var sucks = [];

//create a suck class that is a circle with position, radius, momentum, and color
class Suck {
    constructor(x, y, r, momentum, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.momentum = momentum;
        this.color = color;
    }
    //draw the suck on the canvas
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    //move the suck based on momentum
    move() {
        //apply gravity to momentum
        this.momentum.y += 0.1;
        //apply momentum to position
        this.x += this.momentum.x;
        this.y += this.momentum.y;
        //check for collision with walls here
        if (this.x - this.r < 0) {
            this.x = this.r;
            this.momentum.x = -this.momentum.x * 0.1;
        }
        if (this.x + this.r > canvas.width) {
            this.x = canvas.width - this.r;
            this.momentum.x = -this.momentum.x * 0.1;
        }
        if (this.y - this.r < 0) {
            this.y = this.r;
            this.momentum.y = -this.momentum.y * 0.1;
        }
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - this.r;
            this.momentum.y = -this.momentum.y * 0.1;
        }
    }

    // check for collision with all other sucks
    checkCollision() {
        for (var i = 0; i < sucks.length; i++) {
            if (this !== sucks[i]) {
                var dx = this.x - sucks[i].x;
                var dy = this.y - sucks[i].y;
                var distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < this.r + sucks[i].r) {
                    // Resolve overlap
                    var overlap = this.r + sucks[i].r - distance;
                    var angle = Math.atan2(dy, dx);
                    
                    // Push circles apart by half the overlap distance each
                    this.x += Math.cos(angle) * (overlap / 2);
                    this.y += Math.sin(angle) * (overlap / 2);
                    sucks[i].x -= Math.cos(angle) * (overlap / 2);
                    sucks[i].y -= Math.sin(angle) * (overlap / 2);
    
                    // Adjust roll force based on size difference
                    var rollForce = 0.1 + (sucks[i].r - this.r) * 0.05; // Increase base roll speed to 0.1
    
                    // Apply tangent rolling effect
                    var tangentAngle = angle + Math.PI / 2;
                    this.momentum.x += Math.cos(tangentAngle) * rollForce;
                    this.momentum.y += Math.sin(tangentAngle) * rollForce;
                    sucks[i].momentum.x -= Math.cos(tangentAngle) * rollForce;
                    sucks[i].momentum.y -= Math.sin(tangentAngle) * rollForce;
    
                    // Momentum exchange for elastic collision
                    var ax = (this.momentum.x - sucks[i].momentum.x) * 0.5;
                    var ay = (this.momentum.y - sucks[i].momentum.y) * 0.5;
    
                    this.momentum.x -= ax;
                    this.momentum.y -= ay;
                    sucks[i].momentum.x += ax;
                    sucks[i].momentum.y += ay;
                }
            }
        }
    }    
    
}

//create the game loop
function gameLoop() {
    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < sucks.length; i++) {
        //draw each suck
        sucks[i].draw();
        //move each suck
        sucks[i].move();
        //check for collision with other sucks
        sucks[i].checkCollision();
    }
    //request the next frame
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

//create a new suck
var newSuck = new Suck(102, 100, 20, { x: 0, y: 0 }, "red");
sucks.push(newSuck);
var newSuck = new Suck(100, 200, 20, { x: 0, y: 0 }, "blue");
sucks.push(newSuck);