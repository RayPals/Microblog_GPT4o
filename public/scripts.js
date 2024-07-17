let token = '';
let currentUsername = '';

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
                currentUsername = username;
                $('.auth-forms').hide();
                $('.navbar').show();
                $('.post-form').show();
                showFeed();
            } else {
                alert(data.message);
            }
        }
    });
}

function logout() {
    token = '';
    currentUsername = '';
    $('.post-form').hide();
    $('#feed').empty().hide();
    $('#profile').hide();
    $('#settings').hide();
    $('#people').hide();
    $('#messages').hide();
    $('.navbar').hide();
    $('.auth-forms').show();
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
            feed.empty().show();
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
    const postUser = $('<div>').addClass('user').append(
        $('<a>').attr('href', '#').text(post.userId.username).click(function(event) {
            event.preventDefault();
            viewProfile(post.userId.username);
        })
    );

    if (post.image) {
        const postImage = $('<img>').attr('src', 'http://localhost:3000/uploads/' + post.image).addClass('post-image');
        postDiv.append(postImage);
    }

    const likesDiv = $('<div>').addClass('likes').text(`Likes: ${post.likes.length}`);
    const likeButton = $('<button>').addClass('btn btn-light btn-sm').text('Like').click(function() {
        toggleLike(post._id);
    });

    const commentsDiv = $('<div>').addClass('comments');
    $.each(post.comments, function(index, comment) {
        const commentDiv = $('<div>').text(comment.userId.username + ': ' + comment.content);
        commentsDiv.append(commentDiv);
    });

    const commentInput = $('<input>').addClass('form-control mt-2').attr('placeholder', 'Add a comment...');
    const commentButton = $('<button>').addClass('btn btn-secondary mt-2').text('Comment').click(function() {
        addComment(post._id, commentInput.val());
    });

    postDiv.append(postUser);
    postDiv.append(postContent);
    postDiv.append(postTimestamp);
    postDiv.append(likesDiv);
    postDiv.append(likeButton);
    postDiv.append(commentsDiv);
    postDiv.append(commentInput);
    postDiv.append(commentButton);

    $('#feed').prepend(postDiv);
}

function toggleLike(postId) {
    $.ajax({
        url: 'http://localhost:3000/likes',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, postId }),
        success: function(post) {
            loadPosts();
        }
    });
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

function viewProfile(username) {
    $.ajax({
        url: `http://localhost:3000/profile/${username}`,
        type: 'GET',
        success: function(data) {
            $('#feed').hide();
            $('#settings').hide();
            $('#people').hide();
            $('#messages').hide();
            const profile = $('#profile');
            profile.show();
            profile.find('.user-info').html(`
                <img src="http://localhost:3000/uploads/${data.user.profilePicture}" class="profile-picture">
                <p><strong>${data.user.username}</strong></p>
                <p>${data.user.bio}</p>
            `);
            const userPosts = profile.find('.user-posts');
            userPosts.empty();
            $.each(data.posts, function(index, post) {
                const postDiv = $('<div>').addClass('post').text(post.content);
                userPosts.append(postDiv);
            });
        }
    });
}

function showFeed() {
    $('#profile').hide();
    $('#settings').hide();
    $('#people').hide();
    $('#messages').hide();
    loadPosts();
}

function showCurrentUserProfile() {
    viewProfile(currentUsername);
}

function showSettings() {
    $('#feed').hide();
    $('#profile').hide();
    $('#people').hide();
    $('#messages').hide();
    const settings = $('#settings');
    settings.show();
    $.ajax({
        url: `http://localhost:3000/profile/${currentUsername}`,
        type: 'GET',
        success: function(data) {
            $('#settings-username').val(data.user.username);
            $('#settings-bio').val(data.user.bio);
        }
    });
}

function updateSettings() {
    const username = $('#settings-username').val();
    const bio = $('#settings-bio').val();
    const profilePicture = $('#settings-profile-picture')[0].files[0];

    const formData = new FormData();
    formData.append('token', token);
    formData.append('username', username);
    formData.append('bio', bio);
    if (profilePicture) {
        formData.append('profilePicture', profilePicture);
    }

    $.ajax({
        url: 'http://localhost:3000/updateProfile',
        type: 'POST',
        processData: false,
        contentType: false,
        data: formData,
        success: function(data) {
            alert('Profile updated successfully');
            currentUsername = data.username;
            showCurrentUserProfile();
        }
    });
}

function showPeople() {
    $('#feed').hide();
    $('#profile').hide();
    $('#settings').hide();
    $('#messages').hide();
    const people = $('#people');
    people.show();
    $.ajax({
        url: 'http://localhost:3000/users',
        type: 'GET',
        success: function(users) {
            const peopleList = $('#people-list');
            peopleList.empty();
            $.each(users, function(index, user) {
                if (user.username !== currentUsername) {
                    const userDiv = $('<div>').addClass('user');
                    const userInfo = $('<div>').html(`
                        <img src="http://localhost:3000/uploads/${user.profilePicture}" class="profile-picture">
                        <p><strong>${user.username}</strong></p>
                        <p>${user.bio}</p>
                    `);
                    const friendButton = $('<button>').addClass('btn btn-secondary').text('Add Friend').click(function() {
                        addFriend(user._id);
                    });
                    userDiv.append(userInfo);
                    userDiv.append(friendButton);
                    peopleList.append(userDiv);
                }
            });
        }
    });
}

function addFriend(friendId) {
    $.ajax({
        url: 'http://localhost:3000/addFriend',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, friendId }),
        success: function() {
            alert('Friend added successfully');
            showPeople();
        }
    });
}

function removeFriend(friendId) {
    $.ajax({
        url: 'http://localhost:3000/removeFriend',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, friendId }),
        success: function() {
            alert('Friend removed successfully');
            showPeople();
        }
    });
}

function showMessages() {
    $('#feed').hide();
    $('#profile').hide();
    $('#settings').hide();
    $('#people').hide();
    const messages = $('#messages');
    messages.show();
    loadMessages();
    loadRecipients();
}

function loadMessages() {
    $.ajax({
        url: 'http://localhost:3000/inbox',
        type: 'GET',
        data: { token },
        success: function(messages) {
            const inboxList = $('#inbox-list');
            inboxList.empty();
            $.each(messages, function(index, message) {
                const messageDiv = $('<div>').addClass('message');
                const sender = $('<div>').addClass('sender').text(`From: ${message.sender.username}`);
                const content = $('<div>').addClass('content').text(message.content);
                const timestamp = $('<div>').addClass('timestamp').text(new Date(message.timestamp).toLocaleString());

                messageDiv.append(sender);
                messageDiv.append(content);
                messageDiv.append(timestamp);

                inboxList.append(messageDiv);
            });
        }
    });

    $.ajax({
        url: 'http://localhost:3000/sent',
        type: 'GET',
        data: { token },
        success: function(messages) {
            const sentList = $('#sent-list');
            sentList.empty();
            $.each(messages, function(index, message) {
                const messageDiv = $('<div>').addClass('message');
                const recipient = $('<div>').addClass('recipient').text(`To: ${message.recipient.username}`);
                const content = $('<div>').addClass('content').text(message.content);
                const timestamp = $('<div>').addClass('timestamp').text(new Date(message.timestamp).toLocaleString());

                messageDiv.append(recipient);
                messageDiv.append(content);
                messageDiv.append(timestamp);

                sentList.append(messageDiv);
            });
        }
    });
}

function loadRecipients() {
    $.ajax({
        url: 'http://localhost:3000/users',
        type: 'GET',
        success: function(users) {
            const recipientSelect = $('#recipient-select');
            recipientSelect.empty();
            $.each(users, function(index, user) {
                if (user.username !== currentUsername) {
                    const option = $('<option>').val(user._id).text(user.username);
                    recipientSelect.append(option);
                }
            });
        }
    });
}

function sendMessage() {
    const recipientId = $('#recipient-select').val();
    const content = $('#message-content').val();
    if (!recipientId || content.trim() === '') {
        alert('Recipient and message content cannot be empty!');
        return;
    }

    $.ajax({
        url: 'http://localhost:3000/sendMessage',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token, recipientId, content }),
        success: function(message) {
            $('#message-content').val('');
            loadMessages();
        }
    });
}
