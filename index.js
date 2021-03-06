const parameters = {};
let sons = [];
let ws, audio, 
play = true;

location.search.slice(1).split('&').forEach((value, number)=>{
    const data = value.split('=');
    if (data.length > 1) {
        parameters[data[0]] = data[1];
    }
});
if ("id" in parameters && "rewardId" in parameters && "sons" in parameters) {
    connect();
    loop();
}

async function loop() {
    try {
        if (play) {
            if (sons.length > 0) {
                play = false;
                som(sons[0]);
                sons.shift();
            }
        } else if (audio && audio.ended) {
            play = true;
        }
    } catch (error) {
        play = true;
    }

    setTimeout(() => {
        loop();
    }, 500);
}

function som(name) {
    const site = decodeURIComponent(parameters.sons).replace(/\/$/, '');
    audio = new Audio(`${site}/${encodeURIComponent(name.toLowerCase())}.mp3`);
    const volume = Number (parameters.volume);
    if (volume <= 100 && volume > 0) audio.volume = parameters.volume / 100;
    audio.play();
}

function listen(id) {
    message = {
        type: 'LISTEN',
        data: {
            topics: [`community-points-channel-v1.${id}`]
        }
    };
    try{ 
        ws.send(JSON.stringify(message));
    }catch(e){
        ws.close();
    }
}

function heartbeat() {
    message = {
        type: 'PING'
    };
    console.log('SENT: ' + JSON.stringify(message) + '\n');
    try{ 
        ws.send(JSON.stringify(message));
    }catch(e){
        console.log(e);
    }
}

function connect() {
    const heartbeatInterval = 1000 * 120; 
    const reconnectInterval = 1000 * 3;
    let heartbeatHandle;

    ws = new WebSocket('wss://pubsub-edge.twitch.tv/v1');

    ws.onopen = function(event) {
        console.log('INFO: Socket Opened\n');
        heartbeat();
        listen(parameters.id);
        heartbeatHandle = setInterval(heartbeat, heartbeatInterval);
    };

    ws.onerror = function(error) {
        console.log('ERR:  ' + JSON.stringify(error));
    };

    ws.onmessage = function(event) {
        let mens = JSON.parse(event.data);
        if (mens.type == 'RECONNECT') {
            console.log('INFO: RECONNECT\n');
            ws.close();
        }
        else if (mens.type == 'MESSAGE'){
            const message = JSON.parse(mens.data.message);
            if(message.type == "reward-redeemed" && message.data.redemption.reward.is_user_input_required){
                if (message.data.redemption.reward.id == parameters.rewardId) {
                    try {
                        sons.push(message.data.redemption.user_input);
                    } catch (error) {}
                }
            }
        }
    };
    
    ws.onclose = function() {
        console.log('INFO: Socket Closed\n');
        clearInterval(heartbeatHandle);
        console.log('INFO: Reconnecting...\n');
        setTimeout(connect, reconnectInterval);
    };
    
}