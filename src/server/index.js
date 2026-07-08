import 'dotenv/config';
import express from 'express';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';
import cors from 'cors';

const app = express();

const AllowedOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL_2];

app.use(cors({
  origin: AllowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(routes);
app.use(ErrorHandler);



export default app;