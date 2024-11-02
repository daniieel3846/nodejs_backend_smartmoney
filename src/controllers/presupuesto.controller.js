import getConnection from '../database/database.js';

const obtenerPresupuestos = async (req, res) => {
    const { cedula } = req.query;
    try {
        const connection = await getConnection();
        const [presupuestos] = await connection.query(
            `SELECT p.PresupuestoID, p.Monto, p.Mes, p.Año, c.NombreCategoria 
            FROM Presupuestos p JOIN Categorias c ON p.CategoriaID = c.CategoriaID WHERE p.Cedula = ?`, 
            [cedula]);
        res.status(200).json(presupuestos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener presupuestos" });
    }
};

const crearPresupuesto = async (req, res) => {
    const { Cedula, CategoriaID, Monto } = req.body;
    const fechaActual = new Date();
    const Mes = fechaActual.getMonth() + 1;
    const Año = fechaActual.getFullYear();

    try {
        const connection = await getConnection();
        const result = await connection.query(
            'INSERT INTO Presupuestos (Cedula, CategoriaID, Monto, Mes, Año) VALUES (?, ?, ?, ?, ?)', 
            [Cedula, CategoriaID, Monto, Mes, Año]);
        res.status(201).json({ message: "Presupuesto creado con éxito", presupuestoId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el presupuesto" });
    }
};

const eliminarPresupuesto = async (req, res) => {
    const { presupuestoId } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('DELETE FROM Presupuestos WHERE PresupuestoID = ?', [presupuestoId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Presupuesto no encontrado" });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el presupuesto" });
    }
};

export { obtenerPresupuestos, crearPresupuesto, eliminarPresupuesto };
