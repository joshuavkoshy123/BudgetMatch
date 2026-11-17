import AsyncStorage from '@react-native-async-storage/async-storage';

import { Expense, Budget, Goal } from './types';
import mockExpenses from './mockExpenses.json';
import mockBudgets from './mockBudgets.json';
import mockGoals from './mockGoals.json';

export default class DataManager {
    static expenses: Expense[] = [];
    static budgets: Budget[] = [];
    static goals: Goal[] = [];

    static pageLoadStates = {
        'budget-builder': false,
        'savings-planner': false
    };

    static async loadData() {
        const savedExpenses = await AsyncStorage.getItem('expenses');
        DataManager.expenses = (savedExpenses === null) ? mockExpenses : JSON.parse(savedExpenses);

        DataManager.budgets = [...mockBudgets];
        DataManager.goals = [...mockGoals];

        DataManager.pageLoadStates['budget-builder'] = false;
        DataManager.pageLoadStates['savings-planner'] = false;
    }

    static addBudget(budget: Budget) {
        DataManager.budgets.push(budget);
    }

    static addGoal(goal: Goal) {
        DataManager.goals.push(goal);
    }

    static editExpenseCategory(oldCategory: string, newCategory: string) {
        for (let expense of DataManager.expenses) {
            if (expense.category === oldCategory) {
                expense.category = newCategory;
            }
        }
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
}