import { Router } from "express";
import { metodosUsuario } from "../controllers/usuario.controller.js";
import { metodosTransaccion } from "../controllers/transaccion.controller.js";
import { metodosCategoria } from "../controllers/categoria.controller.js";
//import { obtenerCategorias, crearCategoria, eliminarCategoria } from '../controllers/categoriaController.js';
import { obtenerCuentasBancarias, crearCuentaBancaria, eliminarCuentaBancaria } from '../controllers/cuentabancaria.controller.js';
import { crearMeta, obtenerMetas, eliminarMeta } from '../controllers/meta.controller.js';

import cors from 'cors';
const router = Router();

router.post('/api/Usuario/Login', cors({
    origin: 'http://localhost:8081'
}), metodosUsuario.LoginUsuario);


router.post('/api/Usuario/Register', cors({
    origin: 'http://localhost:8081'
}), metodosUsuario.RegistrarUsuario);

router.get('/api/Usuario/ObtenerCedulaPorEmail',cors({
    origin: 'http://localhost:8081'
}), metodosUsuario.obtenerCedulaPorEmail);


router.post('/api/Transaccion/guardar',cors({
    origin: 'http://localhost:8081'
}), metodosTransaccion.guardarTransaccion);

router.get('/api/Transaccion/mensuales',cors({
    origin: 'http://localhost:8081'
}), metodosTransaccion.getTransaccionesMensuales);

router.get('/api/Transaccion/listar',cors({
    origin: 'http://localhost:8081'
}), metodosTransaccion.getTransacciones);

router.get('/api/Transaccion/exportarPDF', cors({
    origin: 'http://localhost:8081'
}),metodosTransaccion.exportarPDF);

router.get('/api/Categoria/ObtenerCategorias', cors({
    origin: 'http://localhost:8081'
}), metodosCategoria.obtenerCategorias);

router.post('/api/Categoria/Save', cors({
    origin: 'http://localhost:8081'
}), metodosCategoria.crearCategoria);

router.get('/api/CuentasBancarias/ObtenerCuentas', cors({
    origin: 'http://localhost:8081'
}),obtenerCuentasBancarias);

router.post('/api/CuentasBancarias/Save', cors({
    origin: 'http://localhost:8081'
}),crearCuentaBancaria);

router.delete('/api/CuentasBancarias/Delete/:cuentaId', cors({
    origin: 'http://localhost:8081'
}), eliminarCuentaBancaria);

router.get('/api/CuentasBancarias/ObtenerMetas', cors({
    origin: 'http://localhost:8081'
}),obtenerMetas);

router.post('/api/CuentasBancarias/Save', cors({
    origin: 'http://localhost:8081'
}),crearMeta);

router.delete('/api/CuentasBancarias/Delete/:metaId', cors({
    origin: 'http://localhost:8081'
}),eliminarMeta);

export default router;