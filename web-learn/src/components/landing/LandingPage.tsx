import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Masthead from './Masthead';
import Preface from './Preface';
import StatBlock from './StatBlock';
import TOC from './TOC';
import WhatYouCanBuild from './WhatYouCanBuild';
import K8Playground from '../playground/K8Playground';
import Colophon from './Colophon';
import OnboardingModal from '../ui/OnboardingModal';
import FloatingWizardButton from '../ui/FloatingWizardButton';

export default function LandingPage() {
  const location = useLocation();

  // Scroll to a hash target (e.g. returning to /#curriculum from a phase page)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <main id="main">
        <Masthead />
        <Preface />
        <StatBlock />
        <TOC />
        <WhatYouCanBuild />
        <K8Playground />
        <Colophon />
      </main>
      <Footer />
      <OnboardingModal
        onStartCurriculum={() => scrollTo('curriculum')}
        onTryPlayground={() => scrollTo('playground')}
      />
      <FloatingWizardButton />
    </>
  );
}
