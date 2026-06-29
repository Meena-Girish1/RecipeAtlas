import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import CountryPage from './pages/CountryPage';
import StatePage from './pages/StatePage';
import RecipeDetails from './pages/RecipeDetails';
import AddRecipe from './pages/AddRecipe';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/countries/:country" element={<CountryPage />} />
          <Route path="/countries/:country/states/:state" element={<StatePage />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/edit-recipe/:id" element={<AddRecipe />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-2xl px-6 py-24 text-center">
                <h1 className="text-3xl">Page not found</h1>
                <p className="mt-2 text-ink-300">This corner of the atlas hasn't been mapped yet.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
