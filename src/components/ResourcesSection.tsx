import React, { useState } from 'react';
import { BookOpen, Video, FileText} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf' | 'interactive';
  category: 'anxiety' | 'depression' | 'stress' | 'relationships' | 'academics' | 'family';
  language: string;
  culturalContext: string;
  url: string; // This field holds the working link
}

const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'TED-Ed: What is depression?',
    description: 'Coping strategies for students transitioning from rural to urban academic settings.',
    type: 'video',
    category: 'depression',
    language: 'en',
    culturalContext: 'Specifically for students from rural backgrounds adjusting to city college life.',
    url: 'https://www.youtube.com/watch?v=XiCrniLQGYc'
  },
  {
    id: '2',
    title: 'Building Better Mental Health - HelpGuide.org',
    description: 'Navigate friendships, romantic relationships, and family dynamics during college years.',
    type: 'article', // Changed to article as it is a comprehensive guide
    category: 'relationships',
    language: 'en',
    culturalContext: 'Balances traditional values with modern college social dynamics.',
    url: 'https://www.helpguide.org/articles/mental-health/building-better-mental-health.htm'
  },
  {
    id: '3',
    title: 'Tips to Manage Anxiety and Stress - ADAA',
    description: 'Understanding anxiety beyond cultural misconceptions and seeking help.',
    type: 'article', // Changed to article as it is a list of tips
    category: 'anxiety',
    language: 'en',
    culturalContext: 'Addresses cultural stigma and promotes mental health awareness.',
    url: 'https://adaa.org/tips'
  },
  {
    id: '4',
    title: 'Guided Meditation for Stress Relief (Hindi)',
    description: '10-minute guided relaxation in Hindi to reduce stress and anxiety.',
    type: 'video',
    category: 'stress',
    language: 'hi',
    culturalContext: 'Simple Hindi instructions suitable for all levels.',
    url: 'https://www.youtube.com/watch?v=5ELrZ5QH8i4'
  },
  {
    id: '5',
    title: 'Study Motivation — 1 Hour LoFi (Instrumental)',
    description: 'Ambient focus music to help you study.',
    type: 'video',
    category: 'academics',
    language: 'en',
    culturalContext: 'Non-lyrical for universal comprehension.',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A'
  }
];

export const ResourcesSection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Topics' },
    { key: 'anxiety', label: 'Anxiety' },
    { key: 'depression', label: 'Depression' },
    { key: 'stress', label: 'Stress Management' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'academics', label: 'Academic Pressure' },
    { key: 'family', label: 'Family Dynamics' }
  ];

  const types = [
    { key: 'all', label: 'All Formats' },
    { key: 'article', label: 'Articles' },
    { key: 'video', label: 'Videos' },
    { key: 'pdf', label: 'Guides' },
    { key: 'interactive', label: 'Interactive' }
  ];

  const filteredResources = sampleResources.filter(resource => {
    return (selectedCategory === 'all' || resource.category === selectedCategory) &&
           (selectedType === 'all' || resource.type === selectedType);
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={20} className="text-red-500" />;
      case 'pdf': return <FileText size={20} className="text-blue-500" />;
      case 'interactive': return <BookOpen size={20} className="text-green-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('resources.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('resources.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm font-medium text-gray-700 flex items-center mr-4">Categories:</span>
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm font-medium text-gray-700 flex items-center mr-4">Format:</span>
            {types.map(type => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <a 
              key={resource.id} 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm font-medium text-gray-600 capitalize">{resource.type}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {resource.language.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    <strong>Cultural Context:</strong> {resource.culturalContext}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No resources found for the selected filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};