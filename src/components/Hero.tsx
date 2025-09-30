import React from 'react';
import { Heart, Shield, Users, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            {t('hero.subtitle')}
          </p>
          <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg">
            {t('hero.cta')}
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
              <Heart className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Culturally Aware</h3>
            <p className="text-blue-100 text-sm">Mental health support designed for Indian students</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Completely Private</h3>
            <p className="text-blue-100 text-sm">Anonymous support with end-to-end privacy</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Peer Community</h3>
            <p className="text-blue-100 text-sm">Connect with fellow students in safe spaces</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Educational Resources</h3>
            <p className="text-blue-100 text-sm">Learn about mental wellness in your language</p>
          </div>
        </div>
      </div>
    </section>
  );
};