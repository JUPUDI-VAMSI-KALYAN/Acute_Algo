import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [currentWord, setCurrentWord] = useState('better');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const words = ['better', 'faster', 'smarter', 'modern'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setCurrentWord(words[(wordIndex + 1) % words.length]);
        setIsTransitioning(false);
      }, 500); // Wait for fade out animation to complete
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, [wordIndex, words]);

  return (
    <section className="relative bg-gradient-to-br from-black via-blue-950 to-indigo-950 px-4 overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Enhanced Animated Code Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Flowing code lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Vertical code streams */}
          <div className="absolute top-0 left-1/6 h-full opacity-10">
            <div className="text-green-400 text-xs font-mono leading-relaxed animate-float-slow">
              <div className="mb-4">const algorithms = [];</div>
              <div className="mb-4">function optimize(code) {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;return enhance(code);</div>
              <div className="mb-4">{'}'}</div>
              <div className="mb-4">algorithms.map(analyze)</div>
              <div className="mb-4">.filter(isEfficient)</div>
              <div className="mb-4">.sort(byPerformance)</div>
              <div className="mb-4">if (complexity &lt; O(n)) {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;deploy();</div>
              <div className="mb-4">{'}'}</div>
            </div>
          </div>
          
          <div className="absolute top-10 right-1/6 h-full opacity-10">
            <div className="text-blue-400 text-xs font-mono leading-relaxed animate-float-slow delay-1000">
              <div className="mb-4">class AlgorithmAnalyzer {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;analyze(repository) {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;&nbsp;&nbsp;const metrics = [];</div>
              <div className="mb-4">&nbsp;&nbsp;&nbsp;&nbsp;return insights;</div>
              <div className="mb-4">&nbsp;&nbsp;{'}'}</div>
              <div className="mb-4">{'}'}</div>
              <div className="mb-4">async function scan() {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;await Promise.all([</div>
              <div className="mb-4">&nbsp;&nbsp;&nbsp;&nbsp;detectPatterns(),</div>
              <div className="mb-4">&nbsp;&nbsp;&nbsp;&nbsp;measureComplexity()</div>
              <div className="mb-4">&nbsp;&nbsp;]);</div>
              <div className="mb-4">{'}'}</div>
            </div>
          </div>

          <div className="absolute top-20 left-2/3 h-full opacity-10">
            <div className="text-purple-400 text-xs font-mono leading-relaxed animate-float-slow delay-2000">
                             <div className="mb-4">{'// Performance optimization'}</div>
              <div className="mb-4">for (let i = 0; i &lt; n; i++) {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;if (algorithm[i].efficient) {'{'}</div>
              <div className="mb-4">&nbsp;&nbsp;&nbsp;&nbsp;improve(algorithm[i]);</div>
              <div className="mb-4">&nbsp;&nbsp;{'}'}</div>
              <div className="mb-4">{'}'}</div>
              <div className="mb-4">const result = merge(</div>
              <div className="mb-4">&nbsp;&nbsp;quickSort(left),</div>
              <div className="mb-4">&nbsp;&nbsp;quickSort(right)</div>
              <div className="mb-4">);</div>
              <div className="mb-4">return optimized;</div>
            </div>
          </div>
        </div>

        {/* Floating code snippets */}
        <div className="absolute top-16 left-1/4 text-cyan-300/15 text-xs font-mono animate-fade-in-up delay-500">
          function fibonacci(n) {'{'}<br/>
          &nbsp;&nbsp;if (n &lt;= 1) return n;<br/>
          &nbsp;&nbsp;return fib(n-1) + fib(n-2);<br/>
          {'}'}
        </div>

        <div className="absolute top-32 right-1/5 text-yellow-300/15 text-xs font-mono animate-fade-in-up delay-1000">
          const binary_search = (arr, target) =&gt; {'{'}<br/>
          &nbsp;&nbsp;let left = 0, right = arr.length - 1;<br/>
          &nbsp;&nbsp;while (left &lt;= right) {'{'}<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;{'// O(log n) complexity'}<br/>
          &nbsp;&nbsp;{'}'}<br/>
          {'}'}
        </div>

        <div className="absolute bottom-40 left-1/5 text-pink-300/15 text-xs font-mono animate-fade-in-up delay-1500">
          {'// AI-generated algorithm needs optimization'}<br/>
          if (performance &lt; threshold) {'{'}<br/>
          &nbsp;&nbsp;algorithms.optimize();<br/>
          &nbsp;&nbsp;quality.improve();<br/>
          {'}'}
        </div>

        <div className="absolute bottom-32 right-1/4 text-indigo-300/15 text-xs font-mono animate-fade-in-up delay-2000">
          async function deployToProduction() {'{'}<br/>
          &nbsp;&nbsp;await validate(algorithm);<br/>
          &nbsp;&nbsp;await test(performance);<br/>
          &nbsp;&nbsp;return deploy();<br/>
          {'}'}
        </div>

        <div className="absolute top-1/2 left-1/12 text-emerald-300/15 text-xs font-mono animate-fade-in-up delay-2500">
          quickSort(array, low, high)<br/>
          merge(left, right)<br/>
          heapify(arr, n, i)
        </div>

        <div className="absolute top-2/3 right-1/12 text-orange-300/15 text-xs font-mono animate-fade-in-up delay-3000">
          O(1) O(log n) O(n)<br/>
          O(n log n) O(n²)<br/>
          Space: O(1)
        </div>

        {/* Matrix-style falling characters */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-0 left-1/12 text-green-400 text-xs font-mono animate-fade-in-up delay-300">
            <div className="animate-bounce">0</div>
            <div className="animate-bounce delay-100">1</div>
            <div className="animate-bounce delay-200">0</div>
            <div className="animate-bounce delay-300">1</div>
            <div className="animate-bounce delay-400">1</div>
          </div>
          <div className="absolute top-0 left-2/12 text-green-400 text-xs font-mono animate-fade-in-up delay-600">
            <div className="animate-bounce delay-500">1</div>
            <div className="animate-bounce delay-600">0</div>
            <div className="animate-bounce delay-700">1</div>
            <div className="animate-bounce delay-800">0</div>
          </div>
          <div className="absolute top-0 left-10/12 text-green-400 text-xs font-mono animate-fade-in-up delay-900">
            <div className="animate-bounce delay-1000">0</div>
            <div className="animate-bounce delay-1100">0</div>
            <div className="animate-bounce delay-1200">1</div>
            <div className="animate-bounce delay-1300">1</div>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <div className="mb-12 space-y-6">
          <div className="relative">
            <h1 className="relative text-7xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-tight flex flex-col items-center gap-6">
              <span className="inline-block animate-fade-in-up">Make your code</span>
              <span 
                className={`inline-block px-8 py-3 rounded-lg transform hover:scale-105 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 ${
                  isTransitioning ? 'word-transition-exit' : 'word-transition-enter'
                }`}
                style={{
                  textShadow: '0 0 20px rgba(104, 109, 224, 0.3)'
                }}
              >
                {currentWord}
              </span>
            </h1>
          </div>
          
          <div className="space-y-4 animate-fade-in-up delay-500">
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              In today&apos;s AI-driven world, algorithm quality makes the difference between good and exceptional software. 
              We specialize in <span className="text-blue-400 font-semibold">analyzing</span>, <span className="text-purple-400 font-semibold">optimizing</span>, 
              and <span className="text-blue-400 font-semibold">perfecting</span> algorithms for everything from 
              startup innovations to mission-critical systems.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in-up delay-1000">
          <button
            onClick={onGetStarted}
            className="group relative px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
          >
            <span>Start Analyzing Your Code</span>
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Feature Chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white/90 font-medium hover:bg-white/15 transition-all duration-200">
              ✨ Free limited time
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white/90 font-medium hover:bg-white/15 transition-all duration-200">
              🚀 No signup required
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white/90 font-medium hover:bg-white/15 transition-all duration-200">
              ⚡️ Instant analysis
            </div>
          </div>
        </div>

        {/* Enhanced Social Proof with Animation */}
        <div className="mt-20 text-center animate-fade-in-up delay-1200">
          <p className="text-sm text-gray-400 mb-6">Trusted by developers worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            <div className="flex flex-col items-center space-y-2 hover:opacity-100 transition-opacity">
              <div className="text-3xl">🐙</div>
              <div className="text-lg font-bold text-gray-300">GitHub</div>
            </div>
            <div className="flex flex-col items-center space-y-2 hover:opacity-100 transition-opacity">
              <div className="text-3xl">🔒</div>
              <div className="text-lg font-bold text-gray-300">Enterprise</div>
            </div>
            <div className="flex flex-col items-center space-y-2 hover:opacity-100 transition-opacity">
              <div className="text-3xl">🚀</div>
              <div className="text-lg font-bold text-gray-300">Production</div>
            </div>
            <div className="flex flex-col items-center space-y-2 hover:opacity-100 transition-opacity">
              <div className="text-3xl">⚡</div>
              <div className="text-lg font-bold text-gray-300">Fast Analysis</div>
            </div>
            <div className="flex flex-col items-center space-y-2 hover:opacity-100 transition-opacity col-span-2 md:col-span-1">
              <div className="text-3xl">🛰️</div>
              <div className="text-lg font-bold text-gray-300">Mission Critical</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}; 