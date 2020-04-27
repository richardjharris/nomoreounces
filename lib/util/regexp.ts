export function escape(string: string): string {
    return string.replace(/(?:[.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

export function buildAlternationRaw(words: string[]): string {
    return '(?:' + words.map(escape).join('|') + ')';
}

export function buildAlternation(words: string[], flags?: string): RegExp {
    return new RegExp(buildAlternationRaw(words), flags);
}

// Template string allowing multiline regexes with comments
export function rx(flags) { 
    const trailingComments = /\s+#.*$/gm;
    const surroundingWhitespace = /^\s+|\s+$/gm;
    const literalNewlines = /[\r\n]/g;

    return (strings, ...values) => { 
        function toPattern(pattern, rawString, i) { 
            var value = values[i];

            if (value == null) { 
                return pattern + rawString;
            }

            if (value instanceof RegExp) { 
                value = value.source;
            }

            return pattern + rawString + value;
        }

        const compiledPattern = strings.raw
            .reduce(toPattern, '')
            .replace(trailingComments, '')
            .replace(surroundingWhitespace, '')
            .replace(literalNewlines, '');

        return new RegExp(compiledPattern, flags);
    };
}
