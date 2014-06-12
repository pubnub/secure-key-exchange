# DogeChat

## Asymmetric-Key Exchange and Self-Destructing Messages with PubNub

Use PubNub and Public-key cryptography to send encrypted self-destructing messages.

### Live Demo

Check out <http://temp.com> for a live demo. 

### Walkthrough

#### 1. First Steps
DogeChat is built on [PubNub](http://www.pubnub.com/), so first, let's include the PubNub JavaScript SDK.

	<script src=http://cdn.pubnub.com/pubnub.min.js ></script>
	
The DogeChat user interface also uses [jQuery](http://jquery.com/), [Bootstrap](http://getbootstrap.com/), [CSShake](http://elrumordelaluz.github.io/csshake/) and [Cryptico](http://wwwtyro.github.io/cryptico/). However, if you only want to do Public-Key exchange, you only need PubNub.

#### 2. `dogekeyexchange.js`

`dogekeyexchange.js` provides an easy to use way to exchange Public-Keys between two JavaScript clients. 




##### Key Generation
Now we can generate our 1024-bit RSA keys.
	
	

	var RSAkey = cryptico.generateRSAKey(1024);
	var publicKey = cryptico.publicKeyString(RSAkey);

Then let's initialize our PubNub client.
	
	var pubnub = PUBNUB.init({
		publish_key : 'demo',
		subscribe_key : 'demo',
		uuid : userName,
		ssl : true
	});
	
`'demo'` should be replaced with your own PubNub `publish_key` and `subscribe_key`, which you can get with your free PubNub [account](http://www.pubnub.com/get-started/).

`userName` should be some unique and identifiable string. By setting `ssl` to `true`, PubNub will be using TLS to transport our data.

##### Key Sharing

Now that we've generated a Public Key and our PubNub client is prepared, we can share our Public Key with others through PubNub.

Let's subscribe to a PubNub channel.

	pubnub.subscribe({
		channel : dogechat,
		callback : function(m) {console.log(m);},
		state : publicKey
	});
	
Our channel name in this case is `dogechat`. When we receive a message we simply print it out. Also, our `state` has been set to our `publicKey`.
<!--`messageHandler` and `presenceHandler` are functions that we can modify later to change what happens on message and presence changes. For now, it suffices for them to simply print out the arguments passed into them.

	function messageHandler(m) {console.log(m);} 
	function presenceHandler(m) {console.log(m);}-->
	
<!--We set our `state` to our `publicKey`.-->

Now we can use PubNub's presence features to see the public keys of other users subscribed to the `dogechat` channel.

	pubnub.here_now({
		channel : dogechat,
		state : true,
		callback : function(m) {console.log(m)}
	});
	
`here_now` prints out a list of uuids along with their state.

	{
	occupancy: 1,
	uuids: [
	    ‘Alice’ : {"Tknd+V5WrBOujZKHUCS2MYZKhwSUr6WhaMkCag4FW2jKhga6xiru6J2CbbCJmGO5cmDSwtBCiUxXG8xDTCk5QblFlEAzA3XUw4mjar+6+7lhmakcLHrialyFQtWfY47zhWhLy3rvSqlHjVLvDOVmewRjHWC9a5SzQq5/YRhw+7E="}
	]
	}

#### 3. `dogechat.js`

`dogechat.js` builds on top of `dogekeyexchange.js` and provides encrypted self-destructing messages. 

