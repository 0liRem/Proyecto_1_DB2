
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/generic.routes'));
app.use('/api/reports', require('./routes/report.routes'));
module.exports = app;