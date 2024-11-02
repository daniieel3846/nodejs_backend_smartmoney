import express from "express";
import morgan from "morgan";
import router from './routes/smartmoney.routes.js';
import cors from 'cors';

const app = express();

//Configuracion puerto
app.set('port', process.env.PORT || 3000);

//Middleware: intermediario entre las peticiones
app.use(morgan('dev'));

app.use(express.json())
//Route crear archivo route single responsibility
//app.get('/saludo', (req,res)=> res.send('ola grupo'));
app.use(router);

//Config CORS
const corsOptions={
    origin: 'http://localhost:8081'
};
app.use(cors(corsOptions));
//Exportar el modulo
export default app;