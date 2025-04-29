import React from 'react';
const LibraryPage = () => {
  const items = ["Meditation Guide", "Breathing Exercise", "CBT Worksheet"];
  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">MindWell Library</h2>
      <ul>
        {items.map((item, i) => <li key={i} className="mb-2">📘 {item}</li>)}
      </ul>
    </div>
  );
};
export default LibraryPage;