const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');


const sendMessage = asyncHandler(async(req,res) =>{
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
      }

      var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
      };

      try {
        var message = await Message.create(newMessage);
    
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
          path: "chat.users",
          select: "name pic email",
        });
    
        await Chat.findByIdAndUpdate(req.body.chatId, 
            { 
                latestMessage: message
             });
    
        res.json(message);
      } catch (error) {
        res.status(400);
        console.log("chat is not defined");
        
        throw new Error(error.message);
      }



})

const allMessages = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId})
         .populate("sender", "name pic email")
         .populate("chat");
      res.json(messages);
    // res.send(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  const deleteMessage = asyncHandler(async(req,res)=>{
    try {
      const message = await Message.findById(req.params.messageId);
  
  
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      // Check if the user is the sender or an admin
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this message" });
      }
  
      await Message.findByIdAndDelete(req.params.messageId);
      console.log("message delete sucesssfully");
      
  
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

  })




module.exports = {sendMessage,allMessages,deleteMessage};