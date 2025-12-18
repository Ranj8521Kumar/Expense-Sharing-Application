const calculateSplit = (amount, splitType, members, customSplits = []) => {
  const splits = [];

  if (splitType === 'equal') {
    const splitAmount = amount / members.length;
    members.forEach((memberId) => {
      splits.push({
        user: memberId,
        amount: parseFloat(splitAmount.toFixed(2)),
        percentage: parseFloat((100 / members.length).toFixed(2)),
      });
    });

    // Adjust for rounding errors
    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    const difference = parseFloat((amount - totalSplit).toFixed(2));
    if (difference !== 0) {
      splits[0].amount = parseFloat((splits[0].amount + difference).toFixed(2));
    }
  } else if (splitType === 'exact') {
    customSplits.forEach((split) => {
      splits.push({
        user: split.user,
        amount: parseFloat(split.amount.toFixed(2)),
        percentage: parseFloat(((split.amount / amount) * 100).toFixed(2)),
      });
    });
  } else if (splitType === 'percentage') {
    customSplits.forEach((split) => {
      const splitAmount = (amount * split.percentage) / 100;
      splits.push({
        user: split.user,
        amount: parseFloat(splitAmount.toFixed(2)),
        percentage: split.percentage,
      });
    });

    // Adjust for rounding errors
    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    const difference = parseFloat((amount - totalSplit).toFixed(2));
    if (difference !== 0 && splits.length > 0) {
      splits[0].amount = parseFloat((splits[0].amount + difference).toFixed(2));
    }
  }

  return splits;
};

export { calculateSplit };
