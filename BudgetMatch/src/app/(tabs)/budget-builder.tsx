import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Alert } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetBuilderPage() {
  type Budget = {
    budgetingCategory: string;
    amount: number;
    spendingCategory: string;
    notification: string;
    notificationThreshold?: number;
  }
  const [addModalShown, setAddModalShown] = useState(false);
  const [linkModalShown, setLinkModalShown] = useState(false);
  const [notificationModalShown, setNotificationModalShown] = useState(false);
  const [viewModalShown, setViewModalShown] = useState(false);
  const [editModalShown, setEditModalShown] = useState(false);

  const [budgetingCategory, setBudgetingCategory] = useState('');
  const [oldBudgetingCategory, setOldBudgetingCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [spendingCategory, setSpendingCategory] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationThreshold, setNotificationThreshold] = useState('');

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

  // only do this on first render
  useEffect(() => {
    // instantiate default goals
    const defaultBudgets: Budget[] = budgets;
    defaultBudgets.push({budgetingCategory: 'Entertainment', amount: 150, spendingCategory: 'Entertainment', notification: 'Yes', notificationThreshold: 80});
    defaultBudgets.push({budgetingCategory: 'Groceries', amount: 200, spendingCategory: 'Groceries', notification: 'Yes', notificationThreshold: 95});
    defaultBudgets.push({budgetingCategory: 'Transportation', amount: 100, spendingCategory: 'Transportation', notification: 'No'});
    defaultBudgets.push({budgetingCategory: 'Fitness', amount: 50, spendingCategory: 'Fitness', notification: 'Yes', notificationThreshold: 90});

    setBudgets(defaultBudgets);
  }, []);

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
    if (notification.length === 0) {
      isCurrentFormValid.notification = false;
    }
    if (notification === 'Yes' && (notificationThreshold.length === 0 || Number(notificationThreshold) <= 0 || Number(notificationThreshold) > 100)) {
      isCurrentFormValid.notificationThreshold = false;
    }

    setIsFormValid(isCurrentFormValid);
    if (Object.values(isCurrentFormValid).some(valid => !valid)) {
      return;
    }

    const newBudget = {
      budgetingCategory: budgetingCategory,
      amount: Number(amount),
      spendingCategory: spendingCategory,
      notification: notification,
      notificationThreshold: Number(notificationThreshold)
    };

    setBudgets(currentBudgets => [...currentBudgets, newBudget]);
    setNotificationModalShown(false);

    setBudgetingCategory('');
    setAmount('');
    setSpendingCategory('');
    setNotification('');
    setNotificationThreshold('');
  }

  // edit existing budget
  const editBudget = () => {
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
    if (notification.length === 0) {
      isCurrentFormValid.notification = false;
    }
    if (notification === 'Yes' && (notificationThreshold.length === 0 || Number(notificationThreshold) <= 0 || Number(notificationThreshold) > 100)) {
      isCurrentFormValid.notificationThreshold = false;
    }

    setIsFormValid(isCurrentFormValid);
    if (Object.values(isCurrentFormValid).some(valid => !valid)) {
      return;
    }

    const updatedBudgets = budgets.map(budget => {
      if (budget.budgetingCategory === oldBudgetingCategory) {
        const updatedBudget: Budget = {
          budgetingCategory,
          amount: Number(amount),
          spendingCategory,
          notification
        }
        if (notification === 'Yes') {
          updatedBudget.notificationThreshold = Number(notificationThreshold);
        }

        return updatedBudget;
      }
      
      return budget;
    });

    setBudgets(updatedBudgets);
    setEditModalShown(false);

    setBudgetingCategory('');
    setAmount('');
    setSpendingCategory('');
    setNotification('');
    setNotificationThreshold('');
  }

  const deleteBudget = () => {
    const updatedBudgets = budgets.filter(budget => budget.budgetingCategory !== budgetingCategory)
    
    setBudgets(updatedBudgets);
    setViewModalShown(false);

    setBudgetingCategory('');
    setAmount('');
    setSpendingCategory('');
    setNotification('');
    setNotificationThreshold('');
  }

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

  const closeAllModals = () => {
    // close modals and reset variables
    closeAddModal();
    closeLinkModal();
    closeNotificationModal();
    setViewModalShown(false);
    setEditModalShown(false);
    setIsFormValid({
      budgetingCategory: true,
      amount: true,
      spendingCategory: true,
      notification: true,
      notificationThreshold: true
    });
  }

  // sort budgets
  const sortedBudgets: Budget[] = [];
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
          <Pressable style={styles.fullAddTask} onPress={() => setAddModalShown(true)}>
            <View style={styles.addButton}>
              <Ionicons name="add-outline" color="black" size={20} />
            </View>
            <View style={styles.addTask}>
              <Text style={styles.taskText}>Create a Budget</Text>
            </View>
          </Pressable>
          
          {sortedBudgets.map(budget => (
            <View key={budget.budgetingCategory} style={styles.fullTask}>
              <Pressable
                style={styles.editButton}
                onPress={() => {
                  setBudgetingCategory(budget.budgetingCategory);
                  setOldBudgetingCategory(budget.budgetingCategory);
                  setAmount(`${budget.amount}`);
                  setSpendingCategory(budget.spendingCategory);
                  setNotification(budget.notification);
                  if (budget.notification === 'Yes') {
                    setNotificationThreshold(`${budget.notificationThreshold}`);
                  }
                  setEditModalShown(true);
                }}
              >
                <Ionicons name="create-outline" color="black" size={20} />
              </Pressable>
              <Pressable
                key={budget.budgetingCategory}
                style={styles.task}
                onPress={() => {
                  setBudgetingCategory(budget.budgetingCategory);
                  setAmount(`${budget.amount}`);
                  setSpendingCategory(budget.spendingCategory);
                  setNotification(budget.notification);
                  if (budget.notification === 'Yes') {
                    setNotificationThreshold(`${budget.notificationThreshold}`);
                  }
                  setViewModalShown(true);
                }}>
                <CircularProgress
                  value={50}
                  valueSuffix='%'
                  radius={30}/>
                <View>
                  <Text style={styles.taskText}>{budget.budgetingCategory}</Text>
                  <Text>Target: ${budget.amount.toLocaleString()}</Text>
                </View>
              </Pressable>
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
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create a Budget</Text>

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
                  style={styles.createBudgetButton}
                  onPress={openLinkBudgetModal}
                >
                  <Text style={styles.createBudgetButtonText}>Next</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Link Spending Category Modal */}
      <Modal
        visible={linkModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLinkModalShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
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
                  style={styles.createBudgetButton}
                  onPress={openNotificationModal}
                >
                  <Text style={styles.createBudgetButtonText}>Next</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Set Notification Modal */}
      <Modal
        visible={notificationModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationModalShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
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
                    styles.yesButton,
                    notification === 'Yes' && styles.yesButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setNotification('No')}
                  style={[
                    styles.noButton,
                    notification === 'No' && styles.noButtonFilled
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
                  style={styles.createBudgetButton}
                  onPress={addBudget}
                >
                  <Text style={styles.createBudgetButtonText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Budget Modal */}
      <Modal
        visible={viewModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewModalShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>View Budget</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Budgeting Category</Text>
              <TextInput
                style={styles.input}
                value={budgetingCategory}
                editable={false}
              />

              <Text style={styles.modalLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                editable={false}
              />

              <Text style={styles.modalLabel}>Spending Category</Text>
              <TextInput
                style={styles.input}
                value={spendingCategory}
                editable={false}
              />

              <Text style={styles.modalLabel}>Notification</Text>
              <View style={styles.notificationPanel}>
                <View
                  style={[
                    styles.yesButton,
                    notification === 'Yes' && styles.yesButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Yes</Text>
                </View>
                <View
                  style={[
                    styles.noButton,
                    notification === 'No' && styles.noButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>No</Text>
                </View>
              </View>

              {/* Only display threshold input field if user wants notifications */}
              {notification === 'Yes' &&
                <View>
                  <Text style={styles.modalLabel}>Threshold (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={notificationThreshold}
                    editable={false}
                  />
                </View>
              }

              <View style={styles.submitPanel}>
                <Pressable 
                  style={styles.deleteBudgetButton}
                  onPress={() => {
                    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
                      {
                        text: 'Yes',
                        onPress: deleteBudget
                      },
                      {
                        text: 'No'
                      }
                    ]);
                  }}
                >
                  <Text style={styles.createBudgetButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={editModalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Budget</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Budgeting Category</Text>
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

              <Text style={styles.modalLabel}>Spending Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Groceries"
                value={spendingCategory}
                onChangeText={setSpendingCategory}
              />
              {isFormValid.spendingCategory ? <></> : <Text style={styles.errorText}>Please enter a category.</Text>}

              <Text style={styles.modalLabel}>Notification</Text>
              <View style={styles.notificationPanel}>
                <Pressable
                  onPress={() => setNotification('Yes')}
                  style={[
                    styles.yesButton,
                    notification === 'Yes' && styles.yesButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Yes</Text>
                </Pressable>
                <Pressable
                  onPress={() => setNotification('No')}
                  style={[
                    styles.noButton,
                    notification === 'No' && styles.noButtonFilled
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
                  style={styles.createBudgetButton}
                  onPress={editBudget}
                >
                  <Text style={styles.createBudgetButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
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
    flexDirection: 'column',
    gap: 20,
    width: '95%',
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
    flex: 1,
    height: 120,
    borderStyle: 'dashed',
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: '#D9DDDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  task: {
    flex: 1,
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
  fullAddTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  fullTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15
  },
  addButton: {
    backgroundColor: '#D9DDDC',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderColor: 'black',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderColor: 'black',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
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
  createBudgetButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteBudgetButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createBudgetButtonText: {
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
  noButton: {
    color: 'white',
    backgroundColor: '#FF7F7F',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  noButtonFilled: {
    color: 'white',
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  yesButton: {
    color: 'white',
    backgroundColor: 'lightgreen',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  yesButtonFilled: {
    color: 'white',
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  notificationPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
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