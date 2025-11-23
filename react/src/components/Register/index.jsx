import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerMember } from '../../api/auth';
import { saveToken, saveMember } from '../../api/authStorage';
import { useAuth } from '../../App';

function Register() {
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
      const data = await registerMember({
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
      let message = 'Не удалось выполнить регистрацию. Попробуйте ещё раз.';

      if (
        submitError.response &&
        submitError.response.data &&
        typeof submitError.response.data === 'object'
      ) {
        const data = submitError.response.data;

        if (typeof data.detail === 'string') {
          message = data.detail;
        } else {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const value = data[firstKey];

            if (Array.isArray(value) && value.length > 0) {
              message = String(value[0]);
            } else if (typeof value === 'string') {
              message = value;
            }
          }
        }
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      data-easytag="id1-react/src/components/Register/index.jsx"
      className="page-container"
    >
      <section className="page-header">
        <h1 className="page-title">Регистрация</h1>
        <p className="page-subtitle">
          Создайте учетную запись, указав имя пользователя и пароль.
        </p>
      </section>

      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="register-username" className="form-label">
            Имя пользователя
          </label>
          <input
            id="register-username"
            type="text"
            className="form-input"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-password" className="form-label">
            Пароль
          </label>
          <input
            id="register-password"
            type="password"
            className="form-input"
            placeholder="Введите пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="button-primary form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="form-note">
          Уже есть аккаунт?
          {' '}
          <Link to="/login" className="link-inline">
            Войти
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
