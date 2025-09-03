import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import './CommunityChat.css';

const CommunityChat = () => {
    const [user, loading, error] = useAuthState(auth);
    // Updated with more realistic wellness / support communities
    const communities = [
        { id: 1, name: 'Announcements' }, // Broadcast to all channels
        { id: 2, name: 'Mindfulness & Meditation' },
        { id: 3, name: 'Stress Relief & Relaxation' },
        { id: 4, name: 'Anxiety Support' },
        { id: 5, name: 'Sleep Improvement' },
        { id: 6, name: 'Mood & Motivation' },
        { id: 7, name: 'Habits & Productivity' },
        { id: 8, name: 'Movement & Exercise' },
        { id: 9, name: 'Nutrition & Wellness' },
        { id: 10, name: 'Open Community Chat' },
    ];
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (selectedCommunity && user) {
            const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((msg) => msg.community === selectedCommunity.name);
                setMessages(fetchedMessages);
            });
            return () => unsubscribe();
        }
    }, [selectedCommunity, user]);

    // Show loading or error if user authentication is pending
    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return <div className="error-message">Error: {error.message}</div>;
    if (!user) return <div className="error-message">Please log in to access the community chat.</div>;

    const handleSelectCommunity = (community) => {
        setSelectedCommunity(community);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() !== '' && user) {
            try {
                // Get user's display name or email as fallback
                const senderName = user.displayName || user.email?.split('@')[0] || 'Anonymous User';
                
                const isAnnouncementChannel = selectedCommunity.name === 'Announcements';

                const messageData = {
                    community: selectedCommunity.name,
                    text: newMessage,
                    sender: isAnnouncementChannel ? 'Announcement' : senderName,
                    senderEmail: user.email,
                    userId: user.uid,
                    timestamp: new Date()
                };

                if (isAnnouncementChannel) {
                    // Broadcast the announcement to every community (including itself)
                    for (const community of communities) {
                        await addDoc(collection(db, 'messages'), {
                            ...messageData,
                            community: community.name,
                            sender: 'Announcement'
                        });
                    }
                } else {
                    await addDoc(collection(db, 'messages'), messageData);
                }

                setNewMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (

            <div className="community-chat">
                <div className="sidebar1">
                    <h2>Communities</h2>
                    <ul>
                        {communities.map((community) => (
                            <li
                                key={community.id}
                                onClick={() => handleSelectCommunity(community)}
                                className={selectedCommunity?.id === community.id ? 'active' : ''}
                            >
                                {community.name}
                            </li>
                        ))}
                    </ul>
                </div>


            <div className="chat-container">
                {selectedCommunity ? (
                    <>
                        <div className="chat-header">
                            <h3>{selectedCommunity.name}</h3>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.sender === 'Announcement' ? 'announcement' : ''} ${msg.userId === user?.uid ? 'own-message' : ''}`}>
                                    <strong>{msg.sender}:</strong> {msg.text}
                                    <span className="message-time">
                                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : ''}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <p>Select a community to start chatting</p>
                    </div>
                )}
            </div>
        </div>

    );
};

export default CommunityChat;