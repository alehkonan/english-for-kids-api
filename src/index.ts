import express from 'express';
import { SERVER_PORT } from './config';
import dataRouter from './routes/data.routes';
import authRouter from './routes/auth.routes';
import { pool } from './database';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  return next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/data', dataRouter);
app.use('/api/auth', authRouter);

const start = async () => {
  try {
    await pool.connect();
    app.listen(SERVER_PORT, () => {
      console.log(`App listenning at http://localhost:${SERVER_PORT}`);
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

start();
