const BASE_URL = "http://127.0.0.1:8000/api";

const EXPENSES_URL = `${BASE_URL}/expenses/`;
const AUTH_URL = `${BASE_URL}/auth/`;
const ROOMMATES_URL = `${BASE_URL}/roommates/`;
const SPLITS_URL = `${BASE_URL}/splits/`;
const DEBTS_URL = `${BASE_URL}/debts/`;

type ExpenseData = {
  title: string;
  amount: string | number;
  category: string;
  description?: string;
  payment_method: string;
  date: string;
};

type AuthData = {
  username: string;
  password: string;
};

type SignupData = {
  username: string;
  email: string;
  password: string;
};

type RoommateData = {
  name: string;
  email?: string;
};

type SplitData = {
  title: string;
  amount: string | number;
  paid_by: string;
  participants: string[];
  date?: string;
};

async function request(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Something went wrong");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/* EXPENSE APIs */

export async function getExpenses() {
  return request(EXPENSES_URL);
}

export async function addExpense(expenseData: ExpenseData) {
  return request(EXPENSES_URL, {
    method: "POST",
    body: JSON.stringify(expenseData),
  });
}

export async function updateExpense(id: number, expenseData: ExpenseData) {
  return request(`${EXPENSES_URL}${id}/`, {
    method: "PUT",
    body: JSON.stringify(expenseData),
  });
}

export async function deleteExpense(id: number) {
  return request(`${EXPENSES_URL}${id}/`, {
    method: "DELETE",
  });
}

/* AUTH APIs */

export async function signupUser(signupData: SignupData) {
  return request(`${AUTH_URL}signup/`, {
    method: "POST",
    body: JSON.stringify(signupData),
  });
}

export async function loginUser(authData: AuthData) {
  const data = await request(`${AUTH_URL}login/`, {
    method: "POST",
    body: JSON.stringify(authData),
  });

  if (data.access) {
    localStorage.setItem("accessToken", data.access);
  }

  if (data.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
  }

  return data;
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("accessToken"));
}

/* ROOMMATE APIs */

export async function getRoommates() {
  return request(ROOMMATES_URL);
}

export async function addRoommate(roommateData: RoommateData) {
  return request(ROOMMATES_URL, {
    method: "POST",
    body: JSON.stringify(roommateData),
  });
}

export async function deleteRoommate(id: number) {
  return request(`${ROOMMATES_URL}${id}/`, {
    method: "DELETE",
  });
}

/* SPLIT APIs */

export async function getSplits() {
  return request(SPLITS_URL);
}

export async function createSplit(splitData: SplitData) {
  return request(SPLITS_URL, {
    method: "POST",
    body: JSON.stringify(splitData),
  });
}

export async function deleteSplit(id: number) {
  return request(`${SPLITS_URL}${id}/`, {
    method: "DELETE",
  });
}

/* DEBT APIs */

export async function getDebts() {
  return request(DEBTS_URL);
}

export async function settleDebt(id: number) {
  return request(`${DEBTS_URL}${id}/settle/`, {
    method: "POST",
  });
}