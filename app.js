require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const port = 3000;
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
// ... existing imports




const bcrypt = require('bcrypt');
const { spawn } = require('child_process');

// Import your Mongoose models
const Listing = require('./models/listing'); 
const Law = require('./models/law');      
const Review = require('./models/review');  


// ... rest of your code

const sessionSecret = process.env.SESSION_SECRET;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// --- Session Store Setup ---
const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    crypto: { secret: sessionSecret },
    touchAfter: 24 * 3600 // time period in seconds
});

// Handle store errors
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// --- Session Middleware ---
app.use(session({
    store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        rolling: true
    }
}));

// Flash middleware
app.use(flash());

// App Configuration
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Res Locals Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.session.user || null;
    res.locals.path = req.path;
    next();
});

// ... your routes go here ...

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Authentication Middleware
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/login');
    }
    next();
};

const isLoggedInAndAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        req.flash('error', 'You must be an admin to access this page.');
        return res.redirect("/");
    }
    next();
};

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// --- ROUTES ---

// General Routes
app.get('/', (req, res) => res.render("listings/home.ejs"));
app.get('/register', (req, res) => res.render("listings/register.ejs"));
app.get('/about', (req, res) => res.render("listings/about.ejs"));
app.get('/login', (req, res) => res.render("listings/login.ejs"));
app.get('/privacy', (req, res) => res.render("listings/privacy.ejs"));
app.get('/terms', (req, res) => res.render("listings/terms.ejs"));

// User Management Routes
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Listing.findOne({ username: username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            req.flash('success', `Welcome back, ${user.name}!`);
            res.redirect("/");
        } else {
            req.flash('error', 'Invalid username or password.');
            res.redirect("/login");
        }
    } catch (err) {
        console.error("Login error:", err);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect("/login");
    }
});

app.post("/register", async (req, res) => {
    try {
        const newListing = new Listing(req.body);
        await newListing.save();
        req.session.user = newListing;
        req.flash('success', 'Registration successful! You are now logged in.');
        res.redirect("/");
    } catch (err) {
        if (err.code === 11000) {
            req.flash('error', 'Username is already taken. Please choose a different one.');
        } else if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message).join(' ');
            req.flash('error', `Validation failed: ${errors}`);
        } else {
            req.flash('error', 'Registration failed. An unexpected error occurred.');
        }
        res.redirect("/register");
    }
});

app.get('/logout', (req, res) => {
    req.flash('success', 'You have been logged out.');
    req.session.destroy(err => {
        if (err) {
            res.clearCookie('connect.sid');
            return res.redirect("/");
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Username Availability Check
app.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await Listing.findOne({ username: username });
        res.json({ available: !user });
    } catch (err) {
        console.error("Username check error:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Law and Review Routes
app.get('/list', async (req, res) => {
    try {
        const laws = await Law.find({});
        res.render("listings/list.ejs", { laws });
    } catch (err) {
        console.error("Error fetching laws:", err);
        req.flash('error', 'Failed to fetch laws.');
        res.redirect("/");
    }
});

app.get('/law/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const law = await Law.findById(id);
        if (!law) {
            req.flash('error', 'Law not found.');
            return res.redirect("/list");
        }
        res.render("listings/law_details.ejs", { law });
    } catch (err) {
        console.error("Error fetching law details:", err);
        req.flash('error', 'Failed to fetch law details.');
        res.redirect("/list");
    }
});

app.get('/review/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const law = await Law.findById(id);
        if (!law) {
            req.flash('error', 'Law not found.');
            return res.redirect("/list");
        }
        if (law.status === 'Closed') {
            req.flash('error', 'The poll for this law is closed.');
            return res.redirect(`/law/${id}`);
        }

        const existingReview = await Review.findOne({
            lawId: id,
            user: req.session.user._id
        });
        if (existingReview) {
            req.flash('error', 'You have already submitted a review for this law.');
            return res.redirect(`/law/${id}`);
        }
        
        res.render("listings/review.ejs", { law });
    } catch (err) {
        console.error("Error fetching law for review:", err);
        req.flash('error', 'Failed to fetch law for review.');
        res.redirect("/list");
    }
});

app.post('/review/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { review_option, reason, impact, suggestion } = req.body;
        
        const existingReview = await Review.findOne({
            lawId: id,
            user: req.session.user._id
        });
        if (existingReview) {
            req.flash('error', 'You have already submitted a review for this law.');
            return res.redirect(`/law/${id}`);
        }
        
        const newReview = new Review({
            review_option,
            reason,
            impact,
            suggestion,
            lawId: id,
            user: req.session.user._id,
        });

        await newReview.save();
        req.flash('success', 'Review submitted successfully!');
        res.redirect(`/law/${id}`);
    } catch (err) {
        console.error("Error submitting review:", err);
        req.flash('error', 'Failed to submit review. Please check the form data.');
        res.redirect('back');
    }
});

app.get('/add', isLoggedInAndAdmin, (req, res) => res.render("listings/add.ejs"));

app.post('/add-law', isLoggedInAndAdmin, async (req, res) => {
    try {
        const newLaw = new Law(req.body);
        await newLaw.save();
        req.flash('success', 'New law added successfully!');
        res.redirect('/list');
    } catch (err) {
        console.error("Error adding law:", err);
        req.flash('error', 'Failed to add law. Please check the form data.');
        res.redirect('/add');
    }
});

app.delete('/law/:id/delete', isLoggedInAndAdmin, async (req, res) => {
    try {
        await Law.findByIdAndDelete(req.params.id);
        req.flash('success', 'Law deleted successfully!');
        res.redirect('/list');
    } catch (err) {
        console.error("Error deleting law:", err);
        req.flash('error', 'Failed to delete law.');
        res.redirect('/list');
    }
});

app.get('/law/:id/edit', isLoggedInAndAdmin, async (req, res) => {
    try {
        const law = await Law.findById(req.params.id);
        if (!law) {
            req.flash('error', 'Law not found.');
            return res.redirect("/list");
        }
        res.render("listings/edit_law.ejs", { law });
    } catch (err) {
        console.error("Error fetching law for edit:", err);
        req.flash('error', 'Failed to fetch law for editing.');
        res.redirect("/list");
    }
});

app.put('/law/:id', isLoggedInAndAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const oldLaw = await Law.findById(id);

        if (oldLaw.status !== 'On-going' && updatedData.status === 'On-going') {
            updatedData.createdAt = new Date();
        }

        const updatedLaw = await Law.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        
        if (!updatedLaw) {
            req.flash('error', 'Law not found.');
            return res.redirect("/list");
        }
        req.flash('success', 'Law updated successfully!');
        res.redirect(`/law/${id}`);
    } catch (err) {
        console.error("Error updating law:", err);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message).join(' ');
            req.flash('error', `Validation failed: ${errors}`);
        } else {
            req.flash('error', 'Failed to update law. An unexpected error occurred.');
        }
        res.redirect(`/law/${id}/edit`);
    }
});

app.post('/law/:id/generate-report', isLoggedInAndAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const law = await Law.findById(id);
        if (!law) {
            req.flash('error', 'Law not found.');
            return res.redirect("/list");
        }
        if (law.status !== 'Closed') {
            req.flash('error', 'Cannot generate report. The poll for this law is not closed.');
            return res.redirect(`/law/${id}`);
        }

        const reviews = await Review.find({ lawId: id }).populate('user');
        
        const payload = {
            reviews: reviews.map(review => ({
                reason: review.reason,
                gender: review.user.gender,
                age: review.user.age,
                profession: review.user.profession,
                religion: review.user.religion,
                place: review.user.place
            }))
        };
        

      const pythonProcess = spawn('python3', [
    path.join(__dirname, 'sentiment_api', 'sentiment_api.py'),
    JSON.stringify(payload)
   ]);




        let result = '';
        let pythonError = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}`);
                console.error(`Python Error: ${pythonError}`);
                req.flash('error', 'Failed to get analysis from Python service.');
                return res.redirect(`/law/${id}`);
            }

            try {
                const analysisResults = JSON.parse(result);
                // This is the line that populates the law.analysisResults field
                law.analysisResults = analysisResults;
                await law.save();
                req.flash('success', 'Report generated and uploaded successfully!');
                res.redirect(`/law/${id}`);
            } catch (jsonErr) {
                console.error("JSON parsing error:", jsonErr);
                req.flash('error', 'Failed to parse analysis results from Python.');
                res.redirect(`/law/${id}`);
            }
        });

    } catch (err) {
        console.error("Error generating report:", err);
        req.flash('error', 'Failed to generate report. An unexpected error occurred.');
        res.redirect(`/law/${id}`);
    }
});
