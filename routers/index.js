
const router = require('express').Router();
const chamCongRouter = require('./cham-cong');

// Define a route for the homepage
router.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

// Define a route for the about page
router.get('/about', (req, res) => {
    res.send('About us');
});

// Export the router
module.exports = router;
