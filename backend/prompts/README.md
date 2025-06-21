# 🤖 AI Prompts Directory

This directory contains organized AI prompts for algorithm and code analysis in the Acute Algo platform.

## 📁 File Structure

```
prompts/
├── __init__.py                 # Package initialization and exports
├── algorithm_analysis.py       # Technical algorithm analysis prompts
├── business_metrics.py         # Business-focused analysis prompts  
├── code_analysis.py            # General code quality prompts
├── prompt_config.py            # Configuration and prompt selection
└── README.md                   # This documentation
```

## 🎯 Analysis Types

### 1. **Algorithm-Only** (Recommended for business algorithms)
- **Prompts:** Short description, business metrics, complexity analysis, optimization suggestions
- **Use Case:** Balanced analysis for business algorithms
- **Time:** 45-60 seconds
- **Output:** Business context + technical insights

### 2. **Business-Focused** 
- **Prompts:** Short description, business metrics, risk assessment
- **Use Case:** Executive reporting, business prioritization
- **Time:** 30-45 seconds
- **Output:** Business impact and cost analysis

### 3. **Quick Assessment**
- **Prompts:** Short description, basic business metrics
- **Use Case:** Fast screening of large codebases
- **Time:** 15-25 seconds
- **Output:** Essential insights only

### 4. **Technical Comprehensive**
- **Prompts:** Pseudocode, flowcharts, complexity, optimizations, issues
- **Use Case:** Deep technical reviews, refactoring planning
- **Time:** 60-90 seconds
- **Output:** Complete technical analysis

## 🔧 Usage Examples

### Basic Usage
```python
from prompts import BusinessMetricsPrompts, AnalysisType, PromptConfig

# Get business description prompt
prompt = BusinessMetricsPrompts.get_short_description_prompt(
    function_code="def calculate_fee(amount): return amount * 0.03",
    function_name="calculate_fee", 
    language="python"
)

# Get prompts for specific analysis type
prompts_to_run = PromptConfig.get_prompts_for_analysis_type(
    AnalysisType.ALGORITHM_ONLY
)
```

### AI Service Integration
```python
from prompts import PromptSelector, AnalysisType

# Select prompts based on analysis type
analysis_type = AnalysisType.ALGORITHM_ONLY
prompt_methods = PromptSelector.get_prompt_methods(analysis_type)

# Execute selected prompts
for prompt_name, (class_name, method_name) in prompt_methods.items():
    # Call appropriate prompt method
    pass
```

## 📊 Prompt Categories

### Business Metrics (`business_metrics.py`)
Focus on business value and practical impact:
- **Short Description:** Business-focused algorithm summary
- **Business Metrics:** Complexity, impact, maintenance risk scores
- **Risk Assessment:** Business risks and cost implications
- **Classification:** Business domain and criticality

### Algorithm Analysis (`algorithm_analysis.py`)
Technical algorithm analysis:
- **Pseudocode:** Language-agnostic algorithm representation
- **Flowchart:** Mermaid visual flowcharts
- **Complexity Analysis:** Big O, performance, quality assessment
- **Optimization Suggestions:** Performance and code improvements
- **Issues Identification:** Bugs, security, edge cases

### Code Analysis (`code_analysis.py`)
General code quality assessment:
- **Quality Assessment:** Readability, maintainability, structure
- **Maintainability Analysis:** Change impact, team factors
- **Standards Compliance:** Coding standards and best practices
- **Refactoring Recommendations:** Improvement strategies
- **Testing Recommendations:** Testing strategies and coverage

## ⚙️ Configuration

The `prompt_config.py` file manages:
- **Analysis Types:** Different levels of analysis depth
- **Prompt Selection:** Which prompts to run for each type
- **Method Mapping:** How prompts map to class methods
- **Validation:** Input validation and defaults

## 🚀 Adding New Prompts

### 1. Add to Appropriate Class
```python
# In business_metrics.py, algorithm_analysis.py, or code_analysis.py
@staticmethod
def get_new_analysis_prompt(function_code: str, function_name: str, language: str) -> str:
    return f"""Your prompt template here..."""
```

### 2. Update Configuration
```python
# In prompt_config.py
method_mapping = {
    "new_analysis": ("ClassName", "get_new_analysis_prompt"),
    # ... existing mappings
}
```

### 3. Add to Analysis Types
```python
# Add to appropriate prompt list
NEW_ANALYSIS_PROMPTS = [
    "short_description",
    "new_analysis"  # Add your new prompt
]
```

## 📝 Prompt Design Guidelines

### Business Prompts
- Focus on business value and impact
- Use simple 1-10 scoring scales
- Provide clear classifications
- Include cost and risk assessment

### Technical Prompts
- Be specific about output format
- Include examples of good/bad outputs
- Focus on actionable insights
- Maintain consistency in structure

### General Guidelines
- Keep prompts focused and specific
- Use structured output formats (markdown)
- Include clear instructions and examples
- Validate inputs and provide fallbacks

## 🔄 Integration Points

This prompts system integrates with:
- **AI Service:** `services/langchain_ai_service.py` uses these prompts
- **Function Classification:** Based on `is_algorithm` flag
- **API Endpoints:** Analysis type selection in requests
- **Frontend:** Different analysis options for users

## 📈 Future Enhancements

Planned improvements:
- **Dynamic Prompt Selection:** Based on code characteristics
- **Prompt Templates:** Reusable prompt components
- **Custom Business Rules:** Company-specific analysis prompts
- **Performance Optimization:** Parallel prompt execution
- **Prompt Versioning:** Track and manage prompt changes