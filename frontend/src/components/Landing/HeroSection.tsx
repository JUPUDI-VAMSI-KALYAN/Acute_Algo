import React from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20 px-4 overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-3000"></div>
      </div>

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
        {/* Enhanced Main Headline with Shining Effect */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            {/* Main product name - simplified and clear */}
            <h1 className="relative text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              <span className="inline-block animate-fade-in-up drop-shadow-2xl bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>Acute</span>{' '}
              <span className="inline-block animate-fade-in-up delay-300 drop-shadow-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent" style={{ textShadow: '0 0 40px rgba(147, 51, 234, 0.5)' }}>Algo</span>
            </h1>
          </div>
          
          <div className="space-y-4 animate-fade-in-up delay-500">
            <p className="text-2xl md:text-3xl text-gray-200 font-medium">
              The Fundamental Need for Better Code
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Algorithms generated by AI aren&apos;t ready for production. We help improve algorithms 
              whether it&apos;s for <span className="text-blue-400 font-semibold">individual projects</span> or <span className="text-purple-400 font-semibold">space missions</span>.
            </p>
          </div>
        </div>

        {/* Enhanced Mission Statement */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 mb-12 border border-gray-700/50 shadow-2xl hover:bg-gray-800/70 transition-all duration-500 animate-fade-in-up delay-700">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin-slow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Built by Developers, for Developers
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Every line of code matters. From startup MVPs to mission-critical systems, 
            we provide the tools to analyze, understand, and perfect your algorithms.
          </p>
        </div>

        {/* Enhanced CTA with Multiple Actions */}
        <div className="space-y-6 animate-fade-in-up delay-1000">
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 btn-glow"
          >
            <span className="relative z-10">Start Analyzing Your Code</span>
            <svg className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Free limited time</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <span className="text-sm">No signup required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
              <span className="text-sm">Instant analysis</span>
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