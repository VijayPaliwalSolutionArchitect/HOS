import Header from './Header';
import Footer from './Footer';

/**
 * MobileLayout component - Mobile-responsive layout wrapper
 * Optimized for smaller screens with adjusted spacing
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 */
const MobileLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-grow pt-16">
        <div className="px-4 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MobileLayout;
