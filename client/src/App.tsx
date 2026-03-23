import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { ThemeProvider } from "./components/theme-provider"
import { AppLayout } from "./components/layout/AppLayout"
import HomePage from "./features/users/home"
import RadioPage from "./features/users/radio"
import MediaPage from "./features/users/media"
import PropheciesPage from "./features/users/prophecies"
import AboutPage from "./features/users/about"
import TeachingsPage from "./features/users/teachings"
import GalleryPage from "./features/users/gallery"
import NotFound from "./components/NotFound"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="rh-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="jesus-is-lord-radio" element={<RadioPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="teachings" element={<TeachingsPage />} />
            <Route path="prophecies" element={<PropheciesPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-center" />
    </ThemeProvider>
  )
}

export default App
