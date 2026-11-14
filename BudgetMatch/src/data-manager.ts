import AsyncStorage from '@react-native-async-storage/async-storage';

import { Expense, Budget, Goal } from './types';
import mockExpenses from './mockExpenses.json';

export default class DataManager {
    static expenses: Expense[] = [];
    static budgets: Budget[] = [];
    static goals: Goal[] = [];

    static async loadData() {
        const savedExpenses = await AsyncStorage.getItem('expenses');
        DataManager.expenses = (savedExpenses === null) ? mockExpenses : JSON.parse(savedExpenses);

        const savedBudgets = await AsyncStorage.getItem('budgets');
        DataManager.budgets = (savedBudgets === null) ? [] : JSON.parse(savedBudgets);

        const savedGoals = await AsyncStorage.getItem('goals');
        DataManager.goals = (savedGoals === null) ? [] :  JSON.parse(savedGoals);
    }

    static addBudget(budget: Budget) {
        DataManager.budgets.push(budget);
    }

    static addGoal(goal: Goal) {
        DataManager.goals.push(goal);
    }

    static editBudget(budgetingCategory: string, newBudget: Budget) {
        this.deleteBudget(budgetingCategory);
        this.addBudget(newBudget);
    }

    static editGoal(name: string, newGoal: Goal) {
        this.deleteGoal(name);
        this.addGoal(newGoal);
    }

    static deleteBudget(budgetingCategory: string) {
        let index = DataManager.budgets.findIndex(budget => budget.budgetingCategory === budgetingCategory);
        DataManager.budgets.splice(index, 1);
    }

    static deleteGoal(name: string) {
        let index = DataManager.goals.findIndex(goal => goal.name === name);
        DataManager.goals.splice(index, 1);
    }

    static async saveData() {
        const currentBudgets = JSON.stringify(DataManager.budgets);
        await AsyncStorage.setItem('budgets', currentBudgets);

        const currentGoals = JSON.stringify(DataManager.goals);
        await AsyncStorage.setItem('goals', currentGoals);
    }
}