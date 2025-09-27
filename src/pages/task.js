import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, collection, addDoc, getDocs, query, where, updateDoc } from './firebase';
import './task.css';

const TASK_POOL = [
  { label: 'Do a 2 minute meditation', link: '/Game' },
  { label: 'Do a 3 minute meditation', link: '/Game' },
  { label: 'Do a 4 minute meditation', link: '/Game' },
  { label: 'Do a 5 minute meditation', link: '/Game' },
  { label: 'Read an article on CBT', link: '/library' },
  { label: 'Watch a video on Resilience', link: '/library' },
  { label: 'Try an exercise on Mindfulness', link: '/library' }
];

function getTodayKey() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getRandomTasks() {
  // Shuffle and pick 3 unique tasks
  const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

async function addStreakPoints(userId, points = 10) {
  const userTasksRef = collection(db, 'users');
  const qUser = query(userTasksRef, where('userId', '==', userId));
  const userSnapshot = await getDocs(qUser);
  if (userSnapshot.empty) return;
  const userDocRef = userSnapshot.docs[0].ref;
  const userDocData = userSnapshot.docs[0].data();
  const newScore = (userDocData.wellnessScore || 0) + points;
  await updateDoc(userDocRef, { wellnessScore: newScore });
  return newScore;
}

function TaskPage() {
  const [tasks, setTasks] = useState([]); // [{label, link, done, visited}]
  const [loading, setLoading] = useState(true);
  const [wellnessScore, setWellnessScore] = useState(0);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    async function fetchOrCreateTasks() {
      if (!user) {
        setLoading(false);
        return;
      }

      const todayKey = getTodayKey();
      const userTasksRef = collection(db, 'users');
      const qUser = query(userTasksRef, where('userId', '==', user.uid));
      const userSnapshot = await getDocs(qUser);

      let userDocRef;
      let userDocData;

      if (!userSnapshot.empty) {
        userDocRef = userSnapshot.docs[0].ref;
        userDocData = userSnapshot.docs[0].data();
      } else {
        const doc = await addDoc(userTasksRef, {
          userId: user.uid,
          email: user.email,
          wellnessScore: 0
        });
        userDocRef = doc;
        userDocData = { wellnessScore: 0 };
      }

      setWellnessScore(userDocData.wellnessScore || 0);

      // check today's tasks
      const tasksCol = collection(userDocRef, 'tasks');
      const qTasks = query(tasksCol, where('date', '==', todayKey));
      const tasksSnapshot = await getDocs(qTasks);

      if (!tasksSnapshot.empty) {
        const docData = tasksSnapshot.docs[0].data();
        const loadedTasks = docData.tasks.map(t => ({
          ...t,
          visited: t.visited || false
        }));
        setTasks(loadedTasks);
      } else {
        const newTasks = getRandomTasks().map(t => ({
          ...t,
          done: false,
          visited: false
        }));
        await addDoc(tasksCol, { date: todayKey, tasks: newTasks });
        setTasks(newTasks);
      }

      setLoading(false);
    }
    fetchOrCreateTasks();
  }, [user]);

  async function handleTaskDone(idx) {
    if (!user) return;
    const todayKey = getTodayKey();
    const userTasksRef = collection(db, 'users');
    const qUser = query(userTasksRef, where('userId', '==', user.uid));
    const userSnapshot = await getDocs(qUser);
    if (userSnapshot.empty) return;
    const userDocRef = userSnapshot.docs[0].ref;
    const userDocData = userSnapshot.docs[0].data();
    const tasksCol = collection(userDocRef, 'tasks');
    const qTasks = query(tasksCol, where('date', '==', todayKey));
    const tasksSnapshot = await getDocs(qTasks);
    if (tasksSnapshot.empty) return;
    const taskDocRef = tasksSnapshot.docs[0].ref;

    let updatedTasks = tasks.map((t, i) =>
      i === idx ? { ...t, done: !t.done } : t
    );

    let addPoints = 0;
    if (!tasks[idx].done && updatedTasks[idx].done) {
      addPoints = 100;
    } else if (tasks[idx].done && !updatedTasks[idx].done) {
      addPoints = -100;
    }

    await updateDoc(taskDocRef, { tasks: updatedTasks });
    setTasks(updatedTasks);

    if (addPoints !== 0) {
      const newScore = (userDocData.wellnessScore || 0) + addPoints;
      await updateDoc(userDocRef, { wellnessScore: newScore });
      setWellnessScore(newScore);
    }
  }

  async function handleGo(idx, link) {
    if (!user) {
      navigate(link);
      return;
    }
    const todayKey = getTodayKey();
    const userTasksRef = collection(db, 'users');
    const qUser = query(userTasksRef, where('userId', '==', user.uid));
    const userSnapshot = await getDocs(qUser);
    if (userSnapshot.empty) {
      navigate(link);
      return;
    }
    const userDocRef = userSnapshot.docs[0].ref;
    const tasksCol = collection(userDocRef, 'tasks');
    const qTasks = query(tasksCol, where('date', '==', todayKey));
    const tasksSnapshot = await getDocs(qTasks);
    if (tasksSnapshot.empty) {
      navigate(link);
      return;
    }
    const taskDocRef = tasksSnapshot.docs[0].ref;
    const updatedTasks = tasks.map((t, i) =>
      i === idx ? { ...t, visited: true } : t
    );
    await updateDoc(taskDocRef, { tasks: updatedTasks });
    setTasks(updatedTasks);
    navigate(link);
  }

  // UI states
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading tasks...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-message">
          Please log in to view your daily tasks.
        </div>
      </div>
    );
  }

  return (
    <div className="task-container">
      <div className="task-card">
        <div className="wellness-score">
          Wellness Score: <span className="wellness-score-value">{wellnessScore}</span>
        </div>
        <h2 className="task-title">Your Daily Tasks</h2>
        <ul className="task-list">
          {tasks.map((task, idx) => (
            <li key={idx} className={`task-item ${task.done ? 'completed' : ''}`}>
              <span className={`task-label ${task.done ? 'completed' : ''}`}>{task.label}</span>
              <div className="button-container">
                <button
                  className={`btn btn-mark-done ${task.done ? 'completed' : ''}`}
                  onClick={() => (!task.done && task.visited) && handleTaskDone(idx)}
                  disabled={!task.visited || task.done}
                >
                  {task.done ? 'Done' : 'Mark Done'}
                </button>
                <button
                  className="btn btn-go"
                  onClick={() => handleGo(idx, task.link)}
                >
                  Go
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="task-footer">
          New tasks will appear every day when you log in.<br />
          Your progress is saved!<br />
          <span className="task-footer-highlight">* You must visit a task before marking it as done.</span>
        </div>
      </div>
    </div>
  );
}

export { addStreakPoints };
export default TaskPage;