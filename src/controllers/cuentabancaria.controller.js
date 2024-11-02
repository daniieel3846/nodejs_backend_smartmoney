import getConnection from '../database/database.js';

const obtenerCuentasBancarias = async (req, res) => {
    const { cedula } = req.query;
    try {
        const connection = await getConnection();
        const [cuentas] = await connection.query('SELECT * FROM CuentasBancarias WHERE Cedula = ?', [cedula]);
        res.status(200).json(cuentas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener cuentas bancarias" });
    }
};

const crearCuentaBancaria = async (req, res) => {
    const { Cedula, NombreBanco, NumeroCuenta, Saldo } = req.body;
    try {
        const connection = await getConnection();
        const result = await connection.query('INSERT INTO CuentasBancarias (Cedula, NombreBanco, NumeroCuenta, Saldo) VALUES (?, ?, ?, ?)', 
            [Cedula, NombreBanco, NumeroCuenta, Saldo || 0.00]);
        res.status(201).json({ message: "Cuenta creada con éxito", cuentaId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error al crear la cuenta bancaria" });
    }
};

const eliminarCuentaBancaria = async (req, res) => {
    const { cuentaId } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('DELETE FROM CuentasBancarias WHERE CuentaID = ?', [cuentaId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Cuenta no encontrada" });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la cuenta bancaria" });
    }
};

export { obtenerCuentasBancarias, crearCuentaBancaria, eliminarCuentaBancaria };
