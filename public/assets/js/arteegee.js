(function() {

	var peer = null
	var peerId = null
	var conn = null
	var opponent = {
		peerId: null
	}

	function begin() {
		conn.on('data', function(data) {
		})
		conn.on('close', function() {
			
		})
		peer.on('error', function(err) {
			alert(''+err)
		})
	}

	function initialize() {
		peer = new Peer('', {
			host: location.hostname,
			port: location.port || (location.protocol === 'https:' ? 443 : 80),
			path: '/peerjs',
			debug: 3
		})
		peer.on('open', function(id) {
			peerId = id
		})
		peer.on('error', function(err) {
			alert(''+err)
		})

		// Heroku HTTP routing timeout rule (https://devcenter.heroku.com/articles/websockets#timeouts) workaround
		function ping() {
			console.log(peer)
			peer.socket.send({
				type: 'ping'
			})
			setTimeout(ping, 16000)
		}
		ping()
	}

	function start() {
		initialize()
		peer.on('open', function() {
			alert('Ask your friend to join using your peer ID: '+peerId)
		})
		peer.on('connection', function(c) {
			if(conn) {
				c.close()
				return
			}
			conn = c
			turn = true
		})

		peer.on('call', function(call) {
			// Answer the call, providing our mediaStream
			call.answer();
			call.on('stream', function(remoteStream) {
				var video = document.getElementById('video');
				video.srcObject = remoteStream;
				video.play();
			});
		});
	}

	function join() {
		initialize()
		peer.on('open', async function() {
			var destId = prompt("Opponent's peer ID:")
			var videoUrl = prompt('Video url')
			conn = peer.connect(destId, {
				reliable: true
			})

			/* var stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
			}); */

			document.getElementById('video').src = videoUrl;
			await document.getElementById('video').play();
			var stream = document.getElementById('video').captureStream()

			var call = peer.call(destId, stream);

			conn.on('open', function() {
				opponent.peerId = destId
			})
		})
	}

	$('a[href="#start"]').on('click', function(event) {
		event.preventDefault()
		start()
	})
	$('a[href="#join"]').on('click', function(event) {
		event.preventDefault()
		join()
	})

})()
