export function escape(string: string): string {
    return string.replace(/(?:[.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export function buildAlternationRaw(words: string[]): string {
    return '(?:' + words.map(escape).join('|') + ')';
}

export function buildAlternation(words: string[], flags?: string): RegExp {
    return new RegExp(buildAlternationRaw(words), flags);
}