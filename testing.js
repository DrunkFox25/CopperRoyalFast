import {joinRoom, selfId} from 'https://esm.run/trystero';

const config = {
    appId: 'FastCopperRoyal',
    turnConfig: [
        {
            urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443'],
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    rtcConfig: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }
};

const text = document.getElementById("testing");
const hello = document.getElementById("hello");
const pingspan = document.getElementById("ping");
const pingid = document.getElementById("pingid");


const room = joinRoom(config, '0');

text.innerHTML += `You are ${selfId}<br>`;

room.onPeerJoin((peerId) => {
    text.innerHTML += `${peerId} joined<br>`;
});

room.onPeerLeave((peerId) => {
    text.innerHTML += `${peerId} left<br>`;
});

const [sendHello, getHello] = room.makeAction('hell');

getHello((str, peerId) => {
    text.innerHTML += `${peerId} says ${str}<br>`
});

hello.onclick = function(){sendHello('hi');};




function pingCycle(expected) {
  if(pingid.innerHTML.length > 3) pingspan.innerHTML = `ping: ${room.ping(pingid.innerHTML)}`;

  expected += 1000;
  next = Math.max(expected-performance.now(), 0);
  pingCycleId = setTimeout(pingCycle, next, expected);
}

pingCycle(performance.now());