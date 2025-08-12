import express from "express";
import cors from "cors";
import multer from "multer";
import stream from "stream";
import csv from "csv-parser";
import { pool } from "./db.js";

//Create express app
const app = express();

//Middleware
app.use(cors());

//Use multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Use stream to handle buffer data
const bufferStream = stream.Readable;

//List of data
let results = [];

app.get("/transactions", async (req, res) => {
  let connection;

  try {
    //Get pool connection
    connection = await pool.getConnection();

    try {
      //Try to get all transactions in DB
      const [transactions] = await connection.query(
        "SELECT transactions.transaction_id AS id, transactions.transaction_number AS transaction_id, transactions.date AS date, transactions.amount AS amount, transactions.state AS state, transactions.transaction_type AS transaction_type, clients.name AS client_name, clients.identity_number AS identity_number, clients.address AS address, clients.phone AS phone, clients.email AS email, invoices.platform AS platform, invoices.invoice_number AS invoice_number, invoices.billing_period as billing_period, invoices.invoice_amount as invoice_amount, invoices.amount_paid as amount_paid FROM transactions INNER JOIN clients ON clients.client_id = transactions.client_id INNER JOIN invoices ON invoices.invoice_id = transactions.invoice_id ORDER BY transaction_id ASC;"
      );
      res.status(200).json(transactions);
    } catch (err) {
      console.log("Can't get trasactions: ", err);
      res.status(500).json({
        message: "Can't get trasactions",
      });
    }
  } catch (err) {
    console.log("An error occurred while connecting to DB: ", err);
    res.status(500).json({
      message: "An error occurred while connecting to DB",
    });
  } finally {
    connection.release();
  }
});

//Endpoint to upload CSV data
app.post("/transactions", upload.single("fileCSV"), async (req, res) => {
  // Erase old data
  results = [];

  try {
    //Parse CSV
    await new Promise((resolve, reject) => {
      bufferStream
        .from(req.file.buffer)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    //Get pool connection
    const connection = await pool.getConnection();

    try {
      //Start transaction
      await connection.beginTransaction();

      // Insert data
      for (const row of results) {
        // Clients
        const clientQuery = await connection.query(
          "INSERT INTO clients(identity_number, name, address, phone, email) VALUES(?)",
          [
            [
              row["Número de Identificación"],
              row["Nombre del Cliente"],
              row["Dirección"],
              row["Teléfono"],
              row["Correo Electrónico"],
            ],
          ]
        );

        const clientId = await clientQuery[0].insertId;

        //Invoices
        const invoiceQuery = await connection.query(
          "INSERT INTO invoices(platform, invoice_number, billing_period, invoice_amount, amount_paid) VALUES (?)",
          [
            [
              row["Plataforma Utilizada"].toLowerCase(),
              row["Número de Factura"],
              row["Periodo de Facturación"],
              row["Monto Facturado"],
              row["Monto Pagado"],
            ],
          ]
        );

        const invoiceId = await invoiceQuery[0].insertId;

        //Transactions
        let state;

        switch (row["Estado de la Transacción"].toLowerCase()) {
          case "pendiente":
            state = "pending";
            break;
          case "completada":
            state = "completed";
            break;
          case "fallida":
            state = "failed";
            break;
          default:
            state = "pending";
        }

        const transactionQuery = await connection.query(
          "INSERT INTO transactions(client_id, invoice_id, state, transaction_type, transaction_number, date, amount) VALUES (?)",
          [
            [
              clientId,
              invoiceId,
              state,
              "bill payment",
              row["ID de la Transacción"],
              row["Fecha y Hora de la Transacción"],
              row["Monto de la Transacción"],
            ],
          ]
        );
      }

      // Confirm transaction
      await connection.commit();
      res.status(200).json({ message: "Success" });
    } catch (err) {
      // If theres an error, we will cancel transaction
      await connection.rollback();
      console.error("Error to process CSV", err);
      res.status(500).json({ message: "Error to process CSV" });
    } finally {
      // Release connection
      connection.release();
    }
  } catch (err) {
    console.log("An error occurred while processing data: ", err);
    res.status(500).json({
      message:
        "An error occurred while processing data. No changes have been saved",
    });
  }
});

// Endpoint to delete transaction by id
app.delete("/transactions/:id", async (req, res) => {
  const transactionId = req.params.id;
  let connection;

  try {
    // Get pool connection
    connection = await pool.getConnection();

    const [result] = await connection.query(
      "DELETE FROM transactions WHERE transaction_id = ?",
      [transactionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err.message);
    res.status(500).json({
      message:
        "An error occurred while deleting the transaction. No changes have been made.",
    });
  } finally {
    if (connection) connection.release();
  }
});

app.listen(3000, () => {
  console.log("App listening at port 3000");
});
