const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const User = require('./models/User');
const Post = require('./models/Post');
const Message = require('./models/message');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost:27017/microblogging', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, 'SECRET_KEY');
    res.json({ token });
});

app.post('/posts', upload.single('image'), async (req, res) => {
    const { token, content } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const post = new Post({ userId, content });

    if (req.file) {
        post.image = req.file.filename;
    }

    await post.save();
    res.json(post);
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/comments', async (req, res) => {
    const { token, postId, content } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const post = await Post.findById(postId);
    post.comments.push({ userId, content });
    await post.save();
    res.json(post);
});

app.post('/likes', async (req, res) => {
    const { token, postId } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const post = await Post.findById(postId);

    if (post.likes.includes(userId)) {
        post.likes.pull(userId);
    } else {
        post.likes.push(userId);
    }

    await post.save();
    res.json(post);
});

app.post('/updateProfile', upload.single('profilePicture'), async (req, res) => {
    const { token, username, bio } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const user = await User.findById(userId);

    if (req.file) {
        user.profilePicture = req.file.filename;
    }
    if (username) {
        user.username = username;
    }
    if (bio) {
        user.bio = bio;
    }

    await user.save();
    res.json(user);
});

app.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const posts = await Post.find({ userId: user._id }).populate('userId', 'username');
        res.json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('username profilePicture bio');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/addFriend', async (req, res) => {
    const { token, friendId } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await user.save();
    }
    res.json(user);
});

app.post('/removeFriend', async (req, res) => {
    const { token, friendId } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const user = await User.findById(userId);
    if (user.friends.includes(friendId)) {
        user.friends.pull(friendId);
        await user.save();
    }
    res.json(user);
});

// Messaging system
app.post('/sendMessage', async (req, res) => {
    const { token, recipientId, content } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const message = new Message({ sender: userId, recipient: recipientId, content });
    await message.save();
    res.json(message);
});

app.get('/inbox', async (req, res) => {
    const { token } = req.query;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const messages = await Message.find({ recipient: userId }).populate('sender', 'username');
    res.json(messages);
});

app.get('/sent', async (req, res) => {
    const { token } = req.query;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const messages = await Message.find({ sender: userId }).populate('recipient', 'username');
    res.json(messages);
});

app.listen(3000, () => console.log('Server running on port 3000'));
