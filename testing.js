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


const room = joinRoom(config, '0');

console.log(`You are ${selfId}`);

room.onPeerJoin(async (peerId) => {
    console.log(`${peerId} joined`);
    console.log(`to ${peerId} ping is ${await room.ping(peerId)}ms`);
});

room.onPeerLeave(async (peerId) => {
    console.log(`${peerId} left`);
});

const [sendHello, getHello] = room.makeAction('hell');

getHello((str, peerId) => {
    console.log(`${peerId} says ${str}`);
});

hello.onclick = function(){sendHello('hi');};


