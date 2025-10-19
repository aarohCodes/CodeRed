import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Mail } from 'lucide-react';

const CodeRed = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [typedGreeting, setTypedGreeting] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Refs for section animations
  const valuePropositionRef = useRef(null);
  const testimonialsRef = useRef(null);
  const waitlistRef = useRef(null);
  
  // State for section animations
  const [valuePropositionVisible, setValuePropositionVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [waitlistVisible, setWaitlistVisible] = useState(false);
  
  useEffect(() => {
    // Redirect to test.html immediately
    window.location.href = '/test.html';
  }, []);
  
  useEffect(() => {
    // Fade in the title on page load
    setFadeIn(true);
    
    // Set the greeting based on time
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour >= 5 && hour < 12) {
      greetingText = 'good morning, early bird';
    } else if (hour >= 12 && hour < 17) {
      greetingText = 'hello, chef extraordinaire';
    } else if (hour >= 17 && hour < 22) {
      greetingText = 'good evening, night chef';
    } else {
      greetingText = 'welcome, night owl';
    }
    
    // Type out the greeting
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < greetingText.length) {
        setTypedGreeting(greetingText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 80);
    
    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === valuePropositionRef.current && entry.isIntersecting) {
          setValuePropositionVisible(true);
        } else if (entry.target === testimonialsRef.current && entry.isIntersecting) {
          setTestimonialsVisible(true);
        } else if (entry.target === waitlistRef.current && entry.isIntersecting) {
          setWaitlistVisible(true);
        }
      });
    }, observerOptions);
    
    if (valuePropositionRef.current) observer.observe(valuePropositionRef.current);
    if (testimonialsRef.current) observer.observe(testimonialsRef.current);
    if (waitlistRef.current) observer.observe(waitlistRef.current);
    
    return () => {
      clearInterval(typeInterval);
      clearInterval(testimonialInterval);
      observer.disconnect();
    };
  }, []);
  
  const testimonials = [
    {
      quote: "67 Kitchen helped me find the perfect lab for my interests. I was able to connect with researchers working on exactly what I'm passionate about.",
      author: "Alex Chen",
      role: "PhD Student, Computational Biology"
    },
    {
      quote: "I used to spend hours sifting through papers. 67 Kitchen's recommendations are spot-on and saved me countless hours of searching.",
      author: "Priya Sharma",
      role: "Masters Student, AI Research"
    },
    {
      quote: "As a lab director, 67 Kitchen helps me find students who are genuinely interested in our research area. The quality of applicants has been exceptional.",
      author: "Dr. Michael Rodriguez",
      role: "Lab Director, Quantum Computing"
    },
    {
      quote: "Finding project ideas used to be my biggest challenge. With 67 Kitchen, I discovered a research direction that I'm truly excited about.",
      author: "Emma Wilson",
      role: "Undergraduate Researcher"
    }
  ];
  
  return (
    <div className="antialiased font-['Raleway']">
      {/* Hero Section - Image Background */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 via-green-800/90 to-green-700/90 z-0">
          <img 
            src="/api/placeholder/1920/1080" 
            alt="Chef cooking background" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Logo and Tagline with Fade In */}
        <div 
          className={`relative z-10 text-center px-4 transition-all duration-1000 ease-in-out transform ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Typed Greeting */}
          <div className="mb-6">
            <p className="font-['IBM_Plex_Mono'] text-green-100 text-lg md:text-xl tracking-wide">
              <span>{typedGreeting}<span className="animate-pulse">_</span></span>
            </p>
          </div>
          
          <h1 
            className="font-['Inter'] text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
            style={{ 
              textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)'
            }}
          >
            67 Kitchen
          </h1>
          <p className="text-white/90 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light">
            Your Personal Chef. Your Smart Kitchen. Your Better Life.
          </p>
          <button 
            onClick={() => window.location.href = '/test.html'}
            className="px-8 py-3 bg-white/80 backdrop-blur-sm text-green-800 font-medium rounded-lg shadow-lg hover:bg-white transition-all duration-300 flex items-center mx-auto hover:scale-105"
          >
            Sign up! <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>
      
      {/* Value Proposition - Gradient Section with Glassmorphism */}
      <section 
        ref={valuePropositionRef} 
        className="relative py-24 px-4 overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50 to-green-100 z-0" />
        
        <div 
          className={`relative z-10 max-w-6xl mx-auto transition-all duration-1000 ease-out transform ${
            valuePropositionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center font-['Inter']">
            Stop getting lost in Google Scholar
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto text-center mb-16">
            67 Kitchen cuts through the noise and shows you what's worth your time, helping students and early researchers find the right papers, project ideas, and lab connections.
          </p>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Discover Relevant Research",
                description: "Find papers that actually matter to your interests, not just what has the most citations.",
                delay: 0
              },
              {
                title: "Find Project Ideas",
                description: "Get inspired with project suggestions based on your skills and research interests.",
                delay: 150
              },
              {
                title: "Connect With Labs",
                description: "Discover labs and researchers that align with your goals and research direction.",
                delay: 300
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="transition-all duration-700 ease-out transform"
                style={{ 
                  transitionDelay: `${feature.delay}ms`,
                  opacity: valuePropositionVisible ? 1 : 0,
                  transform: valuePropositionVisible ? 'translateY(0)' : 'translateY(12px)'
                }}
              >
                <FeatureCard 
                  title={feature.title} 
                  description={feature.description}
                  icon={<Star className="h-8 w-8 text-green-500" />}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials - Gradient Section with Glassmorphism Carousel */}
      <section 
        ref={testimonialsRef}
        className="relative py-24 px-4 overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-100 via-green-200 to-light-green-200 z-0" />
        
        {/* Content */}
        <div 
          className={`relative z-10 max-w-6xl mx-auto transition-all duration-1000 ease-out transform ${
            testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center font-['Inter']">
            Why Researchers Choose 67 Kitchen
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto text-center mb-16">
            Hear from students and researchers who've transformed their research journey.
          </p>
          
          {/* Testimonial Carousel */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative h-72 overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentTestimonial 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentTestimonial
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <TestimonialCard 
                    quote={testimonial.quote}
                    author={testimonial.author}
                    role={testimonial.role}
                  />
                </div>
              ))}
            </div>
            
            {/* Carousel Controls */}
            <div className="flex justify-between items-center mt-8">
              <button 
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full bg-white/60 backdrop-blur-md hover:bg-white/80 transition duration-200 hover:scale-110 shadow-md"
              >
                <ChevronLeft className="h-6 w-6 text-green-800" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-green-500 scale-125' : 'bg-green-300'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-2 rounded-full bg-white/60 backdrop-blur-md hover:bg-white/80 transition duration-200 hover:scale-110 shadow-md"
              >
                <ChevronRight className="h-6 w-6 text-green-800" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Waitlist Section with Same Background Image */}
      <section 
        id="waitlist" 
        ref={waitlistRef} 
        className="relative text-white py-24 px-4 overflow-hidden"
      >
        {/* Background Image (same as hero) */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/90 via-green-500/90 to-green-400/90 z-0">
          <img 
            src="/api/placeholder/1920/1080" 
            alt="Research lab background" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div 
          className={`relative z-10 max-w-3xl mx-auto transition-all duration-1000 ease-out transform ${
            waitlistVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-green-300/20 hover:shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center font-['Inter']">
              Join Our Waitlist
            </h2>
            <p className="text-xl text-white/90 mb-10 text-center">
              Be among the first to experience 67 Kitchen when we launch. Early members get priority access and special features.
            </p>
            
            <div className="flex flex-col gap-4 max-w-md mx-auto mb-8">
              {/* Sign Up Form */}
              {showSignUpForm && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 transition-all duration-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 transition-all duration-300"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      // Redirect to Dashboard.html
                      window.location.href = '/Dashboard.html';
                    }}
                    className="w-full px-6 py-3 bg-green-500/80 backdrop-blur-md text-white font-medium rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 flex items-center justify-center whitespace-nowrap hover:scale-105"
                  >
                    Complete Sign Up <ArrowRight size={18} className="ml-2" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowSignUpForm(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                    }}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Sign In Form */}
              {showSignInForm && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 transition-all duration-300"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      // Redirect to Dashboard.html
                      window.location.href = '/Dashboard.html';
                    }}
                    className="w-full px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-lg shadow-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center whitespace-nowrap hover:scale-105 border border-white/40"
                  >
                    Complete Sign In <Mail size={18} className="ml-2" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowSignInForm(false);
                      setEmail('');
                      setPhone('');
                    }}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Initial Buttons */}
              {!showSignUpForm && !showSignInForm && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowSignUpForm(true)}
                    className="flex-1 px-6 py-3 bg-green-500/80 backdrop-blur-md text-white font-medium rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 flex items-center justify-center whitespace-nowrap hover:scale-105"
                  >
                    Sign Up <ArrowRight size={18} className="ml-2" />
                  </button>
                  <button 
                    onClick={() => setShowSignInModal(true)}
                    className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-lg shadow-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center whitespace-nowrap hover:scale-105 border border-white/40"
                  >
                    Sign In <Mail size={18} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-white/80 text-sm text-center font-['IBM_Plex_Mono']">
              We respect your privacy and will never share your information.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer with Gradient */}
      <footer className="relative py-12 px-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50 to-green-200 z-0" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="font-['Inter'] text-2xl font-bold text-green-800">67 Kitchen</h2>
              <p className="text-sm text-green-700 font-['IBM_Plex_Mono']">Finding your research path</p>
            </div>
            
            <div className="flex gap-6">
              <a href="#about" className="text-green-700 hover:text-green-900 transition-all duration-300 hover:underline">About</a>
              <a href="#contact" className="text-green-700 hover:text-green-900 transition-all duration-300 hover:underline">Contact</a>
              <a href="#privacy" className="text-green-700 hover:text-green-900 transition-all duration-300 hover:underline">Privacy</a>
              <a href="#ethos" className="text-green-700 hover:text-green-900 transition-all duration-300 hover:underline">Ethos</a>
            </div>
          </div>
          
          <div className="border-t border-green-300/50 pt-8">
            <p className="text-sm text-center text-green-700 font-['IBM_Plex_Mono']">
              © {new Date().getFullYear()} 67 Kitchen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Sign In Modal */}
      {showSignInModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-300"
            >
              <span className="text-2xl text-gray-600">×</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🍳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-600 text-sm">Sign in to access your kitchen dashboard</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Sign in:', { username: signInUsername, password: signInPassword });
                window.location.href = '/profile.html';
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="signin-username" className="text-gray-900 font-semibold text-sm">
                  Name
                </label>
                <input
                  type="text"
                  id="signin-username"
                  required
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-all duration-300"
                  placeholder="Enter your name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="signin-password" className="text-gray-900 font-semibold text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="signin-password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                Sign In
                <ArrowRight size={18} />
              </button>

              <div className="text-center mt-2">
                <a href="#" className="text-green-500 text-sm font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/80 hover:shadow-xl transition-all duration-300 h-full transform hover:-translate-y-2 hover:bg-white/70">
    <div className="mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Inter']">{title}</h3>
    <p className="text-gray-600 font-['IBM_Plex_Mono'] text-sm">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author, role }) => (
  <div className="bg-white/60 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/50 h-full hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-green-400 text-green-400" />
      ))}
    </div>
    <p className="text-gray-700 mb-6 italic text-lg">"{quote}"</p>
    <div>
      <p className="font-semibold text-gray-900 font-['Inter']">{author}</p>
      <p className="text-sm text-gray-600 font-['IBM_Plex_Mono']">{role}</p>
    </div>
  </div>
);

export default CodeRed;
