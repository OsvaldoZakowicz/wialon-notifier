export const metadata = {
  title: 'Wialon Notifier',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          padding: '2rem',
          background: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        {children}
      </body>
    </html>
  );
}
