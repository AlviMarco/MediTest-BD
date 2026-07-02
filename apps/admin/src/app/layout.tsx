import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediTest BD Admin',
  description: 'MediTest BD Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var mode = localStorage.getItem('meditest_admin_ui_mode') || 'modern';
                  document.documentElement.setAttribute('data-admin-ui', mode);
                } catch (error) {
                  document.documentElement.setAttribute('data-admin-ui', 'modern');
                }
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
