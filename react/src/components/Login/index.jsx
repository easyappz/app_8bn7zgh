import React from 'react';

function Login() {
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

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="form-field">
          <label htmlFor="login-username" className="form-label">
            Имя пользователя
          </label>
          <input
            id="login-username"
            type="text"
            className="form-input"
            placeholder="Введите имя пользователя"
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
          />
        </div>

        <button type="submit" className="button-primary form-submit">
          Войти
        </button>
      </form>
    </main>
  );
}

export default Login;
