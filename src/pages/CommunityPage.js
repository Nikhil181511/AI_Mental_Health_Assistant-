import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase'; 
import './CommunityChat.css';

const CommunityChat = () => {
    const communities = [
      { id: 1, name: 'Healthy India' },
      { id: 2, name: 'Doctor 1' },
      { id: 3, name: 'Doctor 2' },
      { id: 4, name: 'Ways to reduce stress' },
      { id: 5, name: 'How to stay Motivated' },// Keeping the "Reports" group as is
  ];
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (selectedCommunity) {
            const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((msg) => msg.community === selectedCommunity.name);
                setMessages(fetchedMessages);
            });
            return () => unsubscribe();
        }
    }, [selectedCommunity]);

    const handleSelectCommunity = (community) => {
        setSelectedCommunity(community);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() !== '') {
            try {
                const messageData = {
                    community: selectedCommunity.name,
                    text: newMessage,
                    sender: selectedCommunity.name === 'Healthy India' ? 'Announcement' : 'You',
                    timestamp: new Date()
                };

                if (selectedCommunity.name === 'Healthy India') {
                    for (const community of communities) {
                        await addDoc(collection(db, 'messages'), {
                            ...messageData,
                            community: community.name
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
            <div className="sidebar">
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
                                <div key={msg.id} className={`chat-message ${msg.sender === 'Announcement' ? 'announcement' : ''}`}>
                                    <strong>{msg.sender}:</strong> {msg.text}
                                </div>
                            ))}
                        </div>

                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
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
