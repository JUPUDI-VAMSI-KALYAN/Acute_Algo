"""
Algorithm analysis prompts for technical aspects.
Focus on pseudocode, flowcharts, and complexity analysis.
"""


class AlgorithmAnalysisPrompts:
    """Prompts for technical algorithm analysis."""

    # System prompt for technical analysis
    TECHNICAL_ANALYSIS_SYSTEM = """
You are a senior software engineer and algorithm specialist with expertise in code analysis and optimization.
Your role is to provide comprehensive technical analysis of algorithms and code functions.

Focus on:
- Algorithm complexity and performance
- Code structure and design patterns
- Technical implementation details
- Optimization opportunities
- Best practices and standards
- Maintainability and scalability

Provide detailed technical insights that help developers understand the algorithmic approach, identify potential improvements, and ensure code quality.
Always include specific, actionable recommendations for technical enhancement.
"""

    @staticmethod
    def get_pseudocode_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Generate pseudocode for the algorithm."""
        return f"""Analyze this {language} function and create clear, readable pseudocode:

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

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "pseudocode": "FUNCTION calculate_payment_fee:\\n    BEGIN\\n        IF transaction_type is premium THEN\\n            fee = amount * 0.025\\n        ELSE\\n            fee = amount * 0.015\\n        END IF\\n        RETURN fee\\n    END"
}}
```

**Example Output:**
```json
{{
  "pseudocode": "FUNCTION {function_name}:\\n    BEGIN\\n        // Your pseudocode here with proper indentation\\n        // Use \\n for line breaks\\n    END"
}}
```

Use \\n for line breaks within the pseudocode string.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_flowchart_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Generate Mermaid flowchart for the algorithm."""
        return f"""Analyze this {language} function and create a Mermaid flowchart that visualizes its logic flow:

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

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "flowchart": "flowchart TD\\n    A[Start] --> B[Get input]\\n    B --> C{{Valid input?}}\\n    C -->|Yes| D[Process]\\n    C -->|No| E[Show error]\\n    D --> F[Return result]\\n    E --> F\\n    F --> G(End)"
}}
```

**Example structure:**
```json
{{
  "flowchart": "flowchart TD\\n    A[Start] --> B[Get input]\\n    B --> C{{Valid input?}}\\n    C -->|Yes| D[Process]\\n    C -->|No| E[Show error]\\n    D --> F[Return result]\\n    E --> F\\n    F --> G(End)"
}}
```

Use \\n for line breaks within the flowchart string.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_complexity_analysis_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Analyze algorithmic complexity."""
        return f"""Analyze this {language} function for complexity, performance, and code quality:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "time_complexity": "O(n)",
  "time_explanation": "Linear time due to single loop through input array",
  "space_complexity": "O(1)",
  "space_explanation": "Constant space usage with only a few variables",
  "readability": "good",
  "maintainability": "Well-structured with clear variable names and logical flow",
  "efficiency": "Efficient algorithm with optimal time complexity for the problem",
  "bottlenecks": "No significant performance concerns for expected input sizes",
  "complexity_score": 4
}}
```

**Valid values:**
- time_complexity, space_complexity: Big O notation strings (e.g., "O(1)", "O(n)", "O(n²)", "O(log n)")
- readability: "excellent", "good", "fair", "poor"
- complexity_score: number 1-10 (where 1=simple, 10=very complex)

Keep each section concise but informative (2-3 sentences max per section).
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_optimization_suggestions_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Get optimization suggestions for the algorithm."""
        return f"""Analyze this {language} function and suggest specific optimizations:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "suggestions": [
    {{
      "category": "performance",
      "suggestion": "Use dictionary lookup instead of linear search",
      "impact": "Reduces time complexity from O(n) to O(1)",
      "implementation": "Replace the for loop with a pre-built dictionary mapping",
      "priority": "high"
    }},
    {{
      "category": "readability",
      "suggestion": "Extract complex condition into named function",
      "impact": "Improves code readability and makes logic easier to understand",
      "implementation": "Create is_valid_transaction() helper function",
      "priority": "medium"
    }},
    {{
      "category": "best_practices",
      "suggestion": "Add input validation at function start",
      "impact": "Prevents runtime errors and improves robustness",
      "implementation": "Add type checks and null/empty validations",
      "priority": "high"
    }},
    {{
      "category": "memory",
      "suggestion": "Use generator instead of list comprehension",
      "impact": "Reduces memory usage for large datasets",
      "implementation": "Replace list comprehension with generator expression",
      "priority": "low"
    }},
    {{
      "category": "error_handling",
      "suggestion": "Add try-catch blocks for external calls",
      "impact": "Better error recovery and user experience",
      "implementation": "Wrap API calls in try-catch with fallback logic",
      "priority": "medium"
    }}
  ]
}}
```

**Valid values:**
- category: "performance", "readability", "best_practices", "memory", "error_handling"
- priority: "high", "medium", "low"

Provide 3-5 specific optimization suggestions.
Focus on actionable, specific suggestions with clear implementation guidance.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_issues_identification_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Identify potential issues in the algorithm."""
        return f"""Analyze this {language} function for potential issues, bugs, or problems:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "issues": [
    {{
      "category": "logic_errors",
      "issue": "Division by zero not handled when calculating percentage",
      "risk_level": "high",
      "solution": "Add check for zero denominator before division operation",
      "line_reference": "Line 15: percentage = total / count"
    }},
    {{
      "category": "security",
      "issue": "User input not sanitized before database query",
      "risk_level": "high",
      "solution": "Use parameterized queries to prevent SQL injection",
      "line_reference": "Line 8: query = f'SELECT * FROM users WHERE id = {{user_id}}'"
    }},
    {{
      "category": "edge_cases",
      "issue": "Empty array not handled in processing loop",
      "risk_level": "medium",
      "solution": "Add array length check before processing",
      "line_reference": "Line 12: for item in data_array"
    }},
    {{
      "category": "performance",
      "issue": "Nested loops creating O(n²) complexity",
      "risk_level": "medium",
      "solution": "Use hash map for lookups to reduce to O(n)",
      "line_reference": "Lines 20-25: nested for loops"
    }},
    {{
      "category": "code_quality",
      "issue": "Magic numbers used without explanation",
      "risk_level": "low",
      "solution": "Define named constants for threshold values",
      "line_reference": "Line 18: if value > 0.85"
    }}
  ],
  "overall_status": "issues_found",
  "summary": "Found 5 issues including 2 high-risk security and logic problems that need immediate attention"
}}
```

**Valid values:**
- category: "logic_errors", "security", "edge_cases", "performance", "code_quality"
- risk_level: "high", "medium", "low"
- overall_status: "no_issues", "issues_found"

If no significant issues are found, use this format:
```json
{{
  "issues": [],
  "overall_status": "no_issues",
  "summary": "No significant issues detected. The function appears to be well-implemented."
}}
```

Be specific about what could go wrong and provide actionable solutions.
Return only the JSON object, no additional formatting or explanation."""
