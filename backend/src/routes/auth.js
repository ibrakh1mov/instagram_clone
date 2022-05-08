const { regValidation } = require('../middlewares/validation.js')
const controller = require('../controllers/auth.js')
const router = require('express').Router()
const multer = require('multer')
const imageUpload = multer()

router.post('/login', controller.LOGIN)
router.post('/register', imageUpload.single('file'), controller.REGISTER)

module.exports = router