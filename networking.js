//https://github.com/dmotz/trystero#selfid

import {joinRoom, selfId} from 'https://esm.run/trystero';
const config = {appId: 'FastCopperRoyal'};

roomID = urlVals['roomID'];

const room = joinRoom(config, roomID);

const hostmsg = "I am the host!"

let state;

const [sendState, getState] = room.makeAction('update');
const [sendHost, getHost] = room.makeAction('indentify host');

let hostId;

getHost((str, peerId) => function(){if(str == hostmsg){hostId = peerId;}});



console.log(`my peer ID is ${selfId}`);

const JButt = document.getElementById("J");const LButt = document.getElementById("L");

function J(roomID) {
  
  room.onPeerJoin((peerId) => console.log(`${peerId} joined`));
  room.onPeerLeave((peerId) => console.log(`${peerId} left`));

  LButt.onclick = room.leave;
}

JButt.onclick = J('100');

function HostSetup(){
    room.onPeerJoin((peerId) => function(){console.log(`${peerId} joined`); sendHost(hostmsg, peerId)});
    room.onPeerLeave((peerId) => console.log(`${peerId} left`));
}