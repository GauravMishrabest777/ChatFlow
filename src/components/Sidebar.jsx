import { useState } from 'react';

export default function Sidebar({ friends, pendingRequests, selectedChat, setSelectedChat, onAddFriend, onAcceptRequest, onRejectRequest }) {
  const [friendId, setFriendId] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'requests'

  const handleAdd = (e) => {
    e.preventDefault();
    if (friendId.trim()) {
      onAddFriend(friendId.trim());
      setFriendId('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/30 backdrop-blur-sm border-r border-teal/10 shrink-0">
      <div className="p-4 border-b border-teal/10">
        <h2 className="text-lg font-semibold text-jade mb-3">Messages</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Friend's User ID..." 
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            className="flex-1 bg-white/60 border border-teal/20 rounded-lg py-2 px-3 text-sm text-jade placeholder-jade/50 focus:outline-none focus:ring-1 focus:ring-teal/40 transition-all font-medium"
          />
          <button 
            type="submit"
            className="w-10 h-10 rounded-lg bg-teal text-white flex items-center justify-center hover:bg-jade transition-colors shadow-sm shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>

      <div className="flex border-b border-teal/10">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative
            ${activeTab === 'chats' ? 'text-teal' : 'text-jade/40 hover:text-jade'}`}
        >
          Chats
          {activeTab === 'chats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center justify-center gap-2
            ${activeTab === 'requests' ? 'text-teal' : 'text-jade/40 hover:text-jade'}`}
        >
          Requests
          {pendingRequests?.length > 0 && (
            <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">
              {pendingRequests.length}
            </span>
          )}
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'chats' ? (
          friends.length === 0 ? (
            <div className="text-center p-4 text-jade/50 text-sm mt-4 font-medium border border-teal/10 rounded-xl bg-white/40">
              No contacts yet. Add a friend's ID above to start chatting!
            </div>
          ) : (
            friends.map(friend => {
              const isSelected = selectedChat?.id === friend.id;
              return (
                <div 
                  key={friend.id}
                  onClick={() => setSelectedChat(friend)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group
                    ${isSelected 
                      ? 'bg-gradient-to-r from-teal/20 to-teal/5 shadow-sm translate-x-1 border border-teal/20' 
                      : 'hover:bg-white/50 hover:scale-[1.03] hover:shadow-glow-teal z-10 border border-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-sm group-hover:border-teal/30 transition-colors">
                      <img src={friend.img} alt={friend.name} className="w-full h-full object-cover" />
                    </div>
                    {friend.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-mint">
                        {friend.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-jade' : 'text-gray-700 group-hover:text-jade'}`}>
                        {friend.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium">{friend.time}</span>
                    </div>
                    <p className={`text-xs truncate ${isSelected ? 'text-teal font-medium' : 'text-gray-500'}`}>
                      {friend.preview}
                    </p>
                  </div>
                </div>
              );
            })
          )
        ) : (
          pendingRequests.length === 0 ? (
            <div className="text-center p-8 text-jade/50 text-sm mt-4 italic">
              No pending requests. Ask a friend for their ID!
            </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-white/60 p-4 rounded-2xl border border-teal/10 shadow-sm animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold border border-teal/20">
                    {req.sender_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-jade truncate">{req.sender_name}</h4>
                    <p className="text-[10px] text-teal font-black tracking-widest">{req.sender_app_id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onAcceptRequest(req.id)}
                    className="flex-1 py-1.5 bg-teal text-white text-xs font-bold rounded-lg hover:shadow-glow-teal transition-all active:scale-95"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => onRejectRequest(req.id)}
                    className="flex-1 py-1.5 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-all active:scale-95"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
