import './style.css';
import p5 from 'p5';
import { sketchConfig } from './config.js';
import { initTransport } from './engine/transport.js';
import { sketch } from './sketch.js';
import { mountDevtools } from './ui/devtools.js';

const app = document.querySelector('#app');

async function boot() {
  try {
    await initTransport(sketchConfig);
  } catch (error) {
    console.error(error);
    if (app) {
      app.textContent = `Failed to load sketch media: ${error.message}`;
    }
    return;
  }

  mountDevtools();
  // eslint-disable-next-line no-new
  new p5(sketch, app ?? undefined);
}

boot();
