'use client';

import { useEffect, useState } from 'react';
import type { CapturedNotification } from '@/lib/storage/NotificationRepository';

export default function Home() {
  const [notifications, setNotifications] = useState<CapturedNotification[]>(
    [],
  );

  useEffect(() => {
    // consultamos el mismo endpoint que usa wialon (via GET) en vez de leer el store
    // directo, para no depender de que server component y route handler compartan modulo
    const fetchNotifications = () => {
      fetch('/api/notifications/wialon')
        .then((res) => res.json())
        .then(setNotifications)
        .catch((error) =>
          console.error('error consultando notificaciones', error),
        );
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <h1>wialon notifier — capturas recientes</h1>
      <p style={{ color: '#94a3b8' }}>
        endpoint: <code>/api/notifications/wialon?token=...</code>
      </p>

      {notifications.length === 0 && (
        <p>todavia no llego ninguna notificacion.</p>
      )}

      {notifications.map((n, i) => (
        <div
          key={i}
          style={{
            background: '#1e293b',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <strong style={{ color: '#38bdf8' }}>{n.receivedAt}</strong>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>
            {JSON.stringify(n.parsed, null, 2)}
          </pre>
          <details>
            <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>
              body crudo
            </summary>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#64748b' }}>
              {JSON.stringify(n.rawBody, null, 2)}
            </pre>
          </details>
        </div>
      ))}
    </main>
  );
}
