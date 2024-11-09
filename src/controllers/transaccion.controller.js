import getConnection from '../database/database.js'
import PDFDocument from 'pdfkit';

const guardarTransaccion = async (req, res) => {
    try {
        const connection = await getConnection();
        const nuevaTransaccion = req.body;
        nuevaTransaccion.fechaTransaccion = new Date();

        // Consultar la cuenta bancaria
        const [cuentaBancaria] = await connection.query(
            'SELECT * FROM CuentasBancarias WHERE CuentaID = ?',
            [nuevaTransaccion.cuentaId]
        );

        if (!cuentaBancaria.length) {
            return res.status(404).json({ error: "Cuenta bancaria no encontrada" });
        }

        // Consultar la categoría
        const [categoria] = await connection.query(
            'SELECT * FROM Categorias WHERE CategoriaID = ?',
            [nuevaTransaccion.categoriaId]
        );

        if (!categoria.length) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // Actualizar el saldo en función del tipo de categoría
        if (nuevaTransaccion.tipoTransaccion === "Ingreso") {
            cuentaBancaria[0].Saldo = parseFloat((parseFloat(cuentaBancaria[0].Saldo) + parseFloat(nuevaTransaccion.monto)).toFixed(2));
        } else if (nuevaTransaccion.tipoTransaccion === "Gasto") {
            if (parseFloat(cuentaBancaria[0].Saldo) >= parseFloat(nuevaTransaccion.monto)) {
                cuentaBancaria[0].Saldo = parseFloat((parseFloat(cuentaBancaria[0].Saldo) - parseFloat(nuevaTransaccion.monto)).toFixed(2));
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
        console.log("SaldoNuevo",cuentaBancaria[0].Saldo);
        console.log("SaldoNuevo", nuevaTransaccion.cuentaId);
        // Actualizar el saldo de la cuenta bancaria
        await connection.query(
            'UPDATE CuentasBancarias SET Saldo = ? WHERE CuentaID = ?',
            [cuentaBancaria[0].Saldo, nuevaTransaccion.cuentaId]
        );

        res.status(200).json(nuevaTransaccion);
    } catch (error) {
        console.error('Error al guardar la transacción:', error);
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

        // Consulta de transacciones en la base de datos
        const [transacciones] = await connection.query(
            'SELECT * FROM Transacciones WHERE Cedula = ? ORDER BY FechaTransaccion DESC',
            [cedula]
        );

        if (!transacciones || transacciones.length === 0) {
            return res.status(404).json({ error: "No se encontraron transacciones para esta cédula" });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();

        // Configuración para que se descargue como PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=transacciones.pdf');

        // Conectar el flujo del PDF a la respuesta
        doc.pipe(res);

        // Título del documento
        doc.fontSize(18).text('Resumen de Transacciones', { align: 'center' });
        doc.moveDown();

        // Información de usuario
        doc.fontSize(12).text(`Cédula: ${cedula}`, { align: 'left' });
        doc.moveDown();

        // Encabezado para las transacciones
        doc.fontSize(14).text('Transacciones', { underline: true });
        doc.moveDown(0.5);

        // Recorrer y añadir transacciones al PDF
        transacciones.forEach((transaccion) => {
            console.log(transaccion);
            const fecha = new Date(transaccion.FechaTransaccion).toLocaleDateString();
            doc.fontSize(12).text(`Fecha: ${fecha}`);
            doc.text(`Tipo: ${transaccion.TipoTransaccion}`);
            doc.text(`Categoría: ${transaccion.CategoriaID}`);
            doc.text(`Monto: $${parseFloat(transaccion.Monto).toFixed(2)}`);
            doc.moveDown();
        });

        // Finalizar el documento PDF
        doc.end();
        
    } catch (error) {
        console.error("Error al exportar PDF:", error);
        res.status(500).json({ error: "Error al exportar las transacciones a PDF" });
    }
};

export const metodosTransaccion = {
    guardarTransaccion,
    getTransaccionesMensuales,
    getTransacciones,
    exportarPDF
};