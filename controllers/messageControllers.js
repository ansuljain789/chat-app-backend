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
    


    
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  });

  // const deleteMessage = asyncHandler(async(req,res)=>{
  //   try {
  //     const message = await Message.findById(req.params.messageId);
  
  
  //     if (!message) {
  //       return res.status(404).json({ message: "Message not found" });
  //     }
  
  //     // Check if the user is the sender or an admin
  //     if (message.sender.toString() !== req.user._id.toString()) {
  //       return res.status(403).json({ message: "Not authorized to delete this message" });
  //     }
  
  //     await Message.findByIdAndDelete(req.params.messageId);
  //     console.log("message delete sucesssfully");
      
  
  //     res.json({ message: "Message deleted successfully" });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }

  // })



  const deleteMessageForMe = asyncHandler(async(req,res)=>{
    try{
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Add user to deletedFor array if not already present
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }
    console.log(message.content);
    
    return res.status(200).json({ message: "Message deleted for you only" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  })

  const deleteMessageForEveryone = asyncHandler(async(req,res)=>{
    try {
      const { messageId } = req.params;
      const userId = req.user._id;
  
      const message = await Message.findById(messageId);
     
      
       
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      

      console.log(message.sender.toString());
      
      const isSender = message.sender.toString() === userId.toString();
      console.log(isSender);
      //  const isAdmin = req.user.role === "admin";
     console.log(isSender);
    
     
      if(message.content=="This message is deleted"){
        console.log("already deleted");
        return res.status(200).json({ message: "Message deleted already" });
      }
      if (isSender) {
        message.isDeletedForEveryone = true;
        console.log(message.content);
        message.content = "This message is deleted"; // Soft delete
        console.log(message.content);
        
        await message.save();
  
        return res.status(200).json({ message: "Message deleted for everyone" });
      } else {
        return res.status(403).json({ error: "Unauthorized to delete for everyone" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  })








module.exports = {sendMessage,allMessages,deleteMessageForMe,deleteMessageForEveryone};