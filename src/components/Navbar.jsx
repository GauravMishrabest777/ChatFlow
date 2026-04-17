import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ dark }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  
  const userName = localStorage.getItem('user_name') || 'User';
  const appId = localStorage.getItem('app_id') || 'N/A';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('app_id');
    navigate('/login');
    window.location.reload(); // Ensure App.jsx re-checks token
  };
  return (
    <div className={`h-[4.5rem] flex items-center justify-between px-6 shrink-0 z-20 relative transition-all duration-300
      ${dark ? 'bg-black/60 border-b border-teal/20 backdrop-blur-md rounded-t-[2rem]' : 'bg-white/20 border-b border-teal/10 backdrop-blur-md rounded-t-[2rem]'}`}>
      
      <Link to="/chat" className="flex items-center gap-3 cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-jade to-teal flex items-center justify-center shadow-glow-teal text-white font-bold text-lg group-hover:scale-105 transition-transform">
          C
        </div>
        <span className={`font-bold text-xl tracking-tight hidden sm:block ${dark ? 'text-teal group-hover:text-white' : 'text-jade group-hover:text-teal'} transition-colors`}>
          ChatFlow
        </span>
      </Link>

      <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
        <input 
          type="text" 
          placeholder="Search..." 
          className={`w-full rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 transition-all duration-300 font-medium
          ${dark ? 'bg-black/40 border border-teal/40 text-teal placeholder-teal/50 focus:ring-teal focus:bg-black/60' : 'bg-white/40 border border-teal/20 text-jade placeholder-jade/60 focus:ring-teal/30 focus:bg-white/60'}`}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 absolute left-3 top-2.5 ${dark ? 'text-teal/50' : 'text-jade/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {dark && (
           <Link to="/chat" className="text-teal/70 hover:text-teal text-sm font-semibold mr-2 transition-colors flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
             Exit Vault
           </Link>
        )}
        {!dark && (
           <button 
            onClick={handleLogout}
            className="text-jade/70 hover:text-red-500 transition-colors flex items-center gap-1 group/logout"
            title="Logout"
           >
            <span className="text-xs font-bold opacity-0 group-hover/logout:opacity-100 transition-opacity">Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
           </button>
        )}
        <div className="relative">
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal/30 shadow-sm cursor-pointer hover:shadow-glow-teal transition-all duration-300 hover:scale-105 relative bg-teal active:scale-95"
          >
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=3ec6a8&color=fff`} alt="User Profile" className="w-full h-full object-cover" />
          </div>

          {showProfile && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfile(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl border border-teal/20 rounded-2xl shadow-2xl p-5 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal/30 mb-3 shadow-sm">
                     <img src={`https://ui-avatars.com/api/?name=${userName}&background=3ec6a8&color=fff`} alt="" className="w-full h-full" />
                  </div>
                  <h3 className="font-bold text-lg text-jade">{userName}</h3>
                  <div className="mt-4 w-full text-left bg-teal/5 p-3 rounded-xl border border-teal/10">
                    <p className="text-[10px] uppercase font-bold text-teal/60 mb-1 tracking-widest">Your Unique ID</p>
                    <div className="flex items-center justify-between gap-2">
                       <code className="text-sm font-black text-jade truncate">{appId}</code>
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(appId);
                          alert('ID Copied!');
                        }}
                        className="p-1.5 hover:bg-teal/20 rounded-lg text-teal transition-colors"
                        title="Copy ID"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                         </svg>
                       </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-jade/50 mt-4 font-medium italic">Share this ID with friends to start chatting!</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
