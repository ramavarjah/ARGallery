import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ARGallery from './components/ARGallery'; // <-- Import it here

const Home = () => <div className="p-10 text-2xl">🏠 Home Page</div>;
const About = () => <div className="p-10 text-2xl">👋 About Me</div>;

function App() {
  return (
    <BrowserRouter>
      {/* Standard 2D Navigation */}
      <nav className="p-4 bg-white flex gap-4 border-b-2 border-gray-200 shadow-sm relative z-10">
        <Link to="/" className="text-blue-600 font-medium hover:text-blue-800">Home</Link>
        <Link to="/portfolio" className="text-blue-600 font-medium hover:text-blue-800">AR Gallery</Link>
        <Link to="/about" className="text-blue-600 font-medium hover:text-blue-800">About</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<ARGallery />} /> {/* <-- Use it here */}
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;