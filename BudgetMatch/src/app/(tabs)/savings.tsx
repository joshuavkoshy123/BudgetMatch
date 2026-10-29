import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';

export default function SavingsPage() {

  type Goal = {
    id: string;
    name: string;
    amount: number;
    contribution: number;
    priority: string;
  }
  const [modalShown, setModalShown] = useState(false);

  const [goal, setGoal] = useState('');
  const [amount, setAmount] = useState('');
  const [contribution, setContribution] = useState('');
  const [priority, setPriority] = useState('');

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

    if (goal.length === 0) {
      isCurrentFormValid.goal = false;
    }
    if (amount.length === 0 || Number(amount) === 0) {
      isCurrentFormValid.amount = false;
    }
    if (contribution.length === 0 || Number(contribution) <= 0 || Number(contribution) > 100) {
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
      id: Date.now().toString(),
      name: goal,
      amount: Number(amount),
      contribution: Number(contribution),
      priority: priority
    };

    setGoals(currentGoals => [...currentGoals, newGoal]);
    setModalShown(false);

    setGoal('');
    setAmount('');
    setContribution('');
    setPriority('');
  };

  const closeModal = () => {
    // close modals and reset variables
    setModalShown(false);
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
        <Text style={styles.amountText}>Total Amount Saved: $500</Text>
      </View>

      <View style={styles.taskPanel}>
        <ScrollView style={styles.taskScrollPanel}>
          <Pressable 
            style={styles.addTask}
            onPress={() => setModalShown(true)}
          >
            <Text style={styles.taskText}>+ Create a goal</Text>
          </Pressable>
          
          {sortedGoals.map(goal => (
            <View 
              key={goal.id}
              style={[
              styles.task,
              goal.priority === 'High'
                ? styles.highPriorityTask
                : goal.priority === 'Medium'
                  ? styles.mediumPriorityTask
                  : styles.lowPriorityTask,
            ]}>
              <CircularProgress
                value={50}
                valueSuffix='%'
                radius={30}/>
              <View>
                <Text style={styles.taskText}>{goal.name}</Text>
                <Text>Target: ${goal.amount.toLocaleString()}</Text>
                <Text>Contribution: {goal.contribution}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={modalShown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalShown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a Goal</Text>

              <Pressable
                onPress={closeModal}
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
            {isFormValid.goal ? <></> : <Text style={styles.errorText}>Please enter a goal.</Text>}

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
    justifyContent: 'flex-start',
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