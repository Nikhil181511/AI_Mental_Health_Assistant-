import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { db, collection, getDocs } from './firebase';
import './leader.css';

function Leaderboard() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentUserRank, setCurrentUserRank] = useState(null);

		useEffect(() => {
			async function fetchUsers() {
				const usersRef = collection(db, 'users');
				const snapshot = await getDocs(usersRef);
				const userList = snapshot.docs.map(doc => {
					const data = doc.data();
					return {
						name: data.name || data.displayName || data.email || 'Anonymous',
						email: data.email,
						wellnessScore: data.wellnessScore || 0
					};
				});
				// Sort by wellnessScore descending
				userList.sort((a, b) => b.wellnessScore - a.wellnessScore);
				setUsers(userList);
				// Find current user's rank
				const currentUser = auth.currentUser;
				if (currentUser && currentUser.email) {
					const idx = userList.findIndex(u => u.email === currentUser.email);
					if (idx !== -1) {
						setCurrentUserRank(idx + 1);
					}
				}
				setLoading(false);
			}
			fetchUsers();
		}, []);

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-text">Loading leaderboard...</div>
			</div>
		);
	}

		return (
			<div className="leaderboard-container">
				<div className="leaderboard-card">
					<h2 className="leaderboard-title">Wellness Leaderboard</h2>
					{users.length === 0 ? (
						<div className="empty-leaderboard">
							No users found. Start completing tasks to appear on the leaderboard!
						</div>
					) : (
						<>
							<ul className="leaderboard-list">
								{users.map((user, idx) => {
									const rank = idx + 1;
									let rankClass = 'leaderboard-item';
									if (rank === 1) rankClass += ' rank-1';
									else if (rank === 2) rankClass += ' rank-2';
									else if (rank === 3) rankClass += ' rank-3';
									// Highlight current user
									const currentUser = auth.currentUser;
									if (currentUser && currentUser.email === user.email) {
										rankClass += ' current-user-row';
									}
									return (
										<li key={user.email} className={rankClass}>
											<span className="rank-number">#{rank}</span>
											<span className="user-name">{user.name}</span>
											<span className="wellness-score-display">{user.wellnessScore}</span>
										</li>
									);
								})}
							</ul>
							{currentUserRank && (
								<div className="current-user-rank-info">
									<strong>Your rank:</strong> #{currentUserRank} out of {users.length}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		);
}

export default Leaderboard;