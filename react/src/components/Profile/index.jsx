import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { saveMember } from '../../api/authStorage';
import { useAuth } from '../../App';

function Profile() {
  const {
    token,
    member,
    isAuthenticated,
    isHydrated,
    login,
  } = useAuth();

  const [currentUsername, setCurrentUsername] = useState(
    member ? member.username : '',
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const profileData = await getProfile(token);
        setCurrentUsername(profileData.username);

        const updatedMember = {
          ...(member || {}),
          ...profileData,
        };

        saveMember(updatedMember);
        login({ token, member: updatedMember });
      } catch (fetchError) {
        setError('Не удалось загрузить профиль. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, isHydrated, token, navigate, member, login]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    const trimmedUsername = usernameInput.trim();
    const hasUsername = trimmedUsername.length > 0;
    const hasPassword = passwordInput.length > 0;

    if (!hasUsername && !hasPassword) {
      setError('Укажите новое имя пользователя или пароль.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateProfile({
        token,
        username: hasUsername ? trimmedUsername : undefined,
        password: hasPassword ? passwordInput : undefined,
      });

      setCurrentUsername(updated.username);

      const updatedMember = {
        ...(member || {}),
        ...updated,
      };

      saveMember(updatedMember);
      login({ token, member: updatedMember });

      setUsernameInput('');
      setPasswordInput('');
      setSuccess('Профиль успешно обновлён.');
    } catch (updateError) {
      let message = 'Не удалось сохранить профиль. Попробуйте ещё раз.';

      if (
        updateError.response &&
        updateError.response.data &&
        typeof updateError.response.data === 'object'
      ) {
        const data = updateError.response.data;

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
      setIsSaving(false);
    }
  };

  return (
    <main
      data-easytag="id1-react/src/components/Profile/index.jsx"
      className="page-container"
    >
      <section className="page-header">
        <h1 className="page-title">Профиль пользователя</h1>
        <p className="page-subtitle">
          Просмотр и изменение информации профиля.
        </p>
      </section>

      <section className="profile-section">
        {isLoading ? (
          <p>Загрузка профиля...</p>
        ) : (
          <>
            <div className="profile-field">
              <span className="profile-label">Имя пользователя:</span>
              <span className="profile-value">{currentUsername}</span>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="form-success" role="status">
                {success}
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="profile-username" className="form-label">
                  Новое имя пользователя
                </label>
                <input
                  id="profile-username"
                  type="text"
                  className="form-input"
                  placeholder="Введите новое имя пользователя"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="profile-password" className="form-label">
                  Новый пароль
                </label>
                <input
                  id="profile-password"
                  type="password"
                  className="form-input"
                  placeholder="Введите новый пароль"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="button-primary form-submit"
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить профиль'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default Profile;
