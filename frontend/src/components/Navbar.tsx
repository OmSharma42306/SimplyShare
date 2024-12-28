import { Link } from 'react-router-dom';
import { Share2, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className={`flex items-center space-x-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Share2 className="w-8 h-8" />
            <span className="text-xl font-bold">FileShare by Om Sharma</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}