"""
Business metrics prompts for algorithm analysis.
Focus on business impact, costs, and practical metrics.
"""


class BusinessMetricsPrompts:
    """Prompts focused on business value and metrics for algorithms."""
    
    # System prompt for business analysis
    BUSINESS_ANALYSIS_SYSTEM = """
You are a business analyst specializing in evaluating software algorithms from a business perspective.
Your role is to assess the business impact, value, and risks associated with code functions.

Focus on:
- Business value and impact
- Cost implications and ROI
- Risk assessment and mitigation
- Stakeholder impact
- Operational considerations
- Strategic alignment

Provide practical, actionable insights that help business stakeholders understand the importance and implications of the analyzed code.
Always structure your analysis in clear, business-friendly language while maintaining technical accuracy.
"""
    
    @staticmethod
    def get_short_description_prompt(function_code: str, function_name: str, language: str) -> str:
        """Generate a business-focused short description of the algorithm."""
        return f"""Analyze this {language} function and provide a concise business description:

```{language}
{function_code}
```

**Function:** `{function_name}`

Provide a 1-2 sentence description of what this algorithm does in business terms.
Focus on the business purpose and value, not technical implementation details.

**Examples of good descriptions:**
- "Calculates customer payment fees based on transaction type and user tier"
- "Validates user authentication credentials and manages session tokens"
- "Processes customer orders and updates inventory levels"
- "Generates financial reports from transaction data"

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "description": "Your 1-2 sentence business description here"
}}
```

**Example Output:**
```json
{{
  "description": "Calculates customer payment fees based on transaction type and user tier"
}}
```

Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_business_metrics_prompt(function_code: str, function_name: str, language: str) -> str:
        """Generate business metrics analysis for the algorithm."""
        return f"""Analyze this {language} function and provide business metrics:

```{language}
{function_code}
```

**Function:** `{function_name}`

Evaluate this algorithm and provide scores (1-10 scale) for each metric.

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "complexity_score": 7,
  "complexity_explanation": "Moderate complexity with nested loops and conditional logic",
  "business_impact": 8,
  "business_impact_explanation": "Critical for payment processing and revenue generation",
  "maintenance_risk": 6,
  "maintenance_risk_explanation": "Some complex logic but well-structured overall",
  "performance_risk": 4,
  "performance_risk_explanation": "No major performance concerns for expected load",
  "algorithm_type": "calculation",
  "business_domain": "payment",
  "priority": "high",
  "key_insight": "This payment calculation algorithm is critical for revenue but needs better error handling"
}}
```

**Valid values:**
- complexity_score, business_impact, maintenance_risk, performance_risk: numbers 1-10
- algorithm_type: "sorting", "search", "calculation", "validation", "workflow", "data_processing", "other"
- business_domain: "payment", "auth", "analytics", "reporting", "workflow", "user_management", "data_management", "other"
- priority: "high", "medium", "low"

Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_business_risk_assessment_prompt(function_code: str, function_name: str, language: str) -> str:
        """Assess business risks associated with the algorithm."""
        return f"""Analyze this {language} function for business risks:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "failure_impact": "Business operations would stop immediately if payment processing fails",
  "data_risk": "Payment data integrity could be compromised leading to financial losses",
  "customer_impact": "Customers unable to complete purchases, leading to lost revenue and poor experience",
  "operational_risk": "Critical business process disruption affecting all sales",
  "maintenance_cost": "medium",
  "failure_cost": "Very high - potential revenue loss of $10k+ per hour of downtime",
  "optimization_roi": "High - improved reliability could prevent costly outages",
  "immediate_actions": "Add comprehensive error handling and input validation",
  "long_term_strategy": "Implement redundancy, monitoring, and automated failover mechanisms"
}}
```

**Valid values:**
- maintenance_cost: "low", "medium", "high"

Keep analysis practical and focused on business impact, not technical details.
Return only the JSON object, no additional formatting or explanation."""

    @staticmethod
    def get_algorithm_classification_prompt(function_code: str, function_name: str, language: str) -> str:
        """Classify algorithm for business categorization."""
        return f"""Classify this {language} function for business categorization:

```{language}
{function_code}
```

**Function:** `{function_name}`

**REQUIRED OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

```json
{{
  "primary_function": "Processes customer payment transactions and calculates fees",
  "business_category": "revenue_generation",
  "criticality_level": "mission_critical",
  "criticality_reasoning": "Business cannot process payments without this function",
  "stakeholder_impact": ["customers", "internal_operations", "compliance"],
  "impact_reasoning": "Affects customer checkout experience, internal financial operations, and regulatory compliance"
}}
```

**Valid values:**
- business_category: "revenue_generation", "customer_experience", "operations", "analytics", "security", "infrastructure"
- criticality_level: "mission_critical", "important", "standard", "utility"
- stakeholder_impact: array with any combination of ["customers", "internal_operations", "external_partners", "compliance", "technical_teams"]

Return only the JSON object, no additional formatting or explanation."""