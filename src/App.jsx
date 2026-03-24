import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ToolPlaceholder from "./pages/tools/ToolPlaceholder";
import tools, { getRelatedTools } from "./tools";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {tools.map((tool) => (
            <Route
              key={tool.path}
              path={`tools/${tool.path}`}
              element={
                <ToolPlaceholder
                  name={tool.name}
                  icon={tool.icon}
                  relatedTools={getRelatedTools(tool.path)}
                />
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
