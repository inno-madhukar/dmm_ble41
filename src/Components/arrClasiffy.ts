const classifyArray = (arr: string[][]): {
  deviceIdArray: string[];
  readingsArray: string[];
  commodityArray: string[];
} => {
  let deviceIdArray: string[] = [];
  let readingsArray: string[] = [];
  let commodityArray: string[] = [];
  console.log(arr)
  const cleanValue = (val: string) =>
    val.replace(/['"]/g, '').trim().replace(/\r?\n$/, '');

  arr.forEach((valueArray) => {
    const cleaned = valueArray.map(cleanValue);
    console.log("cleaned", cleaned)
    const joined = cleaned.join(',').trim();

    if (valueArray[0].length == 12) {
      deviceIdArray = [joined];
    } else if (
      !readingsArray.length &&
      cleaned.length === 3 &&
      cleaned.every(v => /^\d+(\.\d+)?$/.test(v) || v.toUpperCase() === 'FULL')
    ) {
      readingsArray = cleaned;
    } else if (!commodityArray.length) {
      commodityArray = cleaned;
    }
  });
  return { deviceIdArray, readingsArray, commodityArray };
};

export default classifyArray;
