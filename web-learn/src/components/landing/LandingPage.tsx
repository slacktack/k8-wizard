import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Masthead from './Masthead';
import Preface from './Preface';
import StatBlock from './StatBlock';
import TOC from './TOC';
import K8Playground from '../playground/K8Playground';
import Colophon from './Colophon';
import OnboardingModal from '../ui/OnboardingModal';
import FloatingWizardButton from '../ui/FloatingWizardButton';

export default function LandingPage() {
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
