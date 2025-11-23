import React from 'react';

function Register() {
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

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="form-field">
          <label htmlFor="register-username" className="form-label">
            Имя пользователя
          </label>
          <input
            id="register-username"
            type="text"
            className="form-input"
            placeholder="Введите имя пользователя"
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
          />
        </div>

        <button type="submit" className="button-primary form-submit">
          Зарегистрироваться
        </button>
      </form>
    </main>
  );
}

export default Register;
