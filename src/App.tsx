import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  categoryBreakdown,
  navigationItems,
  roommates as dummy,
  summaryCards,
  spendingOverview,
} from './data/mockData';

import { getExpenses, addExpense, deleteExpense } from './services/api';

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
  const [backendExpenses, setBackendExpenses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    payment_method: '',
    date: '',
  });

  const progressPercent = 60;

  const totalSpent = backendExpenses.reduce((total, expense) => {
    return total + Number(expense.amount);
  }, 0);

  useEffect(() => {
    getExpenses().then((data) => setBackendExpenses(data));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newExpense = await addExpense(formData);
    setBackendExpenses([newExpense, ...backendExpenses]);

    setFormData({
      title: '',
      amount: '',
      category: '',
      description: '',
      payment_method: '',
      date: '',
    });

    setActiveItem('Dashboard');
  };

  const handleDelete = async (id: number) => {
    await deleteExpense(id);
    setBackendExpenses(backendExpenses.filter((expense) => expense.id !== id));
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
        variants={{ hidden: { opacity: 0, x: -22 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } } }}
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
              <input type="text" placeholder="Search anything..." />
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
                <h3>Add New Expense</h3>
                <p className="panel-subtitle">Capture every spend quickly with a polished expense form.</p>
              </div>

              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="form-grid">
                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Payment Method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  required
                />

                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <button className="primary-button" type="submit">Add Expense</button>
            </motion.form>
          )}
        </AnimatePresence>

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
                {card.title === 'Total Expenses' || card.title === 'Total Spent'
                  ? `₹ ${totalSpent.toFixed(2)}`
                  : card.value}
              </p>
              <p className="summary-note">{card.subtitle}</p>
            </motion.article>
          ))}
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
              <a className="link-button">View All</a>
            </div>

            <div className="list-card">
              {backendExpenses.map((item, index) => (
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
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="breakdown-row">
                    <span className="breakdown-dot" style={{ background: item.color }} />
                    <div>
                      <p>{item.category}</p>
                      <small>{item.amount}</small>
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
                <div className="ring-text">{progressPercent}%<span>Used</span></div>
              </div>

              <div className="budget-details">
                <p><strong>₹ {totalSpent.toFixed(2)}</strong> of ₹ 10,000.00</p>
                <button className="primary-button">Manage Budget</button>
              </div>
            </div>
          </section>

          <section className="panel panel-who">
            <div className="panel-header">
              <h3>Who Owes You</h3>
              <a className="link-button">View All</a>
            </div>

            <div className="list-card">
              {dummy.map((member, index) => (
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
              ))}
            </div>
          </section>
        </section>

        <section className="insight-panel">
          <div>
            <div className="insight-icon">🧠</div>
            <div>
              <p className="insight-title">AI Insight</p>
              <p>Your total recorded spending is ₹ {totalSpent.toFixed(2)}. Keep tracking daily to stay inside budget.</p>
            </div>
          </div>

          <button className="secondary-button">View Suggestions</button>
        </section>
      </main>
    </motion.div>
  );
};

export default App;