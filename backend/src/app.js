const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')



const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', require('./routes'));
app.get('/hi',(req,res)=>{
  res.json({
    msg : "hi"
  })
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;