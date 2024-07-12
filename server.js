const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const User = require('./models/User');
const Post = require('./models/Post');

mongoose.connect('mongodb://localhost:27017/microblogging');

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

app.post('/posts', async (req, res) => {
    const { token, content } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const post = new Post({ userId, content });
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

app.post('/reactions', async (req, res) => {
    const { token, postId, reaction } = req.body;
    const { userId } = jwt.verify(token, 'SECRET_KEY');
    const post = await Post.findById(postId);
    post.reactions.push({ userId, reaction });
    await post.save();
    res.json(post);
});

app.listen(3000, () => console.log('Server running on port 3000'));
