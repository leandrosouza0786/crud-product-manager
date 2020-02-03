const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const department_controller = require('./department_controller');
const product_controller = require('./product_controller');
const app = express();

const moongoosecckey = require ('./mongodb.config.js');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cors());

moongoosecckey.moongoosecckey;

app.use('/departments', department_controller);
app.use('/products', product_controller);

app.listen(3000);