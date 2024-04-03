export function renderText(text: string) {
    const lines = text.split('\n');
    return lines.filter((s) => !isEmptyOrWhitespace(s)).map((line, index) => {
        let processed = processLine(line)
        return <p key={index}>{processed}</p>
})
}

function processLine(str: string) {
    let processed = str;
    if (processed.startsWith("- ")) {
        processed = replaceFirstTwoChars(processed, "— ")
    }
    return processed
}

function replaceFirstTwoChars(str: string, replacement: string): string {
    if (str.length < 2) {
      return replacement;
    }
    
    return replacement + str.slice(2);
  }

function isEmptyOrWhitespace(str: string) {
    // First, we trim the string to remove leading and trailing whitespace characters
    const trimmedStr = str.trim();
  
    // If the trimmed string has a length of 0, it means the original string was either empty or contained only whitespace
    return trimmedStr.length === 0;
  }