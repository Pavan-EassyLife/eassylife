import React from 'react';
import { SmoothCard, SmoothButton } from '../ui/SmoothHover';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Demo component showing the difference between shaky and smooth hover animations
 */
const HoverComparisonDemo = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Hover Animation Comparison</h1>
        
        {/* Before and After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* BEFORE: Shaky Hover */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">❌ BEFORE: Shaky Hover</h2>
            <div className="space-y-4">
              
              {/* Shaky Card Example */}
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-500 ease-in-out hover:scale-105 cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-lg flex items-center justify-center">
                    <img src="/docs/home.png" alt="Service" className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Shaky Service Card</span>
                  <p className="text-xs text-gray-500 mt-1">Text shakes during hover</p>
                </CardContent>
              </Card>

              {/* Shaky Button Example */}
              <Button className="w-full hover:scale-105 transition-transform duration-300">
                Shaky Button
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Issues:</strong> Text becomes blurry, content shakes, poor performance
                </p>
              </div>
            </div>
          </div>

          {/* AFTER: Smooth Hover */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-600">✅ AFTER: Smooth Hover</h2>
            <div className="space-y-4">
              
              {/* Smooth Card Example */}
              <SmoothCard className="p-4 text-center cursor-pointer" type="subtle">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-lg flex items-center justify-center">
                    <img 
                      src="/docs/home.png" 
                      alt="Service" 
                      className="w-10 h-10 object-contain"
                      style={{
                        transform: 'translate3d(0, 0, 0)',
                        backfaceVisibility: 'hidden'
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Smooth Service Card</span>
                  <p className="text-xs text-gray-500 mt-1">Crisp text during hover</p>
                </CardContent>
              </SmoothCard>

              {/* Smooth Button Example */}
              <SmoothButton className="w-full bg-orange-500 text-white rounded-lg py-2 px-4">
                Smooth Button
              </SmoothButton>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Benefits:</strong> Crisp text, smooth animation, better performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Explanation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">🔧 Technical Solutions Applied</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Hardware Acceleration</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>will-change: transform</code></li>
                <li>• <code>transform: translate3d(0, 0, 0)</code></li>
                <li>• <code>backface-visibility: hidden</code></li>
                <li>• <code>perspective: 1000px</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Smooth Transitions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Proper easing curves</li>
                <li>• Optimized duration timing</li>
                <li>• Transform origin control</li>
                <li>• Anti-aliased text rendering</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📝 How to Use</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Import the Component</h4>
              <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
{`import { SmoothCard, SmoothButton } from '../components/ui/SmoothHover';`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Replace Your Cards</h4>
              <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
{`// Before (shaky)
<Card className="hover:scale-105 transition-all">
  Content
</Card>

// After (smooth)
<SmoothCard type="card">
  Content
</SmoothCard>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Available Types</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SmoothCard type="card" className="p-3 text-center">
                  <span className="text-sm font-medium">type="card"</span>
                  <p className="text-xs text-gray-500">Standard hover</p>
                </SmoothCard>
                <SmoothCard type="button" className="p-3 text-center">
                  <span className="text-sm font-medium">type="button"</span>
                  <p className="text-xs text-gray-500">Button-like hover</p>
                </SmoothCard>
                <SmoothCard type="subtle" className="p-3 text-center">
                  <span className="text-sm font-medium">type="subtle"</span>
                  <p className="text-xs text-gray-500">Minimal hover</p>
                </SmoothCard>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🚀 Performance Benefits</h4>
          <p className="text-sm text-blue-800">
            These smooth hover components use GPU acceleration and optimized CSS properties to provide 
            60fps animations while preventing text blurriness and content shaking. They also include 
            accessibility features like reduced motion support and proper focus states.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HoverComparisonDemo;
