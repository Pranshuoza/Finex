const express = require('express'); 
const router = express.Router();    
const { getTax, addTax, deleteTax, updateTax } =require('../Controller/taxController');

router.get('/', getTax);
router.post('/add', addTax);
router.delete('/delete', deleteTax);
router.put('/update', updateTax);

module.exports = router;