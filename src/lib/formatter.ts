export const formatTimer = (secs: number): string => {
  let remainingSecs = secs;

  const h = Math.floor(remainingSecs / 3600);
  remainingSecs %= 3600;
  const m = Math.floor(remainingSecs / 60);
  remainingSecs %= 60;

  let formattedString = remainingSecs < 10 ? `0${remainingSecs}` : remainingSecs.toString();
  formattedString = m < 10 ? `0${m}:${formattedString}` : `${m.toString()}:${formattedString}`;
  formattedString = `${h}:${formattedString}`;

  return formattedString;
};
