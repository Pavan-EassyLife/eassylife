import userService from './userService.js';

class AnalyticsService {
  // Track login event (Flutter-aligned)
  trackLoginEvent(countryCode, phoneNumber) {
    try {
      console.log('Login Event Tracked:', {
        countryCode,
        phoneNumber,
        timestamp: new Date().toISOString(),
        platform: 'web'
      });

      // Here you can integrate with analytics services like:
      // - Google Analytics
      // - CleverTap
      // - Firebase Analytics
      // - Custom analytics endpoint

      // Example: Send to custom analytics endpoint
      this.sendAnalyticsEvent('login', {
        country_code: countryCode,
        phone_number: phoneNumber,
        platform: 'web',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error tracking login event:', error);
    }
  }

  // Track signup event (Flutter-aligned)
  trackSignupEvent(userData) {
    try {
      console.log('Signup Event Tracked:', {
        ...userData,
        timestamp: new Date().toISOString(),
        platform: 'web'
      });

      this.sendAnalyticsEvent('signup', {
        ...userData,
        platform: 'web',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error tracking signup event:', error);
    }
  }

  // Set user profile for analytics (Flutter-aligned with CleverTap)
  setUserProfile(userData) {
    try {
      const profileData = {
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        user_id: userData.id || userData.userId,
        email: userData.email,
        phone: `${userData.countryCode || ''}${userData.mobile || ''}`,
        date_of_birth: userData.birthdate || userData.dob,
        platform: 'web'
      };

      console.log('User Profile Set:', profileData);

      // Here you can integrate with analytics services
      this.sendAnalyticsEvent('user_profile_set', profileData);

    } catch (error) {
      console.error('Error setting user profile:', error);
    }
  }

  // Track campaign (Flutter-aligned)
  async trackCampaign(campaignName, source, medium) {
    try {
      const campaignData = {
        utm_campaign: campaignName,
        utm_source: source,
        utm_medium: medium,
        timestamp: new Date().toISOString(),
        platform: 'web'
      };

      console.log('Campaign Tracked:', campaignData);

      // Send to backend campaign tracking endpoint
      await userService.trackCampaign(campaignData);

    } catch (error) {
      console.error('Error tracking campaign:', error);
    }
  }

  // Generic analytics event sender
  sendAnalyticsEvent(eventName, eventData) {
    try {
      // Example implementation - replace with your analytics service
      
      // Google Analytics 4 example:
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }

      // Custom analytics endpoint example:
      // fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event: eventName, data: eventData })
      // });

      console.log(`Analytics Event: ${eventName}`, eventData);

    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }

  // Track page view
  trackPageView(pageName, additionalData = {}) {
    try {
      this.sendAnalyticsEvent('page_view', {
        page_name: pageName,
        ...additionalData,
        timestamp: new Date().toISOString(),
        platform: 'web'
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track user action
  trackUserAction(action, additionalData = {}) {
    try {
      this.sendAnalyticsEvent('user_action', {
        action,
        ...additionalData,
        timestamp: new Date().toISOString(),
        platform: 'web'
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }
}

export default new AnalyticsService();
