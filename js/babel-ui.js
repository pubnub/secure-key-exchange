function babelUI(username) {
    var babe  = new babel(username); // Initialize babe
    var currentRecipient = null; // The current recipient 
    var msgTimes = {}; 

    var printUserNames = function(msg) {
        var noSpace = msg.replace(/ /g, '_');
        $("#userList").append("<div class='user' id='" + noSpace  + "'>" + msg + "</div>");
        if (msg !== username) {
            $("#" + noSpace).click(function(){
                if (msg !== currentRecipient) {
                    if (currentRecipient !== null) {
                        $("#" + encodeURI(currentRecipient.replace(/ /g, "_"))).css("background-color", "");
                    }
                    currentRecipient = msg;
                    $("#" + noSpace).css("background-color", "#F65942");
                    $("#" + noSpace).css("text-decoration", "");
                    loadMessages(msg);
                }
            });
        } else {
            $("#" + noSpace).prepend("&#9733;");
        }
    };


    $("#filter").keyup(function() {presenceHandler()});
    $("#filter").keydown(function() {presenceHandler()});

    var enterHandler = function(e) {
        if (e.keyCode === 13) {
            var myMsg = cleanJS($("#myMessage").text());
            var ttl = $("#TTL").text();
            if (currentRecipient != null && currentRecipient in babe.listUsers() && myMsg.length > 0 && ttl.length > 0) {
                $("#myMessage").text('');
                babe.sendMessage(currentRecipient, myMsg, parseInt(ttl));
            }
        }
    }

    $("#myMessage").keyup(enterHandler);
    $("#TTL").keyup(enterHandler);

    var updateUserList = function(userList) {
        $("#userList").empty();
        for (key in userList) {
            printUserNames(userList[key]);
        }
        $("#" + currentRecipient).css("background-color", "#F65942");
    }

    var presenceHandler = function(m) {
        var userList = Object.keys(babe.listUsers()).sort();
        var filval = $("#filter").text();

        updateUserList( userList.filter(function(m) {return m.indexOf(filval) > -1}));
    }

    var recievedMessage = function(m) {
        if ((m.sender === username && m.recipient === currentRecipient) || (m.sender === currentRecipient && m.recipient === username)) {
            if (!(m.msgID in msgTimes)) {
                msgTimes[m.msgID] = m.TTL;
                $("#messages").append("<div class='" + m.msgID + "'>" + "<div id='" + m.msgID + "'>(<span id='" + m.msgID + "-timer'>" + msgTimes[m.msgID] + "</span>) <strong>" + m.sender + "</strong>: " + cleanJS(m.plaintext) + "<br></div></div>");
                var count = m.TTL;
                function timer() {
                    count = count - 1;
                    if (count <= 0) {
                        $("#" + m.msgID + "-timer").html(count);
                        // $("#" + m.msgID).slideUp();
                        var msgEl = $("#" + m.msgID);
                        msgEl.css("transition", "all 3s ease");
                        msgEl.css({"background-color": "white"});
                        msgEl.addClass("shake shake-constant");
                        var destruction = function() {
                            // msgEl.css("transition", "");
                            // msgEl.removeClass("shake shake-constant");
                            explode(m.msgID);
                        };
                        window.setTimeout(destruction, 2000);

                        // babe.deleteMessage(currentRecipient, m.msgID);
                        delete msgTimes[m.msgID];
                        clearInterval(counter);
                        return;
                    }
                    msgTimes[m.msgID] = count;
                    $("#" + m.msgID + "-timer").html(count);
                    // console.log(count);
                } 
                var counter = setInterval(timer, 1000);
            }
            else {
                $("#messages").append("<div id='" + m.msgID + "'>(<span id='" + m.msgID + "-timer'>" + msgTimes[m.msgID] + "</span>) <strong>" + m.sender + "</strong>: " + cleanJS(m.plaintext) + "<br></div>");
            }
        }
        else {
            var sender = $("#"+encodeURI(m.sender.replace(/ /g, "_")));
            sender.css({"text-decoration" : "underline", "background-color" : "white"});
            setTimeout(function() {
                sender.css("background-color", "");
            }, 1000);

        }
    }

    var loadMessages = function(m) {
        $("#messages").empty();
        var messages = babe.returnMessages()[m];
        if (messages !== undefined) {
            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                recievedMessage(msg);
            };
        }
    }

    babe.onRecieveMessage(recievedMessage);
    babe.onPresence(presenceHandler);
}

var init = false;

function babe_init() {
    var username = cleanHTML($('#username').text());
    init = true;
    if (username.length > 0) {
        $("#messages").text('')
        babe_ui = new babelUI(username);
        $("#login").html("You are logged in as <strong>" + username +"</strong>");
    }
}

$(document).keypress(function (e) {
    if(e.which === 13) return false;
});
$("#username").bind("enterKey", function() {
    babe_init();
});
$('#username').keyup(function(e){
    if(e.keyCode == 13) {$(this).trigger("enterKey");}
});

$("#myMessage").keypress(function(e) {
    if (e.keyCode === 13 && init === false) {
        $("#messages").html('&uarr; Pick a Username first!');
    }
});


function cleanHTML(text) {
    // Sanitize text
    return text.split(' ').map(function (m) {return m.replace(/\W+/g, '')}).join(' ');
}

function cleanJS(text) {
    // Removes <>
    return text.split(' ').map(function (m) {return m.replace(/[<>]/g, '')}).join(' ');
}
