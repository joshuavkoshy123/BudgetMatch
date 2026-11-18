export interface Expense {
    description: string;
    amount: number;
    category: string;
    timestamp: string;
}

export interface Budget {
    budgetingCategory: string;
    amount: number;
    spendingCategory: string;
    notification: string;
    notificationThreshold?: number;
};

export interface Goal {
    name: string;
    amount: number;
    contribution: number;
    priority: string;
};