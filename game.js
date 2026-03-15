let state;//has timemarker



/**
 * Updates the game state by a given time step (dt).
 * * Expected state structure:
 * {
 * nodes: [{ x, y, radius, health, playerNum}],
 * walls: [{ x1, y1, x2, y2, playerNum}],
 * players: [{ x, y, radius, vx, vy, health, playerNum}],
 * projectiles: [{ x, y, vx, vy, damage, lifespan }]
 * }
 */

function killPlayer(playerNum){}


//this is partially AI written
function updateState(state, time) {
    let dt = time-state.time;
    // -----------------------------------------
    // 1. UPDATE PLAYERS & LOG COLLISIONS
    // -----------------------------------------
    for (let i = 0; i < state.players.length; i++) {
        let player = state.players[i];

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // A. Check Player-Node Collisions
        for (let node of state.nodes) {
            if(node.playerNum == player.playerNum) continue;
            let rSum = player.radius + node.radius;
            if (distSq(player.x, player.y, node.x, node.y) < (rSum * rSum)) {
                killPlayer(player.playerNum);
            }
        }

        // B. Check Player-Wall Collisions
        for (let wall of state.walls) {
            if(wall.playerNum == player.playerNum) continue;
            let dSq = getSqDistPointToSegment(player.x, player.y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (dSq < (player.radius * player.radius)) {
                killPlayer(player.playerNum);
            }
        }

        // C. Check Player-Player Collisions
        for (let j = i + 1; j < state.players.length; j++) {
            let otherPlayer = state.players[j];
            let rSum = player.radius + otherPlayer.radius;
            if (distSq(player.x, player.y, otherPlayer.x, otherPlayer.y) < (rSum * rSum)) {
                killPlayer(player.playerNum);
                killPlayer(otherPlayer.playerNum);
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
            if(player.playerNum == p.playerNum) continue;

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