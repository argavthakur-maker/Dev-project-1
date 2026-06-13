import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  navigationItems,
  roommates as dummy,
  summaryCards,
  spendingOverview,
} from './data/mockData';

import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
  loginUser,
  signupUser,
  logoutUser,
  isLoggedIn,
} from './services/api';

type Expense = {
  id: number;
  title: string;
  amount: string | number;
  category?: string;
  description?: string;
  payment_method?: string;
  date?: string;
};

type SplitRecord = {
  id: number;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
  perPerson: number;
  date: string;
};

type AuthMode = 'login' | 'signup';

type AuthForm = {
  username: string;
  email: string;
  password: string;
};

const navItems = navigationItems;

const SidebarIcon = ({ label }: { label: string }) => {
  const icon = label[0];
  return <div className="sidebar-icon" aria-label={label}>{icon}</div>;
};

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const App = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [backendExpenses, setBackendExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [authenticated, setAuthenticated] = useState(() => isLoggedIn());
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState<AuthForm>({
    username: '',
    email: '',
    password: '',
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return Number(localStorage.getItem('monthlyBudget')) || 10000;
  });

  const [splits, setSplits] = useState<SplitRecord[]>(() => {
    const savedSplits = localStorage.getItem('splitRecords');
    return savedSplits ? JSON.parse(savedSplits) : [];
  });

  const [splitForm, setSplitForm] = useState({
    title: '',
    amount: '',
    paidBy: '',
    participants: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    payment_method: '',
    date: '',
  });

  const totalSpent = backendExpenses.reduce((total, expense) => {
    return total + Number(expense.amount);
  }, 0);

  const budgetUsedPercent = Math.min((totalSpent / monthlyBudget) * 100, 100).toFixed(0);
  const remainingBudget = monthlyBudget - totalSpent;
  const totalTransactions = backendExpenses.length;

  const highestExpense =
    backendExpenses.length > 0
      ? Math.max(...backendExpenses.map((expense) => Number(expense.amount)))
      : 0;

  const averageExpense = totalTransactions > 0 ? totalSpent / totalTransactions : 0;

  const uniqueCategories = [
    'All',
    ...Array.from(new Set(backendExpenses.map((expense) => expense.category || 'Other'))),
  ];

  const filteredExpenses = backendExpenses.filter((expense) => {
    const search = searchTerm.toLowerCase();
    const title = expense.title?.toLowerCase() || '';
    const category = expense.category?.toLowerCase() || '';
    const payment = expense.payment_method?.toLowerCase() || '';

    const matchesSearch =
      title.includes(search) || category.includes(search) || payment.includes(search);

    const matchesCategory =
      categoryFilter === 'All' || (expense.category || 'Other') === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const dynamicCategoryBreakdown = Object.values(
    backendExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      const amount = Number(expense.amount);

      if (!acc[category]) {
        acc[category] = {
          category,
          amount: 0,
          color: '#f6c66f',
        };
      }

      acc[category].amount += amount;
      return acc;
    }, {} as Record<string, { category: string; amount: number; color: string }>)
  ).map((item) => ({
    ...item,
    amountText: `₹ ${item.amount.toFixed(2)}`,
    percent: totalSpent > 0 ? `${((item.amount / totalSpent) * 100).toFixed(0)}%` : '0%',
  }));

  const debtSummary = splits.flatMap((split) =>
    split.participants
      .filter((person) => person.toLowerCase() !== split.paidBy.toLowerCase())
      .map((person) => ({
        id: `${split.id}-${person}`,
        person,
        paidBy: split.paidBy,
        amount: split.perPerson,
        title: split.title,
      }))
  );

  useEffect(() => {
    getExpenses().then((data: Expense[]) => setBackendExpenses(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('splitRecords', JSON.stringify(splits));
  }, [splits]);

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      payment_method: '',
      date: '',
    });
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingExpense) {
      const updatedExpense = await updateExpense(editingExpense.id, formData);

      setBackendExpenses(
        backendExpenses.map((expense) =>
          expense.id === editingExpense.id ? updatedExpense : expense
        )
      );
    } else {
      const newExpense = await addExpense(formData);
      setBackendExpenses([newExpense, ...backendExpenses]);
    }

    resetForm();
    setActiveItem('Dashboard');
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);

    setFormData({
      title: expense.title || '',
      amount: String(expense.amount || ''),
      category: expense.category || '',
      description: expense.description || '',
      payment_method: expense.payment_method || '',
      date: expense.date || '',
    });

    setActiveItem('Add Expense');
  };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    setBackendExpenses(backendExpenses.filter((expense) => expense.id !== id));
  };

  const handleBudgetSave = () => {
    localStorage.setItem('monthlyBudget', String(monthlyBudget));
    alert('Budget saved successfully!');
  };

  const handleSplitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const participants = splitForm.participants
      .split(',')
      .map((person) => person.trim())
      .filter(Boolean);

    if (!splitForm.title || !splitForm.amount || !splitForm.paidBy || participants.length === 0) {
      alert('Please fill all split details.');
      return;
    }

    const amount = Number(splitForm.amount);
    const perPerson = amount / participants.length;

    const newSplit: SplitRecord = {
      id: Date.now(),
      title: splitForm.title,
      amount,
      paidBy: splitForm.paidBy,
      participants,
      perPerson,
      date: new Date().toISOString().slice(0, 10),
    };

    setSplits([newSplit, ...splits]);

    setSplitForm({
      title: '',
      amount: '',
      paidBy: '',
      participants: '',
    });

    setActiveItem('Debts & Dues');
  };

  const handleClearSplit = (id: number) => {
    setSplits(splits.filter((split) => split.id !== id));
  };

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (authMode === 'signup') {
        await signupUser(authForm);
        await loginUser({
          username: authForm.username,
          password: authForm.password,
        });
      } else {
        await loginUser({
          username: authForm.username,
          password: authForm.password,
        });
      }

      setAuthenticated(true);
      setAuthForm({
        username: '',
        email: '',
        password: '',
      });
      setActiveItem('Dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setAuthenticated(false);
    setActiveItem('Dashboard');
  };

  const { linePoints, fillPath } = useMemo(() => {
    const { points, max } = spendingOverview;

    const pairs = points.map((value, index) => {
      const x = Number(((index / (points.length - 1)) * 100).toFixed(2));
      const y = Number((100 - (value / max) * 100).toFixed(2));
      return `${x},${y}`;
    });

    const path = `M${pairs[0]} ${pairs.slice(1).map((point) => `L${point}`).join(' ')} L100,100 L0,100 Z`;

    return { linePoints: pairs.join(' '), fillPath: path };
  }, []);

  const expenseList = activeItem === 'Expenses' ? filteredExpenses : filteredExpenses.slice(0, 5);

  if (!authenticated) {
  return (
    <motion.div
      className="app-shell auth-shell"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.section
        className="panel auth-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          padding: '36px',
          borderRadius: '32px',
        }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
          <div className="brand-card">
            <div className="brand-icon">H</div>
            <div>
              <p className="brand-label">Hosteler&apos;s</p>
              <p className="brand-subtitle">Expense Manager</p>
            </div>
          </div>

          <div className="panel-header">
            <div>
              <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
              <p className="panel-subtitle">
                {authMode === 'login'
                  ? 'Login to manage your hostel expenses.'
                  : 'Signup and start tracking your hostel money.'}
              </p>
            </div>
          </div>

          <form className="add-expense-panel" onSubmit={handleAuthSubmit}>
            <label className="input-field">
              <input
                type="text"
                placeholder=" "
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
              <span>Username</span>
            </label>

            {authMode === 'signup' && (
              <label className="input-field">
                <input
                  type="email"
                  placeholder=" "
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
                <span>Email</span>
              </label>
            )}

            <label className="input-field">
              <input
                type="password"
                placeholder=" "
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
              <span>Password</span>
            </label>

            {authError && <p className="panel-subtitle">{authError}</p>}

            <button className="primary-button" type="submit">
              {authMode === 'login' ? 'Login' : 'Signup'}
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setAuthError('');
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
              }}
            >
              {authMode === 'login'
                ? 'New here? Create an account'
                : 'Already have an account? Login'}
            </button>
          </form>
        </motion.section>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.aside
        className="sidebar"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, x: -22 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
        }}
      >
        <div className="brand-card">
          <div className="brand-icon">H</div>
          <div>
            <p className="brand-label">Hosteler&apos;s</p>
            <p className="brand-subtitle">Expense Manager</p>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <motion.button
              key={item}
              className={`nav-link ${item === activeItem ? 'active' : ''}`}
              onClick={() => setActiveItem(item)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <SidebarIcon label={item} />
              <span>{item}</span>
            </motion.button>
          ))}
        </nav>

        <div className="pro-card">
          <div>
            <p className="pro-title">Go Premium</p>
            <p className="pro-text">Unlock more features and enhance your experience.</p>
          </div>
          <button className="pro-button">Upgrade Now</button>
        </div>

        <button className="danger-button" onClick={handleLogout}>
          Logout
        </button>
      </motion.aside>

      <main className="workspace">
        <motion.header
          className="topbar"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div>
            <h1>Hey, Arjun! <span>👋</span></h1>
            <p>Track. Split. Save. Your hostel money, managed smartly.</p>
          </div>

          <div className="topbar-actions">
            <div className="search-bar">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="profile-card">
              <div>
                <strong>Arjun Kumar</strong>
                <span>2nd Year, CSE</span>
              </div>
              <div className="avatar">A</div>
            </div>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeItem === 'Add Expense' && (
            <motion.form
              className="panel add-expense-panel"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div className="panel-header">
                <div>
                  <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                  <p className="panel-subtitle">
                    {editingExpense
                      ? 'Update your existing expense details.'
                      : 'Capture every spend quickly with a polished expense form.'}
                  </p>
                </div>

                {editingExpense && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      resetForm();
                      setActiveItem('Expenses');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <label className="input-field">
                <input
                  type="text"
                  placeholder=" "
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <span>Title</span>
              </label>

              <div className="form-grid">
                <label className="input-field">
                  <input
                    type="number"
                    placeholder=" "
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                  <span>Amount</span>
                </label>

                <label className="input-field">
                  <input
                    type="text"
                    placeholder=" "
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                  <span>Category</span>
                </label>
              </div>

              <div className="form-grid">
                <label className="input-field">
                  <input
                    type="text"
                    placeholder=" "
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    required
                  />
                  <span>Payment Method</span>
                </label>

                <label className="input-field">
                  <input
                    type="date"
                    placeholder=" "
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                  <span>Date</span>
                </label>
              </div>

              <label className="input-field">
                <textarea
                  placeholder=" "
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <span>Description</span>
              </label>

              <button className="primary-button" type="submit">
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {activeItem === 'Dashboard' && (
          <>
            <section className="summary-grid">
              {summaryCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  className="summary-card"
                  style={{ borderColor: card.accent }}
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                >
                  <div className="summary-card-top">
                    <h2>{card.title}</h2>
                    <span className="card-chip" style={{ background: card.accent }} />
                  </div>

                  <p className="summary-value">
                    {card.title === 'Total Balance'
                      ? `₹ ${remainingBudget.toFixed(2)}`
                      : card.title === 'Total Expenses' || card.title === 'Total Spent'
                      ? `₹ ${totalSpent.toFixed(2)}`
                      : card.title === 'Monthly Budget'
                      ? `₹ ${monthlyBudget.toFixed(2)}`
                      : card.value}
                  </p>

                  <p className="summary-note">
                    {card.title === 'Monthly Budget'
                      ? `${budgetUsedPercent}% used`
                      : card.title === 'Total Balance'
                      ? 'remaining from budget'
                      : card.subtitle}
                  </p>
                </motion.article>
              ))}
            </section>

            <section className="summary-grid">
              <article className="summary-card">
                <h2>Total Transactions</h2>
                <p className="summary-value">{totalTransactions}</p>
                <p className="summary-note">expenses recorded</p>
              </article>

              <article className="summary-card">
                <h2>Highest Expense</h2>
                <p className="summary-value">₹ {highestExpense.toFixed(2)}</p>
                <p className="summary-note">largest single spend</p>
              </article>

              <article className="summary-card">
                <h2>Average Expense</h2>
                <p className="summary-value">₹ {averageExpense.toFixed(2)}</p>
                <p className="summary-note">per transaction</p>
              </article>
            </section>

            <section className="dashboard-grid">
              <section className="panel panel-graph">
                <div className="panel-header">
                  <h3>Spending Overview</h3>
                  <button className="ghost-button">This Month</button>
                </div>

                <div className="line-chart-card">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart">
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#7f7dff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#15172b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline points={linePoints} fill="none" stroke="#7f7dff" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d={fillPath} fill="url(#chart-gradient)" opacity="0.8" />
                  </svg>

                  <div className="line-chart-labels">
                    <span>1 May</span>
                    <span>8 May</span>
                    <span>15 May</span>
                    <span>22 May</span>
                    <span>31 May</span>
                  </div>
                </div>
              </section>

              <section className="panel panel-summary">
                <div className="panel-header">
                  <h3>Recent Expenses</h3>
                  <button className="link-button" onClick={() => setActiveItem('Expenses')}>
                    View All
                  </button>
                </div>

                <div className="list-card">
                  {expenseList.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="expense-item"
                      variants={listItemVariant}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <div className="expense-avatar">💸</div>

                      <div>
                        <p className="expense-title">{item.title}</p>
                        <p className="expense-date">{item.date}</p>
                      </div>

                      <div className="expense-meta">
                        <strong>₹ {item.amount}</strong>
                        <button className="primary-button" onClick={() => handleEditClick(item)}>
                          Edit
                        </button>
                        <button className="danger-button" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="panel panel-breakdown">
                <div className="panel-header">
                  <h3>Category Breakdown</h3>
                  <span>Total ₹ {totalSpent.toFixed(2)}</span>
                </div>

                <div className="donut-chart-card">
                  <div className="donut-chart" aria-hidden="true">
                    <div className="donut-center">₹ {totalSpent.toFixed(2)}</div>
                  </div>

                  <div className="breakdown-list">
                    {dynamicCategoryBreakdown.map((item) => (
                      <div key={item.category} className="breakdown-row">
                        <span className="breakdown-dot" style={{ background: item.color }} />
                        <div>
                          <p>{item.category}</p>
                          <small>{item.amountText}</small>
                        </div>
                        <span>{item.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel panel-progress">
                <div className="panel-header">
                  <h3>Budget Progress</h3>
                </div>

                <div className="budget-card">
                  <div className="budget-ring">
                    <div className="ring-text">{budgetUsedPercent}%<span>Used</span></div>
                  </div>

                  <div className="budget-details">
                    <p><strong>₹ {totalSpent.toFixed(2)}</strong> of ₹ {monthlyBudget.toFixed(2)}</p>
                    <p>Remaining: <strong>₹ {remainingBudget.toFixed(2)}</strong></p>
                    <button className="primary-button" onClick={() => setActiveItem('Budget')}>
                      Manage Budget
                    </button>
                  </div>
                </div>
              </section>

              <section className="panel panel-who">
                <div className="panel-header">
                  <h3>Who Owes You</h3>
                  <button className="link-button" onClick={() => setActiveItem('Debts & Dues')}>
                    View All
                  </button>
                </div>

                <div className="list-card">
                  {debtSummary.length === 0 ? (
                    dummy.map((member, index) => (
                      <motion.div
                        key={member.name}
                        className="debt-item"
                        variants={listItemVariant}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.35, delay: index * 0.06 }}
                      >
                        <div className="profile-circle" style={{ background: member.color }}>
                          {member.initials}
                        </div>

                        <div>
                          <p>{member.name}</p>
                          <small>{member.status}</small>
                        </div>

                        <strong>{member.amount}</strong>
                      </motion.div>
                    ))
                  ) : (
                    debtSummary.slice(0, 3).map((debt, index) => (
                      <motion.div
                        key={debt.id}
                        className="debt-item"
                        variants={listItemVariant}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.35, delay: index * 0.06 }}
                      >
                        <div className="profile-circle">{debt.person[0]}</div>

                        <div>
                          <p>{debt.person}</p>
                          <small>owes {debt.paidBy} for {debt.title}</small>
                        </div>

                        <strong>₹ {debt.amount.toFixed(2)}</strong>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            </section>

            <section className="insight-panel">
              <div>
                <div className="insight-icon">🧠</div>
                <div>
                  <p className="insight-title">AI Insight</p>
                  <p>
                    Your total recorded spending is ₹ {totalSpent.toFixed(2)}. You have ₹ {remainingBudget.toFixed(2)} remaining from your monthly budget.
                  </p>
                </div>
              </div>

              <button className="secondary-button" onClick={() => setActiveItem('Analytics')}>
                View Suggestions
              </button>
            </section>
          </>
        )}

        {activeItem === 'Expenses' && (
          <motion.section className="panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>All Expenses</h3>
                <p className="panel-subtitle">
                  Showing {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="topbar-actions">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="ghost-button"
                >
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button
                  className="primary-button"
                  onClick={() => {
                    resetForm();
                    setActiveItem('Add Expense');
                  }}
                >
                  Add Expense
                </button>
              </div>
            </div>

            <div className="list-card">
              {filteredExpenses.length === 0 ? (
                <p className="panel-subtitle">No expenses found.</p>
              ) : (
                filteredExpenses.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="expense-item"
                    variants={listItemVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                  >
                    <div className="expense-avatar">💸</div>

                    <div>
                      <p className="expense-title">{item.title}</p>
                      <p className="expense-date">
                        {item.category || 'Other'} • {item.payment_method || 'Cash'} • {item.date || 'No date'}
                      </p>
                    </div>

                    <div className="expense-meta">
                      <strong>₹ {item.amount}</strong>
                      <button className="primary-button" onClick={() => handleEditClick(item)}>
                        Edit
                      </button>
                      <button className="danger-button" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        )}

        {activeItem === 'Budget' && (
          <motion.section className="panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>Budget Management</h3>
                <p className="panel-subtitle">Set your monthly spending limit.</p>
              </div>
            </div>

            <div className="budget-card">
              <div className="budget-ring">
                <div className="ring-text">{budgetUsedPercent}%<span>Used</span></div>
              </div>

              <div className="budget-details">
                <label className="input-field">
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    placeholder=" "
                  />
                  <span>Monthly Budget</span>
                </label>

                <p>Total Spent: <strong>₹ {totalSpent.toFixed(2)}</strong></p>
                <p>Remaining: <strong>₹ {remainingBudget.toFixed(2)}</strong></p>

                <button className="primary-button" onClick={handleBudgetSave}>
                  Save Budget
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {activeItem === 'Split Expense' && (
          <motion.form className="panel add-expense-panel" onSubmit={handleSplitSubmit} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>Split Expense</h3>
                <p className="panel-subtitle">Split hostel expenses with roommates.</p>
              </div>
            </div>

            <label className="input-field">
              <input
                type="text"
                placeholder=" "
                value={splitForm.title}
                onChange={(e) => setSplitForm({ ...splitForm, title: e.target.value })}
                required
              />
              <span>Expense title</span>
            </label>

            <div className="form-grid">
              <label className="input-field">
                <input
                  type="number"
                  placeholder=" "
                  value={splitForm.amount}
                  onChange={(e) => setSplitForm({ ...splitForm, amount: e.target.value })}
                  required
                />
                <span>Total amount</span>
              </label>

              <label className="input-field">
                <input
                  type="text"
                  placeholder=" "
                  value={splitForm.paidBy}
                  onChange={(e) => setSplitForm({ ...splitForm, paidBy: e.target.value })}
                  required
                />
                <span>Paid by</span>
              </label>
            </div>

            <label className="input-field">
              <input
                type="text"
                placeholder=" "
                value={splitForm.participants}
                onChange={(e) => setSplitForm({ ...splitForm, participants: e.target.value })}
                required
              />
              <span>Participants comma separated, e.g. Argav, Rohit, Aman</span>
            </label>

            <button className="primary-button" type="submit">
              Split Now
            </button>
          </motion.form>
        )}

        {activeItem === 'Debts & Dues' && (
          <motion.section className="panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>Debts & Dues</h3>
                <p className="panel-subtitle">Track who owes whom after splitting expenses.</p>
              </div>

              <button className="primary-button" onClick={() => setActiveItem('Split Expense')}>
                New Split
              </button>
            </div>

            <div className="list-card">
              {debtSummary.length === 0 ? (
                <p className="panel-subtitle">No split dues yet. Create a split expense first.</p>
              ) : (
                debtSummary.map((debt, index) => (
                  <motion.div
                    key={debt.id}
                    className="debt-item"
                    variants={listItemVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <div className="profile-circle">{debt.person[0]}</div>

                    <div>
                      <p>{debt.person} owes {debt.paidBy}</p>
                      <small>{debt.title}</small>
                    </div>

                    <strong>₹ {debt.amount.toFixed(2)}</strong>
                  </motion.div>
                ))
              )}
            </div>

            <div className="list-card">
              {splits.map((split) => (
                <div key={split.id} className="expense-item">
                  <div>
                    <p className="expense-title">{split.title}</p>
                    <p className="expense-date">
                      Paid by {split.paidBy} • ₹ {split.amount.toFixed(2)} • {split.participants.length} people
                    </p>
                  </div>

                  <button className="danger-button" onClick={() => handleClearSplit(split.id)}>
                    Mark Settled
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {activeItem === 'Analytics' && (
          <motion.section className="panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>Analytics</h3>
                <p className="panel-subtitle">Understand your spending behavior.</p>
              </div>
            </div>

            <section className="summary-grid">
              <article className="summary-card">
                <h2>Total Spent</h2>
                <p className="summary-value">₹ {totalSpent.toFixed(2)}</p>
                <p className="summary-note">all expenses combined</p>
              </article>

              <article className="summary-card">
                <h2>Average Expense</h2>
                <p className="summary-value">₹ {averageExpense.toFixed(2)}</p>
                <p className="summary-note">per transaction</p>
              </article>

              <article className="summary-card">
                <h2>Budget Used</h2>
                <p className="summary-value">{budgetUsedPercent}%</p>
                <p className="summary-note">of monthly budget</p>
              </article>
            </section>

            <div className="breakdown-list">
              {dynamicCategoryBreakdown.map((item) => (
                <div key={item.category} className="breakdown-row">
                  <span className="breakdown-dot" style={{ background: item.color }} />
                  <div>
                    <p>{item.category}</p>
                    <small>{item.amountText}</small>
                  </div>
                  <span>{item.percent}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {activeItem === 'Reports' && (
          <motion.section className="panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}>
            <div className="panel-header">
              <div>
                <h3>Reports</h3>
                <p className="panel-subtitle">Quick financial summary of your hostel expenses.</p>
              </div>
            </div>

            <div className="list-card">
              <div className="expense-item">
                <div>
                  <p className="expense-title">Monthly Budget</p>
                  <p className="expense-date">Your current limit</p>
                </div>
                <strong>₹ {monthlyBudget.toFixed(2)}</strong>
              </div>

              <div className="expense-item">
                <div>
                  <p className="expense-title">Total Spent</p>
                  <p className="expense-date">Backend recorded expenses</p>
                </div>
                <strong>₹ {totalSpent.toFixed(2)}</strong>
              </div>

              <div className="expense-item">
                <div>
                  <p className="expense-title">Remaining Balance</p>
                  <p className="expense-date">Budget left</p>
                </div>
                <strong>₹ {remainingBudget.toFixed(2)}</strong>
              </div>

              <div className="expense-item">
                <div>
                  <p className="expense-title">Split Records</p>
                  <p className="expense-date">Roommate splits created</p>
                </div>
                <strong>{splits.length}</strong>
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </motion.div>
  );
};

export default App;
