export default function getTextWidth(text: string, font: string) {
  // @ts-ignore: Unreachable code error
  // re-use canvas object for better performance
  const canvas: any = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
