export const navigationItems = [
  'Dashboard',
  'Expenses',
  'Add Expense',
  'Split Expense',
  'Budget',
  'Analytics',
  'Debts & Dues',
  'Reminders',
  'Reports',
  'Profile',
  'Settings',
];

export const summaryCards = [
  {
    title: 'Total Balance',
    value: '₹ 2,450.75',
    subtitle: '↑ 12.5% from last month',
    accent: '#5ce4ff',
  },
  {
    title: 'Total Spent',
    value: '₹ 5,840.50',
    subtitle: '↑ 8.2% from last month',
    accent: '#d973ff',
  },
  {
    title: 'Monthly Budget',
    value: '₹ 10,000.00',
    subtitle: '60% used',
    accent: '#55b0ff',
  },
  {
    title: 'Due to',
    value: '₹ 1,250.00',
    subtitle: 'from 3 people',
    accent: '#2adca3',
  },
];

export const spendingOverview = {
  label: 'This Month',
  points: [0, 220, 310, 450, 560, 700, 630, 760, 820, 910, 1040, 1160, 1230, 1330, 1410, 1500, 1620, 1700, 1810, 1900, 1980, 2050, 2120, 2200, 2280, 2350, 2430, 2510, 2600, 2700, 2840],
  max: 3000,
};

export const categoryBreakdown = [
  { category: 'Food & Mess', amount: '₹ 2,450.00', percent: '41.9%', color: '#4ac7ff' },
  { category: 'Travel', amount: '₹ 1,250.00', percent: '21.4%', color: '#7f7dff' },
  { category: 'Shopping', amount: '₹ 950.00', percent: '16.2%', color: '#ff9ece' },
  { category: 'Laundry', amount: '₹ 600.00', percent: '10.3%', color: '#ffb86c' },
  { category: 'Others', amount: '₹ 590.50', percent: '10.1%', color: '#62e2b7' },
];

export const recentExpenses = [
  { title: 'Mess / Food', value: '₹ 120.00', date: 'Today', icon: '🥗', color: '#5ce4ff' },
  { title: 'Auto / Travel', value: '₹ 80.00', date: 'Today', icon: '🚗', color: '#7f7dff' },
  { title: 'Stationery', value: '₹ 45.00', date: 'Yesterday', icon: '🧾', color: '#ff9ece' },
  { title: 'Laundry', value: '₹ 60.00', date: 'Yesterday', icon: '🧺', color: '#ffb86c' },
  { title: 'Snacks', value: '₹ 35.00', date: '2 days ago', icon: '🍿', color: '#62e2b7' },
];

export const roommates = [
  { name: 'Rohit Singh', amount: '₹ 450.00', status: 'pending', initials: 'R', color: '#ff6c9b' },
  { name: 'Aman Verma', amount: '₹ 350.00', status: 'pending', initials: 'A', color: '#5ce4ff' },
  { name: 'Siddharth', amount: '₹ 450.00', status: 'pending', initials: 'S', color: '#7f7dff' },
];

export const statsCards = [
  { title: 'Average spend per day', value: '₹ 195.42', accent: '#64ffda' },
  { title: 'Savings potential', value: '₹ 3,200', accent: '#ffda6c' },
  { title: 'Recurring bills', value: '4', accent: '#ff8eb7' },
];
