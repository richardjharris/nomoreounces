/**
 * Rounds a number to a multiple of 5.
 * For example: 177 -> 175, 203.1111 -> 200
 *
 * If the number is greater than zero but less than 5,
 * rounds up and returns 5.
 *
 * @argument num number (may be fractional)
 * @returns number Rounded integer
 */
export function round5(num: number): number {
    if (num == 0) return 0;
    if (num < 5) return 5;
    return Math.round(num / 5) * 5;
}
