function dogechat(username) {
    var AppName = "doge_chat"; // The name of our web app, which is also going to be the PubNub channel we subscribe to.
    var RSAkey = cryptico.generateRSAKey(1024); // Generating a RSA key with the Cryptico JS library.
    var publicKey = cryptico.publicKeyString(RSAkey); // Grabbing the public portion of the RSAkey we just generated.
    var myUser = {
        username: username,
        publicKey: publicKey
    }; // Create a user object that contains our username and public key.
    var users = {}; // An object that contains all the users subscribed to the channel.
    var messages = {}; // An object that contains received messages.

    var messageHandler = function (msg) {
        // 'messageHandler' is called whenever a message is received.
        // If the recipient of the message is this user, it will decrypt
        // and store the message inside the messages object, then call 'receiveMessage' with the decrypted message.
        if (msg.recipient === username) {
            var plaintext = cryptico.decrypt(msg.message.cipher, RSAkey).plaintext;
            parsedMsg = {
                msgID: msg.msgID,
                plaintext: plaintext,
                TTL: msg.ttl,
                sender: msg.sender,
                recipient: msg.recipient
            };

            if (messages[msg.sender] === undefined) {
                messages[msg.sender] = [parsedMsg];
            } else {
                messages[msg.sender].push(parsedMsg);
            }
            receiveMessage(parsedMsg);
        }
    };

    var presenceHandler = function (msg) {
        if (msg.action === "join" || msg.action === "state-change") {
            if ("data" in msg) { // if the presence message contains data aka state, add this to our users object. 
                users[msg.data.username] = msg.data.publicKey;
            } else { // otherwise, we have to call 'here_now' to get the state of the new subscriber to the channel.
                pubnub.here_now({
                    channel: AppName,
                    state: true,
                    callback: herenowUpdate,
                });
            }
            presenceChange();
        } else if (msg.action === "timeout" || msg.action === "leave") {
            // A user has left or timed out of doge_chat so we remove them from our users object.
            delete users[msg.uuid];
            presenceChange();
        } else {
            // Some other kind of presence event has happened. Might as well check the entire channel.
            pubnub.here_now({
                channel: AppName,
                state: true,
                callback: herenowUpdate,
            });
        }
    };

    var herenowUpdate = function (msg) {
        // This function is only called as a callback to 'here_now'. 
        // It does a complete refresh of our users object.
        users = {};
        for (var i = 0; i < msg.uuids.length; i++) {
            if ("state" in msg.uuids[i]) {
                users[msg.uuids[i].state.username] = msg.uuids[i].state.publicKey;
            }
        }
        presenceChange();
    };

    var receiveMessage;
    var presenceChange;
    // 'receiveMessage' and 'presenceChange' are called when a message intended for the user is received
    // and when someone connects to or leaves the PubNub channel. They are able to be changed
    // from outside the object with 'onRecieveMessage' and 'onPresence' respectively.


    var pubnub = PUBNUB.init({
        publish_key: 'demo', // Change to your PubNub publish_key
        subscribe_key: 'demo', // Change to your PubNub subscribe_key
        uuid: username,
        ssl: true,
    });

    pubnub.subscribe({
        channel: AppName,
        callback: function (m) {
            messageHandler(m);
        },
        presence: function (m) {
            pubnub.here_now({
                channel: AppName,
                state: true,
                callback: herenowUpdate
            });
        },
        connect: function() {
            pubnub.here_now({
                channel: AppName,
                state: true,
                callback: herenowUpdate
            })
        },
        state: myUser, // Set our state to our user object that contains our username and public key.
        heartbeat: 10
    });

    $(window).on("unload", function () {
        pubnub.unsubscribe({
            channel: AppName
        });
    });

    return {
        sendMessage: function (recipient, message, ttl) {
            // recipient = username of the user you are sending your message to.
            // message = the message you are sending.
            // ttl = number of seconds the message should be able to be viewed.
            if (recipient in users) {
                var plaintext = message;
                var recipient_key = users[recipient];
                message = cryptico.encrypt(message, recipient_key);

                pubnub.uuid(function (msgID) {
                    // var msgID = msgID.replace(/-/g,"");
                    pubnub.publish({
                        channel: AppName,
                        message: {
                            recipient: recipient,
                            msgID: msgID,
                            sender: username,
                            message: message,
                            ttl: ttl
                        },
                        callback: function () {
                            parsedMsg = {
                                msgID: msgID,
                                plaintext: plaintext,
                                TTL: ttl,
                                sender: username,
                                recipient: recipient
                            };
                            if (messages[recipient] === undefined) {
                                messages[recipient] = [parsedMsg];
                            } else {
                                messages[recipient].push(parsedMsg);
                            }
                            receiveMessage(parsedMsg);
                        }
                    });
                });
            }
        },
        onRecieveMessage: function (callback) {
            // callback = function that is called on a received message destined for you
            // Received messages have the form message: message: {msgID : msg.msgID, plaintext : plaintext, TTL : msg.ttl, sender : msg.sender, recipient : msg.recipient};
            receiveMessage = callback;
        },
        onPresence: function (callback) {
            // callback = function that is called when a user has joined/left/timedout of the chat
            presenceChange = callback;
        },
        listUsers: function () {
            // Returns all users and their associated public keys
            return users;
        },
        returnMessages: function () {
            // Return all messages.
            return messages;
        },
        deleteMessage: function (userName, msgID) {
            // Delete a message from 'messages' object by the msgID and userName of the conversation.
            if (userName === msgID) {
                for (var i = 0; i < messages[userName].length; i++) {
                    if (messages[userName][i].msgID === msgID) {
                        messages[userName].splice(i, 1);
                        break;
                    }
                }
            }
        },
        myKey: function () {
            // Return your RSAkey.
            return RSAkey;
        },
    };
}