import { Text, View, StyleSheet, ScrollView, ActivityIndicator, Modal, Pressable, TextInput, Button } from 'react-native';
import { useState } from 'react';
import AnimatedCircularProgress from
  'react-native-circular-progress-indicator';
import { 
  useFonts, 
  IBMPlexSans_400Regular, 
  IBMPlexSans_700Bold 
} from '@expo-google-fonts/ibm-plex-sans';
import CircularProgress from 'react-native-circular-progress-indicator';

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

  // store goals
  const [goals, setGoals] = useState<Goal[]>([]);

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  // Wait until fonts are fully loaded before rendering
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  // add goal to list of goals
  const addGoal = () => {
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
            <Text style={styles.taskText}>Create a goal +</Text>
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

            <Text>Goal:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Emergency Fund"
              value={goal}
              onChangeText={setGoal}
            />

            <Text>Amount:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text>Contribution %:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10"
              value={contribution}
              onChangeText={setContribution}
              keyboardType="decimal-pad"
            />

            <Text>Priority:</Text>
            <View style={styles.priorityPanel}>
              <Pressable
                onPress={() => setPriority('High')}
                style={[
                  styles.highButton,
                  priority === 'High' && styles.highButtonFilled
                ]}
              >
                <Text>High</Text>
              </Pressable>
              <Pressable
                onPress={() => setPriority('Medium')}
                style={[
                  styles.mediumButton,
                  priority === 'Medium' && styles.mediumButtonFilled
                ]}
              >
                <Text>Medium</Text>
              </Pressable>
              <Pressable
                onPress={() => setPriority('Low')}
                style={[
                  styles.lowButton,
                  priority === 'Low' && styles.lowButtonFilled
                ]}
              >
                <Text>Low</Text>
              </Pressable>
            </View>

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
    padding: 20,
    backgroundColor: '#25292e',
  },
  taskScrollPanel: {
    height: 450,
    backgroundColor: '#043574',
    borderRadius: 10
  },
  taskPanel: {
    padding: 15,
    height: 470,
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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