<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $query = UserSubscription::with(['user', 'subscriptionPlan']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount_paid', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount_paid', '<=', $request->amount_max);
        }

        // Get transactions with pagination
        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate summary statistics
        $totalRevenue = UserSubscription::where('status', 'active')->sum('amount_paid');
        $totalTransactions = UserSubscription::count();
        $activeSubscriptions = UserSubscription::where('status', 'active')->count();
        $monthlyRevenue = UserSubscription::where('status', 'active')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount_paid');

        return Inertia::render('admin/finance/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to', 'amount_min', 'amount_max']),
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'active_subscriptions' => $activeSubscriptions,
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }

    public function exportCsv(Request $request)
    {
        $query = UserSubscription::with(['user', 'subscriptionPlan']);

        // Apply the same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount_paid', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount_paid', '<=', $request->amount_max);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $csvData = [];
        $csvData[] = [
            'Transaction ID',
            'User Name',
            'User Email',
            'Plan Name',
            'Status',
            'Payment Method',
            'Amount Paid',
            'Payment ID',
            'Start Date',
            'Expiry Date',
            'Created At',
        ];

        foreach ($transactions as $transaction) {
            $csvData[] = [
                $transaction->id,
                $transaction->user->name_en ?? 'N/A',
                $transaction->user->email ?? 'N/A',
                $transaction->subscriptionPlan->name_en ?? 'N/A',
                $transaction->status,
                $transaction->payment_method ?? 'N/A',
                $transaction->amount_paid ?? '0.00',
                $transaction->payment_id ?? 'N/A',
                $transaction->starts_at ? $transaction->starts_at->format('Y-m-d H:i:s') : 'N/A',
                $transaction->expires_at ? $transaction->expires_at->format('Y-m-d H:i:s') : 'N/A',
                $transaction->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'transactions_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
