import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User, Shield, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from './logo.jpg'; // Imports the logo image

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  const primaryNav = [
    { to: '/', label: t('nav.home') },
    { to: '/resources', label: t('nav.resources') },
    { to: '/relaxation', label: t('nav.relaxation') },
    { to: '/ai-support', label: t('nav.chat') },
    { to: '/counselors', label: t('nav.counselors') },
  ];
  const moreNav = [
    { to: '/peer-forum', label: t('nav.forum') },
    { to: '/games', label: 'Games' },
    { to: '/redeem', label: 'Redeem' },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Site Name */}
          <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <div className="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="Mastishk Setu Logo"
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
              <h1 className="text-xl font-bold text-gray-900">Mastishk Setu</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isLogin && (
            <nav className="hidden md:flex items-center space-x-2">
              {primaryNav.map((item) => (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  {item.label}
                </NavLink>
              ))}
              {/* More dropdown */}
              <div className="relative">
                <button onClick={() => setIsMenuOpen(isMenuOpen => !isMenuOpen)} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center gap-1">
                  <MoreHorizontal size={16} /> More
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {moreNav.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `block w-full text-left px-4 py-2 text-sm ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right side controls (Desktop) */}
          {!isLogin && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <Globe size={16} />
                  <span>{languages.find(l => l.code === currentLanguage)?.nativeName}</span>
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLanguageOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            currentLanguage === lang.code ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      <Shield size={16} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <User size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <User size={16} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          {!isLogin && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {!isLogin && isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-md">
              {[...primaryNav, ...moreNav].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'text-blue-600 bg-blue-100'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};