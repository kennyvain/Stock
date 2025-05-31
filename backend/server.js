const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // React app address
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'smartpark-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'SIMS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check if database exists, if not create it
async function setupDatabase() {
  try {
    // Create database if not exists
    const tempPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await tempPool.query('CREATE DATABASE IF NOT EXISTS SIMS');

    // Connect to the SIMS database
    const connection = await pool.getConnection();

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Spare_Part table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Spare_Part (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        quantity INT DEFAULT 0,
        unitPrice DECIMAL(10, 2) NOT NULL,
        totalPrice DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unitPrice) STORED,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Stock_In table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Stock_In (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sparePartId INT NOT NULL,
        stockInQuantity INT NOT NULL,
        stockInDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sparePartId) REFERENCES Spare_Part(id) ON DELETE CASCADE
      )
    `);

    // Create Stock_Out table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Stock_Out (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sparePartId INT NOT NULL,
        stockOutQuantity INT NOT NULL,
        stockOutUnitPrice DECIMAL(10, 2) NOT NULL,
        stockOutTotalPrice DECIMAL(10, 2) GENERATED ALWAYS AS (stockOutQuantity * stockOutUnitPrice) STORED,
        stockOutDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sparePartId) REFERENCES Spare_Part(id) ON DELETE CASCADE
      )
    `);

    console.log('Database setup completed');
    connection.release();
  } catch (error) {
    console.error('Database setup error:', error);
  }
}

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    // Validate input
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username already exists
    const [existingUsers] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query(
      'INSERT INTO Users (username, password, fullName) VALUES (?, ?, ?)',
      [username, hashedPassword, fullName]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.fullName = user.fullName;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({
      user: {
        id: req.session.userId,
        username: req.session.username,
        fullName: req.session.fullName
      }
    });
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

// Spare Part Routes
app.post('/api/spare-parts', isAuthenticated, async (req, res) => {
  try {
    const { name, category, quantity, unitPrice } = req.body;

    // Validate input
    if (!name || !category || !quantity || !unitPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert new spare part
    const [result] = await pool.query(
      'INSERT INTO Spare_Part (name, category, quantity, unitPrice) VALUES (?, ?, ?, ?)',
      [name, category, quantity, unitPrice]
    );

    // Update stock in record
    if (quantity > 0) {
      await pool.query(
        'INSERT INTO Stock_In (sparePartId, stockInQuantity) VALUES (?, ?)',
        [result.insertId, quantity]
      );
    }

    res.status(201).json({
      message: 'Spare part added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Add spare part error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/spare-parts', isAuthenticated, async (req, res) => {
  try {
    const [spareParts] = await pool.query('SELECT * FROM Spare_Part ORDER BY createdAt DESC');
    res.status(200).json(spareParts);
  } catch (error) {
    console.error('Get spare parts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
  try {
    const [spareParts] = await pool.query('SELECT * FROM Spare_Part WHERE id = ?', [req.params.id]);

    if (spareParts.length === 0) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    res.status(200).json(spareParts[0]);
  } catch (error) {
    console.error('Get spare part error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stock In Routes
app.post('/api/stock-in', isAuthenticated, async (req, res) => {
  try {
    const { sparePartId, stockInQuantity } = req.body;

    // Validate input
    if (!sparePartId || !stockInQuantity || stockInQuantity <= 0) {
      return res.status(400).json({ message: 'Valid spare part ID and quantity are required' });
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert stock in record
      await connection.query(
        'INSERT INTO Stock_In (sparePartId, stockInQuantity) VALUES (?, ?)',
        [sparePartId, stockInQuantity]
      );

      // Update spare part quantity
      await connection.query(
        'UPDATE Spare_Part SET quantity = quantity + ? WHERE id = ?',
        [stockInQuantity, sparePartId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({ message: 'Stock in recorded successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Stock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stock-in', isAuthenticated, async (req, res) => {
  try {
    const [stockIns] = await pool.query(`
      SELECT si.*, sp.name as sparePartName, sp.category
      FROM Stock_In si
      JOIN Spare_Part sp ON si.sparePartId = sp.id
      ORDER BY si.stockInDate DESC
    `);

    res.status(200).json(stockIns);
  } catch (error) {
    console.error('Get stock in records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stock Out Routes
app.post('/api/stock-out', isAuthenticated, async (req, res) => {
  try {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice } = req.body;

    // Validate input
    if (!sparePartId || !stockOutQuantity || !stockOutUnitPrice || stockOutQuantity <= 0) {
      return res.status(400).json({ message: 'All fields are required and must be valid' });
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if there's enough quantity
      const [spareParts] = await connection.query('SELECT quantity FROM Spare_Part WHERE id = ?', [sparePartId]);

      if (spareParts.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Spare part not found' });
      }

      const sparePart = spareParts[0];

      if (sparePart.quantity < stockOutQuantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Not enough quantity in stock' });
      }

      // Insert stock out record
      await connection.query(
        'INSERT INTO Stock_Out (sparePartId, stockOutQuantity, stockOutUnitPrice) VALUES (?, ?, ?)',
        [sparePartId, stockOutQuantity, stockOutUnitPrice]
      );

      // Update spare part quantity
      await connection.query(
        'UPDATE Spare_Part SET quantity = quantity - ? WHERE id = ?',
        [stockOutQuantity, sparePartId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({ message: 'Stock out recorded successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Stock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stock-out', isAuthenticated, async (req, res) => {
  try {
    const [stockOuts] = await pool.query(`
      SELECT so.*, sp.name as sparePartName, sp.category
      FROM Stock_Out so
      JOIN Spare_Part sp ON so.sparePartId = sp.id
      ORDER BY so.stockOutDate DESC
    `);

    res.status(200).json(stockOuts);
  } catch (error) {
    console.error('Get stock out records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stock-out/:id', isAuthenticated, async (req, res) => {
  try {
    const [stockOuts] = await pool.query(`
      SELECT so.*, sp.name as sparePartName, sp.category
      FROM Stock_Out so
      JOIN Spare_Part sp ON so.sparePartId = sp.id
      WHERE so.id = ?
    `, [req.params.id]);

    if (stockOuts.length === 0) {
      return res.status(404).json({ message: 'Stock out record not found' });
    }

    res.status(200).json(stockOuts[0]);
  } catch (error) {
    console.error('Get stock out record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/stock-out/:id', isAuthenticated, async (req, res) => {
  try {
    const { stockOutQuantity, stockOutUnitPrice } = req.body;
    const stockOutId = req.params.id;

    // Validate input
    if (!stockOutQuantity || !stockOutUnitPrice || stockOutQuantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity and unit price are required' });
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current stock out record
      const [stockOuts] = await connection.query(
        'SELECT * FROM Stock_Out WHERE id = ?',
        [stockOutId]
      );

      if (stockOuts.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Stock out record not found' });
      }

      const currentStockOut = stockOuts[0];
      const quantityDifference = stockOutQuantity - currentStockOut.stockOutQuantity;

      // Check if there's enough quantity if increasing
      if (quantityDifference > 0) {
        const [spareParts] = await connection.query(
          'SELECT quantity FROM Spare_Part WHERE id = ?',
          [currentStockOut.sparePartId]
        );

        if (spareParts[0].quantity < quantityDifference) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Not enough quantity in stock' });
        }
      }

      // Update stock out record
      await connection.query(
        'UPDATE Stock_Out SET stockOutQuantity = ?, stockOutUnitPrice = ? WHERE id = ?',
        [stockOutQuantity, stockOutUnitPrice, stockOutId]
      );

      // Update spare part quantity
      await connection.query(
        'UPDATE Spare_Part SET quantity = quantity - ? WHERE id = ?',
        [quantityDifference, currentStockOut.sparePartId]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: 'Stock out record updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update stock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/stock-out/:id', isAuthenticated, async (req, res) => {
  try {
    const stockOutId = req.params.id;

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current stock out record
      const [stockOuts] = await connection.query(
        'SELECT * FROM Stock_Out WHERE id = ?',
        [stockOutId]
      );

      if (stockOuts.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Stock out record not found' });
      }

      const stockOut = stockOuts[0];

      // Delete stock out record
      await connection.query('DELETE FROM Stock_Out WHERE id = ?', [stockOutId]);

      // Update spare part quantity
      await connection.query(
        'UPDATE Spare_Part SET quantity = quantity + ? WHERE id = ?',
        [stockOut.stockOutQuantity, stockOut.sparePartId]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: 'Stock out record deleted successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Delete stock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report Routes
app.get('/api/reports/daily-stock-out', isAuthenticated, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const [stockOuts] = await pool.query(`
      SELECT
        so.id,
        sp.name as sparePartName,
        sp.category,
        so.stockOutQuantity,
        so.stockOutUnitPrice,
        so.stockOutTotalPrice,
        so.stockOutDate
      FROM Stock_Out so
      JOIN Spare_Part sp ON so.sparePartId = sp.id
      WHERE DATE(so.stockOutDate) = ?
      ORDER BY so.stockOutDate DESC
    `, [date]);

    res.status(200).json(stockOuts);
  } catch (error) {
    console.error('Daily stock out report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/reports/stock-status', isAuthenticated, async (req, res) => {
  try {
    const [stockStatus] = await pool.query(`
      SELECT
        sp.id,
        sp.name,
        sp.category,
        sp.quantity as currentQuantity,
        COALESCE(SUM(si.stockInQuantity), 0) as totalStockIn,
        COALESCE(SUM(so.stockOutQuantity), 0) as totalStockOut
      FROM Spare_Part sp
      LEFT JOIN Stock_In si ON sp.id = si.sparePartId
      LEFT JOIN Stock_Out so ON sp.id = so.sparePartId
      GROUP BY sp.id
      ORDER BY sp.name
    `);

    res.status(200).json(stockStatus);
  } catch (error) {
    console.error('Stock status report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();