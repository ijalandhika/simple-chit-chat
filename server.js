require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var to = require('await-to-js');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var Message = mongoose.model('Message', { 
    name: String, 
    message: String 
});

const mongoHost = process.env.MONGO_DB_HOST;
const mongoUser = process.env.MONGO_DB_USER;
const mongoPass = process.env.MONGO_DB_PASS;
const mongoDb = 'chit-chat'

var dbUrl = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDb}?retryWrites=true&w=majority`;

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    })
});

app.post('/messages', async (req, res) => {
    var message = new Message(req.body);

    var [err, newUser] = await to(message.save());

    if (err) {
        res.sendStatus(500);
        return console.log('error', err);
    }

    io.emit('message', req.body);

    res.sendStatus(200);
});

io.on('connection', () => {
    console.log('a user is connected');
});

mongoose.connect(dbUrl, { useNewUrlParser: true })
.then(() => console.log('Connected to monggo'))
.catch(err => console.log(err));

var server = http.listen(3000, () => {
    console.log('Server is running on port', server.address().port);
});
