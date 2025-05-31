import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-pink-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">SmartPark SIMS</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/spare-parts" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700">
              Spare Parts
            </Link>
            <Link to="/stock-in" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700">
              Stock In
            </Link>
            <Link to="/stock-out" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700">
              Stock Out
            </Link>
            <Link to="/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-700">
              Reports
            </Link>

            <div className="ml-4 flex items-center">
              <span className="mr-4">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium bg-pink-700 hover:bg-pink-800"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-pink-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/spare-parts"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-700"
              onClick={closeMenu}
            >
              Spare Parts
            </Link>
            <Link
              to="/stock-in"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-700"
              onClick={closeMenu}
            >
              Stock In
            </Link>
            <Link
              to="/stock-out"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-700"
              onClick={closeMenu}
            >
              Stock Out
            </Link>
            <Link
              to="/reports"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-700"
              onClick={closeMenu}
            >
              Reports
            </Link>

            <div className="pt-4 pb-3 border-t border-pink-700">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium">{user?.fullName}</div>
                  <div className="text-sm font-medium text-pink-300">{user?.username}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-pink-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
