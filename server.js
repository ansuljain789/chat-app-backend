const express = require('express');
const cors = require('cors');  // Add this line to import CORS
const app = express();
const chats = require('./data/data');
const userRoutes = require('./Routes/userRoutes')
const chatRoutes= require('./Routes/chatRoutes');
const {notFound,errorHandler} = require('./middleware/errorMiddleware')

const connectDB = require('./config/db');
require('dotenv').config();
connectDB();

app.use(express.json())
// Allow requests from your frontend (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',  // Replace with your frontend URL
  methods: 'GET, POST, PUT, DELETE',  // Define allowed methods
  allowedHeaders: 'Content-Type, Authorization',  // Define allowed headers
}));

app.get('/', (req, res) => {
  res.send('API Running!');
});

// app.get('/api/chat', (req, res) => {
//   res.send(chats);
// });

// app.get('/api/chat/:id', (req, res) => {
//   console.log(req);
//   const singleChat = chats.find((c) => c._id === req.params.id);
//   res.send(singleChat);
// });

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}...`);
});

