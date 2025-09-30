import React from 'react';

// Import the section components that make up your homepage
import { Hero } from './Hero';
import { ResourcesSection } from './ResourcesSection';
import { RelaxationSection } from './RelaxationSection';

const HomePage = () => {
  return (
    <>
      <Hero />
      <ResourcesSection />
      <RelaxationSection />
    </>
  );
};

export default HomePage;