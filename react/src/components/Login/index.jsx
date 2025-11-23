import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginRequest } from '../../api/auth';
import { saveToken, saveMember } from '../../api/authStorage';
import { useAuth } from '../../App';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login, isAuthenticated, isHydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isHydrated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      setError('Пожалуйста, заполните имя пользователя и пароль.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginRequest({
        username: trimmedUsername,
        password,
      });

      const token = data.token;
      const member = data.member;

      if (token) {
        saveToken(token);
      }

      if (member) {
        saveMember(member);
      }

      login({ token, member });
      navigate('/', { replace: true });
    } catch (submitError) {
      let message = 'Неверное имя пользователя или пароль.';

      if (
        submitError.response &&
        submitError.response.data &&
        typeof submitError.response.data === 'object'
      ) {
        const data = submitError.response.data;

        if (typeof data.detail === 'string') {
          message = data.detail;
        }
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      data-easytag="id1-react/src/components/Login/index.jsx"
      className="page-container"
    >
      <section className="page-header">
        <h1 className="page-title">Вход</h1>
        <p className="page-subtitle">
          Введите имя пользователя и пароль, чтобы войти.
        </p>
      </section>

      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="login-username" className="form-label">
            Имя пользователя
          </label>
          <input
            id="login-username"
            type="text"
            className="form-input"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password" className="form-label">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            placeholder="Введите пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="button-primary form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>

        <p className="form-note">
          Нет аккаунта?
          {' '}
          <Link to="/register" className="link-inline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Login;
