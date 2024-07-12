let token = '';

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => alert(data.message));
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            token = data.token;
            document.querySelector('.auth-forms').style.display = 'none';
            document.querySelector('.post-form').style.display = 'flex';
            loadPosts();
        } else {
            alert(data.message);
        }
    });
}

function createPost() {
    const content = document.getElementById('post-content').value;
    if (content.trim() === '') {
        alert('Post content cannot be empty!');
        return;
    }

    fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, content })
    })
    .then(response => response.json())
    .then(post => {
        addPostToFeed(post);
        document.getElementById('post-content').value = '';
    });
}

function loadPosts() {
    fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => {
        const feed = document.getElementById('feed');
        feed.innerHTML = '';
        posts.forEach(post => addPostToFeed(post));
    });
}

function addPostToFeed(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    const postContent = document.createElement('div');
    postContent.className = 'content';
    postContent.textContent = post.content;

    const postTimestamp = document.createElement('div');
    postTimestamp.className = 'timestamp';
    postTimestamp.textContent = new Date(post.timestamp).toLocaleString();

    const commentsDiv = document.createElement('div');
    commentsDiv.className = 'comments';
    post.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.textContent = `${comment.userId.username}: ${comment.content}`;
        commentsDiv.appendChild(commentDiv);
    });

    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'reactions';
    post.reactions.forEach(reaction => {
        const reactionDiv = document.createElement('div');
        reactionDiv.textContent = `${reaction.userId.username} reacted with ${reaction.reaction}`;
        reactionsDiv.appendChild(reactionDiv);
    });

    const commentInput = document.createElement('input');
    commentInput.placeholder = 'Add a comment...';
    const commentButton = document.createElement('button');
    commentButton.textContent = 'Comment';
    commentButton.onclick = () => addComment(post._id, commentInput.value);

    const reactionInput = document.createElement('input');
    reactionInput.placeholder = 'Add a reaction...';
    const reactionButton = document.createElement('button');
    reactionButton.textContent = 'React';
    reactionButton.onclick = () => addReaction(post._id, reactionInput.value);

    postDiv.appendChild(postContent);
    postDiv.appendChild(postTimestamp);
    postDiv.appendChild(commentsDiv);
    postDiv.appendChild(reactionsDiv);
    postDiv.appendChild(commentInput);
    postDiv.appendChild(commentButton);
    postDiv.appendChild(reactionInput);
    postDiv.appendChild(reactionButton);

    const feed = document.getElementById('feed');
    feed.insertBefore(postDiv, feed.firstChild);
}

function addComment(postId, content) {
    fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, postId, content })
    })
    .then(response => response.json())
    .then(post => {
        loadPosts();
    });
}

function addReaction(postId, reaction) {
    fetch('http://localhost:3000/reactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, postId, reaction })
    })
    .then(response => response.json())
    .then(post => {
        loadPosts();
    });
}
