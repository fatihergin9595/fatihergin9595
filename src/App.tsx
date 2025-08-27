// src/App.tsx
import React from 'react';
import SupportForm from './components/SupportForm';

export default function App() {
  return (
    <div className="min-h-screen bg-[#071d2a] text-white">
      <SupportForm onBack={() => window.history.back()} />
    </div>
  );
}