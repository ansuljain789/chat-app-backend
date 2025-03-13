const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {sendMessage,allMessages, deleteMessageForMe,deleteMessageForEveryone} = require('../controllers/messageControllers')
const router = express.Router();


router.route('/').post(protect,sendMessage);
 router.route('/:chatId').get(protect,allMessages);
//  router.route('/:messageId').delete(protect, deleteMessage);

// Delete message for the current user only
router.route('/:messageId/forme').delete(protect,deleteMessageForMe)
// Delete message for everyone (Admin/Sender only)
router.route('/:messageId/foreveryone').delete(protect,deleteMessageForEveryone);





module.exports= router;