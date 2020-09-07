// id=481058159&rewardId=6a641a9a-3772-4eff-a4ca-47c9db901217
const parameters = {};
let ws;

location.search.slice(1).split('&').forEach((value, number)=>{
    const data = value.split('=');
    if (data.length > 1) {
        parameters[data[0]] = data[1];
    }
});
console.log(parameters);
if (parameters.id && parameters.rewardId) {
    console.log(parameters);
    connect();
}

function som(name) {
    console.log(name);
    let audio = new Audio(`https://github.com/l3yAlbertoJr/sound/raw/master/${name}.mp3`);
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
    console.log('opa');
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
                        som(message.data.redemption.user_input);
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