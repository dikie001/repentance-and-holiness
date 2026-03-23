import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import HomePage from "./features/users/home"
import RadioPage from "./features/users/radio"
import MediaPage from "./features/users/media"
import PropheciesPage from "./features/users/prophecies"
import AboutPage from "./features/users/about"
import Dashboard from "./features/admin/dashboard"
import NotFound from "./components/NotFound"

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="jesus-is-lord-radio" element={<RadioPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="prophecies" element={<PropheciesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="admin/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-center" />
    </>
  )
}

export default App
