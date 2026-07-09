import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeftBar from './leftBar';
import { BrowserRouter } from 'react-router';

// Mock Image component
vi.mock('../image/image', () => ({
  default: ({ path, alt, className }) => <img src={path} alt={alt} className={className} data-testid="mock-image" />,
}));

describe('LeftBar Component', () => {
  it('renders all menu links correctly', () => {
    render(
      <BrowserRouter>
        <LeftBar />
      </BrowserRouter>
    );
    
    const links = screen.getAllByRole('link');
    // logo(1) + home(1) + create(1) + saved(1) + updates(1) + messages(1) + settings(1) = 7 links
    expect(links).toHaveLength(7);

    // Verify hrefs
    expect(links[0]).toHaveAttribute('href', '/'); // logo
    expect(links[1]).toHaveAttribute('href', '/'); // home
    expect(links[2]).toHaveAttribute('href', '/create'); // create
    expect(links[3]).toHaveAttribute('href', '/saved'); // saved
    expect(links[4]).toHaveAttribute('href', '/notifications'); // notifications
    expect(links[5]).toHaveAttribute('href', '/messages'); // messages
    expect(links[6]).toHaveAttribute('href', '/settings'); // settings
  });

  it('renders correctly with images', () => {
    render(
      <BrowserRouter>
        <LeftBar />
      </BrowserRouter>
    );

    const images = screen.getAllByTestId('mock-image');
    // logo, home, create, updates, messages, settings = 6 images
    expect(images).toHaveLength(6);
    expect(images[0]).toHaveAttribute('src', '/general/logo.png');
    expect(images[1]).toHaveAttribute('src', '/general/home.svg');
    expect(images[5]).toHaveAttribute('src', '/general/settings.svg');
  });
});
