import { findChrome } from '@/common/utils/findChrome';
import puppeteer from 'puppeteer-core';

interface IOptions {
  title: string;
  bgcolor?: string;

  args?: string[];

  height?: number;
  width?: number;
  left?: number;
  top?: number;
}

const defaultRect = {
  bgcolor: '#ffffff',
  height: 600,
  width: 800,
  left: 0,
  top: 0,
};

export async function launch(options: IOptions) {
  options = {
    ...defaultRect,
    ...options,
  };

  const executablePath = findChrome();
  if (!executablePath) {
    console.error(
      'Could not find Chrome installation, please make sure Chrome browser is installed from https://www.google.com/chrome/.',
    );
    process.exit(0);
  }

  const targetPage = `
    <title>${encodeURIComponent(options.title || '')}</title>
    <style>html{background:${encodeURIComponent(options.bgcolor as string)};}</style>
    `;

  const args = [
    `--app=data:text/html,${targetPage}`,
    '--enable-features=NetworkService,NetworkServiceInProcess',
  ];

  if (options.args) args.push(...options.args);
  if (typeof options.width === 'number' && typeof options.height === 'number') {
    args.push(`--window-size=${options.width},${options.height}`);
  }
  if (typeof options.left === 'number' && typeof options.top === 'number') {
    args.push(`--window-position=${options.left},${options.top}`);
  }

  let browser: puppeteer.Browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      pipe: true,
      defaultViewport: null,
      headless: true,
      args,
    });
  } catch (e: any) {
    if (e.toString().includes('Target closed')) {
      throw new Error(
        'Could not start the browser or the browser was already running with the given profile.',
      );
    } else {
      throw e;
    }
  }
  return browser;
}
