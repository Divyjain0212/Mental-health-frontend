import React from 'react';

export const PeerForumTest: React.FC = () => {
  console.log('PeerForumTest component rendered');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Peer Support Forum - Test</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">This is a test version of the peer forum to debug the disappearing issue.</p>
          <p className="text-gray-600 mt-4">If you can see this message, the routing and component rendering is working correctly.</p>
        </div>
      </div>
    </div>
  );
};