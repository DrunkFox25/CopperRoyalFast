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






let state;

const [sendState, getState] = room.makeAction('update');
const [sendAction, getAction] = room.makeAction('action');


/*

let intervalId;

function preciseCycle(expected) {
  do shit

  expected += 1000;
  next = Math.max(expected-performance.now(), 0);
  intervalId = setTimeout(preciseCycle, next, expected);
}*/



/*
send state every action, Date.now()


when sending state, send id, which will be verified
*/