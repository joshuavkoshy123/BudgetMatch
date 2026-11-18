import { useState, useRef, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Alert, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Budget } from '@/types';
import DataManager from '@/data-manager';

export default function BudgetBuilderPage() {
  type Notification = {
    message: string;
    timestamp: string;
  }

  const [addModalShown, setAddModalShown] = useState(false);
  const [linkModalShown, setLinkModalShown] = useState(false);
  const [categoryDropdownShown, setCategoryDropdownShown] = useState(false);
  const [notificationModalShown, setNotificationModalShown] = useState(false);
  const [viewModalShown, setViewModalShown] = useState(false);
  const [editModalShown, setEditModalShown] = useState(false);
  const [notificationWidgetShown, setNotificationWidgetShown] = useState(false);

  const [budgetingCategory, setBudgetingCategory] = useState('');
  const [oldBudgetingCategory, setOldBudgetingCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [spendingCategory, setSpendingCategory] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationThreshold, setNotificationThreshold] = useState('');
  const [notificationWidgetShown, setNotificationWidgetShown] = useState(false);

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  const [isAtPageTop, setIsAtPageTop] = useState(true);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const isPageScrollable = layoutHeight > 0 && contentHeight > layoutHeight + 10;

  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const handleScrollEvent = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsAtPageTop(offsetY <= 10);
  };

  // store budgets and notifications 
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    // instantiate default notifications
    const defaultNotifications: Notification[] = notifications;
    defaultNotifications.push({message: 'You have reached 95% of your Groceries budget.', timestamp: '11/04/2026 12:30 PM'});
    defaultNotifications.push({message: 'You have reached 90% of your Fitness budget.', timestamp: '10/26/2026 3:45 PM'});

    setNotifications(defaultNotifications);
  }, []);

  const [spendingCategories, setSpendingCategories] = useState<string[]>([]);
  useFocusEffect(
    useCallback(() => {
      if (!DataManager.pageLoadStates['budget-builder']) {
        setBudgets([...(DataManager.budgets)]);
        DataManager.pageLoadStates['budget-builder'] = true;
      }

      const categories: string[] = [];
      DataManager.expenses.forEach(expense => {
        if (!categories.includes(expense.category)) {
          categories.push(expense.category);
        }
      })
      setSpendingCategories(categories);
    }, [])
  );

  const [isFormValid, setIsFormValid] = useState({
    budgetingCategory: true,
    amount: true,
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
      notification: true,
      notificationThreshold: true
    };

    if (budgetingCategory.length === 0) {
      isCurrentFormValid.budgetingCategory = false;
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
    DataManager.addBudget(newBudget);

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
      notification: true,
      notificationThreshold: true
    };

    if (budgetingCategory.length === 0) {
      isCurrentFormValid.budgetingCategory = false;
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
        };
        if (notification === 'Yes') {
          updatedBudget.notificationThreshold = Number(notificationThreshold);
        }

        DataManager.editBudget(oldBudgetingCategory, updatedBudget);

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
    const updatedBudgets = budgets.filter(budget => budget.budgetingCategory !== budgetingCategory);
    DataManager.deleteBudget(budgetingCategory);
    
    setBudgets(updatedBudgets);
    setViewModalShown(false);

    setBudgetingCategory('');
    setAmount('');
    setSpendingCategory('');
    setNotification('');
    setNotificationThreshold('');
  }

  const getBudgetProgress = (budget: Budget) => {
    let currentExpenditure: number = 0;
    let currentYear: number = (new Date()).getFullYear();
    let currentMonth: number = (new Date()).getMonth();

    DataManager.expenses.forEach(expense => {
      if ((new Date(expense.timestamp)).getMonth() === currentMonth
        && (new Date(expense.timestamp)).getFullYear() === currentYear
        && expense.category === budget.spendingCategory) {
        currentExpenditure += expense.amount;
      }
    })

    return Math.min(100, Math.round((currentExpenditure / budget.amount) * 100));
  }

  const openLinkBudgetModal = () => {
    setAddModalShown(false);

    for (let category of spendingCategories) {
      if (category.toLowerCase() === budgetingCategory.toLowerCase()) {
        setSpendingCategory(category);
        break;
      }
    }

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
    setNotificationWidgetShown(false);
    setIsFormValid({
      budgetingCategory: true,
      amount: true,
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
      <Pressable style={styles.notificationButton} onPress={() => setNotificationWidgetShown(true)}>
        <Ionicons name="notifications-outline" color="black" size={20} />
      </Pressable>
      <View style={styles.headingPanel}>
        <Text style={styles.headingText}>Budget Builder</Text>
      </View>
      <View style={styles.taskPanel}>
        <ScrollView style={styles.taskScrollPanel}
          ref={scrollViewRef}
          onScroll={handleScrollEvent}
          onLayout={(e) => {
            setLayoutHeight(e.nativeEvent.layout.height);
          }}
          onContentSizeChange={(_, height) => {
            setContentHeight(height);
          }}>
          <Pressable style={styles.fullAddTask} onPress={() => setAddModalShown(true)}>
            <View style={styles.addButton}>
              <Ionicons name="add-outline" color="black" size={20} />
            </View>
            <View style={styles.addTask}>
              <Text style={styles.taskText}>Create a Budget</Text>
            </View>
          </Pressable>
          
          {sortedBudgets.map(budget => {
            const progress = getBudgetProgress(budget);

            return (
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
                  <View style={styles.progressBar}>
                    <CircularProgress
                      value={progress}
                      initialValue={progress}
                      showProgressValue={false}
                      radius={30}/>
                    <View style={styles.progressBarOverlay}>
                      <Text>{progress}%</Text>
                    </View>
                  </View>
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskText}>{budget.budgetingCategory}</Text>
                    <Text>Target: ${budget.amount.toLocaleString()}</Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
        {isAtPageTop && isPageScrollable && (
          <TouchableOpacity
            style={styles.arrowContainer}
            activeOpacity={0.8}
          >
            <Text style={styles.arrowText}>↓</Text>
          </TouchableOpacity>
        )}
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
                <Text style={styles.modalTitle1}>Create a Budget</Text>

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
                <Pressable
                  onPress={() => {
                    closeLinkModal();
                    setAddModalShown(true);
                  }}
                  style={styles.backButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>{'<'}</Text>
                </Pressable>
                <Text style={styles.modalTitle2}>Link Spending Category</Text>

                <Pressable
                  onPress={closeLinkModal}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Spending Category</Text>
              <View style={styles.dropdown}>
                <Pressable onPress={() => setCategoryDropdownShown(shown => !shown)}>
                  <Text style={styles.input}>{spendingCategory || 'Select a category'} ▼</Text>
                </Pressable>
                {categoryDropdownShown &&
                  <View>
                    {spendingCategories.map(category =>
                      <Pressable key={category} onPress={() => {
                        setSpendingCategory(category);
                        setCategoryDropdownShown(false);
                      }}>
                        <Text style={styles.dropdownText}>{category}</Text>
                      </Pressable>
                      )
                    }
                  </View>
                }
              </View>

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
                <Pressable
                  onPress={() => {
                    closeNotificationModal();
                    setLinkModalShown(true);
                  }}
                  style={styles.backButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>{'<'}</Text>
                </Pressable>
                <Text style={styles.modalTitle2}>Set Notification</Text>

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
                <View style={styles.notificationThreshold}>
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
                <Text style={styles.modalTitle1}>View Budget</Text>

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
                <Text style={styles.modalTitle1}>Edit Budget</Text>

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
              <Pressable onPress={() => setCategoryDropdownShown(shown => !shown)}>
                <Text style={styles.input}>{spendingCategory || 'Select a category'} ▼</Text>
              </Pressable>
              {categoryDropdownShown &&
                <View>
                  {spendingCategories.map(category =>
                    <Pressable key={category} onPress={() => {
                      setSpendingCategory(category);
                      setCategoryDropdownShown(false);
                    }}>
                      <Text>{category}</Text>
                    </Pressable>
                    )
                  }
                </View>
              }

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
                <View style={styles.notificationThreshold}>
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

      {/* Notifications Widget */}
      <Modal
        visible={notificationWidgetShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationWidgetShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle1}>Notifications</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>
              <View style={styles.notificationWidgetPanel}>
                <ScrollView style={styles.notificationScrollPanel}>
                {notifications.map(notification => (
                  <View key={`${notification.message} ${notification.timestamp}`} style={styles.notification}>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
                  </View>
                ))}
              </ScrollView>
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
  notificationScrollPanel: {
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
  notificationWidgetPanel: {
    flexDirection: 'column',
    gap: 20,
    width: '100%',
    height: 470,
    padding: 15,
    backgroundColor: '#043574',
    borderRadius: 10,
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
    flexDirection: 'row'
  },
  progressBar: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressBarOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDetails: {
    justifyContent: 'center'
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
  notificationButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
    borderColor: 'black',
    position: 'absolute',
    top: 50,
    left: 50
  },
  notification: {
    flex: 1,
    height: '100%',
    borderColor: 'black',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10
  },
  notificationMessage: {
    width: '60%',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'IBMPlexSans_400Regular'
  },
  notificationTimestamp: {
    width: '40%',
    textAlign: 'right'
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
  notificationText: {
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
  modalTitle1: {
    width: '70%',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle2: {
    width: '70%',
    textAlign: 'center',
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
  dropdown: {
    gap: 5
  },
  dropdownText: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: -1
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
  notificationThreshold: {
    gap: 16
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

  backButton: {
    marginRight: 5
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

  arrowContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});