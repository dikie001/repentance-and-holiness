import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { ThemeProvider, useTheme } from "./components/theme-provider"
import { AppLayout } from "./components/layout/AppLayout"
import HomePage from "./features/users/home"
import RadioPage from "./features/users/radio"
import MediaPage from "./features/users/media"
import PropheciesPage from "./features/users/prophecies"
import AboutPage from "./features/users/about"
import TeachingsPage from "./features/users/teachings"
import GalleryPage from "./features/users/gallery"
import NotFound from "./components/NotFound"

function AppContent() {
  const { theme } = useTheme()
  return (
    <>
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
      {/* Dynamic theming via useTheme hook so user preference is respected instantly */}
      <Toaster 
        theme={theme as "system" | "light" | "dark"} 
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "0", // Handled by custom component
            border: "none",
            background: "transparent",
            color: "var(--app-text)",
            fontFamily: "var(--font-barlow)",
            boxShadow: "none",
          },
        }}
      />
    </>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="rh-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
