import React from 'react';
import { SmoothCard } from '../ui/SmoothHover';
import { CrispCard } from '../ui/CrispTextCard';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Test component to verify text distortion fixes
 * This component shows different approaches to prevent text distortion during hover animations
 */
const TextDistortionTest = () => {
  const testData = {
    name: 'Home Cleaning Service',
    price: 299,
    originalPrice: 399,
    description: 'Professional cleaning with attention to detail',
    image: '/docs/home.png'
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Text Distortion Test</h1>
        <p className="text-center text-gray-600 mb-12">
          Hover over each card to test text clarity during animations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Original Card (with distortion) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-600">❌ Original (Distorted)</h3>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-500 ease-in-out hover:scale-105 cursor-pointer">
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                <img src={testData.image} alt={testData.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{testData.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-orange-600">₹{testData.price}</span>
                  <span className="text-sm text-gray-500 line-through">₹{testData.originalPrice}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{testData.description}</p>
                <Button className="w-full bg-orange-500 text-white">Book Now</Button>
              </CardContent>
            </Card>
          </div>

          {/* SmoothCard with crisp-text classes */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">🔧 SmoothCard + CSS</h3>
            <SmoothCard className="overflow-hidden cursor-pointer">
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                <img 
                  src={testData.image} 
                  alt={testData.name} 
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 crisp-text">{testData.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-orange-600 crisp-text">₹{testData.price}</span>
                  <span className="text-sm text-gray-500 line-through crisp-text">₹{testData.originalPrice}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 crisp-text">{testData.description}</p>
                <Button className="w-full bg-orange-500 text-white crisp-text">Book Now</Button>
              </CardContent>
            </SmoothCard>
          </div>

          {/* CrispCard (advanced solution) */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">✅ CrispCard (Advanced)</h3>
            <CrispCard className="overflow-hidden cursor-pointer">
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                <img 
                  src={testData.image} 
                  alt={testData.name} 
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden',
                    imageRendering: 'crisp-edges'
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{testData.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-orange-600">₹{testData.price}</span>
                  <span className="text-sm text-gray-500 line-through">₹{testData.originalPrice}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{testData.description}</p>
                <Button className="w-full bg-orange-500 text-white">Book Now</Button>
              </CardContent>
            </CrispCard>
          </div>
        </div>

        {/* Text-only test */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Text-Only Hover Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Regular text */}
            <div className="bg-white p-6 rounded-lg border hover:scale-105 transition-transform duration-300 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Regular Text</h3>
              <p className="text-gray-600">This text may become blurry during hover animation</p>
            </div>

            {/* Crisp text */}
            <SmoothCard className="bg-white p-6 cursor-pointer" type="subtle">
              <h3 className="text-lg font-semibold mb-2 crisp-text">Crisp Text (CSS)</h3>
              <p className="text-gray-600 crisp-text">This text should stay crisp during hover animation</p>
            </SmoothCard>

            {/* Ultra crisp text */}
            <CrispCard className="bg-white p-6 cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Ultra Crisp Text</h3>
              <p className="text-gray-600">This text uses advanced anti-distortion techniques</p>
            </CrispCard>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">🧪 Testing Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>1. Hover Test:</strong> Slowly hover over each card and observe text clarity</p>
            <p><strong>2. Text Quality:</strong> Look for blurriness, shaking, or distortion in text during animation</p>
            <p><strong>3. Browser Test:</strong> Test in Chrome, Firefox, Safari, and Edge</p>
            <p><strong>4. Performance:</strong> Check if animations are smooth and don't cause lag</p>
            <p><strong>5. Mobile Test:</strong> Test on actual mobile devices (hover effects should be disabled)</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Expected Results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <span className="text-red-600">Red card:</span> Text may appear blurry or shaky</li>
              <li>• <span className="text-blue-600">Blue card:</span> Improved text clarity with CSS fixes</li>
              <li>• <span className="text-green-600">Green card:</span> Perfect text clarity with advanced techniques</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextDistortionTest;
