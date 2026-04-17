import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedId, setGeneratedId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !password) return;
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Signup failed');
      
      // Auto-login: Save token and ID immediately
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('app_id', data.app_id);
      localStorage.setItem('user_name', data.name || data.user_name);
      
      // Redirect to Dashboard immediately
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-mint via-teal-light/20 to-white flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-jade/20 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/60 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-jade to-teal flex items-center justify-center shadow-glow-teal text-white font-bold text-2xl mb-4">
            C
          </div>
          <h2 className="text-3xl font-bold text-jade">Create Account</h2>
          <p className="text-jade/70 mt-2">Join ChatFlow today</p>
        </div>

        {error && <div className="mb-4 text-center text-sm text-red-500 font-bold">{error}</div>}

        {!generatedId ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-jade/80 mb-2">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/60 border border-teal/20 rounded-xl py-3 px-4 text-jade placeholder-jade/50 focus:outline-none focus:ring-2 focus:ring-teal/40 transition-all font-medium"
                placeholder="How should we call you?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-jade/80 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/60 border border-teal/20 rounded-xl py-3 px-4 text-jade placeholder-jade/50 focus:outline-none focus:ring-2 focus:ring-teal/40 transition-all font-medium"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-jade/80 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/60 border border-teal/20 rounded-xl py-3 px-4 text-jade placeholder-jade/50 focus:outline-none focus:ring-2 focus:ring-teal/40 transition-all font-medium"
                placeholder="Create a password"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-gradient-to-r from-jade to-teal text-white rounded-xl shadow-glow-teal hover:opacity-90 hover:scale-[1.02] transition-all duration-300 font-bold text-lg"
            >
              Sign Up
            </button>
            
            <p className="text-center text-sm text-jade/70 mt-4 font-medium">
              Already have an account? <Link to="/" className="text-teal font-bold hover:underline">Log In</Link>
            </p>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-white/60 p-6 rounded-2xl border border-teal/20">
              <p className="text-sm font-medium text-jade/70 mb-2">Your Unique App ID is:</p>
              <h3 className="text-3xl font-black text-jade tracking-widest">{generatedId}</h3>
              <p className="text-xs text-jade/60 mt-4 font-medium">Save this ID! Friends will need it to add you.</p>
            </div>
            <button 
              onClick={handleContinue}
              className="w-full py-3 px-4 bg-gradient-to-r from-jade to-teal text-white rounded-xl shadow-glow-teal hover:opacity-90 hover:scale-[1.02] transition-all duration-300 font-bold text-lg"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
