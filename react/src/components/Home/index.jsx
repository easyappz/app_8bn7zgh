import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../App';
import { getMessages, sendMessage } from '../../api/chat';

const POLLING_INTERVAL_MS = 7000;

function Home() {
  const { token, member, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const loadMessages = useCallback(
    async ({ showLoader } = { showLoader: false }) => {
      if (!token) {
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      setLoadError('');

      try {
        const data = await getMessages(token);

        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (error) {
        setLoadError('Не удалось загрузить сообщения');
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isCancelled = false;

    const runInitialLoad = async () => {
      if (!isCancelled) {
        await loadMessages({ showLoader: true });
      }
    };

    runInitialLoad();

    const intervalId = window.setInterval(() => {
      if (!isCancelled) {
        loadMessages();
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [token, loadMessages]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);

    if (validationError) {
      setValidationError('');
    }

    if (sendError) {
      setSendError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const trimmed = inputValue.trim();

    if (!trimmed) {
      setValidationError('Введите текст сообщения');
      return;
    }

    setIsSending(true);
    setSendError('');

    try {
      const createdMessage = await sendMessage({ token, text: trimmed });

      if (createdMessage) {
        setMessages((previous) => [...previous, createdMessage]);
      } else {
        await loadMessages();
      }

      setInputValue('');
    } catch (error) {
      setSendError('Не удалось отправить сообщение');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessages = () => {
    if (isLoading && messages.length === 0) {
      return <div className="chat-status">Загрузка сообщений...</div>;
    }

    if (messages.length === 0 && !loadError) {
      return (
        <div className="chat-messages-placeholder">
          Сообщений пока нет. Напишите первое сообщение.
        </div>
      );
    }

    return messages.map((message) => {
      const isOwnMessage =
        member &&
        message &&
        message.author &&
        typeof message.author.id !== 'undefined' &&
        member.id === message.author.id;

      const createdAt = message && message.created_at ? new Date(message.created_at) : null;
      const timeLabel = createdAt
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      return (
        <div
          key={message.id}
          className={isOwnMessage ? 'chat-message chat-message-own' : 'chat-message'}
        >
          <div className="chat-message-header">
            <span className="chat-message-author">
              {message.author && message.author.username
                ? message.author.username
                : 'Неизвестный пользователь'}
            </span>
            {timeLabel && <span className="chat-message-time">{timeLabel}</span>}
          </div>
          <div className="chat-message-text">{message.text}</div>
        </div>
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <main
        data-easytag="id1-react/src/components/Home/index.jsx"
        className="page-container chat-page"
      >
        <section className="page-header">
          <h1 className="page-title">Групповой чат</h1>
        </section>

        <section className="chat-access">
          <p className="chat-access-message">
            Для доступа к чату войдите или зарегистрируйтесь.
          </p>
          <div className="chat-access-actions">
            <Link to="/login" className="button-primary">
              Войти
            </Link>
            <Link to="/register" className="button-secondary">
              Зарегистрироваться
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      data-easytag="id1-react/src/components/Home/index.jsx"
      className="page-container chat-page"
    >
      <section className="page-header">
        <h1 className="page-title">Групповой чат</h1>
        <p className="page-subtitle">
          Общайтесь с другими пользователями в режиме, близком к реальному времени.
        </p>
      </section>

      <section className="chat-layout">
        <div className="chat-panel">
          {loadError && (
            <div className="chat-error">
              <span>{loadError}</span>
              <button
                type="button"
                className="button-link"
                onClick={() => loadMessages({ showLoader: true })}
              >
                Повторить
              </button>
            </div>
          )}

          <div className="chat-messages-container">
            <div className="chat-messages">{renderMessages()}</div>
          </div>
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="chat-message">
            Сообщение
          </label>
          <div className="chat-input-row">
            <input
              id="chat-message"
              type="text"
              className="form-input chat-input"
              placeholder="Введите сообщение..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={isSending}
            />
            <button type="submit" className="button-primary" disabled={isSending}>
              {isSending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>

          {validationError && <div className="form-error-text">{validationError}</div>}
          {sendError && <div className="form-error-text">{sendError}</div>}
        </form>
      </section>
    </main>
  );
}

export default Home;
