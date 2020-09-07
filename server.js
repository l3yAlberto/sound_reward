var express = require('express');
var app = express();

app.get('/' , (req, res) =>{
    res.sendFile(__dirname+'/index.html');
})

app.get('/index.js', function(req, res) {
    res.sendFile(__dirname+'/index.js');
});

app.listen(3000, function() {
  console.log('App de Exemplo escutando na porta 3000!');
})