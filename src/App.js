import React, { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';

import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import { generatePDF } from './service/GeneratePdf';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MemoList />} />
        <Route path="/edit/:id" element={<CashMemo />} />
      </Routes>
    </Router>
  );
}

// Memo List Page
function MemoList() {
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    const savedMemos = JSON.parse(localStorage.getItem('memos')) || [];
    setMemos(savedMemos);
  }, []);

  return (
    <div className="memo-list">
      <h1>Saved Memos</h1>
      {memos.length > 0 ? (
        <ul className="memo-list-items">
          {memos.map((memo, index) => (
            <li key={index} className="memo-item">
              <Link to={`/edit/${index}`} className="memo-link">
                <span className="memo-title">Memo #{index + 1}</span>
                <span className="memo-total">Total: {memo.total}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-memos">No saved memos</p>
      )}
      <Link to="/edit/new">
        <button className="create-memo-btn">Create New Memo</button>
      </Link>
    </div>
  );
}

// Cash Memo Page for Creating/Editing Memos
function CashMemo() {
  const navigate = useNavigate();
  const { id } = useParams(); // Use useParams to get the id from the URL
  const [products, setProducts] = useState([{ name: '', price: 0, quantity: 0 }]);
  const [companyName, setCompanyName] = useState('ABC Company'); // State for company name
  const [showMemo, setShowMemo] = useState(false);

  // Load memo data if editing an existing one
  useEffect(() => {
    const savedMemos = JSON.parse(localStorage.getItem('memos')) || [];
    if (id !== 'new' && savedMemos[id]) {
      setProducts(savedMemos[id].products);
      setCompanyName(savedMemos[id].companyName || 'ABC Company'); // Load company name if available
    }
  }, [id]);

  const handleInputChange = (index, event) => {
    const values = [...products];
    values[index][event.target.name] = event.target.value;
    setProducts(values);
  };

  const addProductRow = () => {
    setProducts([...products, { name: '', price: '', quantity: '' }]);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (parseFloat(product.price || 0) * parseInt(product.quantity || 0));
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = calculateTotal();
    const newMemo = { products, total, companyName }; // Include company name

    // Save or update memo
    const savedMemos = JSON.parse(localStorage.getItem('memos')) || [];
    if (id === 'new') {
      savedMemos.push(newMemo);
    } else {
      savedMemos[id] = newMemo;
    }

    localStorage.setItem('memos', JSON.stringify(savedMemos));
    setShowMemo(true);
  };

  return (
    <div className="App">
      <div className='header-item'>
        <h1 className="app-title">Cash Memo Generator</h1>
        <button className="go-back-button" onClick={() => navigate('/')}>Go Back to Memos List</button>
      </div>
      {!showMemo ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          {products.map((product, index) => (
            <div key={index} className="product-row">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={product.name}
                onChange={(event) => handleInputChange(index, event)}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={product.price}
                onChange={(event) => handleInputChange(index, event)}
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={product.quantity}
                onChange={(event) => handleInputChange(index, event)}
                required
              />
            </div>
          ))}
          <div className="button-container">
            <button type="button" onClick={addProductRow}>Add More Product</button>
            <button type="submit">Generate Memo</button>
          </div>
        </form>
      ) : (
        <div className="memo" id="memo">
            <button className="save-pdf" onClick={()=>generatePDF({ calculateTotal, companyName, products })}>Save as PDF</button>

          <h2>{companyName}</h2>
          <h3>Cash Memo</h3>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{parseFloat(product.price) * parseInt(product.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{textAlign:"right"}}>Total Amount: {calculateTotal()}</h3>

          <div className="signature">
            <p>Signature: ___________________________</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
