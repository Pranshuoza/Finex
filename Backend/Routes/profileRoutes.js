const express = require('express')
const router = express.Router()
const { getProfile, editProfile, changePassword } = require('../Controller/profileController')

router.get('/', getProfile)
router.post('/edit', editProfile)
router.post('/changePassword', changePassword)

module.exports = router
