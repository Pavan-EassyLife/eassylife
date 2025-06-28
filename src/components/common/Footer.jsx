import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAddressContext } from '../../contexts/AddressContext';

const Footer = () => {
  const { 
    formattedPrimaryPhone, 
    initiateCall, 
    hasPhoneNumber 
  } = useSettings();
  
  const { 
    getDisplayAddress 
  } = useAddressContext();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">EasyLife</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for all home services. We bring convenience and quality right to your doorstep.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/services" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Our Services
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Popular Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="/services/cleaning" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home Cleaning
                </a>
              </li>
              <li>
                <a href="/services/plumbing" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Plumbing
                </a>
              </li>
              <li>
                <a href="/services/electrical" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Electrical
                </a>
              </li>
              <li>
                <a href="/services/painting" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Painting
                </a>
              </li>
              <li>
                <a href="/services/appliance" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Appliance Repair
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            
            {/* Phone Number */}
            {hasPhoneNumber && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <button
                    onClick={() => initiateCall()}
                    className="text-gray-300 hover:text-white transition-colors text-sm hover:underline"
                    title={`Call ${formattedPrimaryPhone}`}
                  >
                    {formattedPrimaryPhone}
                  </button>
                  <p className="text-gray-400 text-xs mt-1">24/7 Customer Support</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <a 
                  href="mailto:support@easylife.com" 
                  className="text-gray-300 hover:text-white transition-colors text-sm hover:underline"
                >
                  support@easylife.com
                </a>
                <p className="text-gray-400 text-xs mt-1">Email Support</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-300 text-sm">
                  {getDisplayAddress() || 'Mumbai, Maharashtra, India'}
                </p>
                <p className="text-gray-400 text-xs mt-1">Service Area</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-300 text-sm">24/7 Available</p>
                <p className="text-gray-400 text-xs mt-1">All Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} EasyLife. All rights reserved.
            </div>
            
            {/* Additional Contact Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              {hasPhoneNumber && (
                <button
                  onClick={() => initiateCall()}
                  className="flex items-center space-x-2 hover:text-white transition-colors"
                  title={`Call ${formattedPrimaryPhone}`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
              )}
              
              <a 
                href="mailto:support@easylife.com" 
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
