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
const hello = document.getElementById("testing");

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
