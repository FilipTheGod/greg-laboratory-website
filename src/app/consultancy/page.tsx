// src/app/consultancy/page.tsx
'use client';

import React, { useState } from 'react';

export default function Consultancy() {
  const [collaborationEmail, setCollaborationEmail] = useState('');
  const [collaborationMessage, setCollaborationMessage] = useState('');
  const [portfolioEmail, setPortfolioEmail] = useState('');
  const [portfolioMessage, setPortfolioMessage] = useState('');

  const handleCollaborationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Collaboration request:', { collaborationEmail, collaborationMessage });
    // Clear form
    setCollaborationEmail('');
    setCollaborationMessage('');
    // Show success message
    alert('Thank you for your message. We will be in touch shortly.');
  };

  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Portfolio request:', { portfolioEmail, portfolioMessage });
    // Clear form
    setPortfolioEmail('');
    setPortfolioMessage('');
    // Show success message
    alert('Thank you for your portfolio request. We will be in touch shortly.');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 py-16">
      <h1 className="text-4xl mb-16 text-center">
        Greg Laboratory provides technical design consultation, pattern development,
        material sourcing, and construction methodology for selected clients.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl mb-4">COLLABORATION INQUIRY</h2>
          <form onSubmit={handleCollaborationSubmit}>
            <div className="mb-4">
              <label htmlFor="collaborationEmail" className="block mb-2">
                Email
              </label>
              <input
                id="collaborationEmail"
                type="email"
                value={collaborationEmail}
                onChange={(e) => setCollaborationEmail(e.target.value)}
                className="w-full p-2 border border-laboratory-black/20"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="collaborationMessage" className="block mb-2">
                Message
              </label>
              <textarea
                id="collaborationMessage"
                value={collaborationMessage}
                onChange={(e) => setCollaborationMessage(e.target.value)}
                className="w-full p-2 border border-laboratory-black/20 h-32"
                required
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-laboratory-black text-laboratory-white"
            >
              SUBMIT
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl mb-4">PORTFOLIO REQUEST</h2>
          <form onSubmit={handlePortfolioSubmit}>
            <div className="mb-4">
              <label htmlFor="portfolioEmail" className="block mb-2">
                Email
              </label>
              <input
                id="portfolioEmail"
                type="email"
                value={portfolioEmail}
                onChange={(e) => setPortfolioEmail(e.target.value)}
                className="w-full p-2 border border-laboratory-black/20"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="portfolioMessage" className="block mb-2">
                Message
              </label>
              <textarea
                id="portfolioMessage"
                value={portfolioMessage}
                onChange={(e) => setPortfolioMessage(e.target.value)}
                className="w-full p-2 border border-laboratory-black/20 h-32"
                required
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-laboratory-black text-laboratory-white"
            >
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}