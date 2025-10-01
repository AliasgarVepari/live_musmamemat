<?php

$appleKeyPath = env('APPLE_PRIVATE_KEY_PATH');
$appleKey = null;
if ($appleKeyPath && is_string($appleKeyPath)) {
    // Try as given
    $resolved = $appleKeyPath;
    if (!file_exists($resolved)) {
        // Try relative to base_path
        $candidate = base_path(trim($appleKeyPath, '/'));
        if (file_exists($candidate)) {
            $resolved = $candidate;
        }
    }
    if (!file_exists($resolved)) {
        // Try storage path
        $candidate = storage_path(trim($appleKeyPath, '/'));
        if (file_exists($candidate)) {
            $resolved = $candidate;
        }
    }
    if (file_exists($resolved)) {
        $appleKey = @file_get_contents($resolved) ?: null;
    }
}
// Fallback to inline value if path not provided
if (!$appleKey) {
    $appleKey = env('APPLE_PRIVATE_KEY');
}

// Attempt to auto-generate Apple client secret (JWT) if not provided
$appleClientId = env('APPLE_CLIENT_ID');
$appleTeamId = env('APPLE_TEAM_ID');
$appleKeyId = env('APPLE_KEY_ID');
$appleClientSecret = env('APPLE_CLIENT_SECRET');

if (!$appleClientSecret && $appleClientId && $appleTeamId && $appleKeyId && $appleKey) {
    try {
        $cfg = \Lcobucci\JWT\Configuration::forAsymmetricSigner(
            new \Lcobucci\JWT\Signer\Ecdsa\Sha256(),
            \Lcobucci\JWT\Signer\Key\InMemory::plainText($appleKey),
            // For this lib version we must pass a non-empty verification key; we reuse the private key
            \Lcobucci\JWT\Signer\Key\InMemory::plainText($appleKey)
        );
        $now = new \DateTimeImmutable();
        $exp = $now->modify('+180 days');
        $token = $cfg->builder()
            ->issuedBy($appleTeamId)
            ->permittedFor('https://appleid.apple.com')
            ->relatedTo($appleClientId)
            ->issuedAt($now)
            ->expiresAt($exp)
            ->withHeader('kid', $appleKeyId)
            ->getToken($cfg->signer(), $cfg->signingKey());
        $appleClientSecret = $token->toString();
    } catch (\Throwable $e) {
        // leave $appleClientSecret null; driver will error with a clear message
    }
}

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'apple' => [
        'client_id' => $appleClientId,
        'team_id' => $appleTeamId,
        'key_id' => $appleKeyId,
        'private_key' => $appleKey,
        'client_secret' => $appleClientSecret,
        'redirect' => env('APPLE_REDIRECT_URI', '/auth/apple/callback'),
    ],

];
