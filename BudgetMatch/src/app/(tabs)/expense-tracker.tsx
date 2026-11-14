import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Keyboard, KeyboardAvoidingView } from 'react-native';
import Svg, { Path, Polyline, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';

import { Expense } from '@/types';
import DataManager from '@/data-manager';

// Adds Month Name
const addMonth = (amount: number) => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export default function ExpenseTrackerPage() {
  type CategoryTotal = {
    category: string;
    total: number;
  }
  type PieSlice = {
    category: string;
    path: string;
  }
  type ChartLine = {
    category: string;
    points: string;
  }
  const [addModalShown, setAddModalShown] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [customCategory, setCustomCategory] = useState('');

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  // store expenses
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  // Next 5 Months
  const monthOptions = [-6, -5, -4, -3, -2, -1, 0].map(addMonth);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  // Only show expenses from month
  const expenses = allExpenses.filter(expense => {
    const date = new Date(Date.parse(expense.timestamp));
    const formattedDate = new Date(date.getFullYear(), date.getMonth(), 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return formattedDate === selectedMonth;
  });

  const [isFormValid, setIsFormValid] = useState({
    amount: true,
    customCategory: true
  });

  const amountRegexPattern = /^\d*\.?\d{0,2}$/;

  // only do this on first render
  useEffect(() => {
    // instantiate default expenses
    setAllExpenses([...(DataManager.expenses)]);
  }, []);

  // colors for each spending category
  const categoryColors: Record<string, string> = {
    Housing: '#4E79A7',
    Groceries: '#F28E2B',
    Transportation: '#E15759',
    Dining: '#76B7B2',
    Shopping: '#59A14F',
    Entertainment: '#EDC948',
    Health: '#B07AA1',
    Bills: '#FF9DA7',
    Other: '#9C755F',
  };
  const categories = Object.keys(categoryColors);

  // Wait until fonts are fully loaded before rendering
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  // get the color for a spending category
  const getCategoryColor = (expenseCategory: string) => {
    if (categoryColors[expenseCategory]) {
      return categoryColors[expenseCategory];
    }
    return categoryColors.Other;
  }

  const closeAddModal = () => {
    
    // close modal and reset variables
    setAddModalShown(false);
    setDescription('');
    setAmount('');
    setCategory('Groceries');
    setCustomCategory('');
    setIsFormValid({
      amount: true,
      customCategory: true
    });
  }

  // calculate total spent and spending by category
  let totalSpent = 0;
  const spendingByCategory: CategoryTotal[] = [];

  for (let i = 0; i < expenses.length; i++){
    totalSpent += expenses[i].amount;

    let found = false;
    for (let j = 0; j < spendingByCategory.length; j++){
      if (spendingByCategory[j].category === expenses[i].category) {
        spendingByCategory[j].total += expenses[i].amount;
        found = true;
      }
    }

    if (!found) {
      spendingByCategory.push({category: expenses[i].category, total: expenses[i].amount});
    }
  }

  spendingByCategory.sort((category1, category2) => (category2.total - category1.total))

  // build pie chart slices
  const pieSlices: PieSlice[] = [];
  let startAngle = -Math.PI / 2;

  for (let i = 0; i < spendingByCategory.length; i++){
    const angle = (spendingByCategory[i].total / totalSpent) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const x1 = 100 + 88 * Math.cos(startAngle);
    const y1 = 100 + 88 * Math.sin(startAngle);
    const x2 = 100 + 88 * Math.cos(endAngle);
    const y2 = 100 + 88 * Math.sin(endAngle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;

    let path = `M 100 100 L ${x1} ${y1} A 88 88 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // a single category fills the whole circle
    if (angle >= Math.PI * 2 - 0.0001) {
      path = 'M 100 12 A 88 88 0 1 1 99.99 12 Z';
    }

    pieSlices.push({category: spendingByCategory[i].category, path: path});
    startAngle = endAngle;
  }

  // find every category that has expense
  const chartCategories: string[] = [];

  for (let i = 0; i < allExpenses.length; i++){
    if (!chartCategories.includes(allExpenses[i].category)) {
      chartCategories.push(allExpenses[i].category);
    }
  }

  // total spent per category
  const monthTotals: number[][] = [];
  let highestTotal = 1;

  for (let i = 0; i < chartCategories.length; i++){
    const totals: number[] = [];

    for (let j = 0; j < monthOptions.length; j++){
      let total = 0;
      for (let k = 0; k < allExpenses.length; k++){
        const date = new Date(Date.parse(allExpenses[k].timestamp));
        const formattedDate = new Date(date.getFullYear(), date.getMonth(), 1)
          .toLocaleString('en-US', { month: 'long', year: 'numeric' });

        if (allExpenses[k].category === chartCategories[i] && formattedDate === monthOptions[j]) {
          total += allExpenses[k].amount;
        }
      }

      totals.push(total);
      if (total > highestTotal) {
        highestTotal = total;
      }
    }
    monthTotals.push(totals);
  }

  // position month amount on the line chart
  const getChartX = (monthIndex: number) => 40 + monthIndex * 50;
  const getChartY = (value: number) => 165 - (value / highestTotal) * 150;

  // build line chart lines
  const chartLines: ChartLine[] = [];

  for (let i = 0; i < chartCategories.length; i++){
    let points = '';
    for (let j = 0; j < monthOptions.length; j++){
      points += `${getChartX(j)},${getChartY(monthTotals[i][j])} `;
    }
    chartLines.push({category: chartCategories[i], points: points});
  }

  // sort expenses so the newest is shown first
  const recentExpenses: Expense[] = [];

  for (let i = expenses.length - 1; i >= 0; i--){
    recentExpenses.push(expenses[i]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingPanel}>
        <Text style={styles.headingText}>Expense Tracker</Text>
      </View>

      {/* dropdown */}
      <View style={styles.monthDropdown}>
        <Pressable style={styles.monthButton} onPress={() => setMonthMenuOpen(!monthMenuOpen)}>
          <Text style={styles.monthText}>{selectedMonth} ▼</Text>
        </Pressable>
        {monthMenuOpen && monthOptions.map(month => (
          <Pressable
            key={month}
            style={styles.monthOption}
            onPress={() => {
              setSelectedMonth(month);
              setMonthMenuOpen(false);
            }}
          >
            <Text>{month}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalCard}>
          <Text style={styles.sectionLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.helperText}>Across all recorded expenses</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Spending Breakdown</Text>

          {totalSpent === 0 ? (
            <View style={styles.emptyChart}>
              <View style={styles.emptyDonut}>
                <Text style={styles.emptyDonutText}>No data</Text>
              </View>
              <Text style={styles.emptyText}>
                Add an expense to see where your money is going.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.chartContainer}>
                <Svg width={220} height={220} viewBox="0 0 200 200">
                  {pieSlices.map(slice => (
                    <Path
                      key={slice.category}
                      d={slice.path}
                      fill={getCategoryColor(slice.category)}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  ))}
                </Svg>
                <View style={styles.chartCenter}>
                  <Text style={styles.chartCenterLabel}>Total</Text>
                  <Text style={styles.chartCenterAmount}>${totalSpent.toFixed(0)}</Text>
                </View>
              </View>

              <View style={styles.legend}>
                {spendingByCategory.map(item => (
                  <View key={item.category} style={styles.categoryRow}>
                    <View style={styles.categoryNameContainer}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: getCategoryColor(item.category) },
                        ]}
                      />
                      <Text style={styles.categoryName}>{item.category}</Text>
                    </View>
                    <View style={styles.categoryValues}>
                      <Text style={styles.categoryAmount}>${item.total.toFixed(2)}</Text>
                      <Text style={styles.categoryPercentage}>
                        {((item.total / totalSpent) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.lineChartPanel}>
          <Text style={styles.lineChartTitle}>Spending by Month</Text>

          {allExpenses.length === 0 ? (
            <Text style={styles.emptyListText}>Add expenses to see your spending over time.</Text>
          ) : (
            <Svg width="100%" height={200} viewBox="0 0 300 200">
              {[0, 0.5, 1].map(fraction => (
                <G key={fraction}>
                  <Line x1={35} x2={295} y1={getChartY(highestTotal * fraction)} y2={getChartY(highestTotal * fraction)} stroke="#DDDDDD" />
                  <SvgText x={30} y={getChartY(highestTotal * fraction) + 4} fontSize={10} fill="#666666" textAnchor="end">
                    {'$' + Math.round(highestTotal * fraction)}
                  </SvgText>
                </G>
              ))}

              {monthOptions.map((month, index) => (
                <SvgText key={month} x={getChartX(index)} y={188} fontSize={10} fill="#666666" textAnchor="middle">
                  {month.slice(0, 3)}
                </SvgText>
              ))}

              {chartLines.map((line, i) => (
                <G key={line.category}>
                  <Polyline points={line.points} fill="none" stroke={getCategoryColor(line.category)} strokeWidth={2} />
                  {monthOptions.map((month, j) => (
                    <Circle key={month} cx={getChartX(j)} cy={getChartY(monthTotals[i][j])} r={3.5} fill={getCategoryColor(line.category)} />
                  ))}
                </G>
              ))}
            </Svg>
          )}
        </View>

        <View style={styles.expensesPanel}>
          <View style={styles.listHeader}>
            <Text style={styles.panelTitle}>Recent Expenses</Text>
            <Text style={styles.expenseCount}>{expenses.length} total</Text>
          </View>

          {expenses.length === 0 ? (
            <Text style={styles.emptyListText}>No expenses recorded yet.</Text>
          ) : (
            recentExpenses.map((expense, index) => (
              <View key={index} style={styles.expenseRow}>
                <View style={styles.expenseInfo}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(expense.category) },
                    ]}
                  />
                  <View style={styles.expenseLeftTextContainer}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                  </View>
                </View>
                <View style={styles.expenseRightTextContainer}>
                  <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                  <Text style={styles.expenseDate}>{(new Date(expense.timestamp)).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#25292e',
  },
  headingPanel: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  monthDropdown: {
    marginBottom: 16,
  },
  monthButton: {
    backgroundColor: '#043574',
    borderRadius: 12,
    padding: 12,
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  monthOption: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  content: {
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 30,
    gap: 16,
  },
  totalCard: {
    width: '90%',
    backgroundColor: '#043574',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    color: '#D9E7F8',
    fontSize: 16,
    fontFamily: 'IBMPlexSans_400Regular',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: 'IBMPlexSans_700Bold',
    marginTop: 4,
  },
  helperText: {
    color: '#D9E7F8',
    fontSize: 13,
    marginTop: 4,
  },
  panel: {
    width: '90%',
    backgroundColor: '#043574',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  chartContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  chartCenter: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#043574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterLabel: {
    color: '#D9E7F8',
    fontSize: 12,
  },
  chartCenterAmount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 22,
    gap: 14,
  },
  emptyDonut: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 20,
    borderColor: '#8AA2BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDonutText: {
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans_700Bold',
  },
  emptyText: {
    color: '#D9E7F8',
    textAlign: 'center',
    fontSize: 14,
  },
  legend: {
    width: '100%',
    gap: 13,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    paddingBottom: 10,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'IBMPlexSans_400Regular',
  },
  categoryValues: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  categoryAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  categoryPercentage: {
    color: '#D9E7F8',
    fontSize: 12,
  },
  lineChartPanel: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
  },
  lineChartTitle: {
    color: '#25292e',
    fontSize: 20,
    fontFamily: 'IBMPlexSans_700Bold',
    marginBottom: 8,
  },
  expensesPanel: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseCount: {
    color: '#666666',
    fontSize: 13,
  },
  emptyListText: {
    color: '#666666',
    paddingVertical: 12,
  },
  expenseRow: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 10,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  expenseLeftTextContainer: {
    flex: 1,
  },
  expenseRightTextContainer: {
    justifyContent: 'flex-end',
  },
  expenseDescription: {
    color: '#25292e',
    fontSize: 15,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  expenseCategory: {
    color: '#777777',
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    color: '#C0392B',
    fontSize: 15,
    fontFamily: 'IBMPlexSans_700Bold',
    marginLeft: 8,
    textAlign: 'right'
  },
  expenseDate: {
    color: '#777777',
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'right'
  },
  addExpenseButton: {
    width: '90%',
    minHeight: 58,
    borderRadius: 10,
    backgroundColor: '#D9DDDC',
    borderWidth: 2,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExpenseButtonText: {
    color: '#111111',
    fontSize: 18,
    fontFamily: 'IBMPlexSans_700Bold',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#25292e',
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  closeButtonText: {
    fontSize: 30,
    color: '#666666',
    lineHeight: 32,
  },
  modalLabel: {
    fontSize: 16,
    color: '#25292e',
    fontFamily: 'IBMPlexSans_700Bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#25292e',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%'
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#B8C1CC',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#043574',
    borderColor: '#043574',
  },
  categoryOptionText: {
    color: '#25292e',
    fontSize: 13,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans_700Bold',
  },
  customCategoryPanel: {
    width: '100%',
    gap: 12
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitPanel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  createExpenseButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createExpenseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
