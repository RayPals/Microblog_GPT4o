let token = '';

function register() {
    const username = $('#register-username').val();
    const password = $('#register-password').val();

    $.ajax({
        url: 'http://localhost:3000/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(data) {
            alert(data.message);
        }
    });
}

function login() {
    const username = $('#login-username').val();
    const password = $('#login-password').val();

    $.ajax({
        url: 'http://localhost:3000/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function(data) {
            if (data.token) {
                token = data.token;
                $('.auth-forms').hide();
                $('.post-form').show();
                loadPosts();
            } else {
                alert(data.message);
            }
        }
    });
}

function createPost() {
    const content = $('#post-content').val();
    const image = $('#post-image')[0].files[0];

    if (content.trim() === '' && !image) {
        alert('Post content or image cannot be empty!');
        return;
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('content', content);
    if (image) {
        formData.append('image', image);
    }

    $.ajax({
        url: 'http://localhost:3000/posts',
        type: 'POST',
        processData: false,
        contentType: false,
        data: formData,
        success: function(post) {
            addPostToFeed(post);
            $('#post-content').val('');
            $('#post-image').val('');
        }
    });
}

function loadPosts() {
    $.ajax({
        url: 'http://localhost:3000/posts',
        type: 'GET',
        success: function(posts) {
            const feed = $('#feed');
            feed.empty();
            $.each(posts, function(index, post) {
                addPostToFeed(post);
            });
        }
    });
}

function addPostToFeed(post) {
    const postDiv = $('<div>').addClass('post');
    const postContent = $('<div>').addClass('content').text(post.content);
    const postTimestamp = $('<div>').addClass('timestamp').text(new Date(post.timestamp).toLocaleString());

    if (post.image) {
        const postImage = $('<img>').attr('src', 'http://localhost:3000/uploads/' + post.image).addClass('post-image');
        postDiv.append(postImage);
    }

    const commentsDiv = $('<div>').addClass('comments');
    $.each(post.comments, function(index, comment) {
        const commentDiv = $('<div>').text(comment.userId.username + ': ' + comment.content);
        commentsDiv.append(commentDiv);
    });

    const reactionsDiv = $('<div>').addClass('reactions');
    $.each(post.reactions, function(index, reaction) {
        const reactionDiv = $('<div>').text(reaction.userId.username + ' reacted with ' + reaction.reaction);
        reactionsDiv.append(reactionDiv);
    });

    const commentInput = $('<input>').attr('placeholder', 'Add a comment...');
    const commentButton = $('<button>').text('Comment').click(function() {
        addComment(post._id, commentInput.val());
    });

    const reactionInput = $('<input>').attr('placeholder', 'Add a reaction...');
    const reactionButton = $('<button>').text('React').click(function() {
        addReaction(post._id, reactionInput.val());
    });

    postDiv.append(postContent);
    postDiv.append(postTimestamp);
    postDiv.append(commentsDiv);
    postDiv.append(reactionsDiv);
    postDiv.append(commentInput);
    postDiv.append(commentButton);
    postDiv.append(reactionInput);
    postDiv.append(reactionButton);

    $('#feed').prepend(postDiv);
}

function addComment(postId, content) {
    $.ajax({
        url: 'http://localhost:3000/comments',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, postId, content }),
        success: function(post) {
            loadPosts();
        }
    });
}

function addReaction(postId, reaction) {
    $.ajax({
        url: 'http://localhost:3000/reactions',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, postId, reaction }),
        success: function(post) {
            loadPosts();
        }
    });
}
