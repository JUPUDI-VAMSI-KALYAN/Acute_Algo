import React from 'react';

interface UseCase {
  title: string;
  scenario: string;
  challenge: string;
  solution: string;
  icon: string;
  gradient: string;
}

const useCases: UseCase[] = [
  {
    title: "Startup MVP",
    scenario: "Building your first product",
    challenge: "Code needs to scale quickly but you're not sure about performance bottlenecks",
    solution: "Identify algorithm inefficiencies before they become expensive problems",
    icon: "🚀",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Enterprise Software",
    scenario: "Managing large codebases",
    challenge: "Complex systems with algorithms scattered across multiple teams and repositories",
    solution: "Comprehensive analysis to maintain code quality and performance standards",
    icon: "🏢",
    gradient: "from-purple-500/20 to-indigo-500/20"
  },
  {
    title: "Space Missions",
    scenario: "Mission-critical applications",
    challenge: "Algorithms must be perfect - failure is not an option",
    solution: "Deep analysis ensures your algorithms can handle the most demanding requirements",
    icon: "🛰️",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  {
    title: "Enterprise/Development",
    scenario: "Managing large codebases",
    challenge: "Complex systems with algorithms scattered across multiple teams and repositories",
    solution: "Comprehensive analysis to maintain code quality and performance standards",
    icon: "🏢",
    gradient: "from-purple-500/20 to-indigo-500/20"
  }
];

export const UseCases: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            From <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Ideas</span> to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Impact</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Whether you&apos;re building the next unicorn startup or sending humans to Mars, 
            great algorithms are the foundation of success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            // Define delay classes properly
            const delayClass = index === 0 ? 'delay-200' : index === 1 ? 'delay-300' : index === 2 ? 'delay-500' : 'delay-700';
            
            return (
              <div
                key={index}
                className={`
                  relative group
                  bg-gradient-to-br ${useCase.gradient}
                  backdrop-blur-lg rounded-3xl p-8 
                  border border-gray-700/50 hover:border-gray-600/70
                  shadow-2xl hover:shadow-blue-500/10
                  transform hover:scale-105
                  transition-all duration-300 ease-out
                  animate-fade-in-up
                  ${delayClass}
                `}
              >
              <div className="relative z-10">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                    {useCase.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {useCase.title}
                    </h3>
                    <p className="text-blue-400 font-semibold text-lg mb-4">
                      {useCase.scenario}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                      <h4 className="font-bold text-red-300 text-lg">Challenge</h4>
                    </div>
                    <p className="text-gray-300 pl-5 leading-relaxed">
                      {useCase.challenge}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <h4 className="font-bold text-green-300 text-lg">How We Help</h4>
                    </div>
                    <p className="text-gray-300 pl-5 leading-relaxed">
                      {useCase.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>

        <div className="mt-20 text-center animate-fade-in-up delay-1000">
          <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-lg rounded-3xl p-12 border border-gray-600/50 shadow-2xl max-w-4xl mx-auto">
            {/* Floating elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-8 right-8 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Algorithm Journey <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Starts Here</span>
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg max-w-2xl mx-auto">
              Every great software project begins with a single algorithm. Whether you&apos;re 
              optimizing a sorting function or designing distributed systems, understanding 
              your code&apos;s algorithmic foundation is the key to building something extraordinary.
            </p>

            {/* Progress indicators */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <span className="text-gray-300">Analyze</span>
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <span className="text-gray-300">Improve</span>
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <span className="text-gray-300">Deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 