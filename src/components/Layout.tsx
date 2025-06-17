import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 text-center shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold">INSA Tutoring</h1>
      </header>
      
      <main className="flex-grow py-10 px-4 md:px-0">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto text-sm">
        <p>&copy; 2025 INSA Centre-Val de Loire - Plateforme de Tutorat</p>
      </footer>
    </div>
  );
};

export default Layout;