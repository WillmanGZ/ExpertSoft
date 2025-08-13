-- Create and use database
DROP DATABASE IF EXISTS pd_willman_giraldo_caiman;
CREATE DATABASE pd_willman_giraldo_caiman;
USE pd_willman_giraldo_caiman;

-- Create Clients table
CREATE TABLE clients (
	client_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL UNIQUE,
    identity_number INT UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(30),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Create Invoices table
CREATE TABLE invoices (
	invoice_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL UNIQUE,
    platform ENUM("nequi", "daviplata"),
    invoice_number VARCHAR(15) NOT NULL UNIQUE,
    billing_period VARCHAR(10) NOT NULL,
    invoice_amount FLOAT NOT NULL DEFAULT(0),
    amount_paid FLOAT NOT NULL  DEFAULT(0),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create table Transactions
CREATE TABLE  transactions (
	transaction_id INT UNIQUE AUTO_INCREMENT NOT NULL,
    client_id INT,
    invoice_id INT,
    state ENUM("pending", "completed", "failed"),
    transaction_type ENUM("bill payment"),
    transaction_number VARCHAR(15) UNIQUE NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount FLOAT NOT NULL DEFAULT (0),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices (invoice_id) ON DELETE SET NULL ON UPDATE CASCADE
);