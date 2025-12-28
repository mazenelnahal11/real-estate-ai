const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const port = 3001;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// --- Route Registration ---
app.use('/', dashboardRoutes);
app.use('/chat', chatRoutes);

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
