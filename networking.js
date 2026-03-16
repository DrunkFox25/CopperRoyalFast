//https://github.com/dmotz/trystero#selfid

import {joinRoom, selfId} from 'https://esm.run/trystero';
const config = {appId: 'FastCopperRoyal'};

roomID = urlVals['roomID'];

const room = joinRoom(config, roomID);

const [sendHost, getHost] = room.makeAction('indentify host');

let hostId;

let playerNum;//used for knowing who is playing, who is chosen from the lobby of possibly more



const idSpan = document.getElementById("id");

idSpan.innerHTML = `Net Id = ${selfId}`;

const playerSpan = document.getElementById("player");

getHost((pNum, peerId) => {playerNum = pNum; hostId = peerId; playerSpan.innerHTML = `You are player number ${PlayerNum}    `;});

const pingSpan = document.getElementById("ping");

let pingCycleId;//for canceling ping cycle

async function pingCycle(curr){
  pingSpan.innerHTML = `PING: ${await room.ping(hostId)}ms`;

  
  next = Math.max(curr+1000-performance.now(), 0);
  pingCycleId = setTimeout(pingCycle, next, curr+next);
}

pingCycle(performance.now());




if(host){
  let players = 0;
  let playerMap = new Map();

  room.onPeerJoin(async (peerId) => {
    console.log(`${peerId} joined`);
    console.log(`to ${peerId} ping is ${await room.ping(peerId)}ms`);
    players++;
    playerMap.set(peerId, players);

      sendHost(players, peerId);
  });

  room.onPeerLeave((peerId) => {
    console.log(`${peerId} left`);
  });

}


/*

let intervalId;

function preciseCycle(expected) {
  do shit

  expected += 1000;
  next = Math.max(expected-performance.now(), 0);
  intervalId = setTimeout(preciseCycle, next, expected);
}


send state every action, Date.now()


when sending state, send id, which will be verified
*/








//need to add player.angle


/**
 * Updates the game state by a given time step (dt).
 * * Expected state structure:
 * {
 * flags: [{ x, y, playerNum}],
 * booms: [{ x, y, time}],
 * nodes: [{ x, y, radius, health, playerNum}],
 * walls: [{ x1, y1, x2, y2, playerNum}],
 * players: [{ x, y, radius, vx, vy, health, playerNum, alive}],
 * projectiles: [{ x, y, vx, vy, damage, lifespan }]
 * }
 */

//this is partially AI written



let state;
let newState = null;

const freq = 60;

const [sendState, getState] = room.makeAction('update');
const [sendAction, getAction] = room.makeAction('action');

let sendStateCycle = null;



function killPlayer(state, playerNum){
    if(!host) return;

    let i = 0;
    for (; i < state.players.length; i++) {
        let player = state.players[i];
        if(player.playerNum == playerNum) break;
    }

    let player = state.players[i];
    player.alive = -3;
    player.vx = 0;
    player.vy = 0;

    state.boom.push(genBoom())//idk make this work somehow here, boom start life = 1000

    brodcast(state);
}

function brodcast(state){
    if(sendStateInterval != null) clearInterval(sendStateCycle);
    sendState(state);
    sendStateCycle = setInterval(sendState(state), 1000/freq);
}

getState((state, peerId) => {
    if(hostId == peerId) newState = state;
});

getAction((action, peerId) => {//should ideally check if possible
    getPlayerNum
    if(action.name == 'dir'){
        f
    }
});

function findHome(playerNum){}

function updateState(state, time){
    let dt = time-state.time;
    state.time = time;

    for (let i = 0; i < state.booms.length; i++) {
        state.booms[i] -= dt;
    }
    state.booms = state.booms.filter(function(boom) {return boom > 0;});
    // -----------------------------------------
    // 1. UPDATE PLAYERS & LOG COLLISIONS
    // -----------------------------------------
    for (let i = 0; i < state.players.length; i++) {
        let player = state.players[i];

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        player.alive += dt;
        if(player.alive < dt){
            if(player.alive < 0) continue;
            player.alive = 0;

            [player.x, player.y] = findHome(playerNum);

            brodcast(state);
        }

        // A. Check Player-Node Collisions
        for (let node of state.nodes) {
            if(node.playerNum == player.playerNum) continue;
            let rSum = player.radius + node.radius;
            if (distSq(player.x, player.y, node.x, node.y) < (rSum * rSum)) {
                killPlayer(state, player.playerNum);
            }
        }

        // B. Check Player-Wall Collisions
        for (let wall of state.walls) {
            if(wall.playerNum == player.playerNum) continue;
            let dSq = getSqDistPointToSegment(player.x, player.y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (dSq < (player.radius * player.radius)) {
                killPlayer(state, player.playerNum);
            }
        }

        // C. Check Player-Player Collisions
        for (let j = i + 1; j < state.players.length; j++) {
            let otherPlayer = state.players[j];
            let rSum = player.radius + otherPlayer.radius;
            if (distSq(player.x, player.y, otherPlayer.x, otherPlayer.y) < (rSum * rSum)) {
                killPlayer(state, player.playerNum);
                killPlayer(state, otherPlayer.playerNum);
            }
        }
    }

    // -----------------------------------------
    // 2. UPDATE PROJECTILES
    // -----------------------------------------
    let activeProjectiles = [];

    for (let p of state.projectiles) {
        p.lifespan -= dt;
        if (p.lifespan <= 0) continue; 

        let nextX = p.x + p.vx * dt;
        let nextY = p.y + p.vy * dt;
        let projectileHit = false;

        // A. Projectile vs Node
        for (let node of state.nodes) {
            if(node.playerNum == p.playerNum) continue;

            if (node.health > 0 && distSq(nextX, nextY, node.x, node.y) <= (node.radius * node.radius)) {
                node.health -= p.damage;
                projectileHit = true;
                break;
            }
        }
        if (projectileHit) continue; 

        // B. Projectile vs Player
        for (let player of state.players) {
            if (player.health > 0 && distSq(nextX, nextY, player.x, player.y) <= (player.radius * player.radius)) {
                player.health -= p.damage;
                projectileHit = true;
                break;
            }
        }
        if (projectileHit) continue;

        // C. Projectile vs Wall (Continuous Collision)
        let closestIntersection = null;
        for (let wall of state.walls) {
            if(wall.playerNum == p.playerNum) continue;
            let hit = getLineIntersection(p.x, p.y, nextX, nextY, wall.x1, wall.y1, wall.x2, wall.y2);
            if (hit && (!closestIntersection || hit.t < closestIntersection.t)) {
                closestIntersection = hit;
            }
        }

        if (closestIntersection) {
            p.x = closestIntersection.x - p.vx * 0.001;
            p.y = closestIntersection.y - p.vy * 0.001;
            let n = closestIntersection.normal;
            let dot = p.vx * n.x + p.vy * n.y;
            p.vx = p.vx - 2 * dot * n.x;
            p.vy = p.vy - 2 * dot * n.y;
        } else {
            p.x = nextX;
            p.y = nextY;
        }

        activeProjectiles.push(p);
    }

    state.projectiles = activeProjectiles;
    return state;
}

// -----------------------------------------
// FAST MATH WRAPPERS & HELPERS
// -----------------------------------------

/** Returns the squared magnitude of a vector */
function dist2(dx, dy) {
    return (dx * dx) + (dy * dy);
}

/** Returns the squared distance between two points */
function distSq(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return (dx * dx) + (dy * dy);
}

/** Shortest squared distance from a point to a line segment */
function getSqDistPointToSegment(px, py, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let l2 = dist2(dx, dy);
    
    // If the wall is basically a point (length 0)
    if (l2 === 0) return distSq(px, py, x1, y1); 
    
    let t = ((px - x1) * dx + (py - y1) * dy) / l2;
    t = Math.max(0, Math.min(1, t)); 
    
    let projX = x1 + t * dx;
    let projY = y1 + t * dy;
    
    return distSq(px, py, projX, projY);
}

/** Intersection between two line segments */
function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    let s1_x = p1_x - p0_x;
    let s1_y = p1_y - p0_y;
    let s2_x = p3_x - p2_x;
    let s2_y = p3_y - p2_y;

    let denominator = (-s2_x * s1_y + s1_x * s2_y);
    if (Math.abs(denominator) < 0.0001) return null;

    let s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / denominator;
    let t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / denominator;

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        let nx = -s2_y;
        let ny = s2_x;
        
        // We MUST use true Math.sqrt here to normalize the vector to a length of exactly 1.
        let length = Math.sqrt(dist2(nx, ny)); 
        nx /= length;
        ny /= length;

        if ((s1_x * nx + s1_y * ny) > 0) {
            nx = -nx;
            ny = -ny;
        }

        return {
            x: p0_x + (t * s1_x),
            y: p0_y + (t * s1_y),
            t: t,
            normal: { x: nx, y: ny }
        };
    }
    return null;
}






function drawPlayer(ctx, playerSvg, color) {
    playerSvg.documentElement.setAttribute('fill', color);

    playerSvg.render({
        offsetX: -100, 
        offsetY: -100,
        width: 200, 
        height: 350,
        context: ctx
    });
}

function genPoints(n, a, b, color){
    let boomPart = {
        points: [],
        innerRadius: 15,
        outerRadius: 17,
        colorInner: color,
        colorOuter: 'black'
    };

    for(let i = 0; i < n; i++){
        let theta = Math.random()*2*Math.PI;
        let r = a+b*(Math.random()**2);
        boomPart.points.push({x: r*Math.cos(theta), y: r*Math.sin(theta)});
    }

    return boomPart;
}

function drawBoomPart(ctx, boomPart, t){
    ctx.fillStyle = boomPart.colorOuter;

    ctx.beginPath();

    outer.forEach((coord) => {
        ctx.arc(coord.x*t, coord.y*t, boomPart.outerRadius, 0, Math.PI * 2);
    });

    ctx.fill();

    ctx.fillStyle = boomPart.colorInner;

    ctx.beginPath();

    outer.forEach((coord) => {
        ctx.arc(coord.x*t, coord.y*t, boomPart.innerRadius, 0, Math.PI * 2);
    });

    ctx.fill();
}




let boomList = [];

function genBoom(){//boom.id = genBoom();
    let l = boomList.length;
    boomList.push({
        outer: genPoints(500, 40, 65, '#c7444a'),
        middl: genPoints(500, 25, 50, '#fa7e19'),
        inner: genPoints(500, 10, 35, '#fff701')
    });
    return l;
}

function drawBoom(ctx, i, t){//t is 0 to 1   ~ 1 sec
    if(boomList[i] == null) return;

    drawBoomPart(ctx, boomList[i].outer, t);
    drawBoomPart(ctx, boomList[i].middl, t);
    drawBoomPart(ctx, boomList[i].inner, t);
}

function expiredBoom(i){
    boomList[i] = null;
}







const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
const playerSvg = await Canvg.from(ctx, 'chopper.svg');
let drawloopid;



let x, y;//origin of veiw, need to make this mtach curr pos
//need to make controls


function drawloop(time){
    updateState(time);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-x,-y);

    ctx.lineWidth = 10;
    for (let wall of state.walls){
        ctx.strokeStyle = playerColor(wall.playerNum);

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();

        ctx.restore();
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    for (let node of state.nodes){
        ctx.fillStyle = playerColor(node.playerNum);

        ctx.save();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    for (let boom of state.booms){
        ctx.save();

        ctx.translate(boom.x, boom.y);
        drawBoom(ctx, boom.id, -boom.time/1000);

        ctx.restore();
    }

    for (let player of state.players){
        ctx.save();
        ctx.translate(player.x,player.y);
        ctx.rotate(player.angle);

        drawPlayer(ctx, playerSvg, playerColor(node.playerNum));

        ctx.restore();
    }

    

    drawloopid = requestAnimationFrame(drawloop);
}

drawloop(performance.now());