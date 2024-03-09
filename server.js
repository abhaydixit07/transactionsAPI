import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import env from 'dotenv'
import ora from 'ora';

const app = express();
const PORT = 3000;
app.use(bodyParser.json());
env.config();
const SECRET_KEY = process.env.SECRET_KEY; // Replace with a secure secret key


// PostgreSQL configuration
var pool = new pg.Client(process.env.POSTGRESQL_URL);

// Middleware for JSON parsing

const spinner = ora('Connecting to the database...').start();
pool.connect(async function (err) {
    if (err) {
      spinner.fail('Could not connect to the database');
      return console.error('could not connect to postgres', err);
    } else {
      spinner.succeed('Connected to the database');
  
      await pool.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
          spinner.fail('Error running query');
          return console.error('error running query', err);
        }
        console.log(result.rows[0].theTime);
        // >> output: 2018-08-23T14:02:57.117Z
      });
  
      // Start your application after the database connection is established
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  });


// JWT-based authentication middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.sendStatus(401);
    }
  
    const token = authHeader.split(' ')[1]; // Extract the token by removing the "Bearer" prefix
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      req.user = user;
      next();
    });
  };

app.get('/', (req, res)=>{
  res.send("Welcome to transactionsAPI")
})

// Authentication Endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0 || !(await bcrypt.compare(password, user.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a new JWT token upon successful authentication
    const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, SECRET_KEY, { expiresIn: '1h' });
    
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Registration Endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password using bcrypt before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const result = await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);

    // Generate a new JWT token for the newly registered user
    const token = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// RESTful Endpoints for Transactions
app.post('/transactions', authenticateJWT, async (req, res) => {
  try {
    const { description, amount, type } = req.body;
    console.log(authenticateJWT)
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO transactions (user_id, description, amount, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, description, amount, type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/transactions', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1',
      [userId]
    );
    console.log(result.rows)
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/transactions/summary', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const incomeResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_income FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'income']
    );

    const expenseResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_expense FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'expense']
    );

    const savings = incomeResult.rows[0].total_income - expenseResult.rows[0].total_expense;

    res.status(200).json({
      total_income: incomeResult.rows[0].total_income,
      total_expense: expenseResult.rows[0].total_expense,
      savings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/transactions/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    console.log(transactionId,userId)
    await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [transactionId, userId]);

    res.status(200).json({
        message: "Record Deleted Successfully"
      });
      
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
