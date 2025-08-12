import mysql from "mysql2/promise";

//Create a connection to the database
export const pool = mysql.createPool({
    host: "localhost",
    user: 'root',
    port: '3306',
    database: 'pd_willman_giraldo_caiman',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection to the database
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conection to MySQL established successfully');
        connection.release();
    } catch (err) {
        console.error('Failed to connect to MySQL: ', err.message);
    }
})();