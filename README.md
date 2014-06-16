# Babel

## Asymmetric-Key Exchange and Self-Destructing Messages with PubNub

Use PubNub and Public-key cryptography to send encrypted self-destructing messages.

### Live Demo

Check out <http://larrywu.com/babel> for a live demo. 

### Walkthrough

#### 1. First Steps
Babel is built with [PubNub](http://www.pubnub.com/), [jQuery](http://jquery.com/), and [Cryptico](http://wwwtyro.github.io/cryptico/). So first, let's include the all the necessary libraries.

	<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
	<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
	<script src="https://rawgit.com/lw7360/babel/gh-pages/js/libs/cryptico.js"></scrip>
	<script src="https://rawgit.com/lw7360/babel/gh-pages/js/babel.js"></script>

#### 2. Public Key Exchange

`babel.js` provides an easy to use way to exchange 1024-bit RSA Public-Keys between two JavaScript clients. 

Just initialize `babel` with a username and call `listUsers()`.

	var babel = new babel('doge');
	
	console.log(babel.listUsers());
	// Prints out something like this:
	// {
	//		"doge": "gOHeQ49y6kT7QvD2wy8aQ0d105lnzheH7pCczGdSBIblYzjYzpzapacns/SnomwRDsTrrm1eTfxh5qJU2tCqYWVA5W3Zh9ChnojFYQ6WBSe+USxFf4/iNYCFwzVmkkehQv5EfIlCxr2o0LaaguHVtPCFb1MUxxPIZRCZFS0J4Os="
	// }

##### Key Generation
First, we have to generate our 1024-bit RSA key. This step is pretty simple with the Cryptico JavaScript library.

	var RSAkey = cryptico.generateRSAKey(1024);
	var publicKey = cryptico.publicKeyString(RSAkey);

Then let's initialize our PubNub client.
	
	var pubnub = PUBNUB.init({
		publish_key : 'demo',
		subscribe_key : 'demo',
		uuid : userName,
		ssl : true
	});
	
`'demo'` can be replaced with your own PubNub `publish_key` and `subscribe_key`, which you can get with your free PubNub [account](http://www.pubnub.com/get-started/).

`userName` should be some unique string that other users will be able to identify you by. By setting `ssl` to `true`, PubNub will be using TLS while transport our data.

##### Key Sharing

Now that we've generated a Public Key and our PubNub client is prepared, we can share our Public Key with others through PubNub.

Let's subscribe to a PubNub channel.

	pubnub.subscribe({
		channel : babel,
		callback : function(m) {},
		state : {username : 'doge', publicKey : publicKey}
	});
	
Our channel name in this case is `babel`. `callback` has been set to do nothing, because for now we don't need to do anything when we receive a message. Our `state` has been set to an object containing our username and publicKey.

Now we can use PubNub's presence features to see the public keys of other users subscribed to the `babel` channel.

	pubnub.here_now({
		channel : babel,
		state : true,
		callback : function(m) {console.log(m)}
	});
	
`here_now` prints out a list of uuids along with their state. Here's an example of what it might print out.

	{
		occupancy: 1,
		uuids: [
	    	‘doge’ : {"Tknd+V5WrBOujZKHUCS2MYZKhwSUr6Wha...SqlHjVLvDOVmewRjHWC9a5SzQq5/YRhw+7E="}
		]
	}

#### 3. Encrypted, Self-Destructing Messages

`babel.js` also has the capabilities to send encrypted  

