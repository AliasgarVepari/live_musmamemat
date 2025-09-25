<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use App\FuzzySearch;

class FinanceController extends Controller
{
    use FuzzySearch;
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'subscriptionPlan']);

        // Apply filters with fuzzy search
        if ($request->filled('search')) {
            $searchFields = ['transaction_id', 'description'];
            $relationFields = [
                'user' => ['name_en', 'name_ar', 'email']
            ];
            
            $this->applyFuzzySearch($query, $request->search, $searchFields, $relationFields);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        // Get per_page parameter with validation
        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [5, 10, 20, 50, 100]) ? (int) $perPage : 10;

        // Get transactions with pagination
        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Calculate summary statistics
        $totalRevenue        = Transaction::where('status', 'completed')->sum('amount');
        $totalTransactions   = Transaction::count();
        $completedTransactions = Transaction::where('status', 'completed')->count();
        $monthlyRevenue      = Transaction::where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $data = [
            'transactions' => $transactions,
            'filters'      => $request->only(['search', 'status', 'payment_method', 'type', 'date_from', 'date_to', 'amount_min', 'amount_max', 'per_page']),
            'stats'        => [
                'total_revenue'        => $totalRevenue,
                'total_transactions'   => $totalTransactions,
                'completed_transactions' => $completedTransactions,
                'monthly_revenue'      => $monthlyRevenue,
            ],
        ];

        // Return JSON for AJAX requests (React Query)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json($data);
        }

        // Return Inertia response for regular page loads
        return Inertia::render('admin/finance/index', $data);
    }

    public function exportCsv(Request $request)
    {
        $query = Transaction::with(['user', 'subscriptionPlan']);

        // Apply the same filters as index with fuzzy search
        if ($request->filled('search')) {
            $searchFields = ['transaction_id', 'description'];
            $relationFields = [
                'user' => ['name_en', 'name_ar', 'email']
            ];
            
            $this->applyFuzzySearch($query, $request->search, $searchFields, $relationFields);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $csvData   = [];
        $csvData[] = [
            'Transaction ID',
            'External Transaction ID',
            'User Name',
            'User Email',
            'Plan Name',
            'Type',
            'Status',
            'Payment Method',
            'Amount',
            'Currency',
            'Description',
            'Processed At',
            'Created At',
        ];

        foreach ($transactions as $transaction) {
            $csvData[] = [
                $transaction->id,
                $transaction->transaction_id,
                $transaction->user->name_en ?? 'N/A',
                $transaction->user->email ?? 'N/A',
                $transaction->subscriptionPlan->name_en ?? 'N/A',
                $transaction->type,
                $transaction->status,
                $transaction->payment_method ?? 'N/A',
                $transaction->amount,
                $transaction->currency,
                $transaction->description ?? 'N/A',
                $transaction->processed_at ? $transaction->processed_at->format('Y-m-d H:i:s') : 'N/A',
                $transaction->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'transactions_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $callback = function () use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
