var app = require('express')()
var http = require('http').Server(app)
var bodyParser = require('body-parser')
var io = require('socket.io')(http)
var port = Number(process.env.PORT || 2048)

var sockets = []
  , websites = []

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
})

app.use(bodyParser.json())

app.post('/update/website/:id', function (req, res) {
  if (typeof websites[req.params.id] != 'undefined') {
    var subscribers = websites[req.params.id]['subscribers']

    for (var i = subscribers.length - 1; i >= 0; i--) {
      subscribers[i].emit('update', {
        message: req.body
      })
    };
  }

  res.status(200).send({message: 'OK'})
})

io.on('connection', function(socket){
  
  socket.on('subscribe', function(data){
    var website = Number(data.website)

    if(typeof websites[website] != 'undefined') {
      websites[website]['subscribers'].push(socket)
    } else {
      websites[website] = {subscribers: [socket]}
    }
    
    socket.emit('subscribed', {website: website})
  })
})

http.listen(port, function(){
  console.log('listening on *:'+port)
})
