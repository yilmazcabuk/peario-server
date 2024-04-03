export default function nameGenerator(id: string) {
  return `Guest-${id.substring(0, 4)}`;
}
