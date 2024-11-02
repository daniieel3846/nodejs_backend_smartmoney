import getConnection from '../database/database.js';

const crearMeta = async (req, res) => {
    const { Cedula, DescripcionMeta, MontoObjetivo, MontoActual, FechaObjetivo, CuentaID } = req.body;
    try {
        const connection = await getConnection();
        const result = await connection.query(
            'INSERT INTO Metas (Cedula, DescripcionMeta, MontoObjetivo, MontoActual, FechaObjetivo, CuentaID) VALUES (?, ?, ?, ?, ?, ?)', 
            [Cedula, DescripcionMeta, MontoObjetivo, MontoActual || 0.0, FechaObjetivo, CuentaID]);
        res.status(201).json({ message: "Meta creada con éxito", metaId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Error al crear la meta" });
    }
};

const obtenerMetas = async (req, res) => {
    const { cedula } = req.query;
    try {
        const connection = await getConnection();
        const [metas] = await connection.query(
            `SELECT m.MetaID, m.DescripcionMeta, m.MontoObjetivo, m.MontoActual, m.FechaObjetivo, c.NombreBanco 
            FROM Metas m LEFT JOIN CuentasBancarias c ON m.CuentaID = c.CuentaID WHERE m.Cedula = ?`, 
            [cedula]);
        res.status(200).json(metas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener metas" });
    }
};

const eliminarMeta = async (req, res) => {
    const { metaId } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query('DELETE FROM Metas WHERE MetaID = ?', [metaId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Meta no encontrada" });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la meta" });
    }
};

export { crearMeta, obtenerMetas, eliminarMeta };
