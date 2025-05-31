import { Link } from 'react-router-dom';
import AppWrapperHOC from '../Root/HOC';

const paths = [
  '/haven',
  '/dungeon',
  '/chamber',
  '/sanctuary',
  '/nest',
  '/cove',
  '/hideout',
  '/den',
  '/vault',
];



const Home = ({ theme, user }: { theme?: 'light' | 'vs-dark', user?: { name: string, hex: string } }) => {


  const isDark = theme === 'vs-dark';

  return (
    <div
      className="flex flex-col items-center p-8"
    >

      {/* Heading */}
      <div className="text-center mb-12 mt-20">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-lg">
          Choose your destination below to begin your journey.
        </p>
      </div>

      {/* Paths Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {paths.map((path) => (
          <Link
            to={path}
            key={path}
            className={`rounded-2xl shadow-md transform hover:scale-105 transition-all duration-300 p-8 text-center text-2xl font-semibold ${
              isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-white text-gray-800 hover:bg-blue-100'
            }`}
          >
            {path.replace('/', '').toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
};

const WrappedHome = AppWrapperHOC(Home);
export default WrappedHome;
