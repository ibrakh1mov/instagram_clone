const checkToken = require('../middlewares/checkToken.js')
const controller = require('../controllers/likedPost.js')
const router = require('express').Router()

router.get('/', checkToken, controller.GET)
router.get('/:postId', checkToken, controller.GET)
router.post('/', checkToken, controller.LIKE)
router.delete('/', checkToken, controller.UNLIKE)


module.exports = router