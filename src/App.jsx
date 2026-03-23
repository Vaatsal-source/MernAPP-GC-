import React, { useState, useEffect } from "react";
import "./index.css";
import { gamesData } from "./gamesData";

const API_URL = "http://localhost:5000/api";

const StarRating = ({ rating, onRate }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        className={star <= rating ? "star filled" : "star"} 
        onClick={() => onRate && onRate(star)}
      >
        ★
      </span>
    ))}
  </div>
);

const LandingPage = ({ onExplore }) => (
  <div className="landing-container">
    <div className="hero-banner">
      <div className="hero-video-container">
        <video autoPlay muted loop playsInline className="hero-video-bg">
          <source src="/Landing_page.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <p className="hero-subtitle">Welcome to</p>
        <h1 className="hero-main-title">Gamer's Corner</h1>
        <button className="register-btn" onClick={onExplore}>Browse Games Now</button>
      </div>
    </div>
  </div>
);

const AuthPage = ({ onBack, onLoginSuccess }) => {
  const handleLogin = async () => {
    const googleUser = {
      googleId: "google-123",
      email: "gamer@example.com",
      displayName: "Gamer Pro",
      photoURL: "https://via.placeholder.com/150"
    };

    try {
      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser)
      });
      
      const json = await response.json();
      
      if (json.success) {
        localStorage.setItem("token", json.authToken);
        localStorage.setItem("gamerUser", JSON.stringify(json.user));
        onLoginSuccess(json.user);
        onBack();
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  return (
    <div className="auth-overlay fade-in">
      <div className="login-box">
        <h2>Join the Community</h2>
        <button className="login-submit-btn" onClick={handleLogin}>Continue with Google</button>
        <button className="nav-link-btn" onClick={onBack} style={{ marginTop: '10px' }}>Cancel</button>
      </div>
    </div>
  );
};

const GameSection = ({ game, onViewDetails, user }) => {
  const [stats, setStats] = useState({ avg: 0, total: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/ratings/${game.id}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching ratings:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [game.id]);

  const handleRate = async (stars) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to rate!");
    
    try {
      const res = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "auth-token": token 
        },
        body: JSON.stringify({
          gameId: game.id,
          rating: stars
        })
      });

      if (res.status === 400) {
        alert("You've already rated this game!");
      } else if (res.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        fetchStats(); 
      }
    } catch (error) {
      console.error("Rating Error:", error);
    }
  };

  return (
    <div className="info-section">
      <div className="image-container">
        <img src={game.imgSrc} alt={game.title} className="side-image" onClick={() => onViewDetails(game)} />
        <StarRating rating={0} onRate={handleRate} />
        <div className="rating-stats"><p>Avg: {stats.avg} ★ ({stats.total})</p></div>
      </div>
      <div className="description-card">
        <h2 className="section-title">{game.title}</h2>
        <p>{game.shortDescription}</p>
      </div>
    </div>
  );
};

const GameDetailView = ({ game, onBack, user }) => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/comments/${game.id}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [game.id]);

  const handlePost = async () => {
    const token = localStorage.getItem("token");
    if (!token || !input.trim()) return alert("Please login to post a review.");
    
    try {
      const payload = {
        gameId: game.id,
        text: input,
        userName: user.displayName,
        userPhoto: user.photoURL
      };

      // If editingId is set, the backend logic will treat this as an update
      if (editingId) payload.id = editingId;

      const res = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "auth-token": token 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingId(null);
        setInput("");
        fetchComments();
      }
    } catch (e) {
      console.error("Post Error:", e);
    }
  };

  const handleEditClick = (comment) => {
    setEditingId(comment._id);
    setInput(comment.text);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (window.confirm("Delete this review?")) {
      try {
        await fetch(`${API_URL}/comments/${id}`, { 
          method: "DELETE",
          headers: { "auth-token": token }
        });
        fetchComments();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className="game-page-layout">
      <button className="gradient-button" onClick={onBack}>← Back</button>
      <div className="detail-header">
        <img src={game.imgSrc} className="side-image" alt="" />
        <div className="detail-text">
          <h1 className="gradient-text">{game.title}</h1>
          <div className="description-card">
            <p>{game.description}</p>
            {game.officialUrl && (
              <a href={game.officialUrl} target="_blank" rel="noreferrer">
                <button className="register-btn" style={{ marginTop: '20px' }}>Visit Official Site</button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="comment-section">
        <h3>Reviews ({comments.length})</h3>
        <div className="comment-input-group">
          <input
            placeholder={editingId ? "Editing your review..." : "Add a review..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handlePost} className="post-btn">{editingId ? "Update" : "Post"}</button>
          {editingId && <button onClick={() => { setEditingId(null); setInput(""); }} className="nav-link-btn">Cancel</button>}
        </div>

        <div className="comments-list">
          {comments.map((c) => (
            <div key={c._id} className="comment-bubble">
              <div className="comment-user">
                <img src={c.userPhoto} className="user-avatar" alt="" />
                <div className="user-info-meta">
                  <strong>{c.userName}</strong>
                  {c.editedAt && <span className="edited-tag">(edited)</span>}
                </div>
                {/* Checking against MongoDB User ID for authorization */}
                {user?._id === c.userId && (
                  <div className="comment-actions">
                    <button className="deco-btn edit" onClick={() => handleEditClick(c)}>
                      <span>✎</span> Edit
                    </button>
                    <button className="deco-btn delete" onClick={() => handleDelete(c._id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                      <span>🗑</span> Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("gamerUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gamerUser");
    localStorage.removeItem("token");
    setUser(null);
    setView("home");
  };

  const filteredGames = gamesData.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showLogin) return <AuthPage onBack={() => setShowLogin(false)} onLoginSuccess={setUser} />;

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-logo" onClick={() => setView("home")} style={{ cursor: 'pointer' }}>Gamer's Corner</div>
        {view === "browse" && (
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search Games..." 
              className="search-input" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button className="search-btn"></button>
          </div>
        )}
        <ul className="nav-links">
          <li><button className="nav-link-btn" onClick={() => setView("home")}>Home</button></li>
          <li><button className="nav-link-btn" onClick={() => setView("browse")}>Browse</button></li>
          <li>
            {user ? (
              <button className="nav-link-btn" onClick={handleLogout}>
                Logout ({user.displayName.split(' ')[0]})
              </button>
            ) : (
              <button className="nav-link-btn" onClick={() => setShowLogin(true)}>Login</button>
            )}
          </li>
        </ul>
      </nav>

      <div className="content">
        {view === "home" ? (
          <LandingPage onExplore={() => setView("browse")} />
        ) : view === "details" && activeGame ? (
          <GameDetailView game={activeGame} onBack={() => setView("browse")} user={user} />
        ) : (
          <div className="browse-section">
            <h1 className="gradient-text">{searchTerm ? `Results for "${searchTerm}"` : "Browse Games"}</h1>
            <div className="games-grid">
              {filteredGames.map((game) => (
                <GameSection 
                  key={game.id} 
                  game={game} 
                  user={user}
                  onViewDetails={(g) => { setActiveGame(g); setView("details"); }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}