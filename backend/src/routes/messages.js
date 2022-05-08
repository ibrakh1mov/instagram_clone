const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/messages.js')
const router = require('express').Router()
const multer = require('multer')
const postUpload = multer()

router.get('/', checkToken, controller.GET)
router.get('/:messageId', checkToken, controller.GET)
router.post('/', checkToken, postUpload.single('message'), controller.POST)
router.delete('/', checkToken, controller.DELETE)

module.exports = router