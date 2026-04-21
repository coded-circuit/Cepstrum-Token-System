"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, dined: 0, pending: 0, vegCount: 0, nonVegCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('override'); // 'override' or 'manage'
  
  const [newUser, setNewUser] = useState({ name: '', branch: '', year: '4th', rollNumber: '', email: '', dateOfBirth: '' });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if(data.success) setStats(data.stats);
    } catch (e) { console.error("Failed to fetch stats"); }
  };

  useEffect(() => {
    const loadStats = async () => {
      await fetchStats();
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/admin/guests?search=${e.target.value}`);
    const data = await res.json();
    setSearchResults(data.guests || []);
  };

  const toggleDinedStatus = async (id, currentStatus) => {
    if(!confirm(`AUTHORIZATION REQUIRED: Change attendance status to ${!currentStatus ? 'PENDING' : 'DINED'}?`)) return;
    
    await fetch(`/api/admin/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDined: !currentStatus })
    });
    fetchStats();
    handleSearch({ target: { value: searchQuery } });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if (data.success) {
      alert("SYSTEM: Guest Profile Created Successfully");
      setNewUser({ name: '', branch: '', year: '4th', rollNumber: '', email: '', dateOfBirth: '' });
      fetchStats();
    } else {
      alert(data.message || "SYSTEM ERROR: Failed to create guest");
    }
  };

  const handleDeleteUser = async (id) => {
    if(!confirm("CRITICAL WARNING: Are you sure you want to purge this guest record entirely? This action cannot be undone.")) return;
    await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' });
    fetchStats();
    handleSearch({ target: { value: searchQuery } });
  };

  // Calculate check-in percentage for the progress bar
  const checkInPercentage = stats.total > 0 ? Math.round((stats.dined / stats.total) * 100) : 0;

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear cookie and redirect anyway
      document.cookie = "admin_token=; Max-Age=0; path=/;";
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-8 font-sans selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Terminal Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-500 text-[10px] font-mono tracking-widest uppercase">System Online • SECURE CONNECTION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white">COMMAND CENTER</h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-widest uppercase">CEPSTRUM FAREWELL 2026 // ADMIN TERMINAL</p>
          </div>
          <div className="flex gap-4">
            <button className="text-xs font-mono text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-sm transition-colors uppercase tracking-widest">
              Export Data ↓
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs font-mono text-red-500 hover:bg-red-950/30 border border-red-900/50 px-4 py-2 rounded-sm transition-colors uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </div>
        </header>

        {/* Tactical Stats Board */}
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-sm p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            
            {/* Total */}
            <div className="flex flex-col border-r border-zinc-800 pr-6">
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase mb-2">Total Guests</span>
              <span className="text-3xl font-mono text-white">{stats.total}</span>
            </div>

            {/* Dined */}
            <div className="flex flex-col border-r border-zinc-800 pr-6">
              <span className="text-[10px] text-yellow-500 tracking-widest uppercase mb-2">Checked In</span>
              <span className="text-3xl font-mono text-yellow-500">{stats.dined}</span>
            </div>

            {/* Pending */}
            <div className="flex flex-col md:border-r border-zinc-800 pr-6">
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase mb-2">Awaiting</span>
              <span className="text-3xl font-mono text-white">{stats.pending}</span>
            </div>

            {/* Veg */}
            <div className="flex flex-col border-r border-zinc-800 pr-6">
              <span className="text-[10px] text-emerald-500 tracking-widest uppercase mb-2">Vegetarian</span>
              <span className="text-3xl font-mono text-emerald-500">{stats.vegCount}</span>
            </div>

            {/* Non-Veg */}
            <div className="flex flex-col">
              <span className="text-[10px] text-red-500 tracking-widest uppercase mb-2">Non-Veg</span>
              <span className="text-3xl font-mono text-red-500">{stats.nonVegCount}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-2">
              <span>Arrival Progress</span>
              <span className="text-yellow-500">{checkInPercentage}%</span>
            </div>
            <div className="w-full bg-black h-1 rounded-full overflow-hidden">
              <div 
                className="bg-yellow-500 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${checkInPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Interface Navigation */}
        <div className="flex gap-2 border-b border-zinc-800">
          <button 
            onClick={() => setActiveTab('override')} 
            className={`px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
              activeTab === 'override' ? 'border-b-2 border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Terminal Interface
          </button>
          <button 
            onClick={() => setActiveTab('manage')} 
            className={`px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
              activeTab === 'manage' ? 'border-b-2 border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Database Control
          </button>
        </div>

        {/* Content: Terminal Interface */}
        {activeTab === 'override' && (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-yellow-500 font-mono">{'>'}</span>
              </div>
              <input 
                type="text" 
                placeholder="Query database by name or roll number..." 
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-[#0a0a0a] border border-zinc-800 pl-10 pr-4 py-4 rounded-sm focus:outline-none focus:border-yellow-500 text-sm font-mono placeholder-zinc-700 transition-colors"
              />
            </div>
            
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-sm overflow-hidden">
              {searchResults.length === 0 && searchQuery.length > 0 ? (
                <div className="p-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                  [ 0 RECORDS FOUND ]
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {searchResults.map(guest => (
                    <div key={guest._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-white tracking-wider uppercase">{guest.name}</span>
                          <span className="text-xs font-mono text-zinc-500">{guest.rollNumber}</span>
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">
                          {guest.branch}  {guest.year.charAt(0)} {guest.email}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {guest.foodPreference && (
                          <span className={`px-2 py-1 text-[10px] font-mono tracking-widest uppercase border ${
                            guest.foodPreference === 'veg' 
                              ? 'text-emerald-500 border-emerald-900/50 bg-emerald-950/20' 
                              : 'text-red-500 border-red-900/50 bg-red-950/20'
                          }`}>
                            {guest.foodPreference}
                          </span>
                        )}
                        
                        <span className={`w-24 text-center px-2 py-1 text-[10px] font-mono tracking-widest uppercase border ${
                          guest.isDined 
                            ? 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10' 
                            : 'text-zinc-500 border-zinc-700 bg-black'
                        }`}>
                          {guest.isDined ? 'DINED' : 'PENDING'}
                        </span>

                        <button 
                          onClick={() => toggleDinedStatus(guest._id, guest.isDined)}
                          className={`w-28 py-2 text-[10px] font-bold font-mono tracking-widest uppercase border transition-colors ${
                            guest.isDined 
                              ? 'border-red-900/50 text-red-500 hover:bg-red-950/30' 
                              : 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10'
                          }`}
                        >
                          {guest.isDined ? 'REVOKE' : 'AUTHORIZE'}
                        </button>
                        
                        {/* Optional Quick Delete Button for Admins */}
                        <button 
                          onClick={() => handleDeleteUser(guest._id)}
                          className="p-2 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900/50 transition-colors"
                          title="Purge Record"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content: Database Control */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Create form */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-zinc-800 p-6 rounded-sm">
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                Manual Record Insertion
              </h3>
              
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Roll Number</label>
                  <input type="text" required value={newUser.rollNumber} onChange={e => setNewUser({...newUser, rollNumber: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none font-mono" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">IITG Email</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Branch</label>
                  <input type="text" placeholder="e.g. EEE" required value={newUser.branch} onChange={e => setNewUser({...newUser, branch: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none uppercase" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Year</label>
                  <select value={newUser.year} onChange={e => setNewUser({...newUser, year: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none">
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Date of Birth</label>
                  <input type="date" required value={newUser.dateOfBirth} onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-sm text-sm focus:border-yellow-500 focus:outline-none [color-scheme:dark]" />
                </div>

                <div className="md:col-span-2 mt-4">
                  <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] transition-colors">
                    Execute DB Insertion
                  </button>
                </div>
              </form>
            </div>
            
            {/* System Notices */}
            <div className="space-y-4">
              <div className="bg-[#0a0a0a] border border-zinc-800 p-6 rounded-sm">
                <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">System Notice</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Manual record insertion will immediately generate a cryptographic key for the guest. Ensure roll numbers strictly match the IITG registry to prevent access conflicts.
                </p>
              </div>

              <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-sm">
                <h3 className="text-[10px] font-mono text-red-500 uppercase tracking-widest mb-3 border-b border-red-900/30 pb-2">Danger Zone</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  Record purging is irreversible. Cryptographic tokens will be invalidated immediately. Use the Terminal Interface cross-button to purge records.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}