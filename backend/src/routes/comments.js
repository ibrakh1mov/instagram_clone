const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/comments.js')
const router = require('express').Router()

router.get('/', controller.GET)
router.post('/', checkToken, controller.POST)
router.delete('/', checkToken, controller.DELETE)

module.exports = router