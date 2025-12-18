const calculateBalances = (expenses, groupId = null) => {
  const balances = new Map();

  // Filter expenses by group if groupId provided
  const relevantExpenses = groupId
    ? expenses.filter((exp) => exp.group.toString() === groupId.toString())
    : expenses;

  // Calculate net balances
  relevantExpenses.forEach((expense) => {
    const paidBy = expense.paidBy._id || expense.paidBy;

    expense.splits.forEach((split) => {
      const userId = split.user._id || split.user;
      const userIdStr = userId.toString();
      const paidByStr = paidBy.toString();

      // Skip if user paid for themselves
      if (userIdStr === paidByStr) return;

      // Create balance key (always smaller ID first for consistency)
      const key =
        userIdStr < paidByStr
          ? `${userIdStr}-${paidByStr}`
          : `${paidByStr}-${userIdStr}`;

      if (!balances.has(key)) {
        balances.set(key, {
          user1: userIdStr < paidByStr ? userIdStr : paidByStr,
          user2: userIdStr < paidByStr ? paidByStr : userIdStr,
          amount: 0,
        });
      }

      const balance = balances.get(key);

      // Add or subtract based on direction
      if (userIdStr < paidByStr) {
        balance.amount -= split.amount; // user1 owes user2
      } else {
        balance.amount += split.amount; // user2 owes user1
      }
    });
  });

  // Convert to array and format
  const balanceArray = [];
  balances.forEach((balance) => {
    if (Math.abs(balance.amount) > 0.01) {
      // Ignore very small balances
      if (balance.amount > 0) {
        balanceArray.push({
          from: balance.user1,
          to: balance.user2,
          amount: parseFloat(balance.amount.toFixed(2)),
        });
      } else {
        balanceArray.push({
          from: balance.user2,
          to: balance.user1,
          amount: parseFloat(Math.abs(balance.amount).toFixed(2)),
        });
      }
    }
  });

  return balanceArray;
};

const simplifyBalances = (balances) => {
  // Create a net balance map for each user
  const netBalances = new Map();

  balances.forEach(({ from, to, amount }) => {
    const fromStr = from.toString();
    const toStr = to.toString();

    netBalances.set(fromStr, (netBalances.get(fromStr) || 0) - amount);
    netBalances.set(toStr, (netBalances.get(toStr) || 0) + amount);
  });

  // Separate debtors and creditors
  const debtors = [];
  const creditors = [];

  netBalances.forEach((balance, userId) => {
    if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    }
  });

  // Sort by amount (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Simplify settlements
  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(settleAmount.toFixed(2)),
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};

export { calculateBalances, simplifyBalances };
