export function generateColorPalette(count) {
  const colors = []
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 / count) * i)
    colors.push(`hsl(${hue}, 70%, 50%)`)
  }
  return colors
}
