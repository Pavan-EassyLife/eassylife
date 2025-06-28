// Device information utilities for API requests
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Detect operating system
  let operatingSystem = 'Unknown';
  if (userAgent.includes('Windows')) {
    operatingSystem = 'Windows';
  } else if (userAgent.includes('Mac')) {
    operatingSystem = 'macOS';
  } else if (userAgent.includes('Linux')) {
    operatingSystem = 'Linux';
  } else if (userAgent.includes('Android')) {
    operatingSystem = 'Android';
  } else if (userAgent.includes('iOS')) {
    operatingSystem = 'iOS';
  }
  
  // Detect browser
  let deviceName = 'Unknown Browser';
  if (userAgent.includes('Chrome')) {
    deviceName = 'Chrome Browser';
  } else if (userAgent.includes('Firefox')) {
    deviceName = 'Firefox Browser';
  } else if (userAgent.includes('Safari')) {
    deviceName = 'Safari Browser';
  } else if (userAgent.includes('Edge')) {
    deviceName = 'Edge Browser';
  }
  
  return {
    device_name: deviceName,
    device_type: 'Web',
    operating_system: operatingSystem,
    fcm_token: '', // Empty for web
  };
};

// Get IP address (using a public service)
export const getIpAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return '127.0.0.1'; // Fallback
  }
};
