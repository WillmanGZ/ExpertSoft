import Toast from "./alerts";
import Swal from "sweetalert2";

const form = document.getElementById("file-form");
const hiddenContainer = document.getElementById("hidden");

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

  //Get transactions data
  await getTransactionsData();

  //Render all data in screen
  renderTransactions();

  //Make visible tables
  hiddenContainer.classList.remove("hidden");

  //Disable button once he rendered
  sendButton.disabled = true;
});

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
                  <button onclick="deleteLoan('${row["id_prestamo"]}')">Eliminar</button>
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

//Function to get all loans data from DB
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

        transactionsData = transactionsData.filter(
          (row) => row.trasaction_id != id
        );
        Toast.success("Transaction deleted successfully");
        renderLoans();
      } catch (err) {
        Toast.error("We couldn't delete that transaction");
        console.error("We couldn't delete that transaction", err);
      }
    }
  });
}

window.deleteTransaction = deleteTransaction;
