export function renderText(text: string) {
    const lines = text.split('\n');
    return lines.filter((s) => !isEmptyOrWhitespace(s)).map((line, index) => (
        <p key={index}>{line}</p>
    ))
}

function isEmptyOrWhitespace(str: string) {
    // First, we trim the string to remove leading and trailing whitespace characters
    const trimmedStr = str.trim();
  
    // If the trimmed string has a length of 0, it means the original string was either empty or contained only whitespace
    return trimmedStr.length === 0;
  }