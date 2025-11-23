import React, { useEffect, useState, useMemo } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';

import {
  getToken,
  getMember,
} from './api/authStorage';
import { logout as apiLogout } from './api/auth';

export const AuthContext = React.createContext(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AnonymousRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [currentToken, setCurrentToken] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const navigate = useNavigate();

  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

  useEffect(() => {
    const storedToken = getToken();
    const storedMember = getMember();

    if (storedToken) {
      setCurrentToken(storedToken);
    }

    if (storedMember) {
      setCurrentMember(storedMember);
    }

    setIsHydrated(true);
  }, []);

  const handleLogin = ({ token, member }) => {
    setCurrentToken(token || null);
    setCurrentMember(member || null);
  };

  const handleLogout = async () => {
    const token = currentToken;

    try {
      if (token) {
        await apiLogout(token);
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      setCurrentToken(null);
      setCurrentMember(null);
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authMember');
      }
      navigate('/login', { replace: true });
    }
  };

  const authContextValue = useMemo(
    () => ({
      token: currentToken,
      member: currentMember,
      isAuthenticated: Boolean(currentToken),
      isHydrated,
      login: handleLogin,
      logout: handleLogout,
    }),
    [currentToken, currentMember, isHydrated],
  );

  return (
    <div data-easytag="id1-react/src/App.jsx" className="app-root">
      <ErrorBoundary>
        <AuthContext.Provider value={authContextValue}>
          <div className="app-layout">
            <header className="app-header">
              <div className="app-header-inner">
                <div className="app-logo">Групповой чат</div>
                <nav className="app-nav">
                  {authContextValue.isAuthenticated && (
                    <Link to="/" className="app-nav-link">
                      Чат
                    </Link>
                  )}

                  {!authContextValue.isAuthenticated && (
                    <>
                      <Link to="/register" className="app-nav-link">
                        Регистрация
                      </Link>
                      <Link to="/login" className="app-nav-link">
                        Вход
                      </Link>
                    </>
                  )}

                  {authContextValue.isAuthenticated && (
                    <>
                      <Link to="/profile" className="app-nav-link">
                        Профиль
                      </Link>
                      {authContextValue.member && (
                        <span className="app-nav-user">
                          {authContextValue.member.username}
                        </span>
                      )}
                      <button
                        type="button"
                        className="app-nav-link app-nav-button"
                        onClick={handleLogout}
                      >
                        Выйти
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </header>

            <main className="app-main">
              <Routes>
                <Route
                  path="/"
                  element={(
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  )}
                />
                <Route
                  path="/register"
                  element={(
                    <AnonymousRoute>
                      <Register />
                    </AnonymousRoute>
                  )}
                />
                <Route
                  path="/login"
                  element={(
                    <AnonymousRoute>
                      <Login />
                    </AnonymousRoute>
                  )}
                />
                <Route
                  path="/profile"
                  element={(
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  )}
                />
              </Routes>
            </main>
          </div>
        </AuthContext.Provider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
