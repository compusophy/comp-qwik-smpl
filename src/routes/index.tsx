import { component$, useVisibleTask$, useSignal, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

interface PerformanceMetrics {
  pageLoadTime?: number;
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  ttfb?: number; // Time to First Byte
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
}

export default component$(() => {
  const metrics = useSignal<PerformanceMetrics>({});
  const showMetrics = useSignal(false);
  
  useStyles$(`
    .metrics-container {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #eaeaea;
      border-radius: 8px;
      background-color: #f8f8f8;
    }
    .metrics-list {
      list-style: none;
      padding: 0;
    }
    .metrics-list li {
      padding: 0.5rem 0;
      border-bottom: 1px dashed #eaeaea;
    }
    .bundle-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eaeaea;
    }
    pre {
      background-color: #eaeaea;
      padding: 0.5rem;
      overflow-x: auto;
      border-radius: 4px;
    }
    button {
      background-color: #0070f3;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 1rem;
    }
    button:hover {
      background-color: #0060df;
    }
  `);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // This runs on the client after the component is mounted
    // Add the Farcaster Frame SDK from CDN
    const sdkScript = document.createElement('script');
    sdkScript.src = 'https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk/dist/index.min.js';
    sdkScript.async = true;
    
    sdkScript.onload = () => {
      // Once the SDK is loaded, call the ready function
      // @ts-ignore - frame is globally available from the CDN script
      window.frame.sdk.actions.ready();
      console.log("Farcaster Frame SDK ready called from CDN");
    };
    
    document.head.appendChild(sdkScript);

    // Get basic page load time
    const pageLoadTime = performance.now();
    metrics.value = { ...metrics.value, pageLoadTime };

    // Get First Contentful Paint
    if ('performance' in window) {
      const perfEntries = performance.getEntriesByType('paint');
      const fcpEntry = perfEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.value = { ...metrics.value, fcp: fcpEntry.startTime };
      }
    }

    // Get Time to First Byte (TTFB)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      metrics.value = { 
        ...metrics.value, 
        ttfb: navEntry.responseStart 
      };
    }

    // For more accurate Web Vitals, we would use the web-vitals library
    // But for simplicity, we're using the basic Performance API

    // Wait to show metrics until values are populated
    setTimeout(() => {
      // Get Largest Contentful Paint (approximate)
      const lcpEntries = performance.getEntriesByType('element');
      if (lcpEntries.length > 0) {
        const lastLcpEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry;
        metrics.value = { ...metrics.value, lcp: lastLcpEntry?.startTime || 0 };
      }
      showMetrics.value = true;
    }, 300);
  });

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Can't wait to see what you build with CQS!
        <br />
        Happy coding.
      </div>

      {showMetrics.value && (
        <div class="metrics-container">
          <h3>📊 Performance Metrics</h3>
          <button onClick$={() => showMetrics.value = !showMetrics.value}>
            {showMetrics.value ? 'Hide Metrics' : 'Show Metrics'}
          </button>
          <ul class="metrics-list">
            <li>Page Load Time: {Math.round(metrics.value.pageLoadTime || 0)}ms</li>
            <li>First Contentful Paint: {Math.round(metrics.value.fcp || 0)}ms</li>
            <li>Time to First Byte: {Math.round(metrics.value.ttfb || 0)}ms</li>
            {metrics.value.lcp && <li>Largest Contentful Paint: {Math.round(metrics.value.lcp)}ms</li>}
            {metrics.value.cls && <li>Cumulative Layout Shift: {metrics.value.cls.toFixed(3)}</li>}
            {metrics.value.fid && <li>First Input Delay: {Math.round(metrics.value.fid)}ms</li>}
          </ul>
          
          <div class="bundle-info">
            <h4>Symbol Usage</h4>
            <p>To collect symbol usage, add this code to your debug build:</p>
            <pre>
{`<script>
  window.symbols = [];
  document.addEventListener('qsymbol', (e) => window.symbols.push(e.detail));
</script>`}
            </pre>
            <p>Then run <code>console.log(window.symbols)</code> in the browser console.</p>
          </div>
        </div>
      )}
    </>
  );
});

const appUrl = "https://comp-qwik-smpl.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/icon.jpg`,
  button: {
    title: "CQS",
    action: {
      type: "launch_frame",
      name: "CQS", 
      url: appUrl,
      splashImageUrl: `${appUrl}/icon.jpg`,
      splashBackgroundColor: "#000000",
    },
  },
};

export const head: DocumentHead = {
  title: "CQS",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
    {
      property: "og:title",
      content: "CQS",
    },
    {
      property: "og:description",
      content: "A simple Farcaster Frame app built with Qwik",
    },
    {
      property: "og:image",
      content: `${appUrl}/icon.jpg`,
    },
    {
      property: "fc:frame",
      content: JSON.stringify(frame),
    },
  ],
};
