<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the home page
     */
    public function index()
    {
        // Get the current authenticated user
        $user = Auth::guard('web')->user();
        
        // Since we're using React Query for caching, we don't need to pass data here
        // The components will fetch their own data using the API endpoints
        return Inertia::render('user/Index', [
            'auth' => [
                'user' => $user,
                'isAuthenticated' => $user !== null,
            ]
        ]);
    }

    /**
     * Handle search functionality
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $type  = $request->get('type', 'all'); // all, product, brand, category

        if (empty($query)) {
            return redirect()->route('user.products.index');
        }

        // Redirect to products page with search parameters
        return redirect()->route('user.products.index', [
            'search' => $query,
            'type'   => $type,
        ]);
    }
}
