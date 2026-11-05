import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';

export default function BudgetBuilderPage() {
  type Budget = {
    budgetingCategory: string;
    amount: number;
    spendingCategory: string;
    notificationThreshold: number;
  }
  const [addModalShown, setAddModalShown] = useState(false);
  const [linkModalShown, setLinkModalShown] = useState(false);
  const [notificationModalShown, setNotificationModalShown] = useState(false);

  const [budgetingCategory, setBudgetingCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [spendingCategory, setSpendingCategory] = useState('');
  const [notificationThreshold, setNotificationThreshold] = useState('');
  const [notification, setNotification] = useState('');

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  // store budgets
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [isFormValid, setIsFormValid] = useState({
    budgetingCategory: true,
    amount: true,
    spendingCategory: true,
    notification: true,
    notificationThreshold: true
  });

  const amountRegexPattern = /^\d*\.?\d{0,2}$/;
  const notificationThresholdRegexPattern = /^\d*\.?\d*$/;

  // Wait until fonts are fully loaded before rendering
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  // add budget to list of budgets
  const addBudget = () => {
    // validate user input for form fields
    let isCurrentFormValid = {
      budgetingCategory: true,
      amount: true,
      spendingCategory: true,
      notification: true,
      notificationThreshold: true
    };

    if (budgetingCategory.length === 0) {
      isCurrentFormValid.budgetingCategory = false;
    }
    if (spendingCategory.length === 0) {
      isCurrentFormValid.spendingCategory = false;
    }
    if (amount.length === 0 || Number(amount) === 0) {
      isCurrentFormValid.amount = false;
    }
    if (notificationThreshold.length === 0 || Number(notificationThreshold) <= 0 || Number(notificationThreshold) > 100) {
      isCurrentFormValid.notificationThreshold = false;
    }
    if (notification.length === 0) {
      isCurrentFormValid.notification = false;
    }

    setIsFormValid(isCurrentFormValid);
    if (Object.values(isCurrentFormValid).some(valid => !valid)) {
      return;
    }

    const newBudget = {
      budgetingCategory: budgetingCategory,
      amount: Number(amount),
      spendingCategory: spendingCategory,
      notificationThreshold: Number(notificationThreshold),
      notification: notification
    };

    setBudgets(currentBudgets => [...currentBudgets, newBudget]);
    setNotificationModalShown(false);

    setBudgetingCategory('');
    setSpendingCategory('');
    setAmount('');
    setNotificationThreshold('');
    setNotification('');
  }

  // edit budget
  const editBudget = () => {}

  const openLinkBudgetModal = () => {
    setAddModalShown(false);
    setLinkModalShown(true);
  }

  const openNotificationModal = () => {
    setLinkModalShown(false);
    setNotificationModalShown(true);
  }

  const closeAddModal = () => {
    setAddModalShown(false);
    setBudgetingCategory('');
    setAmount('');
  }

  const closeLinkModal = () => {
    setLinkModalShown(false);
    setSpendingCategory('');
  }

  const closeNotificationModal = () => {
    setNotificationModalShown(false);
    setNotification('');
    setNotificationThreshold('');
  }

  // sort budgets
  const sortedBudgets: Budget[] = [];

  sortedBudgets.push({budgetingCategory: 'Entertainment', amount: 150, spendingCategory: 'Entertainment', notificationThreshold: 80});
  sortedBudgets.push({budgetingCategory: 'Groceries', amount: 200, spendingCategory: 'Groceries', notificationThreshold: 95});
  sortedBudgets.push({budgetingCategory: 'Transportation', amount: 100, spendingCategory: 'Transportation', notificationThreshold: 80});
  sortedBudgets.push({budgetingCategory: 'Fitness', amount: 50, spendingCategory: 'Fitness', notificationThreshold: 90});

  for (let i = 0; i < budgets.length; i++){
    sortedBudgets.push(budgets[i]);
  }

  sortedBudgets.sort((budget1, budget2) => (budget2.amount - budget1.amount))

  return (
    <View style={styles.container}>
      <View style={styles.headingPanel}>
        <Text style={styles.headingText}>Budget Builder</Text>
      </View>
      <View style={styles.taskPanel}>
        <ScrollView style={styles.taskScrollPanel}>
          <Pressable 
            style={styles.addTask}
            onPress={() => setAddModalShown(true)}
          >
            <Text style={styles.taskText}>+ Create a budget</Text>
          </Pressable>
          
          {sortedBudgets.map(budget => (
            <View 
              key={budget.budgetingCategory}
              style={styles.task}>
              <CircularProgress
                value={50}
                valueSuffix='%'
                radius={30}/>
              <View>
                <Text style={styles.taskText}>{budget.budgetingCategory}</Text>
                <Text>Target: ${budget.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Modal for adding budget */}
      <Modal
        visible={addModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddModalShown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a Goal</Text>

              <Pressable
                onPress={closeAddModal}
                style={styles.closeButton}
                hitSlop={10}
              >
                <Text style={styles.closeButtonText}>x</Text>
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Groceries"
              value={budgetingCategory}
              onChangeText={setBudgetingCategory}
            />
            {isFormValid.budgetingCategory ? <></> : <Text style={styles.errorText}>Please enter a category.</Text>}

            <Text style={styles.modalLabel}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000"
              value={amount}
              onChangeText={value => {
                if (amountRegexPattern.test(value)) {
                  setAmount(value);
                }
              }}
              keyboardType="decimal-pad"
            />
            {isFormValid.amount ? <></> : <Text style={styles.errorText}>Please enter a valid amount.</Text>}

            <View style={styles.submitPanel}>
              <Pressable 
                style={styles.createGoalButton}
                onPress={openLinkBudgetModal}
              >
                <Text style={styles.createGoalButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Link Spending Category Modal */}
      <Modal
        visible={linkModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLinkModalShown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Spending Category</Text>

              <Pressable
                onPress={closeLinkModal}
                style={styles.closeButton}
                hitSlop={10}
              >
                <Text style={styles.closeButtonText}>x</Text>
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Groceries"
              value={spendingCategory}
              onChangeText={setSpendingCategory}
            />
            {isFormValid.spendingCategory ? <></> : <Text style={styles.errorText}>Please enter a category.</Text>}

            <View style={styles.submitPanel}>
              <Pressable 
                style={styles.createGoalButton}
                onPress={openNotificationModal}
              >
                <Text style={styles.createGoalButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Set Notification Modal */}
      <Modal
        visible={notificationModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModalShown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Notification</Text>

              <Pressable
                onPress={closeNotificationModal}
                style={styles.closeButton}
                hitSlop={10}
              >
                <Text style={styles.closeButtonText}>x</Text>
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Notification</Text>
            <View style={styles.notificationPanel}>
              <Pressable
                onPress={() => setNotification('Yes')}
                style={[
                  styles.lowButton,
                  notification === 'Yes' && styles.lowButtonFilled
                ]}
              >
                <Text style={styles.modalLabel}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setNotification('No')}
                style={[
                  styles.highButton,
                  notification === 'No' && styles.highButtonFilled
                ]}
              >
                <Text style={styles.modalLabel}>No</Text>
              </Pressable>
            </View>
            {isFormValid.notification ? <></> : <Text style={styles.errorText}>Please select an option.</Text>}

            {/* Only display threshold input field if user wants notifications */}
            {notification === 'Yes' &&
              <View>
              <Text style={styles.modalLabel}>Threshold (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                value={notificationThreshold}
                onChangeText={value => {
                  if (notificationThresholdRegexPattern.test(value)) {
                    setNotificationThreshold(value);
                  }
                }}
                keyboardType="decimal-pad"
              />
              {isFormValid.notificationThreshold ? <></> : <Text style={styles.errorText}>Please enter a valid threshold.</Text>}
              </View> 
            }

            <View style={styles.submitPanel}>
              <Pressable 
                style={styles.createGoalButton}
                onPress={addBudget}
              >
                <Text style={styles.createGoalButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  taskScrollPanel: {
    height: 450,
    backgroundColor: '#043574',
    borderRadius: 10
  },
  taskPanel: {
    width: '80%',
    height: 470,
    padding: 15,
    backgroundColor: '#043574',
    borderRadius: 10,
    marginLeft: 30,
    marginRight: 30
  },
  headingPanel: {
    padding: 20,
    maxHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: 'IBMPlexSans_700Bold'
  },
  amountPanel: {
    maxHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    paddingBottom: 20,
    color: '#fff',
    fontSize: 20,
    fontFamily: 'IBMPlexSans_400Regular'
  },
  addTask: {
    height: 120,
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: '#D9DDDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  task: {
    marginTop: 15,
    height: 120,
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30
  },
  highPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'yellow',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'green',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'IBMPlexSans_400Regular'
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
    maxWidth: 400,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createGoalButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalLabel: {
    fontSize: 16
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#25292e',
  },
  highButton: {
    color: 'white',
    backgroundColor: '#FF7F7F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  highButtonFilled: {
    color: 'white',
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  mediumButton: {
    color: 'white',
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  mediumButtonFilled: {
    color: 'white',
    backgroundColor: 'yellow',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  lowButton: {
    color: 'white',
    backgroundColor: 'lightgreen',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  lowButtonFilled: {
    color: 'white',
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  notificationPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  submitPanel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%'
  },

  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  closeButtonText: {
    fontSize: 30,
    color: '#666',
    lineHeight: 32,
  },
});