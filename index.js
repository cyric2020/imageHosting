const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
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

  fs.readdir('./images/', (err, files) => {
    files.forEach(file => {
      var filename = file.replace(/\.[^/.]+$/, "");
      var size = fs.statSync(`./images/${file}`).size;
      var dimensions = sizeOf(`./images/${file}`);
      images.push({id: filename, filename: filename, size: size, dimensions: dimensions});
    });
    res.send(images);
  });
});

app.get('/:imageid', (req, res) => {
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

function maketoken(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?-';
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
    if(sessions.Expires == 0){
      sessions[i].splice(i, 1);
    }else{
      sessions[i].Expires--;
    }
  }
  setTimeout(countdown, 1000);
}

countdown()
