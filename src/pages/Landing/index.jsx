import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Phone, MapPin, Star, Users, Clock, Shield } from 'lucide-react';
import AuthFlowManager from '../../components/auth/AuthFlowManager';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Landing Page Component
 * Displays the public landing page for unauthenticated users
 * Includes hero section, features, and authentication modal
 */
const Landing = () => {
  const navigate = useNavigate();
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const { isAuthenticated, initialized } = useAuthContext();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate('/home');
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleGetStarted = () => {
    setShowAuthFlow(true);
  };

  const handleAuthSuccess = (authType) => {
    console.log('🎉 Landing: Authentication successful, type:', authType);
    setShowAuthFlow(false);

    // Redirect based on authentication type
    if (authType === 'signup') {
      // New user registration - redirect to address setup
      console.log('🏠 Landing: New user signup, redirecting to address setup');
      navigate('/address');
    } else {
      // Existing user login - redirect to home page
      console.log('🏠 Landing: Existing user login, redirecting to home');
      navigate('/home');
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Doorstep Service',
      description: 'Professional services delivered right to your doorstep with convenience and reliability.'
    },
    {
      icon: Star,
      title: 'Verified Professionals',
      description: 'All service providers are background-verified and highly rated by customers.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your safety and security are our top priorities with every service booking.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '1000+', label: 'Service Providers' },
    { number: '100+', label: 'Cities Covered' },
    { number: '4.8★', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 w-full max-w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="w-full max-w-full px-4 py-4 md:container md:mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EassyLife</span>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-full text-center md:container md:mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Life Made
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-3">
              Eassy
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book trusted home services with just a few taps. From cleaning to repairs, 
            we bring professional services right to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg px-8 py-3"
            >
              <Phone className="w-5 h-5 mr-2" />
              Book a Service
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-300 text-lg px-8 py-3"
            >
              <Users className="w-5 h-5 mr-2" />
              Become a Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="w-full max-w-full px-4 md:container md:mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="w-full max-w-full md:container md:mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EassyLife?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the best service experience possible.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="w-full max-w-full px-4 text-center md:container md:mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust EassyLife for their home service needs.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 transition-all duration-300 text-lg px-8 py-3"
          >
            Start Booking Now
          </Button>
        </div>
      </section>



      {/* Auth Flow */}
      {showAuthFlow && (
        <AuthFlowManager
          isOpen={showAuthFlow}
          onClose={() => setShowAuthFlow(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default Landing;
