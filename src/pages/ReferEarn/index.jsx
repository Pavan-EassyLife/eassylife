import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useResponsive';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '../../lib/utils';

/**
 * ReferEarnPage - Referral program and earnings tracking
 * Matches Flutter app refer & earn functionality with responsive design
 */
const ReferEarnPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { user } = useProfile();
  const [copied, setCopied] = useState(false);

  // Mock referral code - replace with actual user referral code from API
  const referralCode = user?.referralCode || 'ZUS5DX74';
  const shareText = `Hey, Life's Eassy With Eassylife. Use Referral Code ${referralCode} And Share The Joy Of Having The World At Your Fingertips With Your Friends And Family. Use This Link To Download The App Now https://eassylife.in/app`;

  // Load referral data from API
  useEffect(() => {
    // TODO: Implement API call to fetch user referral data
    // For now using mock data
  }, []);

  // Handle back navigation
  const handleBack = () => {
    navigate('/profile');
  };

  // Handle copy referral code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle social media sharing
  const handleSocialShare = async (platform) => {
    try {
      // Copy referral code to clipboard first
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Then trigger native share or platform-specific sharing
      if (navigator.share) {
        await navigator.share({
          title: 'EassyLife App',
          text: shareText,
          url: 'https://eassylife.in/app'
        });
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Refer & Earn - EassyLife</title>
        <meta name="description" content="Invite friends and earn rewards with EassyLife referral program" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6">
            <div className="flex items-center h-16">
              <div className="flex items-center ml-16">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
                </button>
                <h1 className="ml-6 text-xl font-semibold text-gray-900">Refer & Earn</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          className={cn(
            "pb-6",
            isMobile ? "px-0" : "max-w-2xl mx-auto px-6"
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Card - Exact Flutter Design */}
          <motion.div variants={itemVariants} className={cn(
            "mt-6 bg-white rounded-2xl shadow-lg",
            isMobile ? "mx-6" : "mx-0"
          )}>
            <div className="px-8 py-6">
              {/* Refer Image - Exact Flutter Asset */}
              <div className="flex justify-center mb-4">
                <img
                  src="/images/refer_image.png"
                  alt="Refer and Earn"
                  className="w-80 h-60 object-contain"
                />
              </div>

              {/* Referral Code Box - Exact Flutter Design */}
              <div
                onClick={handleCopyCode}
                className="border border-gray-300 rounded-2xl p-6 mb-6 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900 tracking-wider">
                    {referralCode}
                  </span>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2 text-center">Code copied to clipboard!</p>
                )}
              </div>

              {/* Description Text - Exact Flutter Text */}
              <div className="text-center mb-8">
                <p className="text-gray-600 text-base leading-relaxed px-4">
                  Invite your friends to join and earn rewards for every successful referral. Use the code below to get started!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Share On Section - Exact Flutter Design */}
          <motion.div variants={itemVariants} className={cn(
            "mt-6",
            isMobile ? "mx-6" : "mx-0"
          )}>
            <div className="text-left mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share On</h3>
            </div>

            {/* Social Media Icons Grid - Exact Flutter Layout */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Row 1 */}
              <SocialButton
                icon="/images/fb.png"
                alt="Facebook"
                onClick={() => handleSocialShare('facebook')}
              />
              <SocialButton
                icon="/images/whatsapp.png"
                alt="WhatsApp"
                onClick={() => handleSocialShare('whatsapp')}
              />
              <SocialButton
                icon="/images/ig.png"
                alt="Instagram"
                onClick={() => handleSocialShare('instagram')}
              />
              <SocialButton
                icon="/images/x.png"
                alt="X (Twitter)"
                onClick={() => handleSocialShare('twitter')}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Row 2 */}
              <SocialButton
                icon="/images/gmail.png"
                alt="Gmail"
                onClick={() => handleSocialShare('gmail')}
              />
              <SocialButton
                icon="/images/reddit.png"
                alt="Reddit"
                onClick={() => handleSocialShare('reddit')}
              />
              <SocialButton
                icon="/images/discord.png"
                alt="Discord"
                onClick={() => handleSocialShare('discord')}
              />
              {/* Empty space to match Flutter layout */}
              <div></div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
};

/**
 * SocialButton - Individual social media sharing button
 * Matches Flutter app design exactly
 */
const SocialButton = ({ icon, alt, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="w-18 h-18 bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center justify-center hover:shadow-lg transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <img
        src={icon}
        alt={alt}
        className="w-10 h-10 object-contain"
      />
    </motion.button>
  );
};

export default ReferEarnPage;
