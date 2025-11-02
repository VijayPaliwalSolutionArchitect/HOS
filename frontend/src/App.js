import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <div className="App">
        <header style={styles.header}>
          <h1>E-commerce Store</h1>
          <nav>
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/checkout" style={styles.link}>Checkout</Link>
          </nav>
        </header>
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <p>&copy; 2024 E-commerce Store. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

const styles = {
  header: {
    backgroundColor: '#282c34',
    padding: '20px',
    color: 'white',
    textAlign: 'center',
  },
  link: {
    color: 'white',
    margin: '0 15px',
    textDecoration: 'none',
  },
  main: {
    minHeight: '70vh',
    padding: '20px',
  },
  footer: {
    backgroundColor: '#282c34',
    padding: '20px',
    color: 'white',
    textAlign: 'center',
  },
};

export default App;
