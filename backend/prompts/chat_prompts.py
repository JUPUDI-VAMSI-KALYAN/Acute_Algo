"""Chat prompts for AI assistant conversations.

This module contains organized prompts for different chat contexts
including function analysis, repository analysis, and general assistance.
"""

from typing import Dict, Any


class ChatPrompts:
    """Organized chat prompts for different conversation contexts."""
    
    # System prompts for different contexts
    FUNCTION_ANALYSIS_SYSTEM = """
You are an expert code analyst and software engineer. You specialize in analyzing functions,
understanding their purpose, complexity, and providing actionable insights.

When analyzing functions, consider:
- Algorithm complexity and efficiency
- Code quality and maintainability
- Potential optimizations
- Business impact and use cases
- Security considerations
- Best practices and patterns

Provide clear, concise, and actionable responses.
"""
    
    REPOSITORY_ANALYSIS_SYSTEM = """
You are an expert software architect and code reviewer. You specialize in analyzing
entire repositories, understanding project structure, and providing strategic insights.

When analyzing repositories, consider:
- Overall architecture and design patterns
- Code organization and structure
- Technology stack and dependencies
- Scalability and maintainability
- Security and performance implications
- Development best practices

Provide strategic, high-level insights along with specific recommendations.
"""
    
    GENERAL_ASSISTANCE_SYSTEM = """
You are a helpful AI assistant specialized in software development and code analysis.
You have expertise in multiple programming languages, frameworks, and development practices.

Provide helpful, accurate, and practical responses to programming questions.
When discussing code, use proper formatting and explain concepts clearly.
Always consider best practices and modern development standards.
"""
    
    # Context templates
    FUNCTION_CONTEXT_TEMPLATE = """
Context: You are analyzing a specific function.

Function Details:
- Name: {function_name}
- Code:
```{language}
{function_code}
```

Please provide helpful analysis and answer the user's question about this function.
"""
    
    REPOSITORY_CONTEXT_TEMPLATE = """
Context: You are analyzing a repository.

Repository Details:
- Name: {repository_name}
- Total Functions: {total_functions}
- Languages: {languages}
- File Structure: {structure}

Please provide helpful analysis and answer the user's question about this repository.
"""
    
    # Conversation history template
    CONVERSATION_HISTORY_TEMPLATE = """
Previous conversation:
{conversation_history}
"""
    
    # Main chat template
    CHAT_TEMPLATE = """
{context_info}{conversation_context}

Current question: {message}

Please provide a helpful, accurate, and concise response. If discussing code, use proper formatting and explain concepts clearly.
"""
    
    @classmethod
    def get_system_prompt(cls, context_type: str) -> str:
        """Get the appropriate system prompt for the given context type.
        
        Args:
            context_type: The type of context ('function', 'repository', or 'general')
            
        Returns:
            The appropriate system prompt
        """
        if context_type == "function":
            return cls.FUNCTION_ANALYSIS_SYSTEM
        elif context_type == "repository":
            return cls.REPOSITORY_ANALYSIS_SYSTEM
        else:
            return cls.GENERAL_ASSISTANCE_SYSTEM
    
    @classmethod
    def build_function_context(cls, function_info: Dict[str, Any]) -> str:
        """Build context information for function analysis.
        
        Args:
            function_info: Dictionary containing function details
            
        Returns:
            Formatted context string
        """
        return cls.FUNCTION_CONTEXT_TEMPLATE.format(
            function_name=function_info.get('name', 'Unknown'),
            language=function_info.get('language', ''),
            function_code=function_info.get('code', 'No code provided')
        )
    
    @classmethod
    def build_repository_context(cls, repository_info: Dict[str, Any]) -> str:
        """Build context information for repository analysis.
        
        Args:
            repository_info: Dictionary containing repository details
            
        Returns:
            Formatted context string
        """
        return cls.REPOSITORY_CONTEXT_TEMPLATE.format(
            repository_name=repository_info.get('name', 'Unknown'),
            total_functions=repository_info.get('totalFunctions', 'Unknown'),
            languages=repository_info.get('languages', 'Unknown'),
            structure=repository_info.get('structure', 'Not provided')
        )
    
    @classmethod
    def build_conversation_history(cls, conversation_history: list) -> str:
        """Build conversation history string from message list.
        
        Args:
            conversation_history: List of conversation messages
            
        Returns:
            Formatted conversation history string
        """
        if not conversation_history:
            return ""
        
        history_lines = []
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            role = msg.role.capitalize() if hasattr(msg, 'role') else 'Unknown'
            content = msg.content if hasattr(msg, 'content') else str(msg)
            history_lines.append(f"{role}: {content}")
        
        return cls.CONVERSATION_HISTORY_TEMPLATE.format(
            conversation_history="\n".join(history_lines)
        )