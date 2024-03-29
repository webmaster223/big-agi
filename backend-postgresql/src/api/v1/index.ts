// ensures that all necessary environment variables are defined after reading from .env
import dotenv from 'dotenv-safe';
dotenv.config({ allowEmptyValues: true });
// this package is used to parse decorators for building sql queries.
import 'reflect-metadata';

// Express
import express from 'express';
// Cors
import cors from 'cors';
// Middleware
// import session from './middleware/session';
// Routes
import userRoutes from './routes/userRoutes';
import personaRoutes from './routes/personaRoutes';
import categoryRoutes from './routes/categoryRoutes';
import apikeyRoutes from './routes/apikeyRoutes';
import voiceModelRoutes from './routes/voiceModelRoutes';
// Constants, Helpers & Types
import { API_VERSION, SERVER_PORT, CLIENT_PORT, SERVER_HOST, serverReady } from './constants';
import { postgresConnect } from './helpers';

// server startup
const initializeApp = () => {
  const app = express();

  // enable this if you run behind a proxy (e.g. nginx) for example, rate limiting
  app.enable('trust proxy');

  // setup cors
  app.use(
    cors({
      credentials: true,
      origin: [
        'http://3.13.141.173:3000',
        'https://3.13.141.173:3000',
        'http://127.0.0.1:3000',
        'https://127.0.0.1:3000',
        'http://localhost:3000',
        'https://aitools.lamassucrm.com',
        'https://aitools.lamassucrm.com/',
        'https://aitools.lamassucrm.com:3000',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      optionsSuccessStatus: 204,
    }),
  );

  // middleware that parses json request
  app.use(express.json());

  // session
  // app.use(session);
  // user related routes
  app.use(`${API_VERSION}/user`, userRoutes);
  app.use(`${API_VERSION}/persona`, personaRoutes);
  app.use(`${API_VERSION}/category`, categoryRoutes);
  app.use(`${API_VERSION}/apikey`, apikeyRoutes);
  app.use(`${API_VERSION}/voiceModel`, voiceModelRoutes);

  // restaurant related routes

  // main route server status
  app.get(API_VERSION, (_, res) => res.send(serverReady));

  return app;
};

const startServer = async () => {
  // start database server
  await postgresConnect();

  const app = initializeApp();

  // Modified server startup
  await new Promise<void>((resolve) => app.listen(SERVER_PORT, resolve));

  console.log(serverReady);
};

startServer();
