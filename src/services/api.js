const API_URL = "http://127.0.0.1:8000/api/expenses/";

export async function getExpenses() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function addExpense(expenseData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  return response.json();
}

export async function deleteExpense(id) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  return response;
}