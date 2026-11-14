import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Keyboard, KeyboardAvoidingView, Alert } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';
import { Ionicons } from '@expo/vector-icons';

import { Goal } from '@/types';
import DataManager from '@/data-manager';

export default function SavingsPlannerPage() {
  const [modalShown, setModalShown] = useState(false);
  const [editModalShown, setEditModalShown] = useState(false);
  const [viewModalShown, setViewModalShown] = useState(false);

  // form values
  const [goal, setGoal] = useState('');
  const [oldGoal, setOldGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [contribution, setContribution] = useState('');
  const [priority, setPriority] = useState('');

  const [contributionRemaining, setContributionRemaining] = useState(100);

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  // store goals
  const [goals, setGoals] = useState<Goal[]>([]);

  const [isFormValid, setIsFormValid] = useState({
    goal: true,
    amount: true,
    contribution: true,
    priority: true
  });

  const amountRegexPattern = /^\d*\.?\d{0,2}$/;
  const contributionRegexPattern = /^\d*\.?\d*$/;

  // only do this on first render
  useEffect(() => {
    // instantiate default goals
    const existingGoals = DataManager.goals;
    setGoals([...existingGoals]);

    let totalContribution = 0;
    existingGoals.forEach(existingGoal => (totalContribution += existingGoal.contribution));
    setContributionRemaining(contributionRemaining - totalContribution);
  }, []);

  // Wait until fonts are fully loaded before rendering
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  // add goal to list of goals
  const addGoal = () => {
    // validate user input for form fields
    let isCurrentFormValid = {
      goal: true,
      amount: true,
      contribution: true,
      priority: true
    };

    // check for duplicate goal
    const goalExists = goals.some(g => g.name === goal);
    console.log(goalExists);

    if (goal.length === 0 || goalExists) {
      isCurrentFormValid.goal = false;
    }
    if (amount.length === 0 || Number(amount) === 0) {
      isCurrentFormValid.amount = false;
    }
    if (contribution.length === 0 || Number(contribution) <= 0 || Number(contribution) > contributionRemaining) {
      isCurrentFormValid.contribution = false;
    }
    if (priority.length === 0) {
      isCurrentFormValid.priority = false;
    }

    setIsFormValid(isCurrentFormValid);
    if (Object.values(isCurrentFormValid).some(valid => !valid)) {
      return;
    }

    const newGoal = {
      name: goal,
      amount: Number(amount),
      contribution: Number(contribution),
      priority: priority
    };

    // deduct from contribution remaining
    setContributionRemaining(contributionRemaining - Number(contribution));

    setGoals(currentGoals => [...currentGoals, newGoal]);
    DataManager.addGoal(newGoal);

    setModalShown(false);

    setGoal('');
    setAmount('');
    setContribution('');
    setPriority('');
  };

  // edit existing goal
  const editGoal = () => {
    // validate user input for form fields
    let isCurrentFormValid = {
      goal: true,
      amount: true,
      contribution: true,
      priority: true
    };

    let totalContribution = 0;
    for (const g of goals) {
      if (g.name == goal) {
        totalContribution += Number(contribution);
      }
      else {
        totalContribution += g.contribution;
      }
    }

    if (goal.length === 0) {
      isCurrentFormValid.goal = false;
    }
    if (amount.length === 0 || Number(amount) === 0) {
      isCurrentFormValid.amount = false;
    }
    if (contribution.length === 0 || Number(contribution) <= 0 || totalContribution > 100) {
      isCurrentFormValid.contribution = false;
    }
    if (priority.length === 0) {
      isCurrentFormValid.priority = false;
    }

    setIsFormValid(isCurrentFormValid);
    if (Object.values(isCurrentFormValid).some(valid => !valid)) {
      return;
    }

    const updatedGoals = goals.map(g => {
      if (g.name === oldGoal) {
        const updatedGoal: Goal = {
          name: goal,
          amount: Number(amount),
          contribution: Number(contribution),
          priority: priority
        };
        
        DataManager.editGoal(oldGoal, updatedGoal);

        return updatedGoal;
      }
      else {
        return g;
      }
    });

    setContributionRemaining(100 - totalContribution);

    setGoals(updatedGoals);
    setEditModalShown(false);

    setGoal('');
    setAmount('');
    setContribution('');
    setPriority('');
  };

  const closeAllModals = () => {
    // close modals and reset variables
    setModalShown(false);
    setEditModalShown(false);
    setViewModalShown(false);
    setGoal('');
    setAmount('');
    setContribution('');
    setPriority('');
    setIsFormValid({
      goal: true,
      amount: true,
      contribution: true,
      priority: true
    });
  };

  const deleteGoal = () => {
    const updatedGoals = goals.filter(g => g.name !== goal);
    DataManager.deleteGoal(goal);

    const remaining = contributionRemaining + Number(contribution);

    setContributionRemaining(remaining);
    
    setGoals(updatedGoals);
    setViewModalShown(false);

    setGoal('');
    setAmount('');
    setContribution('');
    setPriority('');
  }

  // sort goals
  const sortedGoals: Goal[] = [];

  const priorities = ['High', 'Medium', 'Low'];

  for (const priority of priorities) {
    for (let i = goals.length - 1; i >= 0; i--) {
      if (goals[i].priority === priority) {
        sortedGoals.push(goals[i]);
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headingPanel}>
        <Text style={styles.headingText}>Savings Planner</Text>
      </View>
      <View style={styles.amountPanel}>
        <Text style={styles.amountText}>Contribution Remaining: {contributionRemaining}%</Text>
      </View>

      <View style={styles.taskPanel}>
        <ScrollView style={styles.taskScrollPanel}>
          <Pressable style={styles.fullAddTask} onPress={() => setModalShown(true)}>
            <View style={styles.addButton}>
              <Ionicons name="add-outline" color="black" size={20} />
            </View>
            <View style={styles.addTask}>
              <Text style={styles.taskText}>Create a Goal</Text>
            </View>
          </Pressable>
          
          {sortedGoals.map(goal => (
            <View key={goal.name} style={styles.fullTask}>
              {/* Edit Button */}
              <Pressable
                style={styles.editButton}
                onPress={() => {
                  setGoal(goal.name);
                  setOldGoal(goal.name);
                  setAmount(goal.amount.toString());
                  setContribution(goal.contribution.toString());
                  setPriority(goal.priority);
                  setEditModalShown(true);
                }}
              >
                <Ionicons name="create-outline" color="black" size={20} />
              </Pressable>
              <Pressable 
                style={[
                styles.task,
                goal.priority === 'High'
                  ? styles.highPriorityTask
                  : goal.priority === 'Medium'
                    ? styles.mediumPriorityTask
                    : styles.lowPriorityTask,
                ]}
                onPress={() => {
                  setGoal(goal.name);
                  setAmount(goal.amount.toString());
                  setContribution(goal.contribution.toString());
                  setPriority(goal.priority);
                  setViewModalShown(true);
                }}
              >
                <View style={styles.progressBar}>
                  <CircularProgress
                    value={30}
                    initialValue={30}
                    showProgressValue={false}
                    radius={30}/>
                  <View style={styles.progressBarOverlay}>
                    <Text>30%</Text>
                  </View>
                </View>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskText}>{goal.name}</Text>
                  <Text>Target: ${goal.amount.toLocaleString()}</Text>
                  <Text>Contribution: {goal.contribution}%</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Modal for adding savings goal */}
      <Modal
        visible={modalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalShown(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create a Goal</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text>Enter the details for your savings goal.</Text>

              <Text style={styles.modalLabel}>Goal</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Emergency Fund"
                value={goal}
                onChangeText={setGoal}
              />
              {isFormValid.goal ? <></> : <Text style={styles.errorText}>Invalid goal.</Text>}

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

              <Text style={styles.modalLabel}>Contribution (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                value={contribution}
                onChangeText={value => {
                  if (contributionRegexPattern.test(value)) {
                    setContribution(value);
                  }
                }}
                keyboardType="decimal-pad"
              />
              {isFormValid.contribution ? <></> : <Text style={styles.errorText}>Please enter a valid contribution.</Text>}

              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityPanel}>
                <Pressable
                  onPress={() => setPriority('High')}
                  style={[
                    styles.highButton,
                    priority === 'High' && styles.highButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>High</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriority('Medium')}
                  style={[
                    styles.mediumButton,
                    priority === 'Medium' && styles.mediumButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Medium</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriority('Low')}
                  style={[
                    styles.lowButton,
                    priority === 'Low' && styles.lowButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Low</Text>
                </Pressable>
              </View>
              {isFormValid.priority ? <></> : <Text style={styles.errorText}>Please select a priority.</Text>}

              <View style={styles.submitPanel}>
                <Pressable 
                  style={styles.createGoalButton}
                  onPress={addGoal}
                >
                  <Text style={styles.createGoalButtonText}>Create Goal</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal for editing a savings goal */}
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
                <Text style={styles.modalTitle}>Edit Goal</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text>Enter the details for your savings goal.</Text>

              <Text style={styles.modalLabel}>Goal</Text>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
              />
              {isFormValid.goal ? <></> : <Text style={styles.errorText}>Please enter a goal.</Text>}

              <Text style={styles.modalLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={value => {
                  if (amountRegexPattern.test(value)) {
                    setAmount(value);
                  }
                }}
                keyboardType="decimal-pad"
              />
              {isFormValid.amount ? <></> : <Text style={styles.errorText}>Please enter a valid amount.</Text>}

              <Text style={styles.modalLabel}>Contribution (%)</Text>
              <TextInput
                style={styles.input}
                value={contribution}
                onChangeText={value => {
                  if (contributionRegexPattern.test(value)) {
                    setContribution(value);
                  }
                }}
                keyboardType="decimal-pad"
              />
              {isFormValid.contribution ? <></> : <Text style={styles.errorText}>Please enter a valid contribution.</Text>}

              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityPanel}>
                <Pressable
                  onPress={() => setPriority('High')}
                  style={[
                    styles.highButton,
                    priority === 'High' && styles.highButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>High</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriority('Medium')}
                  style={[
                    styles.mediumButton,
                    priority === 'Medium' && styles.mediumButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Medium</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriority('Low')}
                  style={[
                    styles.lowButton,
                    priority === 'Low' && styles.lowButtonFilled
                  ]}
                >
                  <Text style={styles.modalLabel}>Low</Text>
                </Pressable>
              </View>
              {isFormValid.priority ? <></> : <Text style={styles.errorText}>Please select a priority.</Text>}

              <View style={styles.submitPanel}>
                <Pressable 
                  style={styles.createGoalButton}
                  onPress={editGoal}
                >
                  <Text style={styles.createGoalButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Savings Goal Modal */}
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
                <Text style={styles.modalTitle}>View Savings Goal</Text>

                <Pressable
                  onPress={closeAllModals}
                  style={styles.closeButton}
                  hitSlop={10}
                >
                  <Text style={styles.closeButtonText}>x</Text>
                </Pressable>
              </View>

              <Text style={styles.modalLabel}>Goal</Text>
              <TextInput
                style={styles.input}
                value={goal}
                editable={false}
              />

              <Text style={styles.modalLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                editable={false}
              />

              <Text style={styles.modalLabel}>Contribution (%)</Text>
              <TextInput
                style={styles.input}
                value={contribution}
                editable={false}
              />

              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityPanel}>
                <Pressable
                  style={[
                    styles.highButton,
                    priority === 'High' && styles.highButtonFilled
                  ]}
                  disabled={true}
                >
                  <Text style={styles.modalLabel}>High</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.mediumButton,
                    priority === 'Medium' && styles.mediumButtonFilled
                  ]}
                  disabled={true}
                >
                  <Text style={styles.modalLabel}>Medium</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.lowButton,
                    priority === 'Low' && styles.lowButtonFilled
                  ]}
                  disabled={true}
                >
                  <Text style={styles.modalLabel}>Low</Text>
                </Pressable>
              </View>

              <View style={styles.submitPanel}>
                <Pressable 
                  style={styles.deleteGoalButton}
                  onPress={() => {
                    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
                      {
                        text: 'Yes',
                        onPress: deleteGoal
                      },
                      {
                        text: 'No'
                      }
                    ]);
                  }}
                >
                  <Text style={styles.createGoalButtonText}>Delete</Text>
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
    height: 430,
    backgroundColor: '#043574',
    borderRadius: 10
  },
  taskPanel: {
    width: '95%',
    height: 450,
    padding: 15,
    backgroundColor: '#043574',
    borderRadius: 10,
    marginLeft: 30,
    marginRight: 30
  },
  headingPanel: {
    paddingBottom: 10,
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
    width: '60%',
    paddingRight: '10%',
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
    gap: 10
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
    marginTop: 15,
    borderRadius: 30,
    borderColor: 'black',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  highPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  mediumPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'yellow',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  lowPriorityTask: {
    marginTop: 15,
    height: 120,
    borderColor: 'green',
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  taskText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'IBMPlexSans_400Regular',
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
  deleteGoalButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
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
  priorityPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
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