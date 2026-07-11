import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Masthead from './Masthead';
import Preface from './Preface';
import StatBlock from './StatBlock';
import TOC from './TOC';
import K8Playground from '../playground/K8Playground';
import Colophon from './Colophon';

export default function LandingPage() {
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
    </>
  );
}
