import React, { useState } from 'react';

const SERVER = 'https://roblox-case-backend.onrender.com';

export default function App() {
  const [ageChecked, setAgeChecked] = useState(false);
  const [age, setAge] = useState('');
  const [page, setPage] = useState('age'); // age, login, register, case
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inventory, setInventory] = useState([]);
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function verifyAge() {
    if (parseInt(age) >= 18) {
      setAgeChecked(true);
      setPage('login');
    } else {
      alert('You must be 18 or older to enter.');
    }
  }

  async function register() {
    setLoading(true);
    setError('');
    const res = await fetch(SERVER + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, age: parseInt(age) }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Registered successfully! Please log in.');
      setPage('login');
    } else {
      setError(data.error || 'Error registering');
    }
  }

  async function login() {
    setLoading(true);
    setError('');
    const res = await fetch(SERVER + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPage('case');
      fetchInventory();
    } else {
      setError(data.error || 'Error logging in');
    }
  }

  async function fetchInventory() {
    const res = await fetch(SERVER + '/inventory', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data.inventory) setInventory(data.inventory);
  }

  async function openCase() {
    setLoading(true);
    setError('');
    const res = await fetch(SERVER + '/open-case', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPrize(data.prize);
      fetchInventory();
    } else {
      setError(data.error || 'Error opening case');
    }
  }

  function logout() {
    fetch(SERVER + '/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => setPage('login'));
  }

  if (page === 'age') {
    return (
      <div style={{textAlign: 'center', marginTop: 50}}>
        <h2>Are you 18 or older?</h2>
        <input
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
        <br /><br />
        <button onClick={verifyAge}>Enter</button>
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div style={{textAlign: 'center', marginTop: 50}}>
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br />
        <button onClick={login} disabled={loading}>Login</button>
        <button onClick={() => setPage('register')} disabled={loading}>Register</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </div>
    );
  }

  if (page === 'register') {
    return (
      <div style={{textAlign: 'center', marginTop: 50}}>
        <h2>Register</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={e => setAge(e.target.value)}
        /><br />
        <button onClick={register} disabled={loading}>Register</button>
        <button onClick={() => setPage('login')} disabled={loading}>Back to Login</button>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </div>
    );
  }

  if (page === 'case') {
    return (
      <div style={{textAlign: 'center', marginTop: 50}}>
        <h2>Case Opening</h2>
        <button onClick={openCase} disabled={loading}>{loading ? 'Opening...' : 'Open Case'}</button>
        <button onClick={logout} style={{marginLeft: 20}}>Logout</button>
        {prize && (
          <div style={{marginTop: 20}}>
            <h3>You won: {prize.name}</h3>
            <p>Rarity: {prize.rarity}</p>
          </div>
        )}
        <h3>Your Inventory:</h3>
        <ul style={{listStyle: 'none'}}>
          {inventory.map((item, i) => (
            <li key={i}>{item.name} - {item.rarity}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}