import Toast from "./alerts";
import Swal from "sweetalert2";

const form = document.getElementById("file-form");
const hiddenContainer = document.getElementById("hidden");

const clientsTable = document.getElementById("clientsTable");
const addClientBtn = document.getElementById("add-client-btn");
let clientsData = [];

const transactionData = document.getElementById("transactionData");
const sendButton = form.querySelector('button[type="submit"]');
let transactionsData = [];

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  // Save file info
  const fileInput = form.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  // Make sure we have a file
  if (!file) {
    Toast.warning("You must select a CSV FIle");
    return;
  }

  //Send Data
  await sendTransactionsData(file);

  //Get all data
  await getTransactionsData();
  await getClientsData();

  //Render all data in screen
  renderTransactions();
  renderClients();

  //Make visible tables
  hiddenContainer.classList.remove("hidden");

  //Disable button once he rendered
  sendButton.disabled = true;
});

//Add client btn
addClientBtn.addEventListener("click", async (ev) => {
  ev.preventDefault();
  await addClient();
});

//Clients

//Function to get all clients data
async function getClientsData() {
  try {
    const req = await fetch("http://localhost:3000/clients");
    clientsData = await req.json();

    if (!req.ok) {
      Toast.error("Error to fetch clients");
      return;
    }
  } catch (err) {
    Toast.error("We couldn't get the clients");
    console.error(err);
  }
}

//Function to add client
async function addClient() {
  const { value: formValues } = await Swal.fire({
    title: "Add Client",
    html: `
    <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
      <label for="swal-name">Name</label>
      <input id="swal-name" class="swal2-input">
      <label for="swal-identity">Identity Number</label>
      <input type="number" id="swal-identity" class="swal2-input">
      <label for="swal-address">Address</label>
      <input  id="swal-address" class="swal2-input">
      <label for="swal-email">Email</label>
      <input id="swal-email" class="swal2-input">
      <label for="swal-phone">Phone</label>
      <input id="swal-phone" class="swal2-input">
    </div>
    `,
    preConfirm: () => ({
      name: document.getElementById("swal-name").value,
      identity_number: document.getElementById("swal-identity").value,
      address: document.getElementById("swal-address").value,
      email: document.getElementById("swal-email").value,
      phone: document.getElementById("swal-phone").value,
    }),
  });

  if (
    formValues.name &&
    formValues.identity_number &&
    formValues.address &&
    formValues.email &&
    formValues.phone
  ) {
    const req = await fetch(`http://localhost:3000/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    if (!req.ok) {
      Toast.error("We couldn't add that client, try again later");
    }

    Toast.success("Client added successfully");
    await getClientsData();
    renderClients();
  } else {
    Toast.warning("You must fill all fields");
  }
}

//Function to render clients
function renderClients() {
  //Clean previous table data
  clientsTable.innerHTML = "";

  try {
    //Save clients data as html
    let html = "";

    clientsData.forEach((client) => {
      html += `
      <tr>
        <td>${client.name}</td>
        <td>${client.identity_number}</td>
        <td>${client.address}</td>
        <td>${client.email}</td>
        <td>${client.phone}</td>
        <td>
          <button onclick="editUser('${client.client_id}')">Edit</button>
          <button onclick="deleteUser('${client.client_id}')">Delete</button>
        </td>
      </tr>
  `;
    });

    //Render all html in screen
    clientsTable.innerHTML += html;
  } catch (err) {
    Toast.error("Error to render users");
    console.error("Error to render users", err);
  }
}

//Function to edit client by id
async function editClient(id) {
  const client = clientsData.find((client) => client.client_id == id);
  if (!client) return;

  const { value: formValues } = await Swal.fire({
    title: "Edit Client",
    html: `
    <div style="display:flex; flex-direction:column; align-items:center; text-align:center;">
      <label for="swal-name">Name</label>
      <input id="swal-name" class="swal2-input" value="${client.name}">
      <label for="swal-address">Address</label>
      <input id="swal-address" class="swal2-input" value="${client.address}">
      <label for="swal-email">Email</label>
      <input id="swal-email" class="swal2-input" value="${client.email}">
      <label for="swal-phone">Phone</label>
      <input id="swal-phone" class="swal2-input" value="${client.phone}">
    </div>
    `,
    preConfirm: () => ({
      name: document.getElementById("swal-name").value,
      address: document.getElementById("swal-address").value,
      email: document.getElementById("swal-email").value,
      phone: document.getElementById("swal-phone").value,
    }),
  });

  if (formValues) {
    const req = await fetch(`http://localhost:3000/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    if (!req.ok) {
      Toast.error("We couldn't edit that client, try again later");
    }

    Toast.success("Client edited successfully");
    await getClientsData();
    renderClients();
  }
}

//Function to delete clients by id
async function deleteClient(id) {
  Swal.fire({
    title: "Do you want to delete this client?",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "red",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const req = await fetch(`http://localhost:3000/clients/${id}`, {
          method: "DELETE",
        });

        if (!req.ok) {
          Toast.error("We couldn't delete that client, try again later");
        }
        clientsData = clientsData.filter((client) => client.client_id != id);
        Toast.success("Client deleted successfully");
        renderClients();
      } catch (err) {
        Toast.error("We couldn't delete that client");
        console.error("We couldn't delete that client", err);
      }
    }
  });
}

//Transactions

//Function to get all transaction data from DB
async function getTransactionsData() {
  try {
    const req = await fetch("http://localhost:3000/transactions");
    const data = await req.json();
    transactionsData = data;

    if (!req.ok) {
      Toast.error("Error to fetch data");
      return;
    }

    Toast.info("Wait a second, we are proccessing your data");
  } catch (err) {
    Toast.error("We couldn't get the info");
    console.log("We couldn't get the info, error:", err);
  }
}

//Function to send all loans data as CSV data to DB
async function sendTransactionsData(file) {
  // Make form info
  const formData = new FormData();
  formData.append("fileCSV", file);

  try {
    const req = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      body: formData,
    });

    if (!req.ok) {
      Toast.error("We couldn't process the file");
      return;
    }

    Toast.info("Wait a second, we are proccessing your data");
  } catch (err) {
    Toast.error("We couldn't process the file");
    console.log("We couldn't process the file, error:", err);
  }
}

//Function to delete loan by id
async function deleteTransaction(id) {
  Swal.fire({
    title: "Do you want to delete this transaction?",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "red",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const req = await fetch(`http://localhost:3000/transactions/${id}`, {
          method: "DELETE",
        });

        if (!req.ok) {
          Toast.error("We couldn't delete that transaction, try later");
          return;
        }

        transactionsData = transactionsData.filter((row) => row.id != id);
        Toast.success("Transaction deleted successfully");
        renderTransactions();
      } catch (err) {
        Toast.error("We couldn't delete that transaction");
        console.error("We couldn't delete that transaction", err);
      }
    }
  });
}

//Function to render transactions
function renderTransactions() {
  //Clean previous table data
  transactionData.innerHTML = "";

  try {
    //Save loans data as html
    let html = "";

    transactionsData.forEach((row) => {
      html += `
            <tr>
              <td>${row["transaction_id"]}</td>
              <td>${row["date"]}</td>
              <td>${row["amount"]}</td>
              <td>${row["state"]}</td>
              <td>${row["transaction_type"]}</td>
              <td>${row["client_name"]}</td>
              <td>${row["identity_number"]}</td>
              <td>${row["address"]}</td>
              <td>${row["phone"]}</td>
              <td>${row["email"]}</td>
              <td>${row["platform"]}</td>
              <td>${row["invoice_number"]}</td>
              <td>${row["billing_period"]}</td>
              <td>${row["invoice_amount"]}</td>
              <td>${row["amount_paid"]}</td>
              <td><div>
                  <button onclick="deleteTransaction('${row["id"]}')">Eliminar</button>
              </div></td>
            </tr>
  `;
    });
    //Render all html in screen
    transactionData.innerHTML += html;
  } catch (err) {
    Toast.error("Error to render transactions");
    console.error("Error to render transactions", err);
  }
}

window.editUser = editClient;
window.deleteUser = deleteClient;
window.deleteTransaction = deleteTransaction;
