import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid h-screen lg:grid-cols-2 overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acute Algo
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      
      {/* Animated Code Background - Same as Hero Section */}
      <div className="relative bg-gradient-to-br from-black via-blue-950 to-indigo-950 hidden lg:block overflow-hidden">
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

        {/* Centered Login Branding */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Acute Algo
            </h2>
            <p className="text-lg text-gray-300 max-w-md">
              Analyze, optimize, and perfect your algorithms with AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
