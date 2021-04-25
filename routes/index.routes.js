const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  const layout = req.user ? 'layout/auth' : 'layout/noAuth'
  res.render('search', {layout: layout});
});

module.exports = router;
