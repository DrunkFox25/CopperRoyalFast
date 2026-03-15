const canvas = document.getElementById("game");
//const ctx = canvas.getContext('2d');
//let playerSvg = await Canvg.from(ctx, 'chopper.svg');




function clear(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

function drawBoomPart(ctx, boomPart){
    ctx.fillStyle = boomPart.colorOuter;

    ctx.beginPath();

    outer.forEach((coord) => {
        ctx.arc(coord.x, coord.y, boomPart.outerRadius, 0, Math.PI * 2);
    });

    ctx.fill();

    ctx.fillStyle = boomPart.colorInner;

    ctx.beginPath();

    outer.forEach((coord) => {
        ctx.arc(coord.x, coord.y, boomPart.innerRadius, 0, Math.PI * 2);
    });

    ctx.fill();
}

function drawBoom(ctx){
    drawBoomPart(ctx, genPoints(500, 40, 65, '#c7444a'));
    drawBoomPart(ctx, genPoints(500, 25, 50, '#fa7e19'));
    drawBoomPart(ctx, genPoints(500, 10, 35, '#fff701'));
}



function animate() {
      // Clear the canvas for the new frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update each circl
      ctx.beginPath(); // Start a single path for better performance

        draw

      // Request the next frame
      requestAnimationFrame(animate);
    }

    // Start the animation
    animate();




    /*

let drawloopid;
function drawloop(){
    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(angle);

    draw

    ctx.restore();

    drawloopid = requestAnimationFrame(drawloop);
}



*/