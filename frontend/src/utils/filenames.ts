export function toChapterName(s: string) {
    const regex = /(\d{2})\s(.+)/g;
    let replaced = s.replace(/_/g, " ").replace(".txt", "")
    const replacedString = replaced.replace(regex, (_match, p1, p2) => {
        // Convert the first group (the number) to an integer and remove leading zeros
        const num = parseInt(p1, 10);
        return num + '. ' + p2;
    });
    return replacedString;
}