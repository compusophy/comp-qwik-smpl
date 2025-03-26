import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
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
  });

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Can't wait to see what you build with qwik!
        <br />
        Happy coding.
      </div>
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
