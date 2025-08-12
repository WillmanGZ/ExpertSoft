# Expert Soft

## System Description

This project is a Transaction Magnament System that allows users to manage clients, invoices, and transactions records efficiently. It supports bulk data upload via CSV files and provides advanced queries for transactions analytics.

---

## Instructions to Run the Project

1. **Clone the repository:**
	```sh
	git clone <https://github.com/WillmanGZ/ExpertSoft>
	cd ExpertSoft
	```

2. **Install dependencies:**
	```sh
	npm install
	```

3. **Set up the database:**
	- Make sure you have MySQL installed and running.
	- Execute the SQL script located at `docs/pd_willman_giraldo_caiman.sql` to create the database and tables:

4. **Start the backend server:**
	```sh
	npm run server
	```

5. **Start the frontend (Vite dev server):**
	```sh
	npm run dev
	```
	- Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, [Vite](https://vitejs.dev/)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Other Libraries:** 
  - [SweetAlert2](https://sweetalert2.github.io/) (for alerts)
  - [csv-parser](https://www.npmjs.com/package/csv-parser) (for CSV processing)
  - [Multer](https://www.npmjs.com/package/multer) (for file uploads)
  - [mysql2](https://www.npmjs.com/package/mysql2) (for MySQL connection)
  - [CORS](https://www.npmjs.com/package/cors) (for API permission control)

---

## Normalization Explanation

The database is normalized as follows:

- **Clients Table:** Stores client information.
- **Invoices Table:** Stores invoice details.
- **Transactions Table:** Stores transaction records, referencing clients and invoices via foreign keys.

This structure avoids data redundancy and ensures data integrity through the use of primary and foreign keys.

---

## Instructions for Bulk Upload via CSV

1. Prepare a CSV file with the following columns:
	- ID de la Transacción
	- Fecha y Hora de la Transacción
	- Monto de la Transacción
	- Estado de la Transacción
	- Tipo de Transacción
	- Nombre del Cliente
	- Número de Identificación
	- Dirección
	- Teléfono
	- Correo Electrónico
	- Plataforma Utilizada
	- Número de Factura
	- Periodo de Facturación
	- Monto Facturado
	- Monto Pagado

2. On the main page, use the file upload form to select and upload your CSV file.

3. The system will process the file and populate the database with clients, invoices, and transactions.

---

## Advanced Queries Explanation

The backend provides several advanced endpoints:

- `/clients/total-paid/:id`: Returns the total paid by this client.
- `/invoices/with-delays`: Lists of pending invoices.
- `/transactions/platforms/:id`: Lists transactions filtered by platform (Nequi or Daviplata).

See the root endpoint (`/`) for a full list of available API routes.

---

## Relational Model Screenshot

See [`docs/ExpertSoft DB.png`](docs/ExpertSoft DB.png ) for the relational model diagram.

---

## Developer Information

- **Name:** [Willman Alfredo Giraldo Zambrano]
- **Clan:** [Caiman]
- **Email:** [willman0520@outlook.com]