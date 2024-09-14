import React, { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';

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
  const [products, setProducts] = useState([{ name: '', price: '', quantity: '' }]);
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

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Set font and size for company and memo title
    doc.setFont('Arial', 'normal'); // Arial is the default font
    doc.setFontSize(18);
    doc.text(companyName, 105, 20, { align: 'center' }); // Use dynamic company name
    doc.setFontSize(16);
    doc.text('Cash Memo', 105, 30, { align: 'center' });
  
    // Set font size and style for table headers
    doc.setFontSize(12);
    const startX = 20;
    const startY = 50;
    const rowHeight = 10;
    const colWidths = [70, 30, 30, 30]; // Column widths
  
    // Set gray background for header
    doc.setFillColor(220, 220, 220);
  
    // Draw table header with gray background
    doc.rect(startX, startY, colWidths[0], rowHeight, 'F'); // Product Name cell
    doc.rect(startX + colWidths[0], startY, colWidths[1], rowHeight, 'F'); // Price cell
    doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight, 'F'); // Quantity cell
    doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], startY, colWidths[3], rowHeight, 'F'); // Total cell
  
    // Draw borders for the table header
    doc.rect(startX, startY, colWidths[0], rowHeight); // Product Name cell border
    doc.rect(startX + colWidths[0], startY, colWidths[1], rowHeight); // Price cell border
    doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight); // Quantity cell border
    doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], startY, colWidths[3], rowHeight); // Total cell border
  
    // Add text for headers
    doc.setTextColor(0, 0, 0); // Black color
    doc.text('Product Name', startX + 5, startY + 7);
    doc.text('Price', startX + colWidths[0] + 5, startY + 7);
    doc.text('Quantity', startX + colWidths[0] + colWidths[1] + 5, startY + 7);
    doc.text('Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, startY + 7);
  
    // Table rows
    let currentY = startY + rowHeight;
  
    products.forEach((product) => {
      const total = parseFloat(product.price) * parseInt(product.quantity);
  
      // Add product data
      doc.text(product.name, startX + 5, currentY + 7);
      doc.text(product.price.toString(), startX + colWidths[0] + 5, currentY + 7);
      doc.text(product.quantity.toString(), startX + colWidths[0] + colWidths[1] + 5, currentY + 7);
      doc.text(total.toString(), startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 7);
  
      // Draw table row borders
      doc.rect(startX, currentY, colWidths[0], rowHeight); // Product Name cell
      doc.rect(startX + colWidths[0], currentY, colWidths[1], rowHeight); // Price cell
      doc.rect(startX + colWidths[0] + colWidths[1], currentY, colWidths[2], rowHeight); // Quantity cell
      doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], currentY, colWidths[3], rowHeight); // Total cell
  
      currentY += rowHeight; // Move to the next row
    });
  
    // Total amount at the bottom
    doc.setFontSize(12); // Match font size to preview
    doc.text(`Total Amount: ${calculateTotal()}`, startX, currentY + 10);
  
    // Signature line positioned at the bottom right
    doc.setFontSize(12);
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    const signatureY = pageHeight - margin; // Position signature 20 units from bottom
    const signatureX = doc.internal.pageSize.width - margin; // Position signature 20 units from right
    doc.text('Signature: ___________________________', signatureX, signatureY, { align: 'right' });
  
    // Save the PDF
    doc.save('cash-memo.pdf');
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
          <button className="save-pdf" onClick={generatePDF}>Save as PDF</button>

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
          <h3>Total Amount: {calculateTotal()}</h3>

          <div className="signature">
            <p>Signature: ___________________________</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
