const express = require('express');
const morgan = require('morgan');
const analyticsRoutes = require('./routes/analytics.routes');
const path = require('path');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

/* ===========================
   STATIC FRONTEND
=========================== */

app.use(express.static(path.join(__dirname, '../frontend')));

/* ===========================
   API ROUTES
=========================== */

app.use('/api/auth', require('./routes/auth.routes'));

app.use('/api/analytics', analyticsRoutes);

app.use('/api/reports', require('./routes/report.routes'));

app.use('/api/bulk', require('./routes/bulk.routes'));

/* ===========================
   GENERIC ROUTES (AL FINAL)
=========================== */

app.use('/api', require('./routes/generic.routes'));

module.exports = app;