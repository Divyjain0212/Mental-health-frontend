import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Waves } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// --- Helper Audio Player Component ---
// This new component manages its own state, fixing the volume bug.
interface AudioPlayerProps {
  id: string;
  url: string;
  activePlayer: string | null;
  setActivePlayer: (id: string | null) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ id, url, activePlayer, setActivePlayer }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // If another player becomes active, this one should pause.
    if (activePlayer !== id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activePlayer, id, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setActivePlayer(null); // Announce that no player is active
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
      }
      audioRef.current.play();
      setIsPlaying(true);
      setActivePlayer(id); // Announce that this player is the active one
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMute} className="p-1 text-gray-600 hover:text-gray-800">
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};


// --- Main Relaxation Section Component ---

interface RelaxationContent {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'meditation' | 'music' | 'nature';
  duration: string;
  instructor?: string;
  language: string;
  culturalBackground: string;
  url: string;
}

const relaxationContent: RelaxationContent[] = [
    {
      id: '1',
      title: '5-Minute Guided Breathing Meditation',
      description: 'A quick breathing exercise to help you relieve stress and find your center.',
      type: 'breathing',
      duration: '5 min',
      instructor: 'Great Meditation',
      language: 'English',
      culturalBackground: 'Based on universal mindfulness breathing techniques.',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: '2',
      title: '10-Minute Meditation For Anxiety',
      description: 'A guided session to calm anxiety and release nervous tension.',
      type: 'meditation',
      duration: '10 min',
      instructor: 'Goodful',
      language: 'English',
      culturalBackground: 'A modern approach to mindfulness for anxiety relief.',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: '3',
      title: 'Indian Flute Music for Studying',
      description: 'Calming instrumental music to help you focus during study sessions.',
      type: 'music',
      duration: '3 hours',
      language: 'Instrumental',
      culturalBackground: 'Features the Bansuri, an ancient Indian flute, known for its soothing tones.',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
    {
      id: '4',
      title: 'Relaxing Sounds of a Village in India',
      description: 'Ambient sounds of nature and village life to help you feel connected and at peace.',
      type: 'nature',
      duration: '1 hour',
      language: 'Natural sounds',
      culturalBackground: 'Authentic field recordings to evoke a sense of home and tranquility.',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
  ];

export const RelaxationSection: React.FC = () => {
  const { t } = useLanguage();
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [breathingGuide, setBreathingGuide] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [breathCount, setBreathCount] = useState<number>(0);
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const cycleIdRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Cancel any pending timeouts when toggling
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    if (breathingActive) {
      const myCycle = ++cycleIdRef.current;
      const setLater = (fn: () => void, ms: number) => {
        const t = setTimeout(() => {
          // only run if this cycle is current and still active
          if (cycleIdRef.current === myCycle && breathingActive) fn();
        }, ms);
        timersRef.current.push(t);
      };

      const runCycle = () => {
        if (!breathingActive || cycleIdRef.current !== myCycle) return;
        setBreathingGuide('inhale');
        setLater(() => {
          setBreathingGuide('hold');
          setLater(() => {
            setBreathingGuide('exhale');
            setLater(() => {
              setBreathCount(prev => prev + 1);
              runCycle();
            }, 6000);
          }, 4000);
        }, 4000);
      };

      runCycle();
    } else {
      setBreathingGuide('idle');
    }

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      cycleIdRef.current++;
    };
  }, [breathingActive]);

  const types = [
    { key: 'all', label: 'All Practices', icon: Heart },
    { key: 'breathing', label: 'Breathing', icon: Waves },
    { key: 'meditation', label: 'Meditation', icon: Heart },
    { key: 'music', label: 'Music Therapy', icon: Volume2 },
    { key: 'nature', label: 'Nature Sounds', icon: Waves },
  ];

  const filteredContent =
    selectedType === 'all'
      ? relaxationContent
      : relaxationContent.filter((content) => content.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breathing': return 'bg-blue-100 text-blue-800';
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'music': return 'bg-green-100 text-green-800';
      case 'nature': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('relaxation.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('relaxation.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {types.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                  selectedType === type.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <IconComponent size={20} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Breathing Exercise */}
        <div className="mb-12 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-green-100 p-6">
          <h3 className="text-xl font-semibold mb-2">Box Breathing (4-4-6)</h3>
          <p className="text-gray-600 mb-4">A guided exercise to calm your nervous system. Follow the prompt below.</p>
          <div className="flex items-center space-x-4 mb-4">
            <button onClick={() => setBreathingActive(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Start</button>
            <button onClick={() => setBreathingActive(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Stop</button>
            <span className="text-sm text-gray-600">Cycles completed: {breathCount}</span>
          </div>
          <div className={`w-full h-40 flex items-center justify-center rounded-lg border ${breathingGuide === 'inhale' ? 'bg-blue-50 border-blue-200' : breathingGuide === 'hold' ? 'bg-purple-50 border-purple-200' : breathingGuide === 'exhale' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="text-2xl font-semibold text-gray-800 capitalize">{breathingGuide === 'idle' ? 'Ready' : breathingGuide}</span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredContent.map((content) => (
            <div key={content.id} className="bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(content.type)}`}>
                    {content.type}
                  </span>
                  <span className="text-sm text-gray-500">{content.duration}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
                <p className="text-gray-600 mb-4">{content.description}</p>
                {content.instructor && <p className="text-sm text-gray-500 mb-2"><span className="font-medium">Instructor:</span> {content.instructor}</p>}
                <p className="text-sm text-gray-500 mb-4"><span className="font-medium">Language:</span> {content.language}</p>
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-700"><span className="font-medium">Cultural Context:</span> {content.culturalBackground}</p>
                </div>
                {/* Use the new AudioPlayer component */}
                <AudioPlayer
                  id={content.id}
                  url={content.url}
                  activePlayer={activePlayer}
                  setActivePlayer={setActivePlayer}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};