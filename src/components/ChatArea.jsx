import { useState, useRef, useEffect } from 'react';

export default function ChatArea({ selectedChat, setSelectedChat, messages, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText, isSaved);
      setInputText('');
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md">
        <div className="w-24 h-24 mb-6 rounded-full bg-teal/10 flex items-center justify-center text-teal/40 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-jade/80">Welcome to ChatFlow</h2>
        <p className="text-jade/60 mt-2 font-medium">Add a friend via ID to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-md shadow-inner relative z-0">
      {/* Header */}
      <div className="h-[5rem] px-6 sm:px-10 flex items-center justify-between border-b border-teal/10 bg-white/30 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedChat(null)}
            className="md:hidden w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-teal hover:bg-white hover:shadow-sm transition-all mr-1 shrink-0"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative shrink-0">
            <img src={selectedChat.img} alt={selectedChat.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-jade text-lg truncate">{selectedChat.name}</h3>
            <span className="text-xs text-teal font-semibold">Online now</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-sm
              ${isSaved 
                ? 'bg-jade text-white border-jade shadow-glow-jade scale-105' 
                : 'bg-white/50 text-jade/60 border-teal/10 hover:border-teal/30'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isSaved ? 'bg-white animate-pulse' : 'bg-jade/30'}`}></div>
            {isSaved ? 'Safe Mode ON' : 'Safe Mode OFF'}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-white/50 text-jade hover:bg-white hover:text-teal hover:shadow-glow-teal hover:scale-105 transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-teal/20 rounded-2xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden">
                  <button 
                    onClick={async () => {
                      const token = localStorage.getItem('access_token');
                      await fetch(`/friends/toggle-private/${selectedChat.id}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      window.location.reload();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-jade hover:bg-teal/10 rounded-xl transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {selectedChat.is_private ? 'Move to General' : 'Move to Vault'}
                  </button>
                  <button 
                    onClick={async () => {
                      const token = localStorage.getItem('access_token');
                      await fetch(`/friends/block/${selectedChat.id}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      alert('User Blocked');
                      window.location.reload();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
           <div className="flex justify-center h-full items-center">
             <div className="bg-white/60 text-jade/70 py-3 px-6 rounded-2xl font-medium border border-teal/20 shadow-sm text-center">
                Start a conversation with <span className="font-bold">{selectedChat.name}</span>!<br/>
                <span className="text-xs text-jade/50 mt-1 block">Say hello! 👋</span>
             </div>
           </div>
        ) : (
          messages.map((msg, idx) => (
             <div key={idx} className={`flex gap-3 max-w-[85%] sm:max-w-[70%] group ${msg.sender === 'me' ? 'ml-auto justify-end' : ''}`}>
               {msg.sender !== 'me' && <img src={selectedChat.img} alt="" className="w-8 h-8 rounded-full flex-shrink-0 mt-1 shadow-sm" />}
               <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : ''}`}>
                 <div className={`px-5 py-2.5 rounded-2xl leading-relaxed text-[15px] sm:text-base font-medium break-words max-w-full
                    ${msg.sender === 'me' 
                      ? 'bg-gradient-to-r from-jade to-teal text-white rounded-tr-[4px] shadow-md' 
                      : 'bg-white rounded-tl-[4px] text-gray-700 border border-teal/10 shadow-sm'}`}>
                   {msg.text}
                 </div>
                 <span className={`text-[10px] text-gray-400 mt-1 block font-semibold ${msg.sender === 'me' ? 'mr-1' : 'ml-1'}`}>{msg.time}</span>
               </div>
             </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white/40 backdrop-blur-lg border-t border-teal/10 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-white/80 p-2 sm:p-2.5 rounded-full border border-teal/20 shadow-sm focus-within:shadow-glow-teal focus-within:ring-1 focus-within:ring-teal/40 transition-all">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-[15px] px-4 font-medium"
          />
          
          <button 
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90
              ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-teal/10 text-teal hover:bg-teal/20'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 rounded-full bg-gradient-to-r from-jade to-teal text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-glow-teal flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
