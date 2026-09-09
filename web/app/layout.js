import './globals.css';
import { Providers } from './providers';
import SiteHeader from './components/SiteHeader';

export const metadata = {
  title: 'ARE YOU VERITY?',
  description:
    'A generative art ID system powered by ZK-proofs. Part of TRANSEVIL, a work by June Kuhn.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="shell">
            <SiteHeader />
            <main className="site-main">{children}</main>
            <footer className="site-footer">
              <span>
                Are You Verity? — a work by June Kuhn · Softworld 
              </span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
