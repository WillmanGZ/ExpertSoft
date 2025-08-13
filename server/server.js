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

// Endpoint to get all clients
app.get("/clients", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.query("SELECT * FROM clients");
    res.json(result);
  } catch (err) {
    console.error("Error getting clients:", err);
    res.status(500).json({ message: "Error getting clients" });
  } finally {
    if (connection) connection.release();
  }
});

//Special endpoint to the total paid by this client
app.get("/clients/total-paid/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT clients.name, SUM(invoices.amount_paid) AS total_paid FROM clients INNER JOIN transactions ON transactions.client_id = clients.client_id INNER JOIN invoices ON invoices.invoice_id = transactions.invoice_id WHERE clients.client_id = ?;",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Error getting client:", err);
    res.status(500).json({ message: "Error getting client" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to get user by ID
app.get("/clients/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT * FROM clients WHERE client_id = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Error getting client:", err);
    res.status(500).json({ message: "Error getting client" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to create client
app.post("/clients", express.json(), async (req, res) => {
  const { identity_number, name, address, phone, email } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO clients (identity_number, name, address, phone, email) VALUES (?)",
      [[identity_number, name, address, phone, email]]
    );
    res.status(201).json({ message: "Client created successfully" });
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(500).json({ message: "Error creating client" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to update client
app.put("/clients/:id", express.json(), async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, email } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.query(
      `UPDATE clients SET name = ?, address = ?, phone = ?, email = ? WHERE client_id = ${id}`,
      [name, address, phone, email]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client updated successfully" });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ message: "Error updating client" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to delete client
app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "DELETE FROM clients WHERE client_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ message: "Error deleting client" });
  } finally {
    if (connection) connection.release();
  }
});

//Invoices

// Special endpoint to list pending invoices
app.get("/invoices/with-delays", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT transactions.transaction_number, invoices.invoice_number, clients.name, transactions.state FROM transactions INNER JOIN invoices ON invoices.invoice_id = transactions.invoice_id INNER JOIN clients ON clients.client_id = transactions.client_id WHERE transactions.state = 'pending' ORDER BY transactions.transaction_number ASC;"
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "There's no invoices pending" });
    }
    res.json(result);
  } catch (err) {
    console.error("Error getting invoices:", err);
    res.status(500).json({ message: "Error getting invoices" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to get all invoices
app.get("/invoices", async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.query("SELECT * FROM invoices");
    res.json(result);
  } catch (err) {
    console.error("Error getting invoices:", err);
    res.status(500).json({ message: "Error getting invoices" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to get user by ID
app.get("/invoices/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT * FROM invoices WHERE invoice_id = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Error getting invoice:", err);
    res.status(500).json({ message: "Error getting invoice" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to update invoice
app.put("/invoices/:id", express.json(), async (req, res) => {
  const { id } = req.params;
  const { invoice_amount, amount_paid } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.query(
      `UPDATE invoices SET invoice_amount = ?, amount_paid = ? WHERE invoice_id = ${id}`,
      [invoice_amount, amount_paid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice updated successfully" });
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ message: "Error updating invoice" });
  } finally {
    if (connection) connection.release();
  }
});

// Endpoint to delete invoice
app.delete("/invoices/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "DELETE FROM invoices WHERE invoice_id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ message: "Error deleting invoice" });
  } finally {
    if (connection) connection.release();
  }
});

//Transactions

// Endpoint to list transactions filtered by platform (Nequi or Daviplata).
app.get("/transactions/platforms/:name", async (req, res) => {
  const { name } = req.params;

  if (name.toLowerCase() != "nequi" && name.toLowerCase() != "daviplata") {
    return res.status(404).json({ message: "Only nequi or daviplata" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT clients.name, transactions.transaction_number, invoices.invoice_number, invoices.platform FROM transactions INNER JOIN clients ON clients.client_id = transactions.client_id INNER JOIN invoices ON invoices.invoice_id = transactions.invoice_id WHERE platform = ? ORDER BY clients.name ASC;",
      [name.toLowerCase()]
    );
    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: `There's no transactions made in ${name}` });
    }
    res.json(result);
  } catch (err) {
    console.error("Error getting transactions:", err);
    res.status(500).json({ message: "Error getting transactions" });
  } finally {
    if (connection) connection.release();
  }
});

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

// Endpoint to get transaction by id
app.get("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("Error getting transaction:", err);
    res.status(500).json({ message: "Error getting transaction" });
  } finally {
    if (connection) connection.release();
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
