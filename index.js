const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

app.use('/cdn', express.static('panel'))

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/panel/login.html'));
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
