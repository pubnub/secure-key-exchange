PUBNUB.bind('load', window, function frontpageDemo() {

  var PUBNUB_demo = PUBNUB.init({
    publish_key: 'demo',
    subscribe_key: 'demo',
    ssl : (('https:' == document.location.protocol) ? true : false)
  });

  PUBNUB_demo.subscribe({
    channel: "demo_channel",
    message: function(m){
      function createDiv(d){
        var newMessage = document.createElement('div');
        newMessage.className = "message " + d.from
        newMessage.innerHTML = d.message
        return newMessage
      }
      document.getElementById('output').innerHTML = JSON.stringify(m,null,'  ');
      document.getElementById('leftMessages').appendChild(createDiv(m));
      document.getElementById('rightMessages').appendChild(createDiv(m));
    }
  });

  var leftSendBtn = document.getElementById('leftSend');
  var rightSendBtn = document.getElementById('rightSend');

  PUBNUB.bind('click', leftSendBtn, function(e) {
    if(document.getElementById('leftValue').value != ''){
      PUBNUB_demo.publish({
        channel: "demo_channel",
        message: {
          message  : document.getElementById('leftValue').value,
          from     : "velvo",
          location : "left"
        }
      });
      document.getElementById('leftValue').value = ''
    }
    return false;
  });

  PUBNUB.bind('click', rightSendBtn, function(e) {
    if(document.getElementById('rightValue').value != ''){
      PUBNUB_demo.publish({
        channel: "demo_channel",
        message: {
          message  : document.getElementById('rightValue').value,
          from     : "derecha",
          location : "right"
        }
      });
      document.getElementById('rightValue').value = ''
    }
    return false;
  });

});
