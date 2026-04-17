import { Link } from 'react-router-dom';

export default function RightPanel() {
  return (
    <div className="hidden lg:flex w-72 flex-col h-full bg-white/20 backdrop-blur-sm border-l border-teal/10 p-5 shrink-0">
      <h3 className="text-sm font-bold text-jade mb-6 px-1 tracking-wider border-b border-teal/10 pb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Vault Access
      </h3>
      
      <div className="bg-white/40 p-5 rounded-2xl border border-teal/20 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-jade to-teal rounded-full flex items-center justify-center mb-4 shadow-glow-teal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-sm text-jade/80 font-medium mb-6">Enter your encrypted private section.</p>
        
        <Link to="/private">
          <button className="w-full py-3 px-4 bg-teal text-white rounded-xl shadow-glow-teal hover:bg-jade hover:scale-[1.03] transition-all font-bold flex items-center justify-center gap-2">
            Open Private Section
          </button>
        </Link>
      </div>
    </div>
  );
}
