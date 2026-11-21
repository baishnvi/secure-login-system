const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { clientOrigin, trustProxy } = require('./config/env');
const csrf = require('./middleware/csrf');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

if (trustProxy) app.set('trust proxy', trustProxy);
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: clientOrigin, // only the intended frontend - NOT "*"
    credentials: true, // allow the auth cookie
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api', csrf);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
