import os
import asyncio
import httpx
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


@dataclass
class AIAnalysisResult:
    """Result of AI analysis for a function"""
    pseudocode: str
    flowchart: str
    complexity_analysis: str
    optimization_suggestions: List[str]
    potential_issues: List[str]


class DigitalOceanAIService:
    """Service for interacting with DigitalOcean's serverless inference API"""
    
    def __init__(self):
        self.api_key = os.getenv("DO_MODEL_ACCESS_KEY")
        self.base_url = "https://inference.do-ai.run/v1"
        self.default_model = "llama3.3-70b-instruct"
        
        if not self.api_key:
            logger.warning("DO_MODEL_ACCESS_KEY not found in environment variables")
        
        # Configure HTTP client
        self.client = httpx.AsyncClient(
            timeout=120.0,  # 2 minutes timeout for AI requests
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    def is_available(self) -> bool:
        """Check if the AI service is properly configured"""
        return bool(self.api_key)

    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models from DigitalOcean"""
        try:
            response = await self.client.get(f"{self.base_url}/models")
            response.raise_for_status()
            return response.json().get("data", [])
        except Exception as e:
            logger.error(f"Failed to get available models: {e}")
            return []

    async def _make_ai_request(
        self, 
        prompt: str, 
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Optional[str]:
        """Make a request to the AI model"""
        if not self.is_available():
            logger.error("AI service not available - missing API key")
            return None

        try:
            payload = {
                "model": model or self.default_model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not content:
                logger.error("Empty response from AI model")
                return None
                
            return content.strip()

        except httpx.TimeoutException:
            logger.error("AI request timed out")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"AI request failed with status {e.response.status_code}: {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"AI request failed: {e}")
            return None

    async def generate_pseudocode(self, function_code: str, function_name: str, language: str) -> Optional[str]:
        """Generate pseudocode for a function"""
        prompt = f"""Analyze this {language} function and create clear, readable pseudocode:

```{language}
{function_code}
```

**Function:** `{function_name}`

Create pseudocode that:
1. Uses simple, clear language
2. Shows the logical flow with proper indentation
3. Explains the algorithm step by step
4. Uses structured format (BEGIN/END, IF/ELSE, WHILE/FOR)
5. Avoids language-specific syntax

**Format your response as:**
```
FUNCTION {function_name}:
    BEGIN
        // Your pseudocode here with proper indentation
    END
```

Provide only the pseudocode block, no additional explanation."""
        
        return await self._make_ai_request(prompt, temperature=0.3)

    async def generate_mermaid_flowchart(self, function_code: str, function_name: str, language: str) -> Optional[str]:
        """Generate Mermaid flowchart for a function"""
        prompt = f"""Analyze this {language} function and create a Mermaid flowchart that visualizes its logic flow:

{language} code:
{function_code}

Function Name: {function_name}

Create a Mermaid flowchart following the latest Mermaid v11+ syntax:

CRITICAL SYNTAX RULES - MUST FOLLOW:
1. START with "flowchart TD" (Top-Down direction)
2. NODE TYPES (choose appropriate):
   - Process/Action: A[Process name] 
   - Start/End: A(Start) or A(End)
   - Decision: A{{Is condition?}}
   - Input/Output: A[/Input data/] or A[/Output data/]
   - Database: A[(Database)]
   - Subroutine: A[[Subroutine]]

3. TEXT RULES (CRITICAL):
   - Keep node text SHORT (1-3 words max)
   - NEVER use nested brackets: NO [text [with] brackets]
   - NEVER use nested parentheses: NO (text (with) parens)
   - NEVER use special chars: *, =, /, \\, +, -, <, >, &
   - Replace function calls: "func(arg)" becomes "Call func"
   - Use simple verbs: "Check", "Set", "Get", "Return", "Process"

4. CONNECTION SYNTAX:
   - Arrow: A --> B
   - With label: A -->|Yes| B
   - Multiple targets: A --> B & C
   
5. EXAMPLES OF GOOD NODE TEXT:
   ✅ A[Start]
   ✅ B[Get input]  
   ✅ C{{Valid?}}
   ✅ D[Process data]
   ✅ E[Return result]
   ✅ F(End)

6. EXAMPLES TO AVOID:
   ❌ A[Return visited(t)] - has nested parentheses
   ❌ B[Check arr[i]] - has nested brackets  
   ❌ C[Sum = a + b] - has special characters
   ❌ D[Very long descriptive text about process] - too long

FORMAT REQUIREMENTS:
- Return ONLY the Mermaid flowchart code
- Start with "flowchart TD"
- Use clear, logical flow
- Include all major logic branches
- End with appropriate termination nodes

Example structure:
flowchart TD
    A[Start] --> B[Get input]
    B --> C{{Valid input?}}
    C -->|Yes| D[Process]
    C -->|No| E[Show error]
    D --> F[Return result]
    E --> F
    F --> G(End)"""
        
        result = await self._make_ai_request(prompt, temperature=0.3, max_tokens=1500)
        
        # Clean up the Mermaid syntax to avoid parsing errors
        if result:
            result = self._clean_mermaid_syntax(result)
        
        return result

    def _clean_mermaid_syntax(self, mermaid_code: str) -> str:
        """Clean up Mermaid syntax to avoid parsing errors"""
        import re
        
        # Split into lines for processing
        lines = mermaid_code.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Skip empty lines
            if not line.strip():
                cleaned_lines.append(line)
                continue
            
            # Fix nodes with problematic characters
            # Handle parentheses in node text - replace nested parentheses with square brackets
            def fix_parentheses_in_nodes(match):
                node_id = match.group(1)
                node_text = match.group(2)
                # Replace parentheses inside text with square brackets to avoid nesting
                cleaned_text = node_text.replace('(', '[').replace(')', ']')
                return f"{node_id}({cleaned_text})"
            
            # Fix parentheses nodes that have nested parentheses
            line = re.sub(r'(\w+)\(([^)]*\([^)]*\)[^)]*)\)', fix_parentheses_in_nodes, line)
            
            # Fix square brackets inside rectangular node text
            def fix_node_brackets(match):
                node_id = match.group(1)
                node_text = match.group(2)
                # Replace square brackets inside text with parentheses
                cleaned_text = node_text.replace('[', '(').replace(']', ')')
                return f"{node_id}[{cleaned_text}]"
            
            # Apply the fix for rectangular nodes
            line = re.sub(r'(\w+)\[([^\]]*\[[^\]]*\][^\]]*)\]', fix_node_brackets, line)
            
            # Clean up other problematic characters and patterns
            # Replace mathematical operators
            line = re.sub(r'(\w+)(\[|\()([^)\]]*\*[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('*', ' times ')}{')' if m.group(2) == '(' else ']'}", line)
            line = re.sub(r'(\w+)(\[|\()([^)\]]*=[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('=', ' equals ')}{')' if m.group(2) == '(' else ']'}", line)
            line = re.sub(r'(\w+)(\[|\()([^)\]]*\+[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('+', ' plus ')}{')' if m.group(2) == '(' else ']'}", line)
            line = re.sub(r'(\w+)(\[|\()([^)\]]*-[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('-', ' minus ')}{')' if m.group(2) == '(' else ']'}", line)
            
            # Replace angle brackets and other problematic characters
            line = re.sub(r'(\w+)(\[|\()([^)\]]*<[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('<', ' less than ')}{')' if m.group(2) == '(' else ']'}", line)
            line = re.sub(r'(\w+)(\[|\()([^)\]]*>[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('>', ' greater than ')}{')' if m.group(2) == '(' else ']'}", line)
            line = re.sub(r'(\w+)(\[|\()([^)\]]*&[^)\]]*)\)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3).replace('&', ' and ')}{')' if m.group(2) == '(' else ']'}", line)
            
            # Clean up overly long node text (truncate to reasonable length)
            def truncate_long_text(match):
                node_id = match.group(1)
                bracket = match.group(2)
                node_text = match.group(3)
                close_bracket = ')' if bracket == '(' else ']'
                
                # If text is too long, truncate and add ellipsis
                if len(node_text) > 25:
                    words = node_text.split()
                    if len(words) > 3:
                        node_text = ' '.join(words[:3]) + '...'
                    elif len(node_text) > 25:
                        node_text = node_text[:22] + '...'
                
                return f"{node_id}{bracket}{node_text}{close_bracket}"
            
            line = re.sub(r'(\w+)(\[|\()([^)\]]{20,})\)', truncate_long_text, line)
            
            # Fix any remaining problematic characters in node text
            # Replace common problematic patterns
            line = re.sub(r'(\w+)\[([^\]]*=[^\]]*)\]', lambda m: f"{m.group(1)}[{m.group(2).replace('=', ' equals ')}]", line)
            
            # Remove any asterisks that might cause issues
            line = re.sub(r'(\w+)\[([^\]]*\*[^\]]*)\]', lambda m: f"{m.group(1)}[{m.group(2).replace('*', ' times ')}]", line)
            
            # Clean up excessive spaces
            line = re.sub(r'\s+', ' ', line.strip())
            
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)

    async def analyze_complexity(self, function_code: str, function_name: str, language: str) -> Optional[str]:
        """Analyze function complexity and provide insights"""
        prompt = f"""Analyze this {language} function for complexity, performance, and code quality:

```{language}
{function_code}
```

**Function:** `{function_name}`

Provide a structured analysis using this markdown format:

## Complexity Analysis

### ⏱️ Time Complexity
- **Big O:** O(?)
- **Explanation:** Brief explanation of why

### 💾 Space Complexity  
- **Big O:** O(?)
- **Explanation:** Memory usage analysis

### 📖 Code Quality
- **Readability:** (Excellent/Good/Fair/Poor)
- **Maintainability:** Brief assessment

### ⚡ Performance
- **Efficiency:** Assessment of algorithm efficiency
- **Bottlenecks:** Any performance concerns

### 📊 Overall Score
**Complexity Score:** X/10 (where 1=simple, 10=very complex)

Keep each section concise but informative (2-3 sentences max per section)."""
        
        return await self._make_ai_request(prompt, temperature=0.5, max_tokens=800)

    async def suggest_optimizations(self, function_code: str, function_name: str, language: str) -> List[str]:
        """Get optimization suggestions for a function"""
        prompt = f"""Analyze this {language} function and suggest specific optimizations:

```{language}
{function_code}
```

**Function:** `{function_name}`

Provide 3-5 specific optimization suggestions using this markdown format:

## 🚀 Optimization Suggestions

### 1. Performance Improvements
**Suggestion:** Specific optimization
**Impact:** Expected performance gain
**Implementation:** How to implement

### 2. Code Readability  
**Suggestion:** Specific readability improvement
**Impact:** Why it helps maintainability
**Implementation:** How to implement

### 3. Best Practices
**Suggestion:** Specific best practice to apply
**Impact:** Benefits of following this practice
**Implementation:** How to implement

### 4. Memory Efficiency (if applicable)
**Suggestion:** Memory optimization
**Impact:** Expected memory savings
**Implementation:** How to implement

### 5. Error Handling (if applicable)
**Suggestion:** Error handling improvement
**Impact:** Better robustness
**Implementation:** How to implement

Focus on actionable, specific suggestions with clear implementation guidance."""
        
        result = await self._make_ai_request(prompt, temperature=0.6, max_tokens=1500)
        
        if not result:
            return []
        
        # Since we're now using structured markdown format, return the full formatted response
        # The frontend can render the markdown properly
        return [result]  # Return as single formatted string

    async def identify_issues(self, function_code: str, function_name: str, language: str) -> List[str]:
        """Identify potential issues in the function"""
        prompt = f"""Analyze this {language} function for potential issues, bugs, or problems:

```{language}
{function_code}
```

**Function:** `{function_name}`

Analyze for potential issues using this markdown format:

## ⚠️ Potential Issues Analysis

### 🐛 Logic Errors
**Issue:** Describe any logic problems
**Risk Level:** (High/Medium/Low)  
**Solution:** How to fix

### 🔒 Security Vulnerabilities
**Issue:** Security concerns if any
**Risk Level:** (High/Medium/Low)
**Solution:** How to mitigate

### 🎯 Edge Cases
**Issue:** Unhandled edge cases
**Risk Level:** (High/Medium/Low)
**Solution:** How to handle

### ⚡ Performance Bottlenecks
**Issue:** Performance concerns
**Risk Level:** (High/Medium/Low)
**Solution:** How to optimize

### 🔍 Code Quality Issues
**Issue:** Code smells or anti-patterns
**Risk Level:** (High/Medium/Low)
**Solution:** How to improve

If no significant issues are found, respond with:
## ✅ Analysis Result
**Status:** No significant issues detected
**Code Quality:** The function appears to be well-implemented

Be specific about what could go wrong and provide actionable solutions."""
        
        result = await self._make_ai_request(prompt, temperature=0.4, max_tokens=1500)
        
        if not result:
            return []
        
        # Return the full markdown formatted response for proper rendering
        return [result]

    async def analyze_function_comprehensive(
        self, 
        function_code: str, 
        function_name: str, 
        language: str
    ) -> Optional[AIAnalysisResult]:
        """Perform comprehensive AI analysis of a function"""
        if not self.is_available():
            return None

        try:
            # Run all analyses concurrently for better performance
            tasks = [
                self.generate_pseudocode(function_code, function_name, language),
                self.generate_mermaid_flowchart(function_code, function_name, language),
                self.analyze_complexity(function_code, function_name, language),
                self.suggest_optimizations(function_code, function_name, language),
                self.identify_issues(function_code, function_name, language)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle results and exceptions
            pseudocode = results[0] if not isinstance(results[0], Exception) else "Error generating pseudocode"
            flowchart = results[1] if not isinstance(results[1], Exception) else "Error generating flowchart"
            complexity = results[2] if not isinstance(results[2], Exception) else "Error analyzing complexity"
            optimizations = results[3] if not isinstance(results[3], Exception) else []
            issues = results[4] if not isinstance(results[4], Exception) else []
            
            return AIAnalysisResult(
                pseudocode=pseudocode or "Unable to generate pseudocode",
                flowchart=flowchart or "Unable to generate flowchart",
                complexity_analysis=complexity or "Unable to analyze complexity",
                optimization_suggestions=optimizations if isinstance(optimizations, list) else [],
                potential_issues=issues if isinstance(issues, list) else []
            )

        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            return None

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global AI service instance
ai_service = DigitalOceanAIService() 