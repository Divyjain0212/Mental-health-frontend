import React from 'react';
import { Heart, Phone, Mail, MapPin, Globe } from 'lucide-react';
import logo from './logo.jpg'; // Imports the logo from the same folder

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={logo}
                alt="Mastik Setu Logo" 
                className="w-8 h-8 mr-2 rounded-full object-cover" 
              />
              <h3 className="text-xl font-bold">Mastishk Setu</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering Indian college students with culturally-aware, accessible mental health support designed for their unique challenges and experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Access</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/resources" className="text-gray-300 hover:text-white transition-colors">Resources</a></li>
              <li><a href="/ai-support" className="text-gray-300 hover:text-white transition-colors">AI Support Chat</a></li>
              <li><a href="/peer-forum" className="text-gray-300 hover:text-white transition-colors">Peer Forum</a></li>
              <li><a href="/counselors" className="text-gray-300 hover:text-white transition-colors">Find Counselors</a></li>
              <li><a href="/relaxation" className="text-gray-300 hover:text-white transition-colors">Relaxation Tools</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get Help</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>Crisis: 022-27546669</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>Campus: +91-9876543200</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>support@mastishksetu.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Student Support Center</span>
              </li>
            </ul>
          </div>

          {/* Languages & Community */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Community</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-300 mb-2">Available in:</p>
                <div className="flex flex-wrap gap-1">
                  {['English', 'हिन्दी', 'বাংলা', 'తెలుగు'].map(lang => (
                    <span key={lang} className="px-2 py-1 bg-gray-700 rounded text-xs">{lang}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={16} />
                <span className="text-sm">Multi-campus support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Heart size={16} className="text-red-400" />
                <p className="text-sm text-gray-300">
                  Made with care for Indian college students
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-400 mb-1">
                  © 2025 Mastishk Setu. Open Source Mental Health Platform.
                </p>
                <p className="text-xs text-gray-500">
                  Privacy First • Culturally Sensitive • Always Confidential
                </p>
              </div>
            </div>
        </div>
      </div>
    </footer>
  );
};