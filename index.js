const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8086;
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
var sizeOf = require('image-size');

var sessions = [];

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use('/cdn', express.static('panel'))

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/panel/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname + '/panel/dashboard.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname + '/panel/upload.html'));
});

app.post('/token', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var accounts = getJson('accounts.json');

  for(i = 0; i < accounts.Accounts.length; i++){
    var account = accounts.Accounts[i];
    if(account.Username == username && account.Password == password){
      var token = maketoken(40);
      sessions.push({Token: token, Expires: 600});
      console.log(sessions);
      res.send({Token: token, Expires: 600});
    }else{
      res.send({Error: true, Detail: "Account does not exist"});
    }
  }
});

app.post('/verify', (req, res) => {
  if(tokenValid(req.body.token)){
    res.send({Valid: true});
  }else{
    res.send({Valid: false});
  }
});

app.get('/imagelist', (req, res) => {
  // if(!tokenValid(req.body.token)){
  //   res.send({Valid: false});
  //   return;
  // }

  var images = [];

  fs.readdir(`${__dirname}/images/`, (err, files) => {
    if(files == undefined || files == null) return [];
    files.forEach(file => {
      var filename = file.replace(/\.[^/.]+$/, "");
      var size = fs.statSync(`${__dirname}/images/${file}`).size;
      var dimensions = sizeOf(`${__dirname}/images/${file}`);
      images.push({id: filename, filename: filename, size: size, dimensions: dimensions});
    });
    res.send(images);
  });
});

app.post('/init_upload', (req, res) => {
  var id = maketoken(5);
  fs.open(`${__dirname}/temp/${id}.txt`, 'w', function(err){
    if(err) throw err;
    res.send({id: id});
  });
});

app.post('/finish_upload', (req, res) => {
  var body = req.body;
  var id = body.id;

  try{
    if(fs.existsSync(`${__dirname}/temp/${id}.txt`)){
      fs.readFile(`${__dirname}/temp/${id}.txt`, function(err, data){
        if(err) throw err;

        var content = data.toString();

        let base64Image = content.split(';base64,').pop();

        fs.writeFile(`${__dirname}/images/${id}.png`, base64Image, {encoding: 'base64'}, function(err) {
          res.send({complete: true})
        });
      });
    }
  }catch(err){
    console.error(err);
  }
})

app.get('/:imageid', (req, res) => {
  var imageid = req.params.imageid;
  if(fs.existsSync(path.join(__dirname + '/images/' + imageid + '.png'))) {
    res.sendFile(path.join(__dirname + '/images/' + imageid + '.png'));
  }else{
    res.send('File does not exist.');
  }
});

app.get('/cdn/:imageid', (req, res) => {
  var imageid = req.params.imageid;
  if(fs.existsSync(path.join(__dirname + '/images/' + imageid + '.png'))) {
    res.sendFile(path.join(__dirname + '/images/' + imageid + '.png'));
  }else{
    res.send('File does not exist.');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    message = message.toString();
    console.log(message);
    if(!message.startsWith('{')){
      console.log(message);
      return;
    }
    var json = JSON.parse(message);
    var id = json.id;
    try{
      if(fs.existsSync(`./temp/${id}.txt`)){
        fs.appendFile(`./temp/${id}.txt`, json.message, function(err){
          if(err) throw err;
        });
      }
    }catch(err){
      console.error(err);
    }
  });

  ws.send('something');
});

function maketoken(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function getJson(file){
  let rawdata = fs.readFileSync(file);
  let parsed = JSON.parse(rawdata);
  return parsed;
}

function saveJson(file, json){
  let data = JSON.stringify(json, null, 2);
  fs.writeFileSync(file, data);
}

function tokenValid(token){
  var response = false;
  for(i = 0; i < sessions.length; i++){
    console.log(sessions[i]);
    if(sessions[i].Token == token){
      response = true;
    }
  }
  return response;
}

async function countdown(){
  for(i = 0; i < sessions.length; i++){
    if(sessions[i].Expires <= 0){
      try {
        sessions.splice(i, 1);
      } catch (e) {
        console.log(e);
      } finally {

      }
    }else{
      sessions[i].Expires--;
    }
  }
  setTimeout(countdown, 1000);
}

countdown()
