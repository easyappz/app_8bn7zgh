import React from 'react';

function Profile() {
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
        <div className="profile-field">
          <span className="profile-label">Имя пользователя:</span>
          <span className="profile-value">demo_user</span>
        </div>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="form-field">
            <label htmlFor="profile-password" className="form-label">
              Новый пароль
            </label>
            <input
              id="profile-password"
              type="password"
              className="form-input"
              placeholder="Введите новый пароль"
            />
          </div>

          <button type="submit" className="button-primary form-submit">
            Сохранить профиль
          </button>
        </form>
      </section>
    </main>
  );
}

export default Profile;
