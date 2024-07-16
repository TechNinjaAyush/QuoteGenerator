import express from "express";
import ejs from "ejs";
import mysql from "mysql2/promise"; // Using promise-based version
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import cron from "node-cron";
import env from "dotenv"; 
const app = express();
const PORT = 8080; 
const saltRounds = 10;
const maillist = ["ayushkhairnar06@gmail.com"];
env.config();  

// Database connection setup
const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASS, // Replace with your MySQL password
  database: process.env.DATABAS_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connect to the database
db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: AUTH_USER ,
    pass: AUTH_PASSWORD ,
  },
});

// Middleware setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("authentication.ejs");
});

// Registration endpoint
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM UserInfo WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const register_query = "INSERT INTO UserInfo (email, password) VALUES (?, ?)";

    await db.query(register_query, [email, hashedPassword]); // Using await here

    maillist.push(email); // Add email to the maillist array
    console.log("User is registered");
    res.send("Succesfully registered") // Respond with success page
  } catch (err) {
    console.error("Error registering user:", err.message, err.stack);
    res.status(500).send("Internal server error.");
  }
});

// Function to send random quote email
async function sendRandomQuoteEmail(quote) {
  try {
    if (maillist.length === 0) {
      console.log("No emails to send to.");
      return;
    }

    const info = await transporter.sendMail({
      from: '"ayushk 👻" <ayushkhairnar06@gmail.com>',
      to: maillist.join(','),
      subject: "Quote of the day",
      text: quote,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}

// Schedule cron job to send email with random quote every minute
const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The best way to predict the future is to create it. - Abraham Lincoln",
  "It is never too late to be what you might have been. - George Eliot",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
  "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
  "The best revenge is massive success. - Frank Sinatra",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
  "In order to succeed, we must first believe that we can. - Nikos Kazantzakis",
  "If you want to achieve greatness stop asking for permission. - Anonymous",
  "Things work out best for those who make the best of how things work out. - John Wooden",
  "To live a creative life, we must lose our fear of being wrong. - Anonymous",
  "If you are not willing to risk the usual you will have to settle for the ordinary. - Jim Rohn",
  "Trust because you are willing to accept the risk, not because it's safe or certain. - Anonymous",
  "All our dreams can come true if we have the courage to pursue them. - Walt Disney",
];

cron.schedule("0 10 * * * *", async function () {
  try {
    const randomIndex = Math.floor(Math.random() * quotes.length); // Generate random index
    const randomQuote = quotes[randomIndex]; // Get random quote based on random index
    await sendRandomQuoteEmail(randomQuote); // Send email with random quote
  } catch (error) {
    console.error("Failed to extract quotes or send email: ", error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
