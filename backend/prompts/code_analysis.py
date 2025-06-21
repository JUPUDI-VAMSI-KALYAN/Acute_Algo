"""
General code analysis prompts.
Focus on code quality, maintainability, and general analysis.
"""


class CodeAnalysisPrompts:
    """Prompts for general code quality analysis."""

    @staticmethod
    def get_code_quality_assessment_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Assess overall code quality."""
        return f"""Assess the overall quality of this {language} function:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "readability": {{
    "score": 8,
    "assessment": "Code is well-structured with clear variable names and logical flow",
    "issues": "Some complex nested conditions could be extracted into helper functions",
    "suggestions": "Extract complex boolean logic into named helper methods for better readability"
  }},
  "maintainability": {{
    "score": 7,
    "assessment": "Good structure but some tightly coupled dependencies",
    "issues": "Function handles multiple responsibilities that could be separated",
    "suggestions": "Split into smaller functions following single responsibility principle"
  }},
  "structure": {{
    "score": 6,
    "assessment": "Reasonable organization but could benefit from better separation of concerns",
    "issues": "Logic for validation and processing mixed together",
    "suggestions": "Separate validation logic from business logic processing"
  }},
  "documentation": {{
    "score": 4,
    "assessment": "Minimal documentation with unclear variable names in some areas",
    "issues": "Missing function docstring and some unclear variable names",
    "suggestions": "Add comprehensive docstring and rename variables like 'temp' and 'data' to be more descriptive"
  }},
  "overall_score": 25,
  "grade": "fair",
  "summary": "Well-implemented algorithm with good performance but needs better documentation and structure"
}}
```

**Valid values:**
- score fields: numbers 1-10
- grade: "excellent" (36-40), "good" (28-35), "fair" (20-27), "poor" (<20)

Provide specific, actionable feedback for improvement.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_maintainability_analysis_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Analyze code maintainability."""
        return f"""Analyze the maintainability of this {language} function:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "change_impact": {{
    "current_state": "Moderate difficulty - changes require understanding of multiple interconnected parts",
    "risk_areas": "Complex conditional logic and tightly coupled data processing",
    "dependencies": "External API calls and database operations create maintenance dependencies"
  }},
  "team_factors": {{
    "knowledge_transfer": "New developers would need 2-3 days to understand the logic flow",
    "documentation_needs": "Function documentation, API contracts, and business logic explanations",
    "onboarding_impact": "Medium - requires understanding of both business domain and technical implementation"
  }},
  "future_considerations": {{
    "scalability": "Current design will handle expected growth but may need optimization for 10x load",
    "extensibility": "Adding new features would require significant refactoring of conditional logic",
    "refactoring_needs": "Extract validation logic, separate business rules, and improve error handling"
  }},
  "maintenance_cost": {{
    "current_effort": "medium",
    "future_projection": "increasing",
    "roi_of_improvements": "High - investing in refactoring would significantly reduce future maintenance costs"
  }}
}}
```

**Valid values:**
- current_effort: "low", "medium", "high"
- future_projection: "decreasing", "stable", "increasing"

Provide practical recommendations for reducing maintenance burden.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_code_standards_compliance_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Check compliance with coding standards."""
        return f"""Check this {language} function against coding standards:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "naming_conventions": {{
    "functions": "Clear and descriptive function names following camelCase convention",
    "variables": "Most variables well-named, but 'temp' and 'data' could be more specific",
    "constants": "Constants properly named in UPPER_CASE format",
    "compliance": "pass",
    "issues": "Variables 'temp' and 'data' need more descriptive names"
  }},
  "code_style": {{
    "formatting": "Consistent indentation and spacing throughout",
    "line_length": "All lines under 80 characters, good readability",
    "comments": "Sparse commenting, needs more explanation of complex logic",
    "compliance": "pass",
    "issues": "Needs more inline comments for complex conditional logic"
  }},
  "structure_standards": {{
    "function_size": "Function is appropriately sized at 25 lines",
    "complexity": "Cyclomatic complexity of 6 is within acceptable range",
    "single_responsibility": "Function handles validation and processing - violates SRP",
    "compliance": "fail",
    "issues": "Mixing validation and business logic violates single responsibility principle"
  }},
  "best_practices": {{
    "error_handling": "Basic error handling present but could be more comprehensive",
    "resource_management": "No resource cleanup needed for this function",
    "security_practices": "Input validation present, no obvious security issues",
    "compliance": "pass",
    "issues": "Could benefit from more specific exception types"
  }},
  "overall_score": 75,
  "grade": "fair",
  "priority_fixes": ["Separate validation from business logic", "Add more descriptive variable names", "Improve commenting for complex logic"]
}}
```

**Valid values:**
- compliance: "pass", "fail"
- grade: "excellent" (>90%), "good" (80-90%), "fair" (60-79%), "poor" (<60%)
- overall_score: number 0-100

Focus on actionable improvements for standards compliance.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_refactoring_recommendations_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Provide refactoring recommendations."""
        return f"""Analyze this {language} function and provide refactoring recommendations:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "refactoring_priority": {{
    "overall_priority": "medium",
    "reasoning": "Code works well but has maintainability issues that will compound over time",
    "business_impact": "Low immediate impact but high long-term maintenance cost savings"
  }},
  "specific_improvements": {{
    "extract_method": {{
      "current_issues": "Complex validation logic embedded within main processing",
      "suggested_extractions": "Extract validation into validateInput() and business logic into processTransaction()",
      "benefits": "Improved testability, readability, and single responsibility adherence"
    }},
    "simplify_conditionals": {{
      "current_issues": "Nested if-else statements with complex boolean logic",
      "suggested_simplifications": "Use early returns and extract complex conditions into named boolean variables",
      "benefits": "Reduced cognitive load and easier debugging"
    }},
    "remove_duplication": {{
      "duplicated_sections": "Error logging pattern repeated in 3 places",
      "consolidation_strategy": "Create logError() helper function",
      "benefits": "Consistent error handling and easier maintenance"
    }},
    "improve_naming": {{
      "unclear_names": "Variables 'temp', 'data', and 'result' are too generic",
      "suggested_names": "validatedInput, transactionData, and calculationResult",
      "benefits": "Self-documenting code reducing need for comments"
    }}
  }},
  "refactoring_plan": {{
    "phase_1": "Extract validation logic and improve variable naming (2-3 hours, low risk)",
    "phase_2": "Simplify conditional logic and remove duplication (4-5 hours, medium risk)",
    "phase_3": "Consider splitting into multiple focused functions (6-8 hours, high risk)"
  }},
  "cost_benefit": {{
    "effort_required": "10-16 hours",
    "risk_level": "medium",
    "expected_benefits": "50% reduction in future modification time, improved bug detection",
    "roi_assessment": "High - refactoring costs will be recovered within 3-4 maintenance cycles"
  }}
}}
```

**Valid values:**
- overall_priority: "high", "medium", "low"
- risk_level: "low", "medium", "high"

Prioritize recommendations by business value and implementation ease.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_testing_recommendations_prompt(
        function_code: str, function_name: str, language: str
    ) -> str:
        """Recommend testing strategies for the code."""
        return f"""Analyze this {language} function and recommend testing strategies:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "test_coverage_analysis": {{
    "current_testability": "Moderately testable but some dependencies make unit testing challenging",
    "testing_challenges": "External API calls and database dependencies require mocking",
    "improvements_needed": "Extract dependencies to make function more testable"
  }},
  "test_cases": {{
    "unit_tests": {{
      "happy_path": ["Valid input with all required fields", "Minimum valid transaction amount", "Maximum valid transaction amount"],
      "edge_cases": ["Empty input", "Null values", "Boundary value testing"],
      "error_cases": ["Invalid transaction type", "Negative amounts", "Missing required fields"],
      "performance_tests": ["Large transaction volumes", "Concurrent processing"]
    }},
    "integration_tests": {{
      "dependencies": ["Database connection", "External payment API", "Logging service"],
      "data_flow": ["End-to-end transaction processing", "Error propagation testing"],
      "error_propagation": ["Database failure handling", "API timeout scenarios"]
    }}
  }},
  "testing_strategy": {{
    "test_framework": "pytest with mock for Python, Jest for JavaScript",
    "mock_requirements": "Mock external API calls, database operations, and logging",
    "test_data": "Transaction fixtures with various valid and invalid scenarios",
    "automation_level": "Fully automated unit tests, partially automated integration tests"
  }},
  "testing_priority": {{
    "critical_tests": ["Input validation", "Business logic calculation", "Error handling"],
    "important_tests": ["Edge case handling", "Performance under load"],
    "nice_to_have": ["Logging verification", "Detailed error message validation"]
  }},
  "testability_improvements": {{
    "code_changes": "Extract database and API calls into injectable dependencies",
    "design_patterns": "Dependency injection for external services",
    "dependency_injection": "Pass database and API clients as parameters instead of direct calls"
  }}
}}
```

Focus on practical testing approaches that provide maximum business value.
Return only the JSON object, no additional formatting or explanation."""
