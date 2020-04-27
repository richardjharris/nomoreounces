// Chart of maximum temperatures for gas mark values,
// with 'typical' value indicated in comments
const celsiusTempForMark = [
    0,   // 1/4 = 107, 1/2 = 121
    140, // 1: 135
    150, // 2: 149
    160, // 3: 163
    180, // 4: 177
    190, // 5: 191
    200, // 6: 204
    210, // 7: 218
    220, // 8: 232
    240, // 9: 246
    260, // 10: 270 (omitted in most tables)
    280, // rare
    290, // rare
];

export function gasMarkToCelsius(mark: number): number {
    // Return the maximum temperature
    if (mark < 0 || mark >= celsiusTempForMark.length) {
        throw new Error(`invalid mark '${mark}'`)
    }
    if (mark <= 0.25) return 107;
    if (mark <= 0.5) return 121;

    return celsiusTempForMark[mark];
}

export function celsiusToGasMark(celsius: number): number {
    if (celsius <= 110) return 0.25;
    if (celsius <= 130) return 0.5;

    for(const [gasMark, maxTemp] of celsiusTempForMark.entries()) {
        if (celsius <= maxTemp) {
            return gasMark;
        }
    }
    // Assume largest gas mark
    return celsiusTempForMark.length;
}

