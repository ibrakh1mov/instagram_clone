const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/posts.js')
const router = require('express').Router()
const multer = require('multer')
const postUpload = multer()

router.get('/', checkToken, controller.GET)
router.get('/:postId', checkToken, controller.GET)
router.post('/', checkToken, postUpload.single('post'), controller.POST)
router.put('/', checkToken, controller.PUT)
router.delete('/', checkToken, controller.DELETE)

module.exports = router