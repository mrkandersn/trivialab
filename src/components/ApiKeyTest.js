import React from 'react';

function ApiKeyTest() {
  const apiKey = process.env.REACT_APP_HUGGING_FACE_API_KEY;
  
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-sm mb-4">
      <h3 className="font-bold">🔑 API Key Debug Info:</h3>
      <p><strong>API Key Present:</strong> {apiKey ? '✅ Yes' : '❌ No'}</p>
      <p><strong>API Key Value:</strong> {apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set'}</p>
      <p><strong>API Key Length:</strong> {apiKey ? apiKey.length : 0}</p>
      <p><strong>Starts with hf_:</strong> {apiKey ? (apiKey.startsWith('hf_') ? '✅ Yes' : '❌ No') : 'N/A'}</p>
      <p><strong>Process.env exists:</strong> {typeof process !== 'undefined' && typeof process.env !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
      <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
    </div>
  );
}

export default ApiKeyTest;
