import 'dotenv/config';
import express from 'express';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Wajib kalau di belakang reverse proxy (Nginx, Railway, dsb.) supaya cookie `secure` bisa diset
app.set('trust proxy', 1);

const AllowedOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL_2];

app.use(cors({
  origin: AllowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(routes);
app.use(ErrorHandler);



export default app;