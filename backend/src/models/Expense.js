import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'food',
        'transport',
        'accommodation',
        'entertainment',
        'utilities',
        'shopping',
        'other',
      ],
      default: 'other',
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage'],
      default: 'equal',
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
          default: 0,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    attachments: [
      {
        type: String,
      },
    ],
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'splits.user': 1 });

// Validate that splits sum equals total amount
expenseSchema.pre('save', function (next) {
  if (this.splits && this.splits.length > 0) {
    const totalSplit = this.splits.reduce((sum, split) => sum + split.amount, 0);
    const difference = Math.abs(this.amount - totalSplit);
    
    // Allow small floating point differences (1 cent)
    if (difference > 0.01) {
      return next(new Error('Split amounts must equal total amount'));
    }
  }
  next();
});

export default mongoose.model('Expense', expenseSchema);
