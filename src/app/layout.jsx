import { Providers } from './providers';
import CustomCursor from '@/components/ui/CustomCursor';
import './globals.css';

export const metadata = {
  title: 'Aura — Feel the Space Before It Exists',
  description: 'Next-generation architectural experience design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-void antialiased overflow-x-hidden font-sans text-white">
        
        {/* Βγάλαμε τον Cursor έξω από τα animations των σελίδων */}
        <CustomCursor />
        
        <Providers>
          {/* Δώσαμε ένα μοναδικό key στο main περιεχόμενο */}
          <main key="main-content">{children}</main>
        </Providers>
        
      </body>
    </html>
  );
}