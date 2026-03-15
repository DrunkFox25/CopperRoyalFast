let players = 0;
let ids = ['idk maann'];

room.onPeerJoin((peerId) => {
    console.log(`${peerId} joined`);
    players++;
    ids.push(peerId);

    sendHost(players, peerId);
});

room.onPeerLeave((peerId) => {
    console.log(`${peerId} left`);
});


