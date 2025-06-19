import React, { useState } from 'react';

interface Feature {
  id: string;
  icon: {
    viewBox: string;
    path: string;
    gradient: string;
  };
  title: string;
  description: string;
  mockup: {
    type: 'code' | 'chart' | 'terminal' | 'diagram';
    content: string;
    data?: Array<{
      name: string;
      complexity: string;
      score: number;
    }>;
  };
}

const features: Feature[] = [
  {
    id: 'analysis',
    icon: {
      viewBox: "0 0 24 24",
      path: "M11 2a9 9 0 106.16 15.55l4.65 4.64a1 1 0 001.41-1.41l-4.64-4.65A9 9 0 0011 2zm0 2a7 7 0 110 14 7 7 0 010-14z",
      gradient: "from-blue-400 to-cyan-400"
    },
    title: "Deep Code Analysis",
    description: "Scan your entire repository to identify algorithms, patterns, and potential optimizations with AI-powered insights.",
    mockup: {
      type: 'code',
      content: `// Algorithm Complexity Analysis
function spacexRaptorThrottleControl(thrust, conditions) {
  // O(n²) - Real-time engine optimization
  const optimalThrust = calculateOptimalBurn(thrust);
  const safetyMargin = computeSafetyBuffer(conditions);
  
  if (conditions.altitude > 50000) {
    return applyVacuumOptimization(optimalThrust, safetyMargin);
  }
  
  return applyAtmosphericCorrection(optimalThrust, conditions);
}

// Suggested: Neural Network Approach O(k·log n)
function neuralThrustPredictor(sensorData, weatherModel) {
  const features = extractFeatures(sensorData);
  const prediction = neuralNet.forward(features);
  
  return {
    optimalThrust: prediction.thrust,
    confidence: prediction.confidence,
    adjustmentVector: calculateAdjustments(weatherModel)
  };
}

function googlePageRankVariant(linkGraph, personalization) {
  // Custom PageRank with industry modifications
  const dampingFactor = 0.85;
  const iterations = calculateConvergence(linkGraph.size);
  return iterativePowerMethod(linkGraph, dampingFactor, iterations);
}`
    }
  },
  {
    id: 'performance',
    icon: {
      viewBox: "0 0 24 24",
      path: "M13 10V3L4 14h7v7l9-11h-7z",
      gradient: "from-yellow-400 to-orange-400"
    },
    title: "Performance Insights",
    description: "Understand algorithm complexity, bottlenecks, and performance characteristics across your codebase.",
    mockup: {
      type: 'chart',
      content: 'Performance Analysis Dashboard',
      data: [
        { name: 'Falcon Trajectory Optimizer', complexity: 'O(n³)', score: 78 },
        { name: 'Tesla AutoPilot Vision', complexity: 'O(k·log n)', score: 91 },
        { name: 'Netflix ContentRank Engine', complexity: 'O(m·n)', score: 85 },
        { name: 'Stripe FraudGuard ML', complexity: 'O(log n)', score: 96 }
      ]
    }
  },
  {
    id: 'production',
    icon: {
      viewBox: "0 0 24 24",
      path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      gradient: "from-purple-400 to-pink-400"
    },
    title: "Production Ready",
    description: "Get actionable recommendations to make your algorithms robust, scalable, and ready for production environments.",
    mockup: {
      type: 'terminal',
      content: `$ acute-algo analyze --production-check

✅ Algorithm Safety Check
   • Memory leaks: None detected
   • Edge cases: 12 scenarios covered
   • Error handling: Comprehensive

⚠️  Performance Recommendations
   • Optimize Uber's ETA prediction engine
   • Cache results in Spotify's music recommendation
   • Replace O(n²) in Airbnb's pricing algorithm

🚀 Production Readiness Score: 87/100

💡 Next Steps:
   1. Optimize Tesla's battery management system
   2. Improve Netflix's content delivery algorithm
   3. Enhance Robinhood's risk assessment engine`
    }
  },
  {
    id: 'scale',
    icon: {
      viewBox: "0 0 24 24",
      path: "M5 13l4 4L19 7",
      gradient: "from-green-400 to-emerald-400"
    },
    title: "From MVP to Mission Critical",
    description: "Whether you're building a prototype or launching rockets, we help you write algorithms that matter.",
    mockup: {
      type: 'diagram',
      content: 'Algorithm Evolution Pipeline'
    }
  },
  {
    id: 'languages',
    icon: {
      viewBox: "0 0 24 24",
      path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z",
      gradient: "from-blue-400 to-indigo-400"
    },
    title: "Multi-Language Support",
    description: "Analyze algorithms across Python, JavaScript, TypeScript, Java, C++, and more programming languages.",
    mockup: {
      type: 'code',
      content: `// Python - NASA Mars Rover Pathfinding
def marsRoverNavigationSystem(terrain_map, obstacles, target):
    # Proprietary NASA algorithm for Mars terrain
    safe_zones = identifySafeZones(terrain_map, obstacles)
    energy_optimal = calculateEnergyPath(safe_zones, target)
    
    for waypoint in energy_optimal:
        if validateTerrainSafety(waypoint, terrain_map):
            adjustPowerConsumption(waypoint.slope, waypoint.surface)
        else:
            return recalculateEmergencyPath(waypoint, safe_zones)
    
    return energy_optimal

// JavaScript - TikTok's FYP Algorithm
class TikTokForYouPageEngine {
    calculateEngagementScore(user, video, interactions) {
        const userProfile = this.buildUserVector(user.history);
        const videoFeatures = this.extractVideoFeatures(video);
        const contextSignals = this.getContextualData(user.session);
        
        return this.neuralRanking.predict({
            user: userProfile,
            content: videoFeatures,
            context: contextSignals,
            viralityScore: this.calculateViralPotential(video)
        });
    }
}

// Java - Goldman Sachs Risk Engine
public class QuantRiskAssessmentEngine {
    private double calculatePortfolioVaR(Portfolio portfolio, MarketData market) {
        double[] correlationMatrix = buildCorrelationMatrix(portfolio.assets);
        double[] volatilities = calculateHistoricalVolatility(portfolio, 252);
        
        MonteCarloSimulation simulation = new MonteCarloSimulation(
            portfolio, correlationMatrix, volatilities, 10000
        );
        
        return simulation.computeValueAtRisk(0.95);
    }
}`
    }
  },
  {
    id: 'visualization',
    icon: {
      viewBox: "0 0 24 24",
      path: "M2 3h6v4H2V3zm14 0h6v4h-6V3zm-7 11h6v4H9v-4zm-7 0h6v4H2v-4zm0-7h20v4H2V7z",
      gradient: "from-pink-400 to-purple-400"
    },
    title: "Visual Code Maps",
    description: "Interactive visualizations of your code structure, function dependencies, and algorithm relationships.",
    mockup: {
      type: 'diagram',
      content: 'Interactive Code Structure'
    }
  }
];

const MockupRenderer: React.FC<{ feature: Feature }> = ({ feature }) => {
  const { mockup } = feature;

  if (mockup.type === 'code') {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm overflow-hidden">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-gray-400 ml-4">algorithm-analyzer.js</span>
        </div>
        <pre className="text-gray-300 text-xs leading-relaxed overflow-x-auto">
          {mockup.content}
        </pre>
      </div>
    );
  }

  if (mockup.type === 'chart' && mockup.data) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6">
        <h4 className="text-white font-semibold mb-6">{mockup.content}</h4>
        <div className="space-y-4">
          {mockup.data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <div className="text-white font-medium">{item.name}</div>
                <div className="text-gray-400 text-sm">{item.complexity}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.score >= 80 ? 'bg-green-400' : 
                      item.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                <span className="text-white font-bold text-sm">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mockup.type === 'terminal') {
    return (
      <div className="bg-black rounded-2xl p-6 font-mono">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 ml-4">Terminal</span>
        </div>
        <pre className="text-green-400 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
          {mockup.content}
        </pre>
      </div>
    );
  }

  if (mockup.type === 'diagram') {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-white font-semibold text-xl mb-2">{mockup.content}</h4>
          <p className="text-blue-200">Interactive visualization coming soon</p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
            </div>
            <div className="w-12 h-12 bg-cyan-500/30 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-cyan-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Glass Icon Component
const GlassIcon: React.FC<{ 
  icon: { viewBox: string; path: string; gradient: string }; 
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}> = ({ icon, size = 'md', isActive = false }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} relative group transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
      {/* Glass container */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${icon.gradient} opacity-20 rounded-2xl transition-opacity duration-300 group-hover:opacity-30`}></div>
        
        {/* Inner glow */}
        <div className="absolute inset-1 bg-white/5 rounded-xl"></div>
      </div>
      
      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <svg className={`${iconSizes[size]} text-white drop-shadow-lg`} fill="currentColor" viewBox={icon.viewBox}>
          <path d={icon.path} />
        </svg>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export const FeatureGrid: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">optimize algorithms</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            All the tools you need to analyze, understand, and improve your code – in one powerful platform
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 animate-fade-in-up delay-300">
          {/* Sidebar with Features */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">
              Our Features
            </div>
            
                         {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`group w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  activeFeature.id === feature.id
                    ? 'bg-gray-700/50 border-l-4 border-blue-400'
                    : 'hover:bg-gray-700/30 border-l-4 border-transparent hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <GlassIcon 
                    icon={feature.icon} 
                    size="sm" 
                    isActive={activeFeature.id === feature.id}
                  />
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                      activeFeature.id === feature.id 
                        ? 'text-blue-300' 
                        : 'text-white group-hover:text-blue-300'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed mt-1 transition-colors duration-300 ${
                      activeFeature.id === feature.id 
                        ? 'text-gray-200' 
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {feature.description}
                    </p>
                  </div>

                  <div className={`transition-all duration-300 ${
                    activeFeature.id === feature.id 
                      ? 'opacity-100 transform translate-x-0' 
                      : 'opacity-0 transform translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                  }`}>
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content Area with Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl p-8 border border-gray-700/50 shadow-2xl min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {activeFeature.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Live Demo</span>
                  </div>
                </div>
                <GlassIcon 
                  icon={activeFeature.icon} 
                  size="md" 
                  isActive={true}
                />
              </div>

              <div className="transition-all duration-500 ease-in-out">
                <MockupRenderer feature={activeFeature} />
              </div>

              {/* Feature Highlights */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-white font-medium text-sm">Fast</div>
                    <div className="text-gray-400 text-xs">Real-time analysis</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-white font-medium text-sm">Accurate</div>
                    <div className="text-gray-400 text-xs">AI-powered insights</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-white font-medium text-sm">Secure</div>
                    <div className="text-gray-400 text-xs">Code stays private</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 