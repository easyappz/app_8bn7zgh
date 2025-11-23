import React from 'react';

function Home() {
  return (
    <main
      data-easytag="id1-react/src/components/Home/index.jsx"
      className="page-container chat-page"
    >
      <section className="page-header">
        <h1 className="page-title">Групповой чат</h1>
        <p className="page-subtitle">
          Здесь будет отображаться общий чат всех пользователей.
        </p>
      </section>

      <section className="chat-layout">
        <div className="chat-messages">
          <div className="chat-messages-placeholder">
            Сообщения чата появятся здесь.
          </div>
        </div>

        <form
          className="chat-input-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="form-label" htmlFor="chat-message">
            Сообщение
          </label>
          <div className="chat-input-row">
            <input
              id="chat-message"
              type="text"
              className="form-input chat-input"
              placeholder="Введите сообщение..."
            />
            <button type="submit" className="button-primary">
              Отправить
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Home;
