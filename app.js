const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');


app.get('/', (req, res) => {
    res.send('Hi there!')
})

app.listen(3000, () => {
    console.log('Working on port: 3000');
})