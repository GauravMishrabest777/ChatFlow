import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import RightPanel from '../components/RightPanel';

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const ws = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const appId = localStorage.getItem('app_id');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch friends (filtered for non-private)
        const resFriends = await fetch('/friends/list?private=false', { headers });
        if (resFriends.ok) {
          const data = await resFriends.json();
          setFriends(data.map(f => ({
            id: f.friend_app_id,
            name: f.friend_name,
            preview: "Connected.",
            time: "Now",
            unread: 0,
            img: `https://ui-avatars.com/api/?name=${f.friend_name}&background=0f7a65&color=fff`,
            is_blocked: f.is_blocked,
            is_private: f.is_private
          })));
        }

        // Fetch requests
        const resPending = await fetch('/friends/pending', { headers });
        if (resPending.ok) {
          setPendingRequests(await resPending.json());
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    
    fetchData();

    // Open WebSocket (Auto-detect protocol and host for deployment)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws/${appId}`);
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
           console.error(data.error);
           return;
        }
        
        const senderId = data.sender_id;
        const incomingMsg = {
           id: Date.now(),
           text: data.content,
           sender: senderId,
           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), incomingMsg]
        }));
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [navigate, token, appId]);

  useEffect(() => {
    if (!selectedChat) return;
    
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/friends/messages/${selectedChat.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.sender_app_id === appId ? 'me' : m.sender_app_id,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setChatMessages(prev => ({ ...prev, [selectedChat.id]: formatted }));
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [selectedChat, token, appId]);

  const handleAddFriend = async (friendIdInput) => {
    try {
      await fetch('/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiver_app_id: friendIdInput })
      });
      alert('Request sent!');
    } catch (e) {
      alert('Error sending request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await fetch(`/friends/accept/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      window.location.reload();
    } catch (e) {
      alert('Error accepting request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await fetch(`/friends/reject/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (e) {
      alert('Error rejecting request');
    }
  };

  const handleSendMessage = (text, isSaved = false) => {
    if (!selectedChat || !text.trim() || !ws.current) return;
    
    ws.current.send(JSON.stringify({
      receiver_id: selectedChat.id,
      content: text,
      is_saved: isSaved
    }));

    const newMessage = {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-mint via-teal-light/20 to-[#e0f7f1] flex items-center justify-center p-0 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jade/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>

      <div className="w-full h-[100dvh] sm:h-[90vh] max-w-7xl bg-white/40 backdrop-blur-2xl sm:rounded-[2rem] shadow-2xl border border-white/60 flex flex-col overflow-hidden relative z-10 transition-all">
        <Navbar />

        <div className="flex-1 flex overflow-hidden">
          <div className={`w-full md:w-80 h-full ${selectedChat ? 'hidden md:block' : 'block'}`}>
            <Sidebar 
              friends={friends}
              pendingRequests={pendingRequests}
              selectedChat={selectedChat} 
              setSelectedChat={setSelectedChat}
              onAddFriend={handleAddFriend}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
            />
          </div>

          <div className={`flex-1 flex overflow-hidden relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <ChatArea 
               selectedChat={selectedChat} 
               setSelectedChat={setSelectedChat}
               messages={selectedChat ? (chatMessages[selectedChat.id] || []) : []}
               onSendMessage={handleSendMessage}
            />
          </div>

          <RightPanel />
        </div>
      </div>
    </div>
  );
}
