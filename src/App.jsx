import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, Card, message } from 'antd';
import axios from 'axios';
import './App.css';
const App = () => {
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [followedUsersModalVisible, setFollowedUsersModalVisible] = useState(false);
  const [friendRequestsModalVisible, setFriendRequestsModalVisible] = useState(false);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://655edfad879575426b4414a1.mockapi.io/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        if (user) {
          const response = await axios.get(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`);
          setFollowers(response.data.friends.map((friendId) => users.find((u) => u.id === friendId)));
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };

    fetchFollowers();
  }, [user, users]);

  const sendFriendRequest = async (userId) => {
    try {
      const userToSendRequest = users.find((u) => u.id === userId);
      if (!userToSendRequest) {
        console.error('User not found');
        return;
      }

      if (!userToSendRequest.requests.includes(user.id)) {
        const updatedUserToSendRequest = {
          ...userToSendRequest,
          requests: [...userToSendRequest.requests, user.id],
        };

        await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${userId}`, updatedUserToSendRequest);
        message.success('Friend request sent successfully');
      } else {
        message.warning('Friend request already sent');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      message.error('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestingUserId) => {
    try {
      const userSendingRequest = users.find((u) => u.id === requestingUserId);
      if (!userSendingRequest) {
        console.error('User not found');
        return;
      }

      const updatedUser = { ...user, requests: user.requests.filter((requestId) => requestId !== requestingUserId) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`, updatedUser);

      const updatedUserSendingRequest = {
        ...userSendingRequest,
        friends: [...userSendingRequest.friends, user.id],
      };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${requestingUserId}`, updatedUserSendingRequest);

      message.success('Friend request accepted successfully');
      setUser(updatedUser);
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === requestingUserId ? updatedUserSendingRequest : u)));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      message.error('Failed to accept friend request');
    }
  };

  const declineFriendRequest = async (requestingUserId) => {
    try {
      const updatedUser = { ...user, requests: user.requests.filter((requestId) => requestId !== requestingUserId) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`, updatedUser);

      message.success('Friend request declined successfully');
      setUser(updatedUser);
    } catch (error) {
      console.error('Error declining friend request:', error);
      message.error('Failed to decline friend request');
    }
  };

  const handleLogin = async (values) => {
    try {
      const loggedInUser = users.find((u) => u.name === values.name && u.password === values.password);

      if (loggedInUser) {
        message.success('Login successful');
        setUser(loggedInUser);
        setLoginModalVisible(false);
      } else {
        message.error('Login failed. Invalid username or password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      message.error('Login failed');
    }
  };

  const handleRegister = async (values) => {
    try {
      const response = await axios.post('https://655edfad879575426b4414a1.mockapi.io/users', values);
      message.success('Registration successful');
      setRegisterModalVisible(false);
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Registration failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleFollow = async (userId) => {
    try {
      const userToFollow = users.find((u) => u.id === userId);
      const updatedUser = { ...user, friends: [...user.friends, userId] };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`, updatedUser);

      const updatedUserToFollow = { ...userToFollow, friends: [...userToFollow.friends, user.id] };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${userId}`, updatedUserToFollow);

      message.success('Followed successfully');
      setUser(updatedUser);
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? updatedUserToFollow : u)));
    } catch (error) {
      console.error('Error following user:', error);
      message.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const userToUnfollow = users.find((u) => u.id === userId);
      const updatedUser = { ...user, friends: user.friends.filter((friendId) => friendId !== userId) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`, updatedUser);

      const updatedUserToUnfollow = { ...userToUnfollow, friends: userToUnfollow.friends.filter((friendId) => friendId !== user.id) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${userId}`, updatedUserToUnfollow);

      message.success('Unfollowed successfully');
      setUser(updatedUser);
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? updatedUserToUnfollow : u)))}
    catch (error) {
      console.error('Error unfollowing user:', error);
      message.error('Failed to unfollow user');
    }
  }

  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const showRegisterModal = () => {
    setRegisterModalVisible(true);
  };

  const showFollowedUsersModal = () => {
    setFollowedUsersModalVisible(true);
  };

  const showFriendRequestsModal = () => {
    setFriendRequestsModalVisible(true);
  };

  const handleCancel = () => {
    setLoginModalVisible(false);
    setRegisterModalVisible(false);
    setFollowedUsersModalVisible(false);
    setFriendRequestsModalVisible(false);
  };

  const filteredUsers = users.filter((u) => !user || u.id !== user.id);

  const FriendRequestsModal = () => (
    <Modal
      title="Friend Requests"
      visible={friendRequestsModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    >
      <div>
        <h2>Incoming Friend Requests</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {user &&
            users
              .filter((u) => user.requests.includes(u.id))
              .map((requestingUser) => (
                <Card key={requestingUser.id} style={{ width: 200, margin: 10 }}>
                  <p>Name: {requestingUser.name}</p>
                  <p>Email: {requestingUser.mail}</p>
                  <Button type="primary" onClick={() => acceptFriendRequest(requestingUser.id)}>
                    Accept
                  </Button>
                  <Button type="primary" danger onClick={() => declineFriendRequest(requestingUser.id)}>
                    Decline
                  </Button>
                </Card>
              ))}
        </div>
      </div>
    </Modal>
  );
  const showFollowersModal = () => {
    setFollowersModalVisible(true);
  };

  const handleCancelFollowersModal = () => {
    setFollowersModalVisible(false);
  };

  const handleDeleteFollower = async (followerId) => {
    try {
      const updatedUser = { ...user, friends: user.friends.filter((friendId) => friendId !== followerId) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${user.id}`, updatedUser);

      const updatedFollower = users.find((u) => u.id === followerId);
      const updatedFollowerWithoutUser = { ...updatedFollower, friends: updatedFollower.friends.filter((friendId) => friendId !== user.id) };
      await axios.put(`https://655edfad879575426b4414a1.mockapi.io/users/${followerId}`, updatedFollowerWithoutUser);

      message.success('Follower deleted successfully');
      setUser(updatedUser);
      setFollowers((prevFollowers) => prevFollowers.filter((follower) => follower.id !== followerId));
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === followerId ? updatedFollowerWithoutUser : u))
      );
    } catch (error) {
      console.error('Error deleting follower:', error);
      message.error('Failed to delete follower');
    }
  };
  const FollowersModal = () => (
    <Modal
      title="Followers"
      visible={followersModalVisible}
      onCancel={handleCancelFollowersModal}
      footer={[
        <Button key="back" onClick={handleCancelFollowersModal}>
          Close
        </Button>,
      ]}
    >
      <div>
        <h2>Your Followers</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {user &&
            followers.map((follower) => (
              <Card key={follower.id} style={{ width: 200, margin: 10 }}>
                <p>Name: {follower.name}</p>
                <p>Email: {follower.mail}</p>
                <Button type="primary" danger onClick={() => handleDeleteFollower(follower.id)}>
                  Delete Follower
                </Button>
              </Card>
            ))}
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        {user ? (
          <>
            <Button className="instagram-btn" onClick={handleLogout}>
              Logout
            </Button>
            <Button className="instagram-btn" onClick={showFriendRequestsModal}>
              Friend Requests
            </Button>
            <Button className="ant-btn-danger" onClick={showFollowedUsersModal}>
              Followed Users
            </Button>
            <Button className="ant-btn-danger" onClick={showFollowersModal}>
              Followers
            </Button>
            <p className="welcome-text">Welcome, {user.name}!</p>
          </>
        ) : (
          <>
            <Button className="ant-btn-danger" onClick={showLoginModal}>
              Login
            </Button>
            <Button className="ant-btn-danger" onClick={showRegisterModal}>
              Register
            </Button>
          </>
        )}
      </nav>

      {user ? (
        <div className="main-content">
          <h2>Other Users</h2>
          <div className="user-cards">
            {filteredUsers.map((otherUser) => (
              <Card key={otherUser.id} className="user-card">
                <p className="user-name">{otherUser.name}</p>
                <p className="user-email">{otherUser.mail}</p>
                {user.friends.includes(otherUser.id) ? (
                  <Button className="instagram-btn" onClick={() => handleUnfollow(otherUser.id)}>
                    Unfollow
                  </Button>
                ) : (
                  <Button className="instagram-btn" onClick={() => sendFriendRequest(otherUser.id)}>
                    Add Friend
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <Modal
        title="Login"
        visible={loginModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => formLogin.submit()}>
            Login
          </Button>,
        ]}
      >
        <Form form={formLogin} name="login" onFinish={handleLogin} initialValues={{ remember: true }}>
          <Form.Item label="Username" name="name" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Register"
        visible={registerModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => formRegister.submit()}>
            Register
          </Button>,
        ]}
      >
        <Form form={formRegister} name="register" onFinish={handleRegister} initialValues={{ remember: true }}>
          <Form.Item label="Username" name="name" rules={[{ required: true, message: 'Please input your username!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Email" name="mail" rules={[{ required: true, message: 'Please input your email!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Followed Users"
        visible={followedUsersModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
        ]}
      >
        <div>
          <h2>Users You Follow</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {user &&
              users
                .filter((u) => user.friends.includes(u.id))
                .map((followedUser) => (
                  <Card key={followedUser.id} style={{ width: 200, margin: 10 }}>
                    <p>Name: {followedUser.name}</p>
                    <p>Email: {followedUser.mail}</p>
                  </Card>
                ))}
          </div>
        </div>
      </Modal>

      <FriendRequestsModal />
      <FollowersModal/>
    </div>
  );
};

export default App
