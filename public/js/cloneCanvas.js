export default function cloneCanvas(oldCanvas) {
  const newCanvas = document.createElement('canvas');
  const newContext = newCanvas.getContext('2d');
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  newContext.drawImage(oldCanvas, 0, 0);
  return [newCanvas, newContext];
}
