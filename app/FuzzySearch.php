<?php

namespace App;

trait FuzzySearch
{
    /**
     * Apply fuzzy search to a query builder
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $searchTerm
     * @param array $searchFields Array of field names to search in
     * @param array $relationFields Array of relation fields ['relation' => ['field1', 'field2']]
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function applyFuzzySearch($query, $searchTerm, $searchFields = [], $relationFields = [])
    {
        if (empty($searchTerm)) {
            return $query;
        }

        $searchTerm = trim($searchTerm);
        
        // Only apply fuzzy search if the search term is at least 3 characters
        if (strlen($searchTerm) < 3) {
            // For short terms, only do exact substring matching
            $query->where(function ($q) use ($searchTerm, $searchFields, $relationFields) {
                foreach ($searchFields as $field) {
                    $q->orWhereRaw("LOWER({$field}) LIKE ?", ["%{$searchTerm}%"]);
                }

                foreach ($relationFields as $relation => $fields) {
                    $q->orWhereHas($relation, function ($relationQuery) use ($fields, $searchTerm) {
                        foreach ($fields as $field) {
                            $relationQuery->orWhereRaw("LOWER({$field}) LIKE ?", ["%{$searchTerm}%"]);
                        }
                    });
                }
            });
        } else {
            // For longer terms, do exact matching first, then fuzzy
            $query->where(function ($q) use ($searchTerm, $searchFields, $relationFields) {
                // First, try exact substring matching (most important)
                foreach ($searchFields as $field) {
                    $q->orWhereRaw("LOWER({$field}) LIKE ?", ["%{$searchTerm}%"]);
                }

                // Relation field searches with exact substring matching
                foreach ($relationFields as $relation => $fields) {
                    $q->orWhereHas($relation, function ($relationQuery) use ($fields, $searchTerm) {
                        foreach ($fields as $field) {
                            $relationQuery->orWhereRaw("LOWER({$field}) LIKE ?", ["%{$searchTerm}%"]);
                        }
                    });
                }

                // Then, add fuzzy matching for better results (only for terms >= 3 chars)
                foreach ($searchFields as $field) {
                    $this->addFuzzyFieldSearch($q, $field, $searchTerm, 'orWhere');
                }

                // Relation field searches with fuzzy matching
                foreach ($relationFields as $relation => $fields) {
                    $q->orWhereHas($relation, function ($relationQuery) use ($fields, $searchTerm) {
                        foreach ($fields as $field) {
                            $this->addFuzzyFieldSearch($relationQuery, $field, $searchTerm, 'orWhere');
                        }
                    });
                }
            });
        }

        return $query;
    }

    /**
     * Add fuzzy field search to a query
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $field
     * @param string $searchTerm
     * @param string $method 'where' or 'orWhere'
     */
    private function addFuzzyFieldSearch($query, $field, $searchTerm, $method = 'where')
    {
        // Convert search term to lowercase for case-insensitive search
        $lowerSearchTerm = strtolower($searchTerm);
        
        // Create fuzzy variations of the search term
        $fuzzyTerms = $this->generateFuzzyTerms($lowerSearchTerm);
        
        $query->$method(function ($subQuery) use ($field, $fuzzyTerms) {
            foreach ($fuzzyTerms as $term) {
                $subQuery->orWhereRaw("LOWER({$field}) LIKE ?", ["%{$term}%"]);
            }
        });
    }

    /**
     * Generate fuzzy variations of a search term
     * 
     * @param string $term
     * @return array
     */
    private function generateFuzzyTerms($term)
    {
        $terms = [$term]; // Original term
        
        // Add common character substitutions for mild fuzziness
        $substitutions = [
            'a' => ['@', '4'],
            'e' => ['3'],
            'i' => ['1', '!'],
            'o' => ['0'],
            's' => ['$', '5'],
            't' => ['7'],
            'h' => ['#'],
        ];

        // Generate variations with character substitutions
        foreach ($substitutions as $original => $replacements) {
            foreach ($replacements as $replacement) {
                if (strpos($term, $original) !== false) {
                    $variation = str_replace($original, $replacement, $term);
                    if (!in_array($variation, $terms)) {
                        $terms[] = $variation;
                    }
                }
            }
        }

        // Add variations with missing characters (mild fuzziness)
        if (strlen($term) > 4) { // Increased from 2 to 4 to avoid too many short variations
            for ($i = 0; $i < strlen($term); $i++) {
                $variation = substr($term, 0, $i) . substr($term, $i + 1);
                if (!in_array($variation, $terms) && strlen($variation) >= 3) { // Increased from 2 to 3
                    $terms[] = $variation;
                }
            }
        }

        // Add variations with extra characters (mild fuzziness)
        if (strlen($term) > 3) { // Increased from 1 to 3 to avoid too many variations
            $commonChars = ['a', 'e', 'i', 'o', 'u', 'h', 'n', 'r', 's', 't'];
            foreach ($commonChars as $char) {
                for ($i = 0; $i <= strlen($term); $i++) {
                    $variation = substr($term, 0, $i) . $char . substr($term, $i);
                    if (!in_array($variation, $terms) && strlen($variation) <= strlen($term) + 2) { // Reduced from 3 to 2
                        $terms[] = $variation;
                    }
                }
            }
        }

        // Add variations with character swaps (mild fuzziness)
        if (strlen($term) > 3) { // Increased from 1 to 3 to avoid too many variations
            for ($i = 0; $i < strlen($term) - 1; $i++) {
                $chars = str_split($term);
                $temp = $chars[$i];
                $chars[$i] = $chars[$i + 1];
                $chars[$i + 1] = $temp;
                $variation = implode('', $chars);
                if (!in_array($variation, $terms)) {
                    $terms[] = $variation;
                }
            }
        }

        // Add partial matches for better substring matching
        if (strlen($term) > 3) {
            // Add variations with missing characters from the end
            for ($i = 1; $i <= 2; $i++) {
                $variation = substr($term, 0, -$i);
                if (!in_array($variation, $terms) && strlen($variation) >= 2) {
                    $terms[] = $variation;
                }
            }
            
            // Add variations with missing characters from the beginning
            for ($i = 1; $i <= 2; $i++) {
                $variation = substr($term, $i);
                if (!in_array($variation, $terms) && strlen($variation) >= 2) {
                    $terms[] = $variation;
                }
            }
        }

        // Add common typos and variations
        $commonTypos = [
            'test' => ['tst', 'tes', 'testt', 'tets'],
            'user' => ['usr', 'usre', 'usar', 'usar'],
            'admin' => ['admn', 'adim', 'admi', 'adminn'],
            'name' => ['nme', 'nam', 'naem', 'namee'],
            'email' => ['emal', 'emil', 'emai', 'emaill'],
        ];

        foreach ($commonTypos as $correct => $typos) {
            if (strpos($term, $correct) !== false) {
                foreach ($typos as $typo) {
                    $variation = str_replace($correct, $typo, $term);
                    if (!in_array($variation, $terms)) {
                        $terms[] = $variation;
                    }
                }
            }
        }

        // Limit to reasonable number of terms to avoid performance issues
        return array_slice($terms, 0, 8); // Reduced from 15 to 8 to avoid too many variations
    }
}