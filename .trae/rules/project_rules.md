---
description: Development conventions and rules for the Acute Algo platform
globs: ["backend/**/*", "frontend/**/*"]
alwaysApply: true
---
We will work on once feature at a time. just work on the mking the current working feature fit into the existing code. Dont over complicate. 

# 🧠 Acute Algo – Cursor Project Rules

Acute Algo is a platform for detecting, understanding, and versioning algorithms across software projects. This doc outlines conventions to ensure clear structure, scalable architecture, and effective collaboration across frontend and backend teams.
---


#🧰 Tooling & Setup
🔧 Python (Backend)
✅ Use uv for enment and dependency management
✅ Python version: 3.11+
✅ Enforce formatting with black
✅ Lint with ruff
✅ Prefer FastAPI for all backend API routes
✅ Use pydantic for data validation
✅ Use pytest for testing
✅ Use Pydantic field aliases to return camelCase to frontend

🔧 TypeScript/Next.js (Frontend)
✅ Use Next.js with TypeScript
✅ Use Tailwind CSS for all styling
✅ Use Axios for API calls (do not use raw fetch)
✅ Create lib/api.ts to wrap axios logic
✅ Use pages/ routing (not app directory)


🎯 Code Conventions
🐍 Python
✅ Use type hints for all functions
✅ Use async/await for all I/O operations
✅ Follow snake_case naming
✅ Use early returns to reduce nesting

python# ✅ Good
async def detect_algorithms(code_content: str, language: str) -> List[DetectedAlgorithm]:
    if not code_content.strip():
        return []
    return await analysis_service.process(code_content, language)
Field(alias="camelCase")

⚛️ TypeScript/React
✅ Use PascalCase for components
✅ Use CamelCase: All props, variables, and API fields use consistent casing
✅ Always define prop types with interfaces
✅ Prefer function components

tsx// ✅ Good
interface AlgorithmCardProps {
  algorithm: DetectedAlgorithm;
  onSelect: (id: string) => void;
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ algorithm, onSelect }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{algorithm.name}</h3>
      <button onClick={() => onSelect(algorithm.id)}>Select</button>
    </div>
  );
};