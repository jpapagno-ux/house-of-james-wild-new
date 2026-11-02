// Two looks for James to compare (2 Nov 2026): concept B (deep-sea gradients, pearl type) is the default,
// concept A (the first preview) stays at ?look=a. Set on <html> before paint so nothing flashes; a ?look
// view is never indexed (noindex here, X-Robots-Tag in middleware for /whats-coming, canonical unchanged).
const JS = `(function(){try{var l=new URLSearchParams(location.search).get("look");if(l==="a"||l==="b"){document.documentElement.setAttribute("data-look",l);if(!document.querySelector('meta[name="robots"][data-look]')){var m=document.createElement("meta");m.name="robots";m.content="noindex, follow";m.setAttribute("data-look","");document.head.appendChild(m);}}}catch(e){}})();`;
export default function LookScript() {
  return <script dangerouslySetInnerHTML={{ __html: JS }} />;
}
