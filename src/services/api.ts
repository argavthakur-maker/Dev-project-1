const API_URL = "http://127.0.0.1:8000/api/expenses/";

type ExpenseData = {
  title: string;
  amount: string | number;
  category: string;
  description?: string;
  payment_method: string;
  date: string;
};

export async function getExpenses() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function addExpense(expenseData: ExpenseData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  return response.json();
}

export async function updateExpense(id: number, expenseData: ExpenseData) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  return response.json();
}

export async function deleteExpense(id: number) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  return response;
}