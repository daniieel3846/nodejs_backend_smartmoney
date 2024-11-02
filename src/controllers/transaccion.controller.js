import getConnection from '../database/database.js'
import PDFDocument from 'pdfkit';

const guardarTransaccion = async (req, res) => {
    try {
        const connection = await getConnection();
        const nuevaTransaccion = req.body;
        nuevaTransaccion.fechaTransaccion = new Date();

        // Consultar la cuenta bancaria
        const [cuentaBancaria] = await connection.query(
            'SELECT * FROM CuentaBancaria WHERE cuentaId = ?',
            [nuevaTransaccion.cuentaId]
        );

        if (!cuentaBancaria.length) {
            return res.status(404).json({ error: "Cuenta bancaria no encontrada" });
        }

        // Consultar la categoría
        const [categoria] = await connection.query(
            'SELECT * FROM Categoria WHERE categoriaId = ?',
            [nuevaTransaccion.categoriaId]
        );

        if (!categoria.length) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // Actualizar el saldo en función del tipo de categoría
        if (categoria[0].tipoCategoria === "Ingreso") {
            cuentaBancaria[0].saldo += nuevaTransaccion.monto;
        } else if (categoria[0].tipoCategoria === "Gasto") {
            if (cuentaBancaria[0].saldo >= nuevaTransaccion.monto) {
                cuentaBancaria[0].saldo -= nuevaTransaccion.monto;
            } else {
                return res.status(400).json({ error: "Fondos insuficientes" });
            }
        } else {
            return res.status(400).json({ error: "Tipo de categoría no válido" });
        }

        // Insertar la nueva transacción
        await connection.query(
            'INSERT INTO Transacciones SET ?',
            [nuevaTransaccion]
        );

        // Actualizar el saldo de la cuenta bancaria
        await connection.query(
            'UPDATE CuentaBancaria SET saldo = ? WHERE cuentaId = ?',
            [cuentaBancaria[0].saldo, nuevaTransaccion.cuentaId]
        );

        res.status(200).json(nuevaTransaccion);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la transacción" });
    }
};

const getTransaccionesMensuales = async (req, res) => {
    const { cedula } = req.query;
    try {
        const connection = await getConnection();
        const [transaccionesMensuales] = await connection.query(`
            SELECT 
                MONTH(fechaTransaccion) AS mes,
                YEAR(fechaTransaccion) AS anio,
                SUM(CASE WHEN tipoTransaccion = 'Ingreso' THEN monto ELSE 0 END) AS ingresos,
                SUM(CASE WHEN tipoTransaccion = 'Gasto' THEN monto ELSE 0 END) AS gastos
            FROM Transacciones
            WHERE cedula = ?
            GROUP BY mes, anio
            ORDER BY anio ASC, mes ASC
        `, [cedula]);

        res.status(200).json(transaccionesMensuales);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener transacciones mensuales" });
    }
};

const getTransacciones = async (req, res) => {
    const { cedula } = req.query;
    try {
        const connection = await getConnection();
        const [transacciones] = await connection.query(
            'SELECT * FROM Transacciones WHERE cedula = ? ORDER BY fechaTransaccion DESC',
            [cedula]
        );

        res.status(200).json(transacciones);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener transacciones" });
    }
};

const exportarPDF = async (req, res) => {
    const { cedula } = req.query;

    try {
        const connection = await getConnection();

        // Consultar las transacciones en la base de datos
        const [transacciones] = await connection.query(
            'SELECT * FROM Transacciones WHERE Cedula = ? ORDER BY fechaTransaccion DESC',
            [cedula]
        );

        if (transacciones.length === 0) {
            return res.status(404).json({ error: "No se encontraron transacciones para esta cédula" });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();

        // Configurar la respuesta para que se descargue como un archivo PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=transacciones.pdf');

        // Conectar el flujo de datos del PDF a la respuesta
        doc.pipe(res);

        // Título del documento
        doc.fontSize(18).text('Resumen de Transacciones', { align: 'center' });
        doc.moveDown();

        // Información de usuario
        doc.fontSize(12).text(`Cédula: ${cedula}`, { align: 'left' });
        doc.moveDown();

        // Agregar encabezado para las transacciones
        doc.fontSize(14).text('Transacciones', { underline: true });
        doc.moveDown(0.5);

        // Recorrer las transacciones y añadirlas al PDF
        transacciones.forEach((transaccion) => {
            const fecha = new Date(transaccion.fechaTransaccion).toLocaleDateString();
            doc.fontSize(12).text(`Fecha: ${fecha}`);
            doc.text(`Tipo: ${transaccion.tipoTransaccion}`);
            doc.text(`Categoría: ${transaccion.categoriaId}`);
            doc.text(`Monto: $${transaccion.monto.toFixed(2)}`);
            doc.moveDown();
        });

        // Finalizar el documento PDF
        doc.end();

    } catch (error) {
        res.status(500).json({ error: "Error al exportar las transacciones a PDF" });
    }
};

export const metodosTransaccion = {
    guardarTransaccion,
    getTransaccionesMensuales,
    getTransacciones,
    exportarPDF
};