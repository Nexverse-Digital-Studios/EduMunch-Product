import { useLocation } from "react-router-dom";

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.slice(1).split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ") || "Page";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
      <p className="mt-2 text-muted-foreground">This page is coming soon.</p>
    </div>
  );
};

export default PlaceholderPage;
