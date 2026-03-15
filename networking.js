//https://github.com/dmotz/trystero#selfid

import {joinRoom, selfId} from 'https://esm.run/trystero';
const config = {appId: 'FastCopperRoyal'};

roomID = urlVals['roomID'];

const room = joinRoom(config, roomID);

const [sendHost, getHost] = room.makeAction('indentify host');

let hostId;

let playerNum;//used for knowing who is playing, who is chosen from the lobby of possibly more

getHost((pNum, peerId) => function(){playerNum = pNum; hostId = peerId;});

let currPing;

let pingCycleId;

function pingCycle(expected) {
  currPing = room.ping(hostId);

  expected += 1000;
  next = Math.max(expected-performance.now(), 0);
  pingCycleId = setTimeout(pingCycle, next, expected);
}





const JButt = document.getElementById("J");const LButt = document.getElementById("L");





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