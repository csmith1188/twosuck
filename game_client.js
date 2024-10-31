//find canvas element by id
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

//create a suck class that is a circle with position, radius, momentum, and color
class Suck {
    constructor(p, type) {
        this.pos = { x: p.x, y: p.y };
        this.lastPos = { x: p.x, y: p.y };
        this.type = type;
        this.r = this.Size();
        this.mom = { x: 0, y: 0 };
        this.stationary = false;
        this.color = this.typeColor();
        this.gravity = 0.1;
        this.minSpeed = 0.05;
        this.impulseThreshold = 0.5;
        this.bounce = 0.5;
        this.friction = 0.99;
    }

    Size() {
        return this.type * 10 + 10;
    }

    //get the color of the suck based on its type
    typeColor() {
        // list of 10 colors from red to purple
        return ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "pink", "brown", "black"][this.type];
    }

    //draw the suck on the canvas
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Apply gravity to momentum
        this.mom.y += this.gravity;

        // Apply damping to simulate friction
        this.mom.x *= this.friction;
        this.mom.y *= this.friction;

        // Apply momentum to position
        this.pos.x += this.mom.x;
        this.pos.y += this.mom.y;

        // Check for collision with walls
        if (this.pos.x - this.r < 0) {
            this.pos.x = this.r;
            this.mom.x = -this.mom.x * 0.1;
        }
        if (this.pos.x + this.r > canvas.width) {
            this.pos.x = canvas.width - this.r;
            this.mom.x = -this.mom.x * 0.1;
        }
        if (this.pos.y - this.r < 0) {
            this.pos.y = this.r;
            this.mom.y = -this.mom.y * 0.1;
        }
        if (this.pos.y + this.r > canvas.height) {
            this.pos.y = canvas.height - this.r;
            this.mom.y = -this.mom.y * 0.1;
        }

        // Check if momentum is below a threshold to consider it stationary
        if (Math.abs(this.mom.x) < this.minSpeed && Math.abs(this.mom.y) < this.minSpeed) {
            this.mom.x = 0;
            this.mom.y = 0;
            this.stationary = true;
        } else {
            this.stationary = false;
        }

        // Update last position
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
    }


    // check for collision with all other sucks
    checkCollision() {
        for (const suck of sucks) {
            if (suck != this) {
                // Calculate the distance and direction between balls
                let dx = this.pos.x - suck.pos.x;
                let dy = this.pos.y - suck.pos.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Check for overlap
                if (distance < this.r + suck.r) {
                    //if this suck and the colliding suck are the same type, merge them
                    if (this.type == suck.type) {
                        // Calculate the average position and momentum
                        this.pos.x = (this.pos.x + suck.pos.x) / 2;
                        this.pos.y = (this.pos.y + suck.pos.y) / 2;
                        this.mom.x = (this.mom.x + suck.mom.x) / 2;
                        this.mom.y = (this.mom.y + suck.mom.y) / 2;
                        this.type++;
                        this.r = this.Size();
                        this.color = this.typeColor();
                        sucks.splice(sucks.indexOf(suck), 1);
                    } else {
                        // Calculate overlap distance
                        let overlap = this.r + suck.r - distance;

                        // Normalize direction vector
                        let nx = dx / distance;
                        let ny = dy / distance;

                        // Separate the balls to resolve overlap
                        this.pos.x += nx * overlap / 2;
                        this.pos.y += ny * overlap / 2;
                        suck.pos.x -= nx * overlap / 2;
                        suck.pos.y -= ny * overlap / 2;

                        // Relative velocity
                        let relativeVelocityX = this.mom.x - suck.mom.x;
                        let relativeVelocityY = this.mom.y - suck.mom.y;
                        let dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

                        // Only adjust if balls are moving toward each other
                        if (dotProduct > 0) {
                            // Calculate and apply impulse to each ball
                            let impulse = (1 + this.bounce) * dotProduct;
                            this.mom.x -= impulse * nx * this.impulseThreshold;
                            this.mom.y -= impulse * ny * this.impulseThreshold;
                            suck.mom.x += impulse * nx * this.impulseThreshold;
                            suck.mom.y += impulse * ny * this.impulseThreshold;

                            // Check if they are moving slowly enough to stop
                            if (Math.abs(this.mom.x) < this.minSpeed && Math.abs(this.mom.y) < this.minSpeed) {
                                this.mom.x = 0;
                                this.mom.y = 0;
                            }
                            if (Math.abs(suck.mom.x) < this.minSpeed && Math.abs(suck.mom.y) < this.minSpeed) {
                                suck.mom.x = 0;
                                suck.mom.y = 0;
                            }
                        }
                    }
                }
            }
        }
    }
}

// list of sucks
var sucks = [];

// list of suck types to place first
var starterSucks = [0, 0, 0, 1, 1, 1, 2, 2, 2, 4];

// current suck type
var suckCount = 0;

var hoverSuck = new Suck({ x: 0, y: 100 }, 0);


//create the game loop
function gameLoop() {
    let allStationary = false;
    for (const suck of sucks) {
        if (!suck.stationary) {
            allStationary = false;
            break;
        }
        allStationary = true;
    }
    //clear the canvas
    console.log(allStationary);

    if (allStationary) {
        ctx.fillStyle = "green";
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < sucks.length; i++) {
        // draw the hover suck
        hoverSuck.draw();
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

//start the game loop
requestAnimationFrame(gameLoop);

// 20 more random sucks with random x positions and type integer 0-10
for (var i = 0; i < 20; i++) {
    var newSuck = new Suck(
        { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
        Math.floor(Math.random() * 5));
    sucks.push(newSuck);
}

//add a click event listener to the canvas to add a new suck at the click location
canvas.addEventListener('click', function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    let nextSuck;
    if (suckCount < 10) {
        nextSuck = starterSucks[suckCount]
    } else {
        nextSuck = Math.floor(Math.random() * 5);
    }
    var newSuck = new Suck({ x: x, y: y }, nextSuck);
    sucks.push(newSuck);
    suckCount++;
    if (suckCount < 10) {
        nextSuck = starterSucks[suckCount]
    } else {
        nextSuck = Math.floor(Math.random() * 5);
    }
    hoverSuck = new Suck({ x: x, y: 100 }, nextSuck);
});

//add a mousemove event listener to the canvas to show the current suck position
canvas.addEventListener('mousemove', function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = 100
    hoverSuck.pos.x = x;
    hoverSuck.pos.y = y;
});