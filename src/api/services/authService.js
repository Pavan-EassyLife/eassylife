import axiosInstance from '../axiosInstance.js';
import { API_ENDPOINTS } from '../config.js';
import { getDeviceInfo, getIpAddress } from '../../utils/deviceInfo.js';

class AuthService {
  // Send OTP for login
  async sendOTP(countryCode, mobile) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
        country_code: countryCode,
        mobile: mobile,
      });

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Verify OTP
  async verifyOTP(countryCode, mobile, otp) {
    try {
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getIpAddress();

      const payload = {
        country_code: countryCode,
        mobile: mobile,
        otp: otp,
        device_name: deviceInfo.device_name,
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        ip_address: ipAddress,
        fcm_token: deviceInfo.fcm_token,
      };

      // Debug logging
      console.log('AuthService - verifyOTP payload:', payload);

      const response = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP, payload);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Resend OTP
  async resendOTP(countryCode, mobile) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.RESEND_OTP, {
        country_code: countryCode,
        mobile: mobile,
      });

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Register new user
  async register(userData) {
    try {
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getIpAddress();

      const payload = {
        country_code: userData.countryCode,
        mobile: userData.mobile,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        gender: userData.gender,
        referral_code: userData.referralCode || '',
        birthdate: userData.birthdate || '',
        anniversary: userData.anniversary || '',
        signup_location: userData.signupLocation || 'Web',
        device_name: deviceInfo.device_name,
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        ip_address: ipAddress,
        fcm_token: deviceInfo.fcm_token,
        campaign_name: userData.campaignName || '',
        medium: userData.medium || 'web',
        source: userData.source || 'direct',
        is_whatsapp_checked: userData.isWhatsappChecked || false,
        login_type: userData.loginType || null,
        social_id: userData.socialId || null,
        kochava_id: userData.kochavaId || null,
        app_login_token: userData.appLoginToken || null,
      };

      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, payload);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Guest login
  async guestLogin() {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.GUEST_LOGIN, {
        country_code: '91',
        mobile: '8888888888',
      });

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PROFILE);

      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
