import { Link } from 'react-router-dom';
import { Share2, Download } from 'lucide-react';

interface HomeProps {
  darkMode: boolean;
}

export function Home({ darkMode }: HomeProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>
          Seamless File Sharing
        </h1>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-12`}>
          Share files of any size instantly, with no limitations
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/sender"
            className={`p-8 rounded-xl shadow-lg transition-transform hover:scale-105 
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
          >
            <Share2 className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Send Files
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share files securely with anyone
            </p>
          </Link>

          <Link
            to="/receiver"
            className={`p-8 rounded-xl shadow-lg transition-transform hover:scale-105 
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}
          >
            <Download className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Receive Files
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Accept incoming file transfers
            </p>
          </Link>
        </div>
        
      </div>

    
    </div>

  );
}