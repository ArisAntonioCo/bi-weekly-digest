// Clean up AI responses that may contain code blocks or formatting issues
export function cleanAIResponse(content: string): string {
  let cleaned = content.trim()
  
  // Check if the content is wrapped in code blocks (```html or ```)
  if (cleaned.includes('```html')) {
    // Extract content between ```html and ```
    const htmlMatch = cleaned.match(/```html\s*([\s\S]*?)```/)
    if (htmlMatch && htmlMatch[1]) {
      cleaned = htmlMatch[1].trim()
    }
  } else if (cleaned.includes('```')) {
    // Extract content from generic code blocks
    const codeMatch = cleaned.match(/```\s*([\s\S]*?)```/)
    if (codeMatch && codeMatch[1]) {
      cleaned = codeMatch[1].trim()
    }
  }
  
  // Remove any leading text before actual content
  // Sometimes AI adds explanatory text before the actual content
  const lines = cleaned.split('\n')
  const contentStartPatterns = [
    /^(Here's|Here is|This is)/i,
    /^(The following|Below is)/i,
    /newsletter|analysis|report/i
  ]
  
  // Find where the actual content starts
  let startIndex = 0
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    if (contentStartPatterns.some(pattern => pattern.test(lines[i]))) {
      startIndex = i + 1
      break
    }
  }
  
  // If we found explanatory text, skip it
  if (startIndex > 0 && startIndex < lines.length) {
    cleaned = lines.slice(startIndex).join('\n').trim()
  }
  
  return cleaned
}