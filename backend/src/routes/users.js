const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/users.js')
const router = require('express').Router()

router.get('/', checkToken, controller.GET)
router.get('/:userId', checkToken, controller.GET)

module.exports = router