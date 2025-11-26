import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, BarChart3, type LucideIcon } from 'lucide-react';
import './css/LandingPage.css';

interface MousePosition {
  x: number;
  y: number;
}

interface Feature {
  icon: LucideIcon;
  text: string;
}


const LandingPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleSignIn = (): void => {
    window.location.href = '/auth/google';
  };

  const features: Feature[] = [
    { icon: BarChart3, text: 'Real-time Analytics' },
    { icon: Shield, text: 'Risk Intelligence' },
    { icon: Sparkles, text: 'AI Predictions' },
  ];

  return (
    <div className="landing-page-wrapper">
      {/* Animated Background Gradients */}
      <div 
        className="mouse-gradient"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
        }}
      />
      
      <div className="background-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className={`container main-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <div className="hero-content">
              <div className="brand-logo mb-4">
                <img src="/logo.png" className="text-primary nav-bar-logo"/>
                <span className="ps-0 logo-text">quorix+</span>
              </div>

              <div className="headline-section mb-4">
                <div className="ai-badge mb-3">
                  <Sparkles size={16} />
                  <span>AI-Powered Intelligence</span>
                </div>
                
                <h1 className="main-headline mb-3">
                  Portfolio insights
                  <br />
                  <span className="gradient-text">reimagined</span>
                </h1>
                
                <p className="lead-text">
                  Harness real-time market analysis, intelligent risk scoring, and AI-driven insights 
                  to make smarter investment decisions.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="feature-pill">
                    <feature.icon size={16} />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`col-md-6 d-flex justify-content-center glass-card-wrapper ${isLoaded ? 'loaded' : ''}`}>
            <div className="glass-card-container">
              <div className="glow-effect" />
              
              <div className="glass-card">
                <div className="shimmer-overlay" />

                <div className="card-content">
                  <div className="text-center mb-4">
                    <h2 className="card-title mb-2 text-white">Welcome back</h2>
                    <p className="card-subtitle text-white">Sign in to continue to your dashboard</p>

                     <button
                    onClick={handleGoogleSignIn}
                    className="btn google-signin-btn w-75 mx-auto mb-3 mt-4"
                    style={{background: "rgba(255,255,255,0.2)"}}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className='ps-2 text-white'>Continue with Google</span>
                  </button>
                  </div>
                  <p className="legal-text text-center">
                    By continuing, you agree to our{' '}
                    <a href="#" className="legal-link">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="legal-link">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`footer-section text-center ${isLoaded ? 'loaded' : ''}`}>
        <p className="footer-copyright mb-2">
          © 2025 quorix+. All rights reserved
        </p>
        <p className="footer-disclaimer">
          Quorix provides analytical tools and market data visualizations for educational purposes only. 
          This is not investment advice, and we do not provide recommendations or fiduciary services. 
          Nothing on this site should be treated as guidance on what you should buy, sell, or hold.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;